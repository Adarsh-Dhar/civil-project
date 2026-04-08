import { NextResponse } from 'next/server';
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

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { team: { members: { some: { id: userId } } } },
        ],
      },
      include: {
        _count: { select: { proofs: true, compliance: true, auditLogs: true } },
      },
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalProofs = projects.reduce((sum, p) => sum + p._count.proofs, 0);
    const complianceItems = projects.reduce((sum, p) => sum + p._count.compliance, 0);

    return NextResponse.json({
      totalProjects,
      activeProjects,
      totalProofs,
      complianceItems,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}