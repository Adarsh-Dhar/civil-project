'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const COMPLIANCE_ITEMS = [
  {
    id: '1',
    name: 'Foundation Inspection',
    status: 'Approved',
    dueDate: '2024-03-20',
    inspector: 'Government Inspector',
    notes: 'All standards met. No issues found.',
  },
  {
    id: '2',
    name: 'Structural Approval',
    status: 'Pending',
    dueDate: '2024-04-20',
    inspector: 'Chief Structural Engineer',
    notes: 'Awaiting final review. Expected by April 20.',
  },
  {
    id: '3',
    name: 'Safety Certification',
    status: 'Approved',
    dueDate: '2024-02-28',
    inspector: 'OSHA Inspector',
    notes: 'Site safety measures compliant. Valid until 2025.',
  },
  {
    id: '4',
    name: 'Environmental Assessment',
    status: 'Not Started',
    dueDate: '2024-05-15',
    inspector: 'EPA Representative',
    notes: 'Required after structural phase completion.',
  },
  {
    id: '5',
    name: 'Electrical Inspection',
    status: 'Rejected',
    dueDate: '2024-03-15',
    inspector: 'City Electrical Inspector',
    notes: 'Minor issues found. Resubmit after corrections.',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Approved':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    case 'Pending':
      return <Clock className="w-5 h-5 text-amber-600" />;
    case 'Rejected':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function CompliancePage({ params }: { params: { projectId: string } }) {
  const approved = COMPLIANCE_ITEMS.filter(i => i.status === 'Approved').length;
  const pending = COMPLIANCE_ITEMS.filter(i => i.status === 'Pending').length;
  const rejected = COMPLIANCE_ITEMS.filter(i => i.status === 'Rejected').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Compliance & Inspections</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Track approvals and government inspections</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-emerald-700 font-medium mb-2">Approved</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-900">{approved}</p>
          <p className="text-xs text-emerald-600 mt-2">{Math.round((approved / COMPLIANCE_ITEMS.length) * 100)}% complete</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-amber-700 font-medium mb-2">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-900">{pending}</p>
          <p className="text-xs text-amber-600 mt-2">Awaiting review</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-red-700 font-medium mb-2">Rejected</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-900">{rejected}</p>
          <p className="text-xs text-red-600 mt-2">Need corrections</p>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="space-y-3">
        {COMPLIANCE_ITEMS.map((item) => (
          <div key={item.id} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="mt-1 flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{item.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-600 mb-2">
                  <span>{item.inspector}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    Due:{' '}
                    {new Date(item.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded">{item.notes}</p>
              </div>
            </div>

            {item.status === 'Rejected' && (
              <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm mt-3">
                Review & Resubmit
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
