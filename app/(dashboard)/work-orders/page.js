'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Search, Filter, ClipboardList } from 'lucide-react';
import { workOrdersApi } from '@/api/workOrdersApi';
import { usersApi } from '@/api/usersApi';
import { settingsApi } from '@/api/settingsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const STATUS_COLORS = {
  OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const PRIORITY_COLORS = {
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  LOW: 'bg-green-500/10 text-green-400 border-green-500/20',
};

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-sail-card border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-semibold text-lg mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractors, setContractors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { title: '', description: '', priority: 'MEDIUM', location_id: '', assigned_to_id: '', due_date: '', notes: '', status: 'OPEN' };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    try {
      const result = await workOrdersApi.getWorkOrders(params);
      setWorkOrders(result.data || []);
      setTotal(result.total || 0);
    } catch (e) {
      setWorkOrders([]);
      setTotal(0);
      toast.error(e?.response?.data?.message || 'Could not load work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  // Auto-refresh when the admin returns to the tab so work orders changed
  // elsewhere (e.g. a contractor updating status from the mobile app) show up.
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [statusFilter]);

  useEffect(() => {
    usersApi.getAll({ role: 'CONTRACTOR', limit: 100 }).then(r => setContractors(r.data || r || [])).catch(() => {});
    settingsApi.getLocations().then(r => setLocations(r.data || r || [])).catch(() => {});
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditTarget(null); setModalOpen(true); };
  const openEdit = (wo) => {
    setEditTarget(wo);
    setForm({
      title: wo.title,
      description: wo.description,
      priority: wo.priority,
      location_id: wo.locationId || '',
      assigned_to_id: wo.assignedToId || '',
      due_date: wo.dueDate ? wo.dueDate.slice(0, 10) : '',
      notes: wo.notes || '',
      status: wo.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await workOrdersApi.updateWorkOrder(editTarget.id, form);
        toast.success('Work order updated');
      } else {
        await workOrdersApi.createWorkOrder(form);
        toast.success('Work order created');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to save work order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await workOrdersApi.deleteWorkOrder(deleteTarget.id);
      toast.success('Work order deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete work order');
    }
  };

  const filtered = workOrders.filter(wo => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (wo.title || '').toLowerCase().includes(q) ||
      (wo.workOrderNumber || '').toLowerCase().includes(q) ||
      (wo.assignedTo?.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Orders</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total work orders</p>
        </div>
        <Button onClick={openCreate} className="bg-sail-orange hover:bg-sail-orange/90 text-white gap-2">
          <Plus className="w-4 h-4" /> New Work Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search work orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-sail-card border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-sail-card border border-white/10 text-white rounded-md text-sm"
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-sail-card border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No work orders found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-slate-400 text-xs font-medium">Work Order</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium">Assigned To</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium">Priority</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium">Status</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium">Due Date</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium">Location</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(wo => (
                <tr key={wo.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{wo.title}</p>
                    <p className="text-slate-400 text-xs">{wo.workOrderNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    {wo.assignedTo ? (
                      <div>
                        <p className="text-white text-sm">{wo.assignedTo.name}</p>
                        <p className="text-slate-400 text-xs">{wo.assignedTo.email}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_COLORS[wo.priority] || ''}`}>
                      {wo.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[wo.status] || ''}`}>
                      {wo.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{wo.location?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1.5 hover:bg-white/10 rounded text-slate-400">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-sail-card border-white/10">
                        <DropdownMenuItem onClick={() => openEdit(wo)} className="flex items-center gap-2 text-white">
                          <Edit className="w-4 h-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(wo)} className="flex items-center gap-2 text-red-400 focus:text-red-400">
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Work Order' : 'New Work Order'}>
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Title *</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Work order title" className="bg-sail-bg border-white/10 text-white" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Describe the work to be done..."
              className="w-full px-3 py-2 bg-sail-bg border border-white/10 rounded-md text-white placeholder:text-slate-500 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-sail-bg border border-white/10 text-white rounded-md text-sm">
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 bg-sail-bg border border-white/10 text-white rounded-md text-sm">
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Assign to Contractor</label>
            <select value={form.assigned_to_id} onChange={e => setForm(f => ({ ...f, assigned_to_id: e.target.value }))}
              className="w-full px-3 py-2 bg-sail-bg border border-white/10 text-white rounded-md text-sm">
              <option value="">— Unassigned —</option>
              {contractors.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Location</label>
              <select value={form.location_id} onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}
                className="w-full px-3 py-2 bg-sail-bg border border-white/10 text-white rounded-md text-sm">
                <option value="">— None —</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Due Date</label>
              <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="bg-sail-bg border-white/10 text-white" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Additional notes..."
              className="w-full px-3 py-2 bg-sail-bg border border-white/10 rounded-md text-white placeholder:text-slate-500 text-sm resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 border-white/10 text-slate-300" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.description.trim()}
              className="flex-1 bg-sail-orange hover:bg-sail-orange/90 text-white">
              {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Create Work Order'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Work Order">
        <p className="text-slate-300 text-sm mb-6">
          Delete <strong className="text-white">{deleteTarget?.workOrderNumber}</strong> — {deleteTarget?.title}? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-white/10 text-slate-300" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
