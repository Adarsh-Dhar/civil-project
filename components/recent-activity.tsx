'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  user: { name: string };
  project: { name: string };
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/dashboard/activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (action: string) => {
    if (action.includes('upload')) return FileText;
    if (action.includes('complete')) return CheckCircle;
    if (action.includes('flag')) return AlertCircle;
    return Clock;
  };

  const getColor = (action: string) => {
    if (action.includes('upload')) return 'text-blue-600';
    if (action.includes('complete')) return 'text-green-600';
    if (action.includes('flag')) return 'text-red-600';
    return 'text-amber-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Recent Activity</h2>
        <div>Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Recent Activity</h2>

      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.action);
          const color = getColor(activity.action);
          const timeAgo = new Date(activity.timestamp).toLocaleString();
          return (
            <div key={activity.id} className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <Avatar className="w-9 sm:w-10 h-9 sm:h-10 mt-0.5 flex-shrink-0">
                <AvatarImage src={`https://avatar.vercel.sh/${activity.user.name.split(' ')[0].toLowerCase()}`} />
                <AvatarFallback className="text-xs">{activity.user.name.split(' ')[0][0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900 line-clamp-2 sm:line-clamp-none">
                      <span className="font-medium">{activity.user.name}</span>
                      <span className="text-gray-600 hidden sm:inline"> {activity.action}</span>
                      <span className="text-gray-600 sm:hidden text-[11px]"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{activity.project.name}</p>
                  </div>
                  <Icon className={`w-4 h-4 ${color} mt-1 flex-shrink-0`} />
                </div>
              </div>

              <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">{timeAgo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
