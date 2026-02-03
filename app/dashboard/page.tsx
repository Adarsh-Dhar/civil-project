'use client';

import { useState } from 'react';
import { SummaryCardsSection } from '@/components/summary-cards';
import { AnalyticsSection } from '@/components/analytics-section';
import { RecentActivity } from '@/components/recent-activity';
import { RACITable } from '@/components/raci-table';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Tab Navigation */}
      <div className="flex gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-gray-200 pb-3 sm:pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`font-medium text-xs sm:text-sm whitespace-nowrap transition-colors pb-2 border-b-2 ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Project Dashboard
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`font-medium text-xs sm:text-sm whitespace-nowrap transition-colors pb-2 border-b-2 ${
            activeTab === 'table'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          RACI Matrix
        </button>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Summary Cards */}
          <SummaryCardsSection />

          {/* Analytics */}
          <AnalyticsSection />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      )}

      {/* RACI Table View */}
      {activeTab === 'table' && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Construction Workflow</h1>
            <p className="text-gray-600 text-xs sm:text-sm">Manage tasks with RACI matrix and proof documentation</p>
          </div>
          <RACITable />
        </div>
      )}
    </div>
  );
}
