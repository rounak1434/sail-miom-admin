'use client';
import { useState } from 'react';
import { Plus, AlertTriangle, Clock, CheckCircle2, Wrench, X, Save } from 'lucide-react';
import { useMaintenance, useCreateMaintenance, invalidateMaintenanceData } from '@/hooks/useMaintenance';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { maintenanceApi } from '@/api/maintenanceApi';
import { settingsApi } from '@/api/settingsApi';
import { formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'sonner';

const STAT_CARDS = [
  { label: 'Overdue', key: 'overdue', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { label: 'Due Today', key: 'dueToday', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { label: 'Due This Week', key: 'dueThisWeek', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { label: 'Completed This Month', key: 'completedThisMonth', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
];

// Maintenance status values are the Prisma enum (uppercase): UPCOMING, DUE, OVERDUE, COMPLETED
const STATUS_COLORS = {
  OVERDUE: 'badge-critical',
  DUE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  UPCOMING: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'badge-resolved',
};
const STATUS_LABELS = { OVERDUE: 'Overdue', DUE: 'Due', UPCOMING: 'Upcoming', COMPLETED: 'Completed' };

// Maintenance type enum (uppercase): MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY
const TYPE_LABELS = { MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', HALF_YEARLY: 'Half-Yearly', YEARLY: 'Yearly' };
const TYPE_COLORS = { MONTHLY: 'bg-cyan-100 text-cyan-700', QUARTERLY: 'bg-purple-100 text-purple-700', HALF_YEARLY: 'bg-orange-100 text-orange-700', YEARLY: 'bg-rose-100 text-rose-700' };

const EMPTY_FORM = { title: '', type: 'MONTHLY', location_id: '', installation_id: '', due_date: '', checklist: '' };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-sail-border sticky top-0 bg-white">
          <h3 className="font-semibold text-sail-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function useCompleteMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    // The /complete endpoint marks it done AND auto-schedules the next cycle.
    mutationFn: ({ id, notes }) => maintenanceApi.complete(id, { notes }),
    onSuccess: () => { toast.success('Marked as completed'); invalidateMaintenanceData(qc); },
    onError: () => toast.error('Failed to complete'),
  });
}

export default function MaintenancePage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useMaintenance({ page, limit: 20 });
  const { data: mntStats } = useQuery({ queryKey: ['maintenance-stats'], queryFn: maintenanceApi.getStats, staleTime: 60000 });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: settingsApi.getLocations });
  const { data: installations = [] } = useQuery({ queryKey: ['installations'], queryFn: () => settingsApi.getInstallations() });
  const createMaintenance = useCreateMaintenance();
  const completeMaintenance = useCompleteMaintenance();

  const schedules = data?.data || [];
  const total = data?.total || 0;

  const grouped = {
    OVERDUE: schedules.filter(s => s.status === 'OVERDUE'),
    DUE: schedules.filter(s => s.status === 'DUE'),
    UPCOMING: schedules.filter(s => s.status === 'UPCOMING'),
    COMPLETED: schedules.filter(s => s.status === 'COMPLETED'),
  };

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = () => {
    if (!form.title || !form.due_date) { toast.error('Title and due date are required'); return; }
    if (!form.location_id || !form.installation_id) { toast.error('Location and installation are required'); return; }
    const payload = {
      title: form.title,
      type: form.type,
      location_id: form.location_id,
      installation_id: form.installation_id,
      due_date: form.due_date,
      checklist: form.checklist ? form.checklist.split('\n').map(s => s.trim()).filter(Boolean) : [],
    };
    createMaintenance.mutate(payload, { onSuccess: () => { setShowCreate(false); setForm(EMPTY_FORM); } });
  };

  const handleComplete = () => {
    completeMaintenance.mutate(
      { id: completeTarget.id, notes: completionNotes },
      { onSuccess: () => { setCompleteTarget(null); setCompletionNotes(''); } }
    );
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-sail-text-primary">Maintenance Management</h1>
          <p className="text-sail-text-secondary text-sm mt-0.5">Schedule and track preventive maintenance activities</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Schedule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {STAT_CARDS.map(({ label, key, icon: Icon, color, bg }) => (
          <div key={label} className={`section-card p-4 flex items-center gap-3 border ${bg}`}>
            <Icon className={`w-6 h-6 ${color} flex-shrink-0`} />
            <div>
              <p className={`text-2xl font-bold ${color}`}>{mntStats?.[key] ?? 0}</p>
              <p className="text-xs text-sail-text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      {isLoading ? <div className="section-card"><TableSkeleton rows={8} cols={6} /></div> : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([status, items]) => {
            if (items.length === 0) return null;
            const headers = { OVERDUE: '🔴 Overdue', DUE: '🟡 Due', UPCOMING: '🔵 Upcoming', COMPLETED: '✅ Completed' };
            return (
              <div key={status} className="section-card overflow-hidden">
                <div className="section-card-header">
                  <h3 className="font-semibold text-sail-text-primary">{headers[status]} <span className="text-slate-400 font-normal text-sm">({items.length})</span></h3>
                </div>
                <div className="divide-y divide-sail-border">
                  {items.map((s) => (
                    <div key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-sail-text-primary">{s.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-sail-text-muted">{s.location?.name ?? '—'}</span>
                          {s.installation?.name && <>
                            <span className="text-xs text-sail-text-muted">·</span>
                            <span className="text-xs text-sail-text-muted">{s.installation.name}</span>
                          </>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[s.type] || ''}`}>{TYPE_LABELS[s.type] || s.type}</span>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[s.status] || ''}`}>{STATUS_LABELS[s.status] || s.status}</span>
                        <span className="text-xs text-sail-text-secondary font-medium">{formatDate(s.dueDate)}</span>
                        <div className="flex gap-1">
                          {s.status !== 'COMPLETED' && (
                            <button
                              onClick={() => { setCompleteTarget(s); setCompletionNotes(''); }}
                              className="px-2.5 py-1 text-xs bg-green-100 text-green-700 border border-green-200 rounded hover:bg-green-200 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {schedules.length === 0 && (
            <div className="section-card">
              <EmptyState title="No maintenance schedules" description="Create your first maintenance schedule." />
            </div>
          )}

          {total > 20 && (
            <div className="section-card p-4">
              <Pagination page={page} limit={20} total={total} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreate && (
        <Modal title="Add Maintenance Schedule" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Title</label>
              <input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="e.g. Monthly Transformer T-1 Inspection"
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setField('type', e.target.value)}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm bg-white focus:outline-none">
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Due Date</label>
                <input type="date" value={form.due_date} onChange={(e) => setField('due_date', e.target.value)}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Location</label>
                <select value={form.location_id} onChange={(e) => setField('location_id', e.target.value)}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm bg-white focus:outline-none">
                  <option value="">Select…</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Installation</label>
                <select value={form.installation_id} onChange={(e) => setField('installation_id', e.target.value)}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm bg-white focus:outline-none">
                  <option value="">Select…</option>
                  {installations
                    .filter((inst) => !form.location_id || String(inst.locationId) === String(form.location_id))
                    .map((inst) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                </select>
                {installations.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No installations yet — add them in Settings first.</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Checklist (one item per line, optional)</label>
              <textarea value={form.checklist} onChange={(e) => setField('checklist', e.target.value)} rows={3}
                placeholder={"Check oil level\nInspect cooling fins\nTest protection relays"}
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sail-primary/20" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} disabled={createMaintenance.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors">
                <Save className="w-4 h-4" />
                {createMaintenance.isPending ? 'Creating…' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Complete Maintenance Modal */}
      {completeTarget && (
        <Modal title={`Complete: ${completeTarget.title}`} onClose={() => setCompleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-sail-text-secondary">Mark this maintenance as completed. Add completion notes below.</p>
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Completion Notes</label>
              <textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={4}
                placeholder="Work done, parts replaced, observations…"
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sail-primary/20" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setCompleteTarget(null)} className="px-4 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={handleComplete} disabled={completeMaintenance.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                {completeMaintenance.isPending ? 'Completing…' : 'Mark Completed'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
