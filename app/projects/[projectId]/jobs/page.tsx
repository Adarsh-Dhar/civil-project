'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, FileUp, MoreVertical } from 'lucide-react';

const JOBS_DATA = [
  {
    id: '1',
    function: 'Site Preparation',
    status: 'Completed',
    responsible: 'Bob Collins',
    accountable: 'Alice Morgan',
    consulted: ['Charlie Davis'],
    informed: ['Team Lead'],
    dueDate: '2024-02-15',
    proof: true,
  },
  {
    id: '2',
    function: 'Excavation',
    status: 'In Progress',
    responsible: 'Charlie Davis',
    accountable: 'Alice Morgan',
    consulted: ['Engineer A'],
    informed: ['Site Manager'],
    dueDate: '2024-03-30',
    proof: false,
  },
  {
    id: '3',
    function: 'Foundation Pouring',
    status: 'In Progress',
    responsible: 'Bob Collins',
    accountable: 'Alice Morgan',
    consulted: ['Structural Engineer'],
    informed: ['Quality Inspector'],
    dueDate: '2024-04-15',
    proof: true,
  },
  {
    id: '4',
    function: 'Structural Steel',
    status: 'Pending',
    responsible: 'Engineer A',
    accountable: 'Alice Morgan',
    consulted: ['Contractor Lead'],
    informed: ['All Staff'],
    dueDate: '2024-05-20',
    proof: false,
  },
];

export default function JobsPage({ params }: { params: { projectId: string } }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Construction Jobs</h2>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Job</span>
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-900">Function</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-900 hidden sm:table-cell">Status</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900">R</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 hidden sm:table-cell">A</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 hidden md:table-cell">C</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 hidden lg:table-cell">I</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-900 hidden sm:table-cell">Due</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900">Proof</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {JOBS_DATA.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{job.function}</p>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-center">
                      <Avatar className="w-7 sm:w-8 h-7 sm:h-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${job.responsible.split(' ')[0].toLowerCase()}`} />
                        <AvatarFallback className="text-xs">{job.responsible[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <div className="flex justify-center">
                      <Avatar className="w-7 sm:w-8 h-7 sm:h-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${job.accountable.split(' ')[0].toLowerCase()}`} />
                        <AvatarFallback className="text-xs">{job.accountable[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                    <div className="flex justify-center">
                      <div className="text-xs text-gray-600 font-medium">
                        {job.consulted.length}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                    <div className="flex justify-center">
                      <div className="text-xs text-gray-600 font-medium">
                        {job.informed.length}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 text-xs hidden sm:table-cell">
                    {new Date(job.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4">
                    {job.proof ? (
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
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
