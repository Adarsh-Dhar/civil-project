import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    const { name, description, teamId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
        teamId,
      },
      include: {
        owner: { select: { name: true } },
        team: { select: { name: true } },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}