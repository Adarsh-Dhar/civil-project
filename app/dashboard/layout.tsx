import React from "react"
import { ProtectedLayout } from '@/app/layout-protected';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check - redirects before any client render
  const session = await getServerSession(authConfig);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <ProtectedLayout>{children}</ProtectedLayout>
  );
}
