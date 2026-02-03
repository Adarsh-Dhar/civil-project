'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const PHASES = [
  {
    id: '1',
    name: 'Planning & Design',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    progress: 100,
    status: 'Completed',
  },
  {
    id: '2',
    name: 'Site Preparation',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    progress: 100,
    status: 'Completed',
  },
  {
    id: '3',
    name: 'Excavation & Foundation',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    progress: 85,
    status: 'In Progress',
  },
  {
    id: '4',
    name: 'Structural Work',
    startDate: '2024-04-16',
    endDate: '2024-06-30',
    progress: 0,
    status: 'Pending',
  },
  {
    id: '5',
    name: 'MEP Systems',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    progress: 0,
    status: 'Pending',
  },
  {
    id: '6',
    name: 'Finishing & Testing',
    startDate: '2024-10-01',
    endDate: '2025-01-15',
    progress: 0,
    status: 'Pending',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'text-emerald-600';
    case 'In Progress':
      return 'text-amber-600';
    case 'Pending':
      return 'text-slate-600';
    default:
      return 'text-gray-600';
  }
};

const getBarColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-500';
    case 'In Progress':
      return 'bg-amber-500';
    case 'Pending':
      return 'bg-gray-300';
    default:
      return 'bg-gray-300';
  }
};

export default function TimelinePage({ params }: { params: { projectId: string } }) {
  const getProgress = (startDate: string, endDate: string, currentProgress: number) => {
    return currentProgress;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Project Timeline</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Track phases and milestones</p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {PHASES.map((phase, index) => {
          const startDate = new Date(phase.startDate);
          const endDate = new Date(phase.endDate);
          const durationMonths = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );

          return (
            <div key={phase.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute left-0 top-8 w-4 h-4 bg-white border-4 border-indigo-600 rounded-full -translate-x-1.5"></div>

              {/* Content Card */}
              <div className="ml-6 sm:ml-8 bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{phase.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} -{' '}
                      {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <span className="text-gray-500"> • {durationMonths} months</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {phase.status === 'Completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-medium text-gray-900">{phase.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(phase.status)} transition-all`}
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Timeline Line */}
              {index < PHASES.length - 1 && (
                <div className="absolute left-1 top-24 w-0.5 h-16 bg-gray-300"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-900">
          <span className="font-semibold">Note:</span> Timeline shows planned phases. Current project is{' '}
          <span className="font-semibold">65% complete</span> overall with Excavation & Foundation phase in progress.
        </p>
      </div>
    </div>
  );
}
