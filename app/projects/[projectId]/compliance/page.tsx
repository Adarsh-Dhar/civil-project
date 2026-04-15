'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type ComplianceItem = {
  id: string;
  requirement: string;
  status: 'pending' | 'compliant' | 'non-compliant';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'compliant':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-amber-600" />;
    case 'non-compliant':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'compliant':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'non-compliant':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-secondary text-secondary-foreground border-border';
  }
};

const getStatusLabel = (status: ComplianceItem['status']) => {
  switch (status) {
    case 'compliant':
      return 'Compliant';
    case 'non-compliant':
      return 'Non-Compliant';
    default:
      return 'Pending';
  }
};

export default function CompliancePage() {
  const params = useParams<{ projectId?: string | string[] }>();
  const projectId = useMemo(() => {
    const raw = params?.projectId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError('Invalid project id.');
      return;
    }

    let cancelled = false;

    const fetchCompliance = async () => {
      try {
        setError('');
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (!cancelled) {
            setError(errorData?.error || 'Failed to load compliance records.');
          }
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setItems(Array.isArray(data?.project?.compliance) ? data.project.compliance : []);
        }
      } catch (fetchError) {
        console.error('Failed to fetch compliance:', fetchError);
        if (!cancelled) {
          setError('Failed to load compliance records.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCompliance();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const compliant = items.filter((i) => i.status === 'compliant').length;
  const pending = items.filter((i) => i.status === 'pending').length;
  const nonCompliant = items.filter((i) => i.status === 'non-compliant').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Compliance & Inspections</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track approvals and government inspections</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-emerald-700 font-medium mb-2">Compliant</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-900">{compliant}</p>
          <p className="text-xs text-emerald-600 mt-2">
            {items.length > 0 ? `${Math.round((compliant / items.length) * 100)}% complete` : 'No records yet'}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-amber-700 font-medium mb-2">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-900">{pending}</p>
          <p className="text-xs text-amber-600 mt-2">Awaiting review</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-red-700 font-medium mb-2">Non-Compliant</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-900">{nonCompliant}</p>
          <p className="text-xs text-red-600 mt-2">Need corrections</p>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading compliance records...</div>}
      {!loading && error && <div className="text-sm text-destructive">{error}</div>}

      {/* Compliance Checklist */}
      <div className="space-y-3">
        {!loading && !error && items.length === 0 && (
          <div className="bg-card rounded-lg sm:rounded-xl p-6 border border-border text-sm text-muted-foreground">
            No compliance records found for this project.
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border hover:shadow-md transition">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
              <div className="mt-1 flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">{item.requirement}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground mb-2">
                  <span>Updated</span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    {new Date(item.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    Created{' '}
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-foreground bg-secondary/50 p-2 sm:p-3 rounded">{item.notes || 'No notes added yet.'}</p>
              </div>
            </div>

            {item.status === 'non-compliant' && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                Action required: resolve issues and update status.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
