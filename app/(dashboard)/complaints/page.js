'use client';
import { useState, useEffect } from 'react';
import { Plus, Download, Filter, MoreVertical, Eye, UserCheck, CheckSquare, Trash2 } from 'lucide-react';
import { useComplaints, useDeleteComplaint, useUpdateComplaintStatus } from '@/hooks/useComplaints';
import { useUsers } from '@/hooks/useUsers';
import { useQuery } from '@tanstack/react-query';
import { complaintsApi } from '@/api/complaintsApi';
import { settingsApi } from '@/api/settingsApi';
import { dashboardApi } from '@/api/dashboardApi';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badges';
import SearchInput from '@/components/shared/SearchInput';
import Pagination from '@/components/shared/Pagination';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate, timeAgo, truncate } from '@/lib/utils';
import { useFilterStore } from '@/store/filterStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const STATUS_TABS = [
  { label: 'All', value: '', countKey: null },
  { label: 'Open', value: 'open', countKey: 'open', color: 'text-red-600' },
  { label: 'In Progress', value: 'in_progress', countKey: 'inProgress', color: 'text-yellow-600' },
  { label: 'Resolved', value: 'resolved', countKey: 'resolved', color: 'text-green-600' },
  { label: 'Closed', value: 'closed', countKey: 'closed', color: 'text-slate-500' },
];

const PRIORITIES = ['critical', 'high', 'medium', 'low'];

export default function ComplaintsPage() {
  const router = useRouter();
  const { complaintsFilter, setComplaintsFilter } = useFilterStore();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected, setSelected] = useState([]);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useComplaints(complaintsFilter);
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: settingsApi.getLocations });
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.getStats, staleTime: 60000 });
  const deleteComplaint = useDeleteComplaint();
  const updateStatus = useUpdateComplaintStatus();

  const complaints = data?.data || [];
  const total = data?.total || 0;
  const statusCounts = stats?.statusBreakdown || {};

  // Honor deep links from the dashboard cards, e.g. /complaints?status=open&priority=high.
  // (The page state lives in the filter store, not the URL, so apply params once on mount.)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const next = {};
    const status = sp.get('status');
    const priority = sp.get('priority');
    const location_id = sp.get('location_id');
    const breached = sp.get('breached');
    if (status !== null) next.status = status;
    if (priority !== null) next.priority = priority;
    if (location_id !== null) next.location_id = location_id;
    if (breached !== null) next.breached = breached;
    if (Object.keys(next).length) setComplaintsFilter({ ...next, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, val) => setComplaintsFilter({ [key]: val, page: 1 });

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleExport = async (ids) => {
    setExporting(true);
    try {
      const params = ids?.length ? { ids: ids.join(',') } : complaintsFilter;
      const blob = await complaintsApi.export(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complaints-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-sail-text-primary flex items-center gap-2">
            Complaints Management
            <span className="px-2.5 py-0.5 bg-slate-100 text-sail-text-secondary rounded-full text-sm font-medium">{total}</span>
          </h1>
          <p className="text-sail-text-secondary text-sm mt-0.5">Track and manage all electrical department complaints</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport()}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 border border-sail-border rounded-lg text-sm font-medium text-sail-text-secondary hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Export'}
          </button>
          <button
            onClick={() => router.push('/complaints/new')}
            className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Raise Complaint
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="section-card p-4">
        <div className="filter-bar">
          <SearchInput
            placeholder="Search complaints..."
            className="w-64"
            defaultValue={complaintsFilter.search}
            onSearch={(v) => updateFilter('search', v)}
          />
          <select value={complaintsFilter.priority} onChange={(e) => updateFilter('priority', e.target.value)} className="px-3 py-2 border border-sail-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sail-primary/20">
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select value={complaintsFilter.location_id} onChange={(e) => updateFilter('location_id', e.target.value)} className="px-3 py-2 border border-sail-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sail-primary/20">
            <option value="">All Locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          {(complaintsFilter.search || complaintsFilter.priority || complaintsFilter.location_id || complaintsFilter.breached) && (
            <button onClick={() => setComplaintsFilter({ search: '', priority: '', location_id: '', breached: '' })} className="text-sm text-sail-primary hover:underline">Clear filters</button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mt-4 border-b border-sail-border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateFilter('status', tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${complaintsFilter.status === tab.value ? 'border-sail-primary text-sail-primary' : 'border-transparent text-sail-text-secondary hover:text-sail-text-primary'}`}
            >
              {tab.label}
              {tab.countKey && statusCounts[tab.countKey] != null && (
                <span className={`text-xs font-semibold ${tab.color || ''}`}>{statusCounts[tab.countKey]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-sail-primary/10 border border-sail-primary/20 rounded-lg">
          <span className="text-sm font-medium text-sail-primary">{selected.length} selected</span>
          <button
            onClick={() => handleExport(selected)}
            disabled={exporting}
            className="text-sm text-sail-primary hover:underline flex items-center gap-1 disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" /> Export Selected
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete ${selected.length} complaints? This cannot be undone.`)) {
                selected.forEach((cid) => deleteComplaint.mutate(cid));
                setSelected([]);
              }
            }}
            className="text-sm text-red-600 hover:underline flex items-center gap-1 ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="section-card overflow-hidden">
        {isLoading ? <TableSkeleton rows={8} cols={8} /> : complaints.length === 0 ? (
          <EmptyState title="No complaints found" description="No complaints match your current filters." icon={Filter} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        ref={(el) => { if (el) el.indeterminate = selected.length > 0 && selected.length < complaints.length; }}
                        checked={complaints.length > 0 && selected.length === complaints.length}
                        onChange={(e) => setSelected(e.target.checked ? complaints.map((c) => c.id) : [])}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Assigned To</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sail-border">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => router.push(`/complaints/${c.id}`)}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-300" />
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-sail-primary font-semibold">{c.complaintNumber ?? c.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-sail-text-primary">{truncate(c.title, 35)}</p>
                      </td>
                      <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-sm text-sail-text-secondary">{c.location?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        {c.assignedTo ? (
                          <span className="text-sm text-sail-text-secondary">{c.assignedTo.name}</span>
                        ) : (
                          <span className="text-sm text-red-500 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-sail-text-muted">{timeAgo(c.createdAt)}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/complaints/${c.id}`)} className="flex items-center gap-2"><Eye className="w-4 h-4" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/complaints/${c.id}`)} className="flex items-center gap-2"><UserCheck className="w-4 h-4" /> Assign</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/complaints/${c.id}`)} className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Change Status</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(c)} className="flex items-center gap-2 text-red-600 focus:text-red-600"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 border-t border-sail-border">
              <Pagination
                page={complaintsFilter.page}
                limit={complaintsFilter.limit}
                total={total}
                onPageChange={(p) => setComplaintsFilter({ page: p })}
                onLimitChange={(l) => setComplaintsFilter({ limit: l, page: 1 })}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteComplaint.mutate(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete Complaint"
        description={`Are you sure you want to delete complaint "${deleteTarget?.complaintNumber ?? deleteTarget?.id}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteComplaint.isPending}
      />
    </div>
  );
}
