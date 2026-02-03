'use client';

import { FileUp, MoreVertical, Edit2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const raceData = [
  {
    id: 1,
    function: 'Foundation Pouring',
    status: 'In Progress',
    statusColor: 'bg-yellow-100 text-yellow-800',
    responsible: 'John D.',
    accountable: 'Alice M.',
    consulted: ['Bob C.', 'Sarah C.'],
    informed: ['Charlie I.'],
    dueDate: '2024-02-15',
    proof: true,
    project: 'Skyline Tower',
  },
  {
    id: 2,
    function: 'Structural Steel Installation',
    status: 'Pending',
    statusColor: 'bg-gray-100 text-gray-800',
    responsible: 'Bob C.',
    accountable: 'Alice M.',
    consulted: ['John D.'],
    informed: ['Emma W.', 'Sarah C.'],
    dueDate: '2024-02-20',
    proof: false,
    project: 'Skyline Tower',
  },
  {
    id: 3,
    function: 'Electrical Wiring',
    status: 'Completed',
    statusColor: 'bg-green-100 text-green-800',
    responsible: 'Sarah C.',
    accountable: 'Alice M.',
    consulted: ['Bob C.'],
    informed: ['John D.', 'Charlie I.'],
    dueDate: '2024-02-10',
    proof: true,
    project: 'Riverfront Villa',
  },
  {
    id: 4,
    function: 'Safety Inspection',
    status: 'At Risk',
    statusColor: 'bg-red-100 text-red-800',
    responsible: 'Charlie I.',
    accountable: 'Alice M.',
    consulted: ['John D.', 'Bob C.', 'Sarah C.'],
    informed: ['Emma W.'],
    dueDate: '2024-02-12',
    proof: true,
    project: 'Skyline Tower',
  },
];

function AvatarGroup({ users }: { users: string[] }) {
  return (
    <div className="flex items-center gap-1 justify-center">
      {users.slice(0, 2).map((user, idx) => (
        <Avatar key={idx} className="w-6 sm:w-8 h-6 sm:h-8 border-2 border-white">
          <AvatarImage src={`https://avatar.vercel.sh/${user.split(' ')[0].toLowerCase()}`} />
          <AvatarFallback className="text-xs">{user[0]}</AvatarFallback>
        </Avatar>
      ))}
      {users.length > 2 && (
        <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
          +{users.length - 2}
        </div>
      )}
    </div>
  );
}

export function RACITable() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-900">Function</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-900 hidden sm:table-cell">Status</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-900">R</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-900 hidden sm:table-cell">A</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-900 hidden md:table-cell">C</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-900 hidden lg:table-cell">I</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-900 hidden sm:table-cell">Due Date</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-900">Proof</th>
              <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-900"></th>
            </tr>
          </thead>
          <tbody>
            {raceData.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{row.function}</p>
                    <p className="text-xs text-gray-500 truncate">{row.project}</p>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${row.statusColor}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-2 sm:px-6 py-3 sm:py-4">
                  <div className="flex justify-center">
                    <Avatar className="w-7 sm:w-8 h-7 sm:h-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${row.responsible.split(' ')[0].toLowerCase()}`} />
                      <AvatarFallback className="text-xs">{row.responsible[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </td>
                <td className="px-2 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  <div className="flex justify-center">
                    <Avatar className="w-7 sm:w-8 h-7 sm:h-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${row.accountable.split(' ')[0].toLowerCase()}`} />
                      <AvatarFallback className="text-xs">{row.accountable[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </td>
                <td className="px-2 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                  <div className="flex justify-center">
                    <AvatarGroup users={row.consulted} />
                  </div>
                </td>
                <td className="px-2 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                  <div className="flex justify-center">
                    <AvatarGroup users={row.informed} />
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 font-medium text-xs hidden sm:table-cell">
                  {new Date(row.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-2 sm:px-6 py-3 sm:py-4">
                  {row.proof ? (
                    <button className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium">
                      <FileUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-transparent px-2 py-1 h-auto"
                    >
                      <FileUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-1">Upload</span>
                    </Button>
                  )}
                </td>
                <td className="px-2 sm:px-6 py-3 sm:py-4">
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
