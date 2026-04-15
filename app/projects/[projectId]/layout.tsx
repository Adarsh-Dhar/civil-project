'use client';

import React from "react"
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
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
}: {
  children: React.ReactNode
}) {
  const params = useParams<{ projectId?: string | string[] }>();
  const pathname = usePathname();
  const projectId = useMemo(() => {
    const raw = params?.projectId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);
  const currentTab = pathname.split('/').pop() || 'overview';
  const [projectName, setProjectName] = useState('Project Details');
  const [projectDescription, setProjectDescription] = useState('');

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    const fetchProjectSummary = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!cancelled && data?.project) {
          setProjectName(data.project.name || 'Project Details');
          setProjectDescription(data.project.description || '');
        }
      } catch (error) {
        console.error('Failed to fetch project summary:', error);
      }
    };

    fetchProjectSummary();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-indigo-600">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Project Details</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{projectName}</h2>
        {projectDescription && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{projectDescription}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <div className="flex gap-2 sm:gap-6 min-w-min">
          {TABS.map((tab) => {
            const tabUrl = tab.id === 'overview' ? `/projects/${projectId}` : `/projects/${projectId}/${tab.id}`;
            const isActive = currentTab === tab.id || (currentTab === projectId && tab.id === 'overview');
            return (
              <Link
                key={tab.id}
                href={tabUrl}
                className={`px-3 py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
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
  );
}
