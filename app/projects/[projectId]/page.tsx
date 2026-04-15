'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  owner: { name: string; email: string };
  team?: { name: string; members: { id: string; name: string; email: string }[] };
  proofs: any[];
  compliance: any[];
  auditLogs: any[];
  raciEntries: any[];
  tasks: Array<{
    id: string;
    sequence: number;
    stage: string;
    name: string;
    status: 'pending' | 'in_progress' | 'blocked' | 'done';
    _count: { proofs: number };
  }>;
  _count: { proofs: number; taskProofs: number; compliance: number; auditLogs: number; tasks: number };
}

export default function ProjectOverviewPage() {
  const params = useParams<{ projectId?: string | string[] }>();
  const projectId = useMemo(() => {
    const raw = params?.projectId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setLoadError('Invalid project id.');
      return;
    }

    fetchProject(projectId);
  }, [projectId]);

  const fetchProject = async (id: string) => {
    try {
      setLoadError('');
      const response = await fetch(`/api/projects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setProject(null);
        setLoadError(errorData?.error || 'Failed to fetch project.');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setProject(null);
      setLoadError('Error fetching project details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-4 sm:p-6 lg:p-8">{loadError || 'Project not found'}</div>;
  }

  const doneTasks = project.tasks.filter((task) => task.status === 'done').length;
  const inProgressTasks = project.tasks.filter((task) => task.status === 'in_progress').length;
  const blockedTasks = project.tasks.filter((task) => task.status === 'blocked').length;
  const progressPercent = project.tasks.length > 0 ? Math.round((doneTasks / project.tasks.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground mt-1">{project.description || 'No description'}</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Edit Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-2">Status</p>
          <p className="text-lg font-bold text-foreground capitalize">{project.status}</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-2">Task Progress</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{progressPercent}%</p>
          <p className="text-xs text-muted-foreground mt-1">{doneTasks}/{project.tasks.length} tasks done</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-2">Team Members</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{project.team?.members.length || 0}</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-2">Task Proofs</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{project._count.taskProofs}</p>
          <p className="text-xs text-muted-foreground mt-1">{blockedTasks} blocked · {inProgressTasks} in progress</p>
        </Card>
      </div>

      {/* Project Details & Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Project Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Owner</p>
                  <p className="text-sm sm:text-base font-medium text-foreground">{project.owner.name}</p>
                </div>
              </div>
              {project.team && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Team</p>
                    <p className="text-sm sm:text-base font-medium text-foreground">{project.team.name}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {project.team.members.slice(0, 4).map((member) => (
                        <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                          <AvatarImage src={`https://avatar.vercel.sh/${member.name.split(' ')[0].toLowerCase()}`} />
                          <AvatarFallback className="text-xs">{member.name.split(' ')[0][0]}</AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                          +{project.team.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {project.auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-border/60 last:border-0 last:pb-0">
                  <Avatar className="w-8 h-8 mt-0.5">
                    <AvatarImage src={`https://avatar.vercel.sh/${log.user.name.split(' ')[0].toLowerCase()}`} />
                    <AvatarFallback className="text-xs">{log.user.name.split(' ')[0][0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-foreground">
                      <span className="font-medium">{log.user.name}</span> {log.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {project.auditLogs.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Compliance */}
        <div>
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Items</h3>
            <div className="space-y-3">
              {project.compliance.filter(item => item.status === 'pending').slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-amber-900">{item.requirement}</p>
                      <p className="text-xs text-amber-700 mt-1">{item.notes || 'No notes'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {project.compliance.filter(item => item.status === 'pending').length === 0 && (
                <p className="text-sm text-muted-foreground">No pending compliance items</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
