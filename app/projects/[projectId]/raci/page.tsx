'use client';

import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

const TEAM_MEMBERS = ['Alice Morgan', 'Bob Collins', 'Charlie Davis', 'Engineer A'];
const FUNCTIONS = [
  'Site Preparation',
  'Excavation',
  'Foundation Pouring',
  'Structural Steel',
  'Electrical Wiring',
  'Plumbing',
  'HVAC',
];

// RACI Matrix data
const RACI_MATRIX: Record<string, Record<string, string>> = {
  'Site Preparation': {
    'Alice Morgan': 'A',
    'Bob Collins': 'R',
    'Charlie Davis': 'C',
    'Engineer A': 'I',
  },
  'Excavation': {
    'Alice Morgan': 'A',
    'Bob Collins': '',
    'Charlie Davis': 'R',
    'Engineer A': 'C',
  },
  'Foundation Pouring': {
    'Alice Morgan': 'A',
    'Bob Collins': 'R',
    'Charlie Davis': 'C',
    'Engineer A': 'R',
  },
  'Structural Steel': {
    'Alice Morgan': 'A',
    'Bob Collins': 'C',
    'Charlie Davis': '',
    'Engineer A': 'R',
  },
  'Electrical Wiring': {
    'Alice Morgan': 'A',
    'Bob Collins': '',
    'Charlie Davis': 'R',
    'Engineer A': 'C',
  },
  'Plumbing': {
    'Alice Morgan': 'A',
    'Bob Collins': 'R',
    'Charlie Davis': 'I',
    'Engineer A': 'C',
  },
  'HVAC': {
    'Alice Morgan': 'A',
    'Bob Collins': 'C',
    'Charlie Davis': 'R',
    'Engineer A': 'I',
  },
};

const getRACIColor = (role: string) => {
  switch (role) {
    case 'R':
      return 'bg-blue-50 border border-blue-200';
    case 'A':
      return 'bg-purple-50 border border-purple-200';
    case 'C':
      return 'bg-amber-50 border border-amber-200';
    case 'I':
      return 'bg-emerald-50 border border-emerald-200';
    default:
      return 'bg-gray-50 border border-gray-200';
  }
};

const getRACITextColor = (role: string) => {
  switch (role) {
    case 'R':
      return 'text-blue-700 font-semibold';
    case 'A':
      return 'text-purple-700 font-semibold';
    case 'C':
      return 'text-amber-700 font-semibold';
    case 'I':
      return 'text-emerald-700 font-semibold';
    default:
      return 'text-gray-400';
  }
};

export default function RACIPage({ params }: { params: { projectId: string } }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">RACI Matrix</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Responsibility assignment matrix</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-lg px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-2 text-xs sm:text-sm bg-transparent">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
          <span className="text-gray-700"><span className="font-semibold text-blue-700">R</span> = Responsible</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded"></div>
          <span className="text-gray-700"><span className="font-semibold text-purple-700">A</span> = Accountable</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded"></div>
          <span className="text-gray-700"><span className="font-semibold text-amber-700">C</span> = Consulted</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded"></div>
          <span className="text-gray-700"><span className="font-semibold text-emerald-700">I</span> = Informed</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">Function</th>
                {TEAM_MEMBERS.map((member) => (
                  <th key={member} className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs font-semibold text-gray-900 whitespace-nowrap">
                    <span className="text-[10px] sm:text-xs">{member.split(' ')[0]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FUNCTIONS.map((func) => (
                <tr key={func} className="hover:bg-gray-50 transition">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 hover:bg-gray-50">
                    {func}
                  </td>
                  {TEAM_MEMBERS.map((member) => {
                    const role = RACI_MATRIX[func][member];
                    return (
                      <td key={`${func}-${member}`} className="px-2 sm:px-4 py-3 sm:py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded ${getRACIColor(role)}`}>
                          <span className={`text-xs sm:text-sm ${getRACITextColor(role)}`}>
                            {role || '-'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-900">
          <span className="font-semibold">Tip:</span> Use this matrix to clearly define roles and responsibilities. Each task should have exactly one person Responsible (R) and one person Accountable (A).
        </p>
      </div>
    </div>
  );
}
