'use client';

import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const taskData = [
  { name: 'Jan', completed: 85, total: 100 },
  { name: 'Feb', completed: 88, total: 100 },
  { name: 'Mar', completed: 92, total: 100 },
  { name: 'Apr', completed: 78, total: 100 },
  { name: 'May', completed: 95, total: 100 },
  { name: 'Jun', completed: 87, total: 100 },
];

const timelineData = [
  { week: 'Week 1', planned: 20, actual: 18 },
  { week: 'Week 2', planned: 40, actual: 38 },
  { week: 'Week 3', planned: 60, actual: 62 },
  { week: 'Week 4', planned: 80, actual: 75 },
  { week: 'Week 5', planned: 100, actual: 92 },
];

export function AnalyticsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Task Completion Rate */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Task Completion Rate</h2>
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-indigo-600">87%</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={taskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="completed" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline Progress */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Timeline Progress</h2>
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-purple-600">92%</span>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
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
