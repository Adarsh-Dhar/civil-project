import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'dwg']);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
}

function getProofTypeByExtension(extension: string) {
  if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
    return 'image';
  }

  if (extension === 'pdf') {
    return 'pdf';
  }

  if (extension === 'dwg') {
    return 'dwg';
  }

  return 'document';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = (await getServerSession(authConfig)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    if (!projectId || projectId === 'undefined') {
      return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const fileEntry = formData.get('file');
    const taskIdEntry = formData.get('taskId');
    const noteEntry = formData.get('note');

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (fileEntry.size <= 0) {
      return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
    }

    if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size must be 100 MB or less' }, { status: 400 });
    }

    const rawExtension = path.extname(fileEntry.name).toLowerCase().replace('.', '');
    if (!ALLOWED_EXTENSIONS.has(rawExtension)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: pdf, jpg, jpeg, png, dwg' },
        { status: 400 }
      );
    }

    const note = typeof noteEntry === 'string' && noteEntry.trim() ? noteEntry.trim() : null;
    const taskId = typeof taskIdEntry === 'string' && taskIdEntry.trim() ? taskIdEntry.trim() : null;

    const originalBaseName = path.basename(fileEntry.name, path.extname(fileEntry.name));
    const safeBaseName = sanitizeFileName(originalBaseName || 'proof');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBaseName}.${rawExtension}`;

    const storageDir = path.join(process.cwd(), 'public', 'uploads', 'proofs', projectId);
    await mkdir(storageDir, { recursive: true });

    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    await writeFile(path.join(storageDir, uniqueName), buffer);

    const fileUrl = `/uploads/proofs/${projectId}/${uniqueName}`;
    const proofType = getProofTypeByExtension(rawExtension);

    if (taskId && taskId !== 'project') {
      const task = await prisma.projectTask.findFirst({
        where: {
          id: taskId,
          projectId,
        },
      });

      if (!task) {
        return NextResponse.json({ error: 'Selected task was not found in this project' }, { status: 400 });
      }

      const created = await prisma.$transaction(async (tx) => {
        const proof = await tx.taskProof.create({
          data: {
            projectId,
            taskId,
            type: proofType,
            fileUrl,
            note,
            uploadedBy: session.user.id,
          },
          include: {
            uploader: { select: { id: true, name: true } },
            task: { select: { id: true, sequence: true, name: true } },
          },
        });

        await tx.auditLog.create({
          data: {
            projectId,
            userId: session.user.id,
            action: 'TASK_PROOF_ADDED',
            details: `Uploaded ${uniqueName} for task #${task.sequence} ${task.name}`,
          },
        });

        return proof;
      });

      return NextResponse.json(
        {
          ok: true,
          fileUrl,
          linkedTo: 'task',
          proof: created,
        },
        { status: 201 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const proof = await tx.proof.create({
        data: {
          projectId,
          type: proofType,
          fileUrl,
          uploadedBy: session.user.id,
        },
        include: {
          uploader: { select: { id: true, name: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          projectId,
          userId: session.user.id,
          action: 'PROJECT_PROOF_ADDED',
          details: note ? `Uploaded ${uniqueName} (${note})` : `Uploaded ${uniqueName}`,
        },
      });

      return proof;
    });

    return NextResponse.json(
      {
        ok: true,
        fileUrl,
        linkedTo: 'project',
        proof: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload proof error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}