'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, FileText, Calendar, CheckCircle2 } from 'lucide-react';

const REPORTS = [
  {
    id: '1',
    title: 'RACI Matrix Report',
    description: 'Complete responsibility assignment matrix for all projects',
    icon: BarChart3,
    formats: ['Excel', 'PDF'],
  },
  {
    id: '2',
    title: 'Completion Summary',
    description: 'Project progress and task completion status',
    icon: CheckCircle2,
    formats: ['Excel', 'PDF'],
  },
  {
    id: '3',
    title: 'Proof Inventory',
    description: 'Complete list of uploaded proofs and documentation',
    icon: FileText,
    formats: ['Excel', 'CSV'],
  },
  {
    id: '4',
    title: 'Timeline Report',
    description: 'Project phases and milestones with dates',
    icon: Calendar,
    formats: ['PDF', 'Excel'],
  },
];

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports & Exports</h1>
        <p className="text-muted-foreground text-sm mt-2">Generate and download project reports</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border mb-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Start Date</label>
            <input type="date" className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm text-foreground bg-background placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">End Date</label>
            <input type="date" className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm text-foreground bg-background placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Project</label>
            <select className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm text-foreground bg-background">
              <option>All Projects</option>
              <option>Skyline Tower</option>
              <option>Riverfront Villa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="p-4 sm:p-6 bg-card border border-border shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {report.formats.map((format) => (
                  <span key={format} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                    {format}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                {report.formats.map((format) => (
                  <Button
                    key={format}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-3 py-2 text-xs flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    {format}
                  </Button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
