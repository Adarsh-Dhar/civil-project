'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AuditLog = {
  id: string;
  action: string;
  details: string | null;
  timestamp: string;
  user: { name: string | null };
};

export default function AuditLogPage() {
  const params = useParams<{ projectId?: string | string[] }>();
  const projectId = useMemo(() => {
    const raw = params?.projectId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [entries, setEntries] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError('Invalid project id.');
      return;
    }

    let cancelled = false;

    const fetchAuditLogs = async () => {
      try {
        setError('');
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (!cancelled) {
            setError(errorData?.error || 'Failed to load audit logs.');
          }
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setEntries(Array.isArray(data?.project?.auditLogs) ? data.project.auditLogs : []);
        }
      } catch (fetchError) {
        console.error('Failed to fetch audit logs:', fetchError);
        if (!cancelled) {
          setError('Failed to load audit logs.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAuditLogs();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Audit Log</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Immutable record of all project activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-lg px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-2 text-xs sm:text-sm bg-transparent">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" className="rounded-lg px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-2 text-xs sm:text-sm bg-transparent">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground mb-4">Loading audit logs...</div>}
      {!loading && error && <div className="text-sm text-destructive mb-4">{error}</div>}

      {/* Log Entries */}
      <div className="space-y-0 divide-y divide-border">
        {!loading && !error && entries.length === 0 && (
          <div className="bg-card p-6 border border-border rounded-lg text-sm text-muted-foreground">
            No audit logs found for this project.
          </div>
        )}

        {entries.map((entry) => {
          const date = new Date(entry.timestamp);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          const userName = entry.user?.name || 'Unknown user';
          const target = entry.details ? entry.details.split(':')[0] : 'Activity';

          return (
            <div key={entry.id} className="bg-card hover:bg-accent/40 transition p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Avatar className="w-9 sm:w-10 h-9 sm:h-10 mt-0.5 flex-shrink-0">
                  <AvatarImage src={`https://avatar.vercel.sh/${userName.split(' ')[0].toLowerCase()}`} />
                  <AvatarFallback className="text-xs">{userName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                    <p className="text-xs sm:text-sm text-foreground">
                      <span className="font-semibold">{userName}</span>
                      <span className="text-muted-foreground"> {entry.action.replaceAll('_', ' ').toLowerCase()}</span>
                    </p>
                    <span className="text-xs text-indigo-600 font-medium">{target}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{entry.details || 'No details provided.'}</p>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-mono">{formattedDate}</span>
                    <span>•</span>
                    <span className="font-mono">{formattedTime}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block">
                  <span className="text-xs text-muted-foreground">#{entry.id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-900">
          <span className="font-semibold">Legal Notice:</span> This audit log is immutable and provides a legal record of all
          project activities. All entries are timestamped and linked to user accounts.
        </p>
      </div>
    </div>
  );
}
