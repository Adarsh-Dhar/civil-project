import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences } = await request.json();

    // Update user with preferences and mark onboarding complete
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}