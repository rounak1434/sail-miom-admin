'use client';
import { useState } from 'react';
import { Plus, Upload, LayoutGrid, List, Download, Trash2, Eye, Edit, MoreVertical, X, Save, FileText } from 'lucide-react';
import { useDrawings, useDrawingCategories, useDeleteDrawing, useUploadDrawing, useUpdateDrawing, useBulkUploadDrawing } from '@/hooks/useDrawings';
import SearchInput from '@/components/shared/SearchInput';
import Pagination from '@/components/shared/Pagination';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/LoadingSpinner';
import { formatDate, formatFileSize } from '@/lib/utils';
import { useFilterStore } from '@/store/filterStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/api/settingsApi';
import { drawingsApi } from '@/api/drawingsApi';
import { toast } from 'sonner';

// FIX #12: Locations now loaded from DB via API (removed hardcoded array)
const DRAWING_TYPES = ['transformer', 'motor', 'breaker', 'panel', 'cable', 'other'];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-sail-border sticky top-0 bg-white">
          <h3 className="font-semibold text-sail-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { title: '', drawingNumber: '', type: '', locationId: '', installationId: '', description: '', file: null };

export default function DrawingsPage() {
  const { drawingsFilter, setDrawingsFilter } = useFilterStore();
  const [view, setView] = useState('list');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModal, setUploadModal] = useState(null); // null | 'single' | 'bulk' | { mode: 'edit', drawing }
  const [form, setForm] = useState(EMPTY_FORM);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkLocationId, setBulkLocationId] = useState('');

  const { data, isLoading } = useDrawings(drawingsFilter);
  const { data: categories = [] } = useDrawingCategories();
  const deleteDrawing = useDeleteDrawing();
  const uploadDrawing = useUploadDrawing();
  const updateDrawing = useUpdateDrawing();
  const bulkUpload = useBulkUploadDrawing();
  const { data: locationsData = [] } = useQuery({ queryKey: ['locations'], queryFn: settingsApi.getLocations });

  const drawings = data?.data || [];
  const total = data?.total || 0;

  const updateFilter = (key, val) => setDrawingsFilter({ [key]: val, page: 1 });
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openUpload = (mode, drawing = null) => {
    if (drawing) {
      setForm({ title: drawing.title, drawingNumber: drawing.drawingNumber, type: drawing.type, locationId: drawing.location?.id ?? drawing.locationId ?? drawing.location_id ?? '', installationId: '', description: '', file: null });
    } else {
      setForm(EMPTY_FORM);
    }
    setUploadModal(drawing ? { mode: 'edit', drawing } : mode);
  };

  const handleUpload = () => {
    const done = () => { setUploadModal(null); setForm(EMPTY_FORM); };
    // Edit mode: send a JSON metadata update (no file re-upload), not a brand-new create.
    if (uploadModal && uploadModal.mode === 'edit') {
      updateDrawing.mutate(
        { id: uploadModal.drawing.id, title: form.title, drawingNumber: form.drawingNumber, type: form.type, locationId: form.locationId || undefined },
        { onSuccess: done }
      );
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') formData.append(k, v); });
    uploadDrawing.mutate(formData, { onSuccess: done });
  };

  const handleDownload = async (drawing) => {
    try {
      const url = await drawingsApi.getDownloadUrl(drawing.id);
      if (!url) { toast.error('Download URL not available'); return; }
      const a = document.createElement('a');
      a.href = url;
      a.download = `${drawing.drawingNumber}.${(drawing.type || 'pdf').toLowerCase()}`;
      a.target = '_blank';
      a.click();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Download URL not available');
    }
  };

  const handleView = async (drawing) => {
    try {
      const url = await drawingsApi.getDownloadUrl(drawing.id);
      if (url) window.open(url, '_blank');
      else toast.error('Preview not available');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Preview not available');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-sail-text-primary flex items-center gap-2">
            Drawings Library
            <span className="px-2.5 py-0.5 bg-slate-100 text-sail-text-secondary rounded-full text-sm font-medium">{total.toLocaleString()}</span>
          </h1>
          <p className="text-sail-text-secondary text-sm mt-0.5">Electrical drawings and schematics repository</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setBulkFiles([]); setUploadModal('bulk'); }}
            className="flex items-center gap-2 px-3 py-2 border border-sail-border rounded-lg text-sm font-medium text-sail-text-secondary hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>
          <button
            onClick={() => openUpload('single')}
            className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Upload Drawing
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.type}
            onClick={() => updateFilter('type', cat.type === 'All' ? '' : cat.type.toLowerCase())}
            className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left transition-all ${
              (drawingsFilter.type === cat.type.toLowerCase() || (cat.type === 'All' && !drawingsFilter.type))
                ? 'bg-sail-primary text-white border-sail-primary shadow-sm'
                : 'bg-white border-sail-border hover:border-sail-primary/30 hover:bg-blue-50/50'
            }`}
          >
            <p className={`text-lg font-bold ${drawingsFilter.type === cat.type.toLowerCase() || (cat.type === 'All' && !drawingsFilter.type) ? 'text-white' : 'text-sail-text-primary'}`}>{cat.count.toLocaleString()}</p>
            <p className={`text-xs font-medium ${drawingsFilter.type === cat.type.toLowerCase() || (cat.type === 'All' && !drawingsFilter.type) ? 'text-white/80' : 'text-sail-text-muted'}`}>{cat.type}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="section-card p-4">
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search drawings..."
            className="w-72"
            defaultValue={drawingsFilter.search}
            onSearch={(v) => updateFilter('search', v)}
          />
          {/* FIX #12: use real locations from DB */}
          <select value={drawingsFilter.location_id} onChange={(e) => updateFilter('location_id', e.target.value)} className="px-3 py-2 border border-sail-border rounded-lg text-sm bg-white focus:outline-none">
            <option value="">All Locations</option>
            {locationsData.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <div className="ml-auto flex gap-1 bg-slate-100 rounded-lg p-1">
            <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-white shadow-sm text-sail-primary' : 'text-slate-400 hover:text-slate-600'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-white shadow-sm text-sail-primary' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-card overflow-hidden">
        {isLoading ? <TableSkeleton rows={8} cols={7} /> : drawings.length === 0 ? (
          <EmptyState title="No drawings found" description="Upload your first drawing to get started." />
        ) : view === 'list' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">Drawing #</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Version</th>
                    <th className="px-4 py-3 text-left">Size</th>
                    <th className="px-4 py-3 text-left">Uploaded</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sail-border">
                  {drawings.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleView(d)}>
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-sail-primary">{d.drawingNumber}</td>
                      <td className="px-4 py-3 text-sm font-medium text-sail-text-primary">{d.title}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">{d.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-sail-text-secondary">{d.location?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-sail-text-muted">{d.version}</td>
                      <td className="px-4 py-3 text-xs text-sail-text-muted">{formatFileSize(d.fileSize)}</td>
                      <td className="px-4 py-3 text-xs text-sail-text-muted">{formatDate(d.uploadedAt)}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(d)} className="flex items-center gap-2"><Eye className="w-4 h-4" /> View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(d)} className="flex items-center gap-2"><Download className="w-4 h-4" /> Download</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openUpload(null, d)} className="flex items-center gap-2"><Edit className="w-4 h-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(d)} className="flex items-center gap-2 text-red-600 focus:text-red-600"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
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
                page={drawingsFilter.page}
                limit={drawingsFilter.limit}
                total={total}
                onPageChange={(p) => setDrawingsFilter({ page: p })}
                onLimitChange={(l) => setDrawingsFilter({ limit: l, page: 1 })}
              />
            </div>
          </>
        ) : (
          <div className="p-4 grid grid-cols-4 gap-4">
            {drawings.map((d) => (
              <div
                key={d.id}
                className="border border-sail-border rounded-xl p-4 hover:border-sail-primary/40 hover:shadow-sm transition-all group cursor-pointer"
                onClick={() => handleView(d)}
              >
                <div className="w-full h-28 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-sail-text-primary truncate mb-1">{d.title}</p>
                <p className="text-xs font-mono text-sail-primary mb-2">{d.drawingNumber}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">{d.type}</span>
                  <span className="text-xs text-sail-text-muted">{d.location?.name ?? '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Single Drawing Modal */}
      {(uploadModal === 'single' || (uploadModal && uploadModal.mode === 'edit')) && (
        <Modal
          title={uploadModal === 'single' ? 'Upload Drawing' : `Edit Drawing — ${uploadModal.drawing?.drawingNumber}`}
          onClose={() => setUploadModal(null)}
        >
          <div className="space-y-4">
            {[
              { label: 'Drawing Number', key: 'drawingNumber', placeholder: 'MIOM-EL-0001' },
              { label: 'Title', key: 'title', placeholder: 'Transformer T-1 Single Line Diagram' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">{label}</label>
                <input value={form[key]} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setField('type', e.target.value)}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm bg-white focus:outline-none">
                  <option value="">Select type…</option>
                  {DRAWING_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Location</label>
                <select value={form.locationId} onChange={(e) => setField('locationId', e.target.value)}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm bg-white focus:outline-none">
                  <option value="">Select location…</option>
                  {locationsData.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            {uploadModal === 'single' && (
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">File (PDF/DWG)</label>
                <input type="file" accept=".pdf,.dwg,.dxf" onChange={(e) => setField('file', e.target.files[0])}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-sail-primary file:text-white file:text-xs file:font-medium" />
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setUploadModal(null)} className="px-4 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleUpload}
                disabled={uploadDrawing.isPending || updateDrawing.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
              >
                <Save className="w-4 h-4" />
                {(uploadDrawing.isPending || updateDrawing.isPending) ? 'Saving…' : uploadModal === 'single' ? 'Upload' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Upload Modal */}
      {uploadModal === 'bulk' && (
        <Modal title="Bulk Upload Drawings" onClose={() => setUploadModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-sail-text-secondary">Select multiple PDF/DWG files. Each file becomes one drawing — the title and drawing number are taken from the filename.</p>
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Location</label>
              <select value={bulkLocationId} onChange={(e) => setBulkLocationId(e.target.value)}
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm bg-white focus:outline-none">
                <option value="">Select location…</option>
                {locationsData.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Files</label>
              <input type="file" accept=".pdf,.dwg,.dxf" multiple
                onChange={(e) => setBulkFiles(Array.from(e.target.files))}
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-sail-primary file:text-white file:text-xs file:font-medium" />
              {bulkFiles.length > 0 && (
                <p className="text-xs text-sail-text-muted mt-1">{bulkFiles.length} file{bulkFiles.length > 1 ? 's' : ''} selected</p>
              )}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setUploadModal(null)} className="px-4 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => {
                  if (!bulkFiles.length) { toast.error('Select at least one file'); return; }
                  if (!bulkLocationId) { toast.error('Select a location'); return; }
                  const formData = new FormData();
                  bulkFiles.forEach((f) => formData.append('files', f));
                  formData.append('location_id', bulkLocationId);
                  bulkUpload.mutate(formData, { onSuccess: () => { setUploadModal(null); setBulkFiles([]); setBulkLocationId(''); } });
                }}
                disabled={!bulkFiles.length || !bulkLocationId || bulkUpload.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {bulkUpload.isPending ? 'Uploading…' : `Upload ${bulkFiles.length || ''} Files`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteDrawing.mutate(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete Drawing"
        description={`Delete drawing "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteDrawing.isPending}
      />
    </div>
  );
}
