'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { RACITable } from '@/components/raci-table';

type ProjectTask = {
  id: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'done';
  costWeight: number;
  timeWeight: number;
};

const ALPHA = 0.4;
const BETA = 0.6;

const asPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export default function RACIPage() {
  const params = useParams<{ projectId?: string | string[] }>();
  const projectId = useMemo(() => {
    const raw = params?.projectId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) {
      setError('Invalid project id.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadTasks = async () => {
      try {
        setError('');
        const response = await fetch(`/api/projects/${projectId}/tasks`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (!cancelled) {
            setError(errorData?.error || 'Failed to load RACI tasks.');
          }
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
        }
      } catch (loadError) {
        console.error('Failed to load RACI tasks:', loadError);
        if (!cancelled) {
          setError('Failed to load RACI tasks.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const doneTasks = tasks.filter((task) => task.status === 'done').length;

  const totalCostDone = tasks
    .filter((task) => task.status === 'done')
    .reduce((sum, task) => sum + task.costWeight, 0);

  const totalTimeDone = tasks
    .filter((task) => task.status === 'done')
    .reduce((sum, task) => sum + task.timeWeight, 0);

  const overallProgress = ALPHA * totalCostDone + BETA * totalTimeDone;

  const progressLabel = asPercent(overallProgress);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">RACI Progress Narrative</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Live weighted progress using cost and time completion</p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="mb-6 grid gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Core Idea</h3>
          <p className="text-sm text-muted-foreground">
            Think of this as a checklist. Every completed task adds two contributions: cost progress and time progress.
            Final progress is the weighted mix of both.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">How Progress Builds</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Step 1:</span> At project start, no task is completed so cost progress and time progress are both 0%.
            </p>
            <p>
              <span className="font-semibold text-foreground">Step 2:</span> Every completed task adds its own cost weight and time weight into cumulative totals.
            </p>
            <p>
              <span className="font-semibold text-foreground">Step 3:</span> The cumulative cost and time contributions are combined with alpha and beta weights.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">Live Formula Snapshot</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Calculating from project tasks...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Progress = α × (Total Cost Weight Completed) + β × (Total Time Weight Completed)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-muted-foreground text-xs">Alpha (cost)</p>
                  <p className="font-semibold text-foreground">{ALPHA.toFixed(1)}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-muted-foreground text-xs">Beta (time)</p>
                  <p className="font-semibold text-foreground">{BETA.toFixed(1)}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-muted-foreground text-xs">Cost Completed</p>
                  <p className="font-semibold text-foreground">{asPercent(totalCostDone)}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-muted-foreground text-xs">Time Completed</p>
                  <p className="font-semibold text-foreground">{asPercent(totalTimeDone)}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-indigo-900 text-sm">
                <span className="font-semibold">Current Progress:</span>{' '}
                {`0.4 × ${totalCostDone.toFixed(3)} + 0.6 × ${totalTimeDone.toFixed(3)} = ${overallProgress.toFixed(3)} (${progressLabel})`}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Tasks completed: {doneTasks} of {tasks.length}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Live Task Matrix</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          This table is connected to project tasks. Updating task status changes the weighted progress values above.
        </p>
        {projectId ? <RACITable projectId={projectId} /> : <p className="text-sm text-muted-foreground">Invalid project context.</p>}
      </div>
    </div>
  );
}
