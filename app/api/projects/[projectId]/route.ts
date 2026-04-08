import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authConfig) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;

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
        compliance: true,
        auditLogs: {
          include: { user: { select: { name: true } } },
          orderBy: { timestamp: 'desc' },
        },
        raciEntries: {
          include: { user: { select: { name: true } } },
        },
        _count: { select: { proofs: true, compliance: true, auditLogs: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if user has access (owner or team member)
    const hasAccess = project.ownerId === session.user.id ||
      project.team?.members.some((member: any) => member.id === session.user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}