'use client';
import { useState, useEffect } from 'react';
import { Settings, MapPin, Layers, Shield, Info, Save, Plus, Edit, Trash2, X, Check, Cpu } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settingsApi';
import { usersApi } from '@/api/usersApi';
import { authApi } from '@/api/authApi';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const SIDEBAR_ITEMS = [
  { value: 'general', label: 'General', icon: Settings },
  { value: 'locations', label: 'Locations', icon: MapPin },
  { value: 'types', label: 'Installation Types', icon: Layers },
  { value: 'installations', label: 'Installations', icon: Cpu },
  { value: 'sla', label: 'SLA Configuration', icon: Shield },
  { value: 'system', label: 'System Info', icon: Info },
];

function InlineForm({ fields, onSave, onCancel, saving }) {
  const [values, setValues] = useState(Object.fromEntries(fields.map((f) => [f.key, f.default || ''])));
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50/50 border-b border-blue-100">
      {fields.map((f) => (
        <input
          key={f.key}
          value={values[f.key]}
          onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
          placeholder={f.placeholder}
          className="px-3 py-1.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 flex-1"
        />
      ))}
      <button onClick={() => onSave(values)} disabled={saving}
        className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-60">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={onCancel} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();

  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: settingsApi.getLocations });
  const { data: types = [] } = useQuery({ queryKey: ['installation-types'], queryFn: settingsApi.getInstallationTypes });
  const { data: installations = [] } = useQuery({ queryKey: ['installations'], queryFn: () => settingsApi.getInstallations() });
  const { data: slaConfig } = useQuery({ queryKey: ['sla-config'], queryFn: settingsApi.getSlaConfig });

  // camelCase keys match what the backend returns and accepts
  const [sla, setSla] = useState({ criticalHours: 4, highHours: 8, mediumHours: 24, lowHours: 72 });
  // Sync SLA state when API data loads (so inputs show real DB values and remain editable)
  useEffect(() => {
    if (slaConfig) setSla({ criticalHours: slaConfig.criticalHours, highHours: slaConfig.highHours, mediumHours: slaConfig.mediumHours, lowHours: slaConfig.lowHours });
  }, [slaConfig]);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', designation: user?.designation || '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [addingLocation, setAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [addingType, setAddingType] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [instForm, setInstForm] = useState({ name: '', locationId: '', installationTypeId: '' });

  const mutOpts = (msg) => ({
    onSuccess: () => { toast.success(msg); qc.invalidateQueries({ queryKey: ['locations'] }); qc.invalidateQueries({ queryKey: ['installation-types'] }); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Operation failed'),
  });

  const createLocation = useMutation({ mutationFn: settingsApi.createLocation, ...mutOpts('Location added') });
  const updateLocation = useMutation({ mutationFn: ({ id, ...d }) => settingsApi.updateLocation(id, d), ...mutOpts('Location updated') });
  const deleteLocation = useMutation({ mutationFn: settingsApi.deleteLocation, ...mutOpts('Location deleted') });
  const createType  = useMutation({ mutationFn: settingsApi.createInstallationType, ...mutOpts('Type added') });
  const updateType  = useMutation({ mutationFn: ({ id, ...d }) => settingsApi.updateInstallationType(id, d), ...mutOpts('Type updated') });
  const deleteType  = useMutation({ mutationFn: settingsApi.deleteInstallationType, ...mutOpts('Type deleted') });
  const instMutOpts = (msg) => ({
    onSuccess: () => { toast.success(msg); qc.invalidateQueries({ queryKey: ['installations'] }); qc.invalidateQueries({ queryKey: ['installation-types'] }); qc.invalidateQueries({ queryKey: ['locations'] }); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Operation failed'),
  });
  const createInstallation = useMutation({ mutationFn: settingsApi.createInstallation, ...instMutOpts('Installation added') });
  const deleteInstallation = useMutation({ mutationFn: settingsApi.deleteInstallation, ...instMutOpts('Installation removed') });

  const updateSla = useMutation({
    mutationFn: settingsApi.updateSlaConfig,
    onSuccess: () => { toast.success('SLA configuration saved'); qc.invalidateQueries({ queryKey: ['sla-config'] }); },
    onError: () => toast.error('Failed to save SLA config'),
  });
  const changePassword = useMutation({
    mutationFn: (payload) => authApi.changePassword(payload),
    onSuccess: () => { toast.success('Password updated'); setPwForm({ current: '', next: '', confirm: '' }); },
    onError: () => toast.error('Failed to update password'),
  });

  const updateMe = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (updated) => {
      // Push the saved profile back into the auth store so the topbar (and any
      // other view reading user.name/email) updates immediately — no logout/login.
      if (updated) updateUser(updated);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const handleSaveProfile = () => {
    updateMe.mutate(profileForm);
  };

  const handleChangePassword = () => {
    if (!pwForm.current || !pwForm.next) { toast.error('Fill all password fields'); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.next.length < 8) { toast.error('Minimum 8 characters'); return; }
    changePassword.mutate({ currentPassword: pwForm.current, newPassword: pwForm.next });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header mb-5">
        <div>
          <h1 className="text-2xl font-bold text-sail-text-primary">Settings</h1>
          <p className="text-sail-text-secondary text-sm mt-0.5">Configure system settings and preferences</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="section-card p-2 space-y-0.5">
            {SIDEBAR_ITEMS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setActiveSection(value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === value ? 'bg-sail-primary text-white' : 'text-sail-text-secondary hover:bg-slate-100'}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 section-card p-6">
          {/* GENERAL */}
          {activeSection === 'general' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="font-semibold text-sail-text-primary">General Settings</h2>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Email Address', key: 'email', type: 'email' },
                  { label: 'Designation', key: 'designation', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-sail-text-primary mb-1.5">{label}</label>
                    <input type={type} value={profileForm[key]} onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 focus:border-sail-primary" />
                  </div>
                ))}
                <button
                  onClick={handleSaveProfile}
                  disabled={updateMe.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
                >
                  <Save className="w-4 h-4" /> {updateMe.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>

              <div className="pt-4 border-t border-sail-border">
                <h3 className="font-semibold text-sail-text-primary mb-4">Change Password</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Current Password', key: 'current' },
                    { label: 'New Password', key: 'next' },
                    { label: 'Confirm New Password', key: 'confirm' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-sail-text-primary mb-1.5">{label}</label>
                      <input type="password" value={pwForm[key]} onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 focus:border-sail-primary" />
                    </div>
                  ))}
                  <button
                    onClick={handleChangePassword}
                    disabled={changePassword.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
                  >
                    <Save className="w-4 h-4" /> {changePassword.isPending ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOCATIONS */}
          {activeSection === 'locations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sail-text-primary">Locations</h2>
                <button
                  onClick={() => { setAddingLocation(true); setEditingLocation(null); }}
                  className="flex items-center gap-2 px-3 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Location
                </button>
              </div>
              <table className="w-full data-table">
                <thead><tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Installations</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-sail-border">
                  {addingLocation && (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <InlineForm
                          fields={[
                            { key: 'name', placeholder: 'Location name', default: '' },
                            { key: 'code', placeholder: 'Code (e.g. MS)', default: '' },
                          ]}
                          onSave={(v) => createLocation.mutate(v, { onSuccess: () => setAddingLocation(false) })}
                          onCancel={() => setAddingLocation(false)}
                          saving={createLocation.isPending}
                        />
                      </td>
                    </tr>
                  )}
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50">
                      {editingLocation === loc.id ? (
                        <td colSpan={4} className="p-0">
                          <InlineForm
                            fields={[
                              { key: 'name', placeholder: 'Location name', default: loc.name },
                              { key: 'code', placeholder: 'Code', default: loc.code },
                            ]}
                            onSave={(v) => updateLocation.mutate({ id: loc.id, ...v }, { onSuccess: () => setEditingLocation(null) })}
                            onCancel={() => setEditingLocation(null)}
                            saving={updateLocation.isPending}
                          />
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm font-medium">{loc.name}</td>
                          <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono font-semibold">{loc.code}</span></td>
                          <td className="px-4 py-3 text-sm text-sail-text-secondary">{loc.installationsCount}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setEditingLocation(loc.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Edit className="w-3.5 h-3.5" /></button>
                              <button
                                onClick={() => { if (window.confirm(`Delete location "${loc.name}"?`)) deleteLocation.mutate(loc.id); }}
                                className="p-1.5 rounded hover:bg-red-50 text-red-400"
                              ><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INSTALLATION TYPES */}
          {activeSection === 'types' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sail-text-primary">Installation Types</h2>
                <button
                  onClick={() => { setAddingType(true); setEditingType(null); }}
                  className="flex items-center gap-2 px-3 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Type
                </button>
              </div>
              <table className="w-full data-table">
                <thead><tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Installations</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-sail-border">
                  {addingType && (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <InlineForm
                          fields={[{ key: 'name', placeholder: 'Type name (e.g. Transformer)', default: '' }]}
                          onSave={(v) => createType.mutate(v, { onSuccess: () => setAddingType(false) })}
                          onCancel={() => setAddingType(false)}
                          saving={createType.isPending}
                        />
                      </td>
                    </tr>
                  )}
                  {types.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      {editingType === t.id ? (
                        <td colSpan={3} className="p-0">
                          <InlineForm
                            fields={[{ key: 'name', placeholder: 'Type name', default: t.name }]}
                            onSave={(v) => updateType.mutate({ id: t.id, ...v }, { onSuccess: () => setEditingType(null) })}
                            onCancel={() => setEditingType(null)}
                            saving={updateType.isPending}
                          />
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm font-medium">{t.name}</td>
                          <td className="px-4 py-3 text-sm text-sail-text-secondary">{t.installationsCount ?? 0}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => { setEditingType(t.id); setAddingType(false); }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Edit className="w-3.5 h-3.5" /></button>
                              <button
                                onClick={() => { if (window.confirm(`Delete type "${t.name}"?`)) deleteType.mutate(t.id); }}
                                className="p-1.5 rounded hover:bg-red-50 text-red-400"
                              ><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INSTALLATIONS */}
          {activeSection === 'installations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-sail-text-primary">Installations</h2>
                  <p className="text-xs text-sail-text-muted mt-0.5">Specific assets (e.g. Transformer T-1) used when scheduling maintenance.</p>
                </div>
              </div>

              {/* Add form */}
              <div className="flex flex-wrap items-end gap-2 p-4 bg-blue-50/50 border border-blue-100 rounded-lg mb-4">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-sail-text-muted mb-1">Name</label>
                  <input
                    value={instForm.name}
                    onChange={(e) => setInstForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Transformer T-1"
                    className="w-full px-3 py-1.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-sail-text-muted mb-1">Location</label>
                  <select
                    value={instForm.locationId}
                    onChange={(e) => setInstForm((p) => ({ ...p, locationId: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-sail-border rounded-lg text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select…</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-sail-text-muted mb-1">Type</label>
                  <select
                    value={instForm.installationTypeId}
                    onChange={(e) => setInstForm((p) => ({ ...p, installationTypeId: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-sail-border rounded-lg text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select…</option>
                    {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (!instForm.name.trim() || !instForm.locationId || !instForm.installationTypeId) {
                      toast.error('Name, location and type are required');
                      return;
                    }
                    createInstallation.mutate(
                      { name: instForm.name.trim(), location_id: instForm.locationId, installation_type_id: instForm.installationTypeId },
                      { onSuccess: () => setInstForm({ name: '', locationId: '', installationTypeId: '' }) }
                    );
                  }}
                  disabled={createInstallation.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <table className="w-full data-table">
                <thead><tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-sail-border">
                  {installations.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{inst.name}</td>
                      <td className="px-4 py-3 text-sm text-sail-text-secondary">{inst.location?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-sail-text-secondary">{inst.installationType?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { if (window.confirm(`Remove installation "${inst.name}"?`)) deleteInstallation.mutate(inst.id); }}
                          className="p-1.5 rounded hover:bg-red-50 text-red-400"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                  {installations.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-sail-text-muted">No installations yet — add one above.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SLA CONFIG */}
          {activeSection === 'sla' && (
            <div className="max-w-md">
              <h2 className="font-semibold text-sail-text-primary mb-4">SLA Configuration</h2>
              <div className="border border-sail-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="bg-slate-50 border-b border-sail-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-sail-text-muted uppercase tracking-wide">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-sail-text-muted uppercase tracking-wide">Response Time (Hours)</th>
                  </tr></thead>
                  <tbody className="divide-y divide-sail-border">
                    {[
                      { label: 'Critical', key: 'criticalHours', color: 'text-red-600' },
                      { label: 'High', key: 'highHours', color: 'text-orange-600' },
                      { label: 'Medium', key: 'mediumHours', color: 'text-yellow-600' },
                      { label: 'Low', key: 'lowHours', color: 'text-green-600' },
                    ].map(({ label, key, color }) => (
                      <tr key={key}>
                        <td className="px-4 py-3"><span className={`font-semibold text-sm ${color}`}>{label}</span></td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={sla[key]}
                            onChange={(e) => setSla(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                            className="w-24 px-3 py-1.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20"
                          />
                          <span className="ml-2 text-sm text-sail-text-muted">hours</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => updateSla.mutate(sla)}
                disabled={updateSla.isPending}
                className="flex items-center gap-2 mt-4 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
              >
                <Save className="w-4 h-4" /> {updateSla.isPending ? 'Saving…' : 'Save SLA Config'}
              </button>
            </div>
          )}

          {/* SYSTEM INFO */}
          {activeSection === 'system' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-sail-text-primary">System Information</h2>
              {[
                { label: 'Application Version', value: 'v1.0.0' },
                { label: 'Database Status', value: <span className="flex items-center gap-1.5 text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected</span> },
                { label: 'API Endpoint', value: process.env.NEXT_PUBLIC_API_URL || 'https://sail-miom.ddns.net/api' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-sail-border last:border-0">
                  <span className="text-sm text-sail-text-secondary">{label}</span>
                  <span className="text-sm font-medium text-sail-text-primary">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
