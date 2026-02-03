'use client';

import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const activities = [
  {
    id: 1,
    user: 'John Davis',
    action: 'uploaded foundation inspection proof',
    project: 'Skyline Tower',
    time: '2 hours ago',
    icon: FileText,
    color: 'text-blue-600',
  },
  {
    id: 2,
    user: 'Sarah Chen',
    action: 'completed structural steel task',
    project: 'Riverfront Villa',
    time: '4 hours ago',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  {
    id: 3,
    user: 'Mike Johnson',
    action: 'flagged safety compliance issue',
    project: 'Skyline Tower',
    time: '6 hours ago',
    icon: AlertCircle,
    color: 'text-red-600',
  },
  {
    id: 4,
    user: 'Emma Wilson',
    action: 'rescheduled electrical wiring task',
    project: 'Riverfront Villa',
    time: '1 day ago',
    icon: Clock,
    color: 'text-amber-600',
  },
];

export function RecentActivity() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Recent Activity</h2>

      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <Avatar className="w-9 sm:w-10 h-9 sm:h-10 mt-0.5 flex-shrink-0">
                <AvatarImage src={`https://avatar.vercel.sh/${activity.user.split(' ')[0].toLowerCase()}`} />
                <AvatarFallback className="text-xs">{activity.user.split(' ')[0][0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900 line-clamp-2 sm:line-clamp-none">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-600 hidden sm:inline"> {activity.action}</span>
                      <span className="text-gray-600 sm:hidden text-[11px]"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{activity.project}</p>
                  </div>
                  <Icon className={`w-4 h-4 ${activity.color} mt-1 flex-shrink-0`} />
                </div>
              </div>

              <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
