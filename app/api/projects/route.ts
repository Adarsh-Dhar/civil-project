import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ensureRaciTemplateTasks, seedProjectTasksFromTemplate } from '@/lib/project-tasks';

export async function GET() {
  try {
    const session = await getServerSession(authConfig) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get projects where user is owner or member of team
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { team: { members: { some: { id: userId } } } },
        ],
      },
      include: {
        owner: { select: { name: true } },
        team: { select: { name: true } },
        _count: { select: { proofs: true, compliance: true } },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      description,
      teamId,
      status,
      startDate,
      endDate,
    } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    if (status && !['planning', 'active', 'completed', 'on_hold'].includes(status)) {
      return NextResponse.json({ error: 'Invalid project status' }, { status: 400 });
    }

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) {
        return NextResponse.json({ error: 'Invalid teamId' }, { status: 400 });
      }
    }

    await ensureRaciTemplateTasks(prisma);

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name,
          description,
          status: status ?? 'planning',
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          ownerId: session.user.id,
          teamId,
        },
        include: {
          owner: { select: { name: true } },
          team: { select: { name: true } },
        },
      });

      await seedProjectTasksFromTemplate(tx, created.id);

      await tx.auditLog.create({
        data: {
          projectId: created.id,
          userId: session.user.id,
          action: 'PROJECT_CREATED',
          details: 'Project created and default RACI tasks seeded',
        },
      });

      return created;
    });

    const taskCount = await prisma.projectTask.count({ where: { projectId: project.id } });

    return NextResponse.json({ project, seededTaskCount: taskCount }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}