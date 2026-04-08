'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';

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
  _count: { proofs: number; compliance: number; auditLogs: number };
}

export default function ProjectOverviewPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [params.projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      } else {
        console.error('Failed to fetch project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-4 sm:p-6 lg:p-8">Project not found</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description || 'No description'}</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Edit Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">Status</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{project.status}</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">Proofs</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{project._count.proofs}</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">Team Members</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{project.team?.members.length || 0}</p>
        </Card>

        <Card className="p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">Compliance Items</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{project._count.compliance}</p>
        </Card>
      </div>

      {/* Project Details & Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Owner</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{project.owner.name}</p>
                </div>
              </div>
              {project.team && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Team</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">{project.team.name}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {project.team.members.slice(0, 4).map((member) => (
                        <Avatar key={member.id} className="w-6 h-6 border-2 border-white">
                          <AvatarImage src={`https://avatar.vercel.sh/${member.name.split(' ')[0].toLowerCase()}`} />
                          <AvatarFallback className="text-xs">{member.name.split(' ')[0][0]}</AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {project.auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <Avatar className="w-8 h-8 mt-0.5">
                    <AvatarImage src={`https://avatar.vercel.sh/${log.user.name.split(' ')[0].toLowerCase()}`} />
                    <AvatarFallback className="text-xs">{log.user.name.split(' ')[0][0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900">
                      <span className="font-medium">{log.user.name}</span> {log.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {project.auditLogs.length === 0 && (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Compliance */}
        <div>
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Items</h3>
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
                <p className="text-sm text-gray-500">No pending compliance items</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
