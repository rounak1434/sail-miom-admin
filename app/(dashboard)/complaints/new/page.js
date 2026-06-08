'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { useCreateComplaint } from '@/hooks/useComplaints';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/api/settingsApi';

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const PRIORITY_COLORS = { CRITICAL: 'text-red-600 border-red-300 bg-red-50', HIGH: 'text-orange-600 border-orange-300 bg-orange-50', MEDIUM: 'text-yellow-600 border-yellow-300 bg-yellow-50', LOW: 'text-green-600 border-green-300 bg-green-50' };

export default function NewComplaintPage() {
  const router = useRouter();
  const createComplaint = useCreateComplaint();

  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: settingsApi.getLocations });
  const { data: types = [] } = useQuery({ queryKey: ['installation-types'], queryFn: settingsApi.getInstallationTypes });

  const [form, setForm] = useState({
    title: '', description: '', priority: '', locationId: '', installationTypeId: '', safetyConcern: false, safetyDescription: '', estimatedDowntime: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 100) e.title = 'Max 100 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.length < 10) e.description = 'Minimum 10 characters';
    if (!form.priority) e.priority = 'Select a priority';
    if (!form.locationId) e.locationId = 'Select a location';
    if (!form.installationTypeId) e.installationTypeId = 'Select installation type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createComplaint.mutate(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        // Backend expects snake_case keys
        location_id: form.locationId,
        installation_type_id: form.installationTypeId,
        safety_concern: form.safetyConcern,
        safety_description: form.safetyConcern ? form.safetyDescription.trim() : undefined,
        estimated_downtime: form.estimatedDowntime || undefined,
      },
      {
        onSuccess: (data) => {
          // Backend returns { success, data: complaint }.
          const id = data?.data?.id ?? data?.complaint?.id ?? data?.id;
          router.push(id ? `/complaints/${id}` : '/complaints');
        },
      }
    );
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-sail-text-secondary hover:text-sail-primary mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="page-header mb-5">
        <div>
          <h1 className="text-2xl font-bold text-sail-text-primary">Raise Complaint</h1>
          <p className="text-sail-text-secondary text-sm mt-0.5">Create a new electrical department complaint</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="section-card p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-sail-text-primary mb-1.5">Complaint Title <span className="text-red-500">*</span></label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            maxLength={100}
            placeholder="Brief, specific description…"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 ${errors.title ? 'border-red-400' : 'border-sail-border'}`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-sail-text-primary mb-1.5">Description <span className="text-red-500">*</span></label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            placeholder="Describe the fault in detail — symptoms, observations, impact…"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 resize-none ${errors.description ? 'border-red-400' : 'border-sail-border'}`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
            <span className={`text-xs ${form.description.length < 10 ? 'text-amber-500' : 'text-green-600'}`}>
              {form.description.length} chars {form.description.length < 10 ? `(${10 - form.description.length} more needed)` : '✓'}
            </span>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-sail-text-primary mb-1.5">Priority <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-4 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set('priority', p)}
                className={`py-2.5 text-xs font-semibold rounded-lg border-2 transition-all capitalize ${
                  form.priority === p ? PRIORITY_COLORS[p] : 'border-sail-border text-sail-text-secondary hover:border-sail-primary/40'
                }`}
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority}</p>}
        </div>

        {/* Location + Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-sail-text-primary mb-1.5">Location <span className="text-red-500">*</span></label>
            <select
              value={form.locationId}
              onChange={(e) => set('locationId', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 bg-white ${errors.locationId ? 'border-red-400' : 'border-sail-border'}`}
            >
              <option value="">Select location…</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            {errors.locationId && <p className="text-xs text-red-500 mt-1">{errors.locationId}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-sail-text-primary mb-1.5">Installation Type <span className="text-red-500">*</span></label>
            <select
              value={form.installationTypeId}
              onChange={(e) => set('installationTypeId', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 bg-white ${errors.installationTypeId ? 'border-red-400' : 'border-sail-border'}`}
            >
              <option value="">Select type…</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.installationTypeId && <p className="text-xs text-red-500 mt-1">{errors.installationTypeId}</p>}
          </div>
        </div>

        {/* Estimated Downtime */}
        <div>
          <label className="block text-sm font-semibold text-sail-text-primary mb-1.5">Estimated Downtime (optional)</label>
          <select
            value={form.estimatedDowntime}
            onChange={(e) => set('estimatedDowntime', e.target.value)}
            className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 bg-white"
          >
            <option value="">Not applicable</option>
            <option value="Already on standby / not running">Already on standby / not running</option>
            <option value="1–2 hours">1–2 hours</option>
            <option value="4–8 hours">4–8 hours</option>
            <option value="8–24 hours">8–24 hours</option>
            <option value="1–3 days">1–3 days</option>
            <option value="More than 3 days">More than 3 days</option>
          </select>
        </div>

        {/* Safety Concern */}
        <div className="p-4 border border-sail-border rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-sail-text-primary">Safety Concern</p>
              <p className="text-xs text-sail-text-muted mt-0.5">Live conductors, flashover risk, fire hazard, etc.</p>
            </div>
            <button
              type="button"
              onClick={() => set('safetyConcern', !form.safetyConcern)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.safetyConcern ? 'bg-red-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.safetyConcern ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          {form.safetyConcern && (
            <textarea
              value={form.safetyDescription}
              onChange={(e) => set('safetyDescription', e.target.value)}
              rows={3}
              placeholder="Describe the hazard, required precautions, barricading…"
              className="w-full mt-3 px-3 py-2.5 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none bg-red-50/30"
            />
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-2 border-t border-sail-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-sail-border rounded-lg text-sm font-medium text-sail-text-secondary hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createComplaint.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
          >
            <Send className="w-4 h-4" />
            {createComplaint.isPending ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
