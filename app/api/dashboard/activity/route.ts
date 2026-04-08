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

    // Get recent audit logs for user's projects
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { team: { members: { some: { id: userId } } } },
          ],
        },
      },
      include: {
        user: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return NextResponse.json({ activities: auditLogs });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}