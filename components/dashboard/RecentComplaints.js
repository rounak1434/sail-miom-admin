'use client';
import Link from 'next/link';
import { useComplaints } from '@/hooks/useComplaints';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badges';
import { timeAgo, truncate } from '@/lib/utils';
import { TableSkeleton } from '@/components/shared/LoadingSpinner';
import { ExternalLink } from 'lucide-react';

export default function RecentComplaints() {
  const { data, isLoading } = useComplaints({ limit: 5, page: 1 });
  const complaints = data?.data || [];

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3 className="font-semibold text-sail-text-primary">Recent Complaints</h3>
        <Link href="/complaints" className="text-sm text-sail-primary hover:underline flex items-center gap-1">
          View all <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
      {isLoading ? <TableSkeleton rows={5} cols={4} /> : (
        <div className="divide-y divide-sail-border">
          {complaints.map((c) => (
            <Link key={c.id} href={`/complaints/${c.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sail-text-primary truncate group-hover:text-sail-primary">{truncate(c.title, 35)}</p>
                <p className="text-xs text-sail-text-muted">{c.complaintNumber ?? c.id} · {c.location?.name ?? '—'} · {timeAgo(c.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
