'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, FileUp, MoreVertical } from 'lucide-react';

type ProjectTask = {
  id: string;
  sequence: number;
  stage: string;
  name: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'done';
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  timeDays: number;
  _count: { proofs: number };
};

export default function JobsPage() {
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
      setLoading(false);
      setError('Invalid project id.');
      return;
    }

    let cancelled = false;

    const fetchTasks = async () => {
      try {
        setError('');
        const response = await fetch(`/api/projects/${projectId}/tasks`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (!cancelled) {
            setError(errorData?.error || 'Failed to load jobs.');
            setTasks([]);
          }
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
        }
      } catch (fetchError) {
        console.error('Failed to fetch project tasks:', fetchError);
        if (!cancelled) {
          setError('Failed to load jobs.');
          setTasks([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const formatStatus = (status: ProjectTask['status']) => {
    switch (status) {
      case 'done':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'blocked':
        return 'Blocked';
      default:
        return 'Pending';
    }
  };

  const toInitials = (value: string) =>
    value
      .split(/[,/]|\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-accent/20 text-accent border-accent/35';
      case 'In Progress':
        return 'bg-chart-5/20 text-chart-5 border-chart-5/35';
      case 'Pending':
        return 'bg-secondary text-secondary-foreground border-border';
      default:
        return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8">Loading jobs...</div>;
  }

  if (error) {
    return <div className="p-4 sm:p-6 lg:p-8">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Construction Jobs</h2>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Job</span>
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl sm:rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-foreground">Function</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-foreground hidden sm:table-cell">Status</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-foreground">R</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-foreground hidden sm:table-cell">A</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-foreground hidden md:table-cell">C</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-foreground hidden lg:table-cell">I</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-foreground hidden sm:table-cell">Due</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-foreground">Proof</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tasks.map((job) => {
                const readableStatus = formatStatus(job.status);
                return (
                <tr key={job.id} className="hover:bg-accent/40 transition">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <p className="font-medium text-foreground truncate text-xs sm:text-sm">{job.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{job.stage}</p>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(readableStatus)}`}>
                      {readableStatus}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-center">
                      <Avatar className="w-7 sm:w-8 h-7 sm:h-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${encodeURIComponent(job.responsible.toLowerCase())}`} />
                        <AvatarFallback className="text-xs">{toInitials(job.responsible)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <div className="flex justify-center">
                      <Avatar className="w-7 sm:w-8 h-7 sm:h-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${encodeURIComponent(job.accountable.toLowerCase())}`} />
                        <AvatarFallback className="text-xs">{toInitials(job.accountable)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                    <div className="flex justify-center">
                      <div className="text-xs text-muted-foreground font-medium">
                        {job.consulted.split(',').map((v) => v.trim()).filter(Boolean).length || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                    <div className="flex justify-center">
                      <div className="text-xs text-muted-foreground font-medium">
                        {job.informed.split(',').map((v) => v.trim()).filter(Boolean).length || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground text-xs hidden sm:table-cell">
                    {job.timeDays > 0 ? `${job.timeDays}d` : '--'}
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4">
                    {job._count?.proofs > 0 ? (
                      <button className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-xs font-medium">
                        <FileUp className="w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-1 px-2 py-1 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-xs font-medium">
                        <FileUp className="w-3 h-3" />
                        <span className="hidden sm:inline">Upload</span>
                      </button>
                    )}
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4">
                    <button className="p-1 hover:bg-accent rounded-lg transition">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
                );
              })}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No jobs found for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
