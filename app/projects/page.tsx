'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, Grid3x3, List, Filter, X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  owner: { name: string };
  team?: { name: string };
  _count: { proofs: number; compliance: number };
}

export default function ProjectsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setProjects([...projects, data.project]);
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectDescription('');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'active':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 text-sm mt-1">Manage all your construction projects</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Project</span>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2.5 transition ${view === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2.5 border-l border-gray-300 transition ${view === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition cursor-pointer h-full">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">{project.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{project.description || 'No description'}</p>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                      {project._count.proofs}
                    </div>
                    <span className="text-xs text-gray-500">proofs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Owner: {project.owner.name}</span>
                  {project.team && <span>Team: {project.team.name}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">Project</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 hidden sm:table-cell">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 hidden md:table-cell">Owner</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900">Proofs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4">
                      <Link href={`/projects/${project.id}`} className="block">
                        <p className="font-medium text-indigo-600 hover:text-indigo-700 text-sm">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.description || 'No description'}</p>
                      </Link>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600">{project.owner.name}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{project._count.proofs}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createProject}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={!newProjectName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
