'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AUDIT_LOGS = [
  {
    id: '1',
    user: 'Alice Morgan',
    action: 'Created task',
    target: 'Structural Steel',
    timestamp: '2024-03-15T14:30:00Z',
    details: 'Assigned to Bob Collins',
  },
  {
    id: '2',
    user: 'Bob Collins',
    action: 'Uploaded proof',
    target: 'Foundation Inspection Photos',
    timestamp: '2024-03-15T10:15:00Z',
    details: '24.5 MB image set',
  },
  {
    id: '3',
    user: 'Charlie Davis',
    action: 'Changed status',
    target: 'Excavation',
    timestamp: '2024-03-14T16:45:00Z',
    details: 'Status changed from Pending to In Progress',
  },
  {
    id: '4',
    user: 'Alice Morgan',
    action: 'Assigned RACI role',
    target: 'Foundation Pouring',
    timestamp: '2024-03-14T11:20:00Z',
    details: 'Engineer A set as Responsible',
  },
  {
    id: '5',
    user: 'Inspector',
    action: 'Approved inspection',
    target: 'Foundation Inspection',
    timestamp: '2024-03-13T09:00:00Z',
    details: 'Government approval received',
  },
  {
    id: '6',
    user: 'Bob Collins',
    action: 'Added comment',
    target: 'Site Preparation',
    timestamp: '2024-03-12T15:30:00Z',
    details: '"Ready for next phase approval"',
  },
];

export default function AuditLogPage({ params }: { params: { projectId: string } }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Immutable record of all project activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-lg px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-2 text-xs sm:text-sm bg-transparent">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" className="rounded-lg px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-2 text-xs sm:text-sm bg-transparent">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-0 divide-y divide-gray-200">
        {AUDIT_LOGS.map((entry) => {
          const date = new Date(entry.timestamp);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

          return (
            <div key={entry.id} className="bg-white hover:bg-gray-50 transition p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Avatar className="w-9 sm:w-10 h-9 sm:h-10 mt-0.5 flex-shrink-0">
                  <AvatarImage src={`https://avatar.vercel.sh/${entry.user.split(' ')[0].toLowerCase()}`} />
                  <AvatarFallback className="text-xs">{entry.user[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                    <p className="text-xs sm:text-sm text-gray-900">
                      <span className="font-semibold">{entry.user}</span>
                      <span className="text-gray-600"> {entry.action}</span>
                    </p>
                    <span className="text-xs text-indigo-600 font-medium">{entry.target}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{entry.details}</p>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="font-mono">{formattedDate}</span>
                    <span>•</span>
                    <span className="font-mono">{formattedTime}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block">
                  <span className="text-xs text-gray-400">#{entry.id.padStart(5, '0')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-900">
          <span className="font-semibold">Legal Notice:</span> This audit log is immutable and provides a legal record of all
          project activities. All entries are timestamped and linked to user accounts.
        </p>
      </div>
    </div>
  );
}
