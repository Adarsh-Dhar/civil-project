import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authConfig) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    if (!projectId || projectId === 'undefined') {
      return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { name: true, email: true } },
        team: {
          select: {
            name: true,
            members: { select: { id: true, name: true, email: true } },
          },
        },
        proofs: {
          include: { uploader: { select: { name: true } } },
          orderBy: { uploadedAt: 'desc' },
        },
        taskProofs: {
          include: {
            uploader: { select: { name: true } },
            task: { select: { id: true, sequence: true, name: true } },
          },
          orderBy: { uploadedAt: 'desc' },
        },
        compliance: true,
        auditLogs: {
          include: { user: { select: { name: true } } },
          orderBy: { timestamp: 'desc' },
        },
        raciEntries: {
          include: { user: { select: { name: true } } },
        },
        tasks: {
          include: {
            _count: { select: { proofs: true } },
          },
          orderBy: { sequence: 'asc' },
        },
        _count: { select: { proofs: true, taskProofs: true, compliance: true, auditLogs: true, tasks: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}