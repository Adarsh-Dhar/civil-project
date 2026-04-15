'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type StageCompletion = {
  stage: string;
  completed: number;
  total: number;
  completionPercent: number;
};

type TimelinePoint = {
  period: string;
  planned: number;
  actual: number;
};

export function AnalyticsSection() {
  const [stageData, setStageData] = useState<StageCompletion[]>([]);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/dashboard/analytics');
        if (!response.ok) return;

        const data = await response.json();
        setStageData(data.stageCompletion ?? []);
        setTimelineData(data.timeline ?? []);
      } catch (error) {
        console.error('Failed to fetch dashboard analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const taskCompletionPercent = useMemo(() => {
    if (stageData.length === 0) return 0;
    const totals = stageData.reduce(
      (acc, row) => {
        acc.completed += row.completed;
        acc.total += row.total;
        return acc;
      },
      { completed: 0, total: 0 }
    );
    return totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;
  }, [stageData]);

  const timelineProgress = useMemo(() => {
    if (timelineData.length === 0) return 0;
    return timelineData[timelineData.length - 1]?.actual ?? 0;
  }, [timelineData]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Task Completion Rate */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">Task Completion Rate</h2>
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-indigo-600">{taskCompletionPercent}%</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stageData.map((row) => ({ name: row.stage, completed: row.completionPercent, total: 100 }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="completed" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline Progress */}
      <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">Timeline Progress</h2>
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-purple-600">{timelineProgress}%</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="period" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="planned"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorPlanned)"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorActual)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
