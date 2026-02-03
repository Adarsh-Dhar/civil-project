import React from "react"
import { ProtectedLayout } from '@/app/layout-protected';
import { AuthGuard } from '@/components/auth-guard';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthGuard>
  );
}
