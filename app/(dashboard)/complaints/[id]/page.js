'use client';
import { useState, useRef } from 'react';
import { ArrowLeft, Edit, Trash2, UserCheck, CheckSquare, Download, Clock, MapPin, User, Calendar, AlertTriangle, X, ImagePlus, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useComplaint, useComplaintTimeline, useAssignComplaint, useUpdateComplaintStatus, useDeleteComplaint } from '@/hooks/useComplaints';
import { useUsers } from '@/hooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';
import { complaintsApi } from '@/api/complaintsApi';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badges';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { formatDateTime, timeAgo } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-sail-border">
          <h3 className="font-semibold text-sail-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function ComplaintDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const { data, isLoading } = useComplaint(id);
  const { data: timeline = [] } = useComplaintTimeline(id);
  const { data: usersData } = useUsers({ role: 'contractor', limit: 100 });
  const assignComplaint = useAssignComplaint();
  const updateStatus = useUpdateComplaintStatus();
  const deleteComplaint = useDeleteComplaint();

  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);
  const qc = useQueryClient();

  const handleUploadPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (e.target) e.target.value = ''; // allow re-selecting the same file
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      await complaintsApi.addAttachments(id, files);
      await qc.invalidateQueries({ queryKey: ['complaint', id] });
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (attachmentId) => {
    try {
      await complaintsApi.deleteAttachment(id, attachmentId);
      await qc.invalidateQueries({ queryKey: ['complaint', id] });
      toast.success('Photo deleted');
    } catch {
      toast.error('Could not delete photo');
    }
  };

  if (isLoading) return <PageLoader />;
  // Backend returns { success, data: complaint }.
  const complaint = data?.data ?? data?.complaint;
  if (!complaint) return <div className="text-center py-20 text-sail-text-muted">Complaint not found</div>;

  // Relations come back as objects ({ id, name, … }); render their .name, never the object.
  const locationName = complaint.location?.name ?? complaint.locationName ?? '—';
  const installationName = complaint.installationType?.name ?? complaint.installation?.name ?? complaint.installationName ?? 'N/A';
  const raisedByName = complaint.raisedBy?.name ?? complaint.raisedByName ?? '—';
  const assignedToName = complaint.assignedTo?.name ?? complaint.assignedToName ?? 'Unassigned';
  const isBreached = complaint.isSlaBreached ?? complaint.slaBreach ?? false;
  const displayId = complaint.complaintNumber ?? complaint.id;

  const contractors = usersData?.data?.filter((u) => u.role?.toLowerCase() === 'contractor') || [];

  const handleAssign = () => {
    if (!selectedContractor) return;
    assignComplaint.mutate(
      { id, assigned_to_id: selectedContractor, note: assignNote },
      { onSuccess: () => { setShowAssign(false); setSelectedContractor(''); setAssignNote(''); } }
    );
  };

  const handleStatusChange = () => {
    if (!selectedStatus) return;
    updateStatus.mutate(
      { id, status: selectedStatus, note: statusNote },
      { onSuccess: () => { setShowStatus(false); setSelectedStatus(''); setStatusNote(''); } }
    );
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-sail-text-secondary hover:text-sail-primary mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Complaints
      </button>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Main Content */}
        <div className="col-span-2 space-y-4">
          {/* Header Card */}
          <div className="section-card">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                  {complaint.safetyConcern && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                      <AlertTriangle className="w-3 h-3" /> Safety Concern
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDelete(true)}
                    className="p-1.5 rounded border border-red-200 hover:bg-red-50 transition-colors text-red-500"
                    title="Delete complaint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs font-mono text-sail-primary font-semibold mb-1">{displayId}</p>
              <h1 className="text-xl font-bold text-sail-text-primary mb-4">{complaint.title}</h1>

              {/* SLA Progress */}
              {complaint.slaDeadline && (
                <div className={`p-3 rounded-lg flex items-center gap-3 border ${isBreached ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                  <Clock className={`w-4 h-4 flex-shrink-0 ${isBreached ? 'text-red-500' : 'text-orange-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${isBreached ? 'text-red-700' : 'text-orange-700'}`}>
                        {isBreached ? '⚠ SLA Breached' : 'SLA Status'}
                      </span>
                      <span className={`text-xs ${isBreached ? 'text-red-600' : 'text-orange-600'}`}>
                        Deadline: {formatDateTime(complaint.slaDeadline)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="px-6 pb-6">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details"><FileText /> Details</TabsTrigger>
                  <TabsTrigger value="timeline"><Clock /> Timeline ({timeline.length})</TabsTrigger>
                  <TabsTrigger value="photos"><ImageIcon /> Photos ({complaint.attachments?.length ?? 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-sail-text-primary mb-2">Description</h3>
                    <p className="text-sm text-sail-text-secondary leading-relaxed">{complaint.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Location', value: locationName, icon: MapPin },
                      { label: 'Installation', value: installationName },
                      { label: 'Raised By', value: raisedByName, icon: User },
                      { label: 'Assigned To', value: assignedToName },
                      { label: 'Created At', value: formatDateTime(complaint.createdAt), icon: Calendar },
                      { label: 'Estimated Downtime', value: complaint.estimatedDowntime || 'N/A' },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-sail-text-muted uppercase tracking-wide">{label}</span>
                        <span className="text-sm text-sail-text-primary font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="timeline">
                  <div className="space-y-4">
                    {timeline.length === 0 ? (
                      <div className="text-center py-6 text-sail-text-muted text-sm">No timeline entries yet</div>
                    ) : timeline.map((item, i) => {
                      // The actor may arrive as a string or as a { name } relation object.
                      const actorName = typeof item.user === 'string' ? item.user : (item.user?.name ?? '—');
                      return (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 bg-sail-primary rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                          {getInitials(actorName)}
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-sail-text-primary">{item.action}</span>
                            <span className="text-xs text-sail-text-muted">{timeAgo(item.timestamp)}</span>
                          </div>
                          <p className="text-xs text-sail-text-secondary">{actorName}</p>
                          {item.note && <p className="text-sm text-sail-text-secondary mt-1 italic">"{item.note}"</p>}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="photos">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-sail-text-primary">Attachments</h3>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhotos}
                      className="flex items-center gap-2 px-3 py-1.5 bg-sail-primary text-white rounded-lg text-sm font-medium hover:bg-sail-secondary disabled:opacity-60 transition-colors"
                    >
                      {uploadingPhotos ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                      {uploadingPhotos ? 'Uploading…' : 'Upload Photos'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleUploadPhotos}
                    />
                  </div>
                  {(complaint.attachments?.length ?? 0) === 0 ? (
                    <div className="flex items-center justify-center py-8 text-sail-text-muted text-sm">No photos attached</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {complaint.attachments.map((a) => (
                        <div key={a.id} className="relative group rounded-lg overflow-hidden border border-sail-border aspect-square bg-slate-100">
                          {a.fileType?.startsWith('image/') ? (
                            <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={a.fileUrl} alt={a.fileName} className="w-full h-full object-cover" />
                            </a>
                          ) : (
                            <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center h-full text-sail-text-muted text-xs gap-2">
                              <Download className="w-6 h-6" />
                              <span className="px-2 text-center truncate w-full">{a.fileName}</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDeletePhoto(a.id)}
                            title="Delete photo"
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right: Action Panel */}
        <div className="space-y-4">
          <div className="section-card p-5 space-y-4">
            <h3 className="font-semibold text-sail-text-primary text-sm uppercase tracking-wide">Actions</h3>
            <button
              onClick={() => setShowAssign(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors"
            >
              <UserCheck className="w-4 h-4" /> Assign to Contractor
            </button>
            <button
              onClick={() => { setSelectedStatus(String(complaint.status || '').toLowerCase()); setShowStatus(true); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-sail-border text-sail-text-primary rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <CheckSquare className="w-4 h-4" /> Change Status
            </button>
            <button
              onClick={handleExportPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-sail-border text-sail-text-primary rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Export as PDF
            </button>

            <div className="pt-3 border-t border-sail-border">
              <h4 className="text-xs font-semibold text-sail-text-muted uppercase tracking-wide mb-2">SLA Information</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-sail-text-secondary">Deadline</span>
                  <span className={`font-medium ${isBreached ? 'text-red-600' : 'text-orange-600'}`}>
                    {complaint.slaDeadline ? formatDateTime(complaint.slaDeadline) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sail-text-secondary">Status</span>
                  <span className={`font-medium ${isBreached ? 'text-red-600' : 'text-green-600'}`}>
                    {isBreached ? '⚠ Breached' : '✓ On Track'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-sail-border">
              <h4 className="text-xs font-semibold text-sail-text-muted uppercase tracking-wide mb-2">Current Assignment</h4>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-sail-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {getInitials(assignedToName === 'Unassigned' ? 'UN' : assignedToName)}
                  </span>
                </div>
                <span className="text-sm text-sail-text-primary">
                  {assignedToName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssign && (
        <Modal title="Assign to Contractor" onClose={() => setShowAssign(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Select Contractor</label>
              <select
                value={selectedContractor}
                onChange={(e) => setSelectedContractor(e.target.value)}
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20"
              >
                <option value="">Choose contractor…</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company || c.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Note (optional)</label>
              <textarea
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                rows={3}
                placeholder="Add instructions or context…"
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowAssign(false)} className="px-4 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleAssign}
                disabled={!selectedContractor || assignComplaint.isPending}
                className="px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-50 transition-colors"
              >
                {assignComplaint.isPending ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Status Modal */}
      {showStatus && (
        <Modal title="Change Status" onClose={() => setShowStatus(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    selectedStatus === s
                      ? 'bg-sail-primary text-white border-sail-primary'
                      : 'border-sail-border text-sail-text-secondary hover:border-sail-primary/40'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Note (optional)</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                placeholder="Reason for status change…"
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowStatus(false)} className="px-4 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleStatusChange}
                disabled={!selectedStatus || updateStatus.isPending}
                className="px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-50 transition-colors"
              >
                {updateStatus.isPending ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          deleteComplaint.mutate(complaint.id, {
            onSuccess: () => router.push('/complaints'),
          });
        }}
        title="Delete Complaint"
        description={`Delete complaint "${displayId}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteComplaint.isPending}
      />
    </div>
  );
}
