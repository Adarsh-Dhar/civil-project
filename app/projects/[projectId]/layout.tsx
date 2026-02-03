'use client';

import React from "react"

import { useState } from 'react';
import { ProtectedLayout } from '@/app/layout-protected';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'raci', label: 'RACI Matrix' },
  { id: 'proofs', label: 'Proofs' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'audit', label: 'Audit Log' },
];

export default function ProjectDetailsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { projectId: string }
}) {
  const pathname = usePathname();
  const currentTab = pathname.split('/').pop() || 'overview';

  return (
    <ProtectedLayout>
      <div className="flex flex-col h-full">
        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm text-gray-600">
            <Link href="/projects" className="hover:text-indigo-600">Projects</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Project Details</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Skyline Tower</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Downtown District • 65% Complete</p>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="flex gap-2 sm:gap-6 min-w-min">
            {TABS.map((tab) => {
              const tabUrl = tab.id === 'overview' ? `/projects/${params.projectId}` : `/projects/${params.projectId}/${tab.id}`;
              const isActive = currentTab === tab.id || (currentTab === params.projectId && tab.id === 'overview');
              return (
                <Link
                  key={tab.id}
                  href={tabUrl}
                  className={`px-3 py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </ProtectedLayout>
  );
}
