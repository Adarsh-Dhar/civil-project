'use client';

import React, { useState, useEffect } from "react"

import { TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  trend?: number;
  unit?: string;
  icon?: React.ReactNode;
}

export function SummaryCard({ title, value, trend, unit }: SummaryCardProps) {
  const sparklineData = [2, 4, 3, 8, 5, 9, 4, 7, 6, 8, 5];
  
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-gray-600 font-medium text-xs sm:text-sm truncate">{title}</h3>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium flex-shrink-0 ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</div>
        {unit && <p className="text-xs text-gray-500 mt-1">{unit}</p>}
      </div>

      {/* Mini Sparkline */}
      <div className="flex items-end gap-1 h-8 sm:h-10">
        {sparklineData.map((val, idx) => (
          <div
            key={idx}
            className="flex-1 bg-gradient-to-t from-indigo-200 to-indigo-300 rounded-sm transition-all hover:opacity-80"
            style={{ height: `${(val / 10) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SummaryCardsSection() {
  const [summary, setSummary] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalProofs: 0,
    complianceItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/dashboard/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Projects', value: summary.totalProjects, trend: 8, unit: 'Active' },
    { title: 'Active Projects', value: summary.activeProjects, trend: 5, unit: 'In progress' },
    { title: 'Total Proofs', value: summary.totalProofs, trend: 10, unit: 'Uploaded' },
    { title: 'Compliance Items', value: summary.complianceItems, trend: -2, unit: 'Pending' },
  ];

  if (loading) {
    return <div>Loading summary...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => (
        <SummaryCard key={idx} {...card} />
      ))}
    </div>
  );
}
