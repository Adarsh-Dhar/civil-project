'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type ProjectTask = {
  id: string;
  sequence: number;
  stage: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'done';
  costWeight: number;
  timeWeight: number;
};

type Phase = {
  id: string;
  name: string;
  progress: number;
  status: 'Completed' | 'In Progress' | 'Blocked' | 'Pending';
  completed: number;
  total: number;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'text-emerald-600';
    case 'In Progress':
      return 'text-amber-600';
    case 'Blocked':
      return 'text-red-600';
    case 'Pending':
      return 'text-slate-600';
    default:
      return 'text-muted-foreground';
  }
};

const getBarColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-500';
    case 'In Progress':
      return 'bg-amber-500';
    case 'Blocked':
      return 'bg-red-500';
    case 'Pending':
      return 'bg-muted';
    default:
      return 'bg-muted';
  }
};

export default function TimelinePage() {
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

    const fetchTimeline = async () => {
      try {
        setError('');
        const response = await fetch(`/api/projects/${projectId}/tasks`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (!cancelled) {
            setError(errorData?.error || 'Failed to load timeline.');
          }
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
        }
      } catch (fetchError) {
        console.error('Failed to fetch timeline tasks:', fetchError);
        if (!cancelled) {
          setError('Failed to load timeline.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTimeline();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const phases: Phase[] = useMemo(() => {
    const stageMap = new Map<string, ProjectTask[]>();
    for (const task of tasks) {
      const bucket = stageMap.get(task.stage) ?? [];
      bucket.push(task);
      stageMap.set(task.stage, bucket);
    }

    return Array.from(stageMap.entries()).map(([stage, stageTasks], index) => {
      const completed = stageTasks.filter((task) => task.status === 'done').length;
      const blocked = stageTasks.some((task) => task.status === 'blocked');
      const inProgress = stageTasks.some((task) => task.status === 'in_progress');
      const totalCost = stageTasks.reduce((sum, task) => sum + task.costWeight, 0);
      const totalTime = stageTasks.reduce((sum, task) => sum + task.timeWeight, 0);
      const doneCost = stageTasks.filter((task) => task.status === 'done').reduce((sum, task) => sum + task.costWeight, 0);
      const doneTime = stageTasks.filter((task) => task.status === 'done').reduce((sum, task) => sum + task.timeWeight, 0);
      const denominator = 0.5 * totalCost + 0.5 * totalTime;
      const progress = denominator > 0 ? Math.round(((0.5 * doneCost + 0.5 * doneTime) / denominator) * 100) : 0;

      let status: Phase['status'] = 'Pending';
      if (completed === stageTasks.length && stageTasks.length > 0) {
        status = 'Completed';
      } else if (blocked) {
        status = 'Blocked';
      } else if (inProgress || completed > 0) {
        status = 'In Progress';
      }

      return {
        id: `${stage}-${index}`,
        name: stage,
        progress,
        status,
        completed,
        total: stageTasks.length,
      };
    });
  }, [tasks]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Project Timeline</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Live stage progress from project tasks</p>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading timeline...</div>}
      {!loading && error && <div className="text-sm text-destructive">{error}</div>}

      {/* Timeline */}
      <div className="space-y-4">
        {!loading && !error && phases.length === 0 && (
          <div className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border text-sm text-muted-foreground">
            No stage data available yet.
          </div>
        )}

        {phases.map((phase, index) => {

          return (
            <div key={phase.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute left-0 top-8 w-4 h-4 bg-card border-4 border-indigo-600 rounded-full -translate-x-1.5"></div>

              {/* Content Card */}
              <div className="ml-6 sm:ml-8 bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">{phase.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {phase.completed} of {phase.total} tasks completed
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {phase.status === 'Completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : phase.status === 'Blocked' ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : phase.status === 'In Progress' ? (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                    )}
                    <span className={`text-xs sm:text-sm font-medium ${getStatusColor(phase.status)}`}>
                      {phase.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium text-foreground">{phase.progress}%</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(phase.status)} transition-all`}
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Timeline Line */}
              {index < phases.length - 1 && (
                <div className="absolute left-1 top-24 w-0.5 h-16 bg-border"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-900">
          <span className="font-semibold">Note:</span> Timeline is generated from live project task status grouped by stage.
        </p>
      </div>
    </div>
  );
}
