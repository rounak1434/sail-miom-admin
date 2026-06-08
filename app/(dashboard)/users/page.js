'use client';
import { useState } from 'react';
import { Plus, MoreVertical, Edit, Lock, UserX, UserCheck, X, Save } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser, useActivateUser, useResetPassword } from '@/hooks/useUsers';
import { UserRoleBadge } from '@/components/shared/Badges';
import SearchInput from '@/components/shared/SearchInput';
import Pagination from '@/components/shared/Pagination';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate, getInitials } from '@/lib/utils';
import { useFilterStore } from '@/store/filterStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/api/settingsApi';
import { usersApi } from '@/api/usersApi';
import { useAuthStore } from '@/store/authStore';

const TABS = [
  { value: '', label: 'All Users' },
  { value: 'admin', label: 'Admins' },
  { value: 'engineer', label: 'Engineers' },
  { value: 'contractor', label: 'Contractors' },
  { value: 'staff', label: 'Staff' },
  { value: 'inactive', label: 'Inactive', isStatus: true },
];

const ROLE_LABELS = { admin: 'Admin', engineer: 'Engineer', contractor: 'Contractor', staff: 'Staff' };

const EMPTY_USER = { name: '', email: '', employeeId: '', phone: '', password: '', role: 'engineer', locationId: '', department: 'Electrical', company: '' };

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

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const canManageAdmins = ['ADMIN', 'SUPERADMIN'].includes(currentUser?.role?.toUpperCase());
  const { usersFilter, setUsersFilter } = useFilterStore();
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [userModal, setUserModal] = useState(null); // { mode: 'create'|'edit', role: 'engineer'|'contractor', user?: {} }
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState(EMPTY_USER);

  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: settingsApi.getLocations });

  // Real stats: separate count queries per role/status
  const { data: engData }  = useQuery({ queryKey: ['users-count', 'engineer'],  queryFn: () => usersApi.getAll({ role: 'engineer', limit: 1 }) });
  const { data: conData }  = useQuery({ queryKey: ['users-count', 'contractor'], queryFn: () => usersApi.getAll({ role: 'contractor', limit: 1 }) });
  const { data: inaData }  = useQuery({ queryKey: ['users-count', 'inactive'],   queryFn: () => usersApi.getAll({ status: 'inactive', limit: 1 }) });

  const totalEngineers   = engData?.total ?? '—';
  const totalContractors = conData?.total ?? '—';
  const totalInactive    = inaData?.total ?? '—';

  const params = { ...usersFilter };
  if (activeTab === 'inactive') { params.status = 'inactive'; params.role = ''; }
  else if (activeTab) { params.role = activeTab; params.status = ''; }
  else { params.role = ''; params.status = ''; }

  const { data, isLoading } = useUsers(params);
  const deactivate = useDeactivateUser();
  const activate = useActivateUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const resetPassword = useResetPassword();

  const users = data?.data || [];
  const total = data?.total || 0;

  const openCreate = (role) => {
    setFormData({ ...EMPTY_USER, role });
    setUserModal({ mode: 'create', role });
  };

  const openEdit = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      employeeId: user.employeeId || '',
      phone: user.phone || '',
      role: user.role || 'engineer',
      locationId: user.locationId || '',
      department: user.department || 'Electrical',
      company: user.company || '',
    });
    setUserModal({ mode: 'edit', user });
  };

  const setField = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const handleSubmitUser = () => {
    if (userModal.mode === 'create') {
      createUser.mutate(formData, { onSuccess: () => setUserModal(null) });
    } else {
      updateUser.mutate({ id: userModal.user.id, ...formData }, { onSuccess: () => setUserModal(null) });
    }
  };

  const handleResetPassword = () => {
    if (!newPassword) return;
    resetPassword.mutate(
      { id: resetTarget.id, newPassword },
      { onSuccess: () => { setResetTarget(null); setNewPassword(''); } }
    );
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-sail-text-primary">User Management</h1>
          <p className="text-sail-text-secondary text-sm mt-0.5">Manage engineers, contractors, and system access</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageAdmins && (
            <button
              onClick={() => openCreate('admin')}
              className="flex items-center gap-2 px-3 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Admin
            </button>
          )}
          <button
            onClick={() => openCreate('engineer')}
            className="flex items-center gap-2 px-3 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Engineer
          </button>
          <button
            onClick={() => openCreate('contractor')}
            className="flex items-center gap-2 px-3 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Contractor
          </button>
          <button
            onClick={() => openCreate('staff')}
            className="flex items-center gap-2 px-3 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Engineers', value: totalEngineers, color: 'text-sail-primary' },
          { label: 'Total Contractors', value: totalContractors, color: 'text-orange-600' },
          { label: 'Inactive Users', value: totalInactive, color: 'text-slate-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="section-card p-4 text-center">
            <p className={`text-3xl font-bold mb-1 ${color}`}>{value}</p>
            <p className="text-sm text-sail-text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Tabs */}
      <div className="section-card p-4 space-y-4">
        <div className="filter-bar">
          <SearchInput placeholder="Search by name or email..." className="w-72" onSearch={(v) => setUsersFilter({ search: v, page: 1 })} />
        </div>
        <div className="flex gap-1 border-b border-sail-border">
          {TABS.map((tab) => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.value ? 'border-sail-primary text-sail-primary' : 'border-transparent text-sail-text-secondary hover:text-sail-text-primary'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="section-card overflow-hidden">
        {isLoading ? <TableSkeleton rows={8} cols={7} /> : users.length === 0 ? (
          <EmptyState title="No users found" description="No users match your current filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Employee ID</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sail-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sail-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{getInitials(u.name)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sail-text-primary">{u.name}</p>
                            <p className="text-xs text-sail-text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-sail-text-secondary">{u.employeeId}</td>
                      <td className="px-4 py-3"><UserRoleBadge role={u.role} /></td>
                      <td className="px-4 py-3 text-sm text-sail-text-secondary">{u.location?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-sail-text-secondary">{u.department}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${u.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-sail-text-muted">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(u)} className="flex items-center gap-2"><Edit className="w-4 h-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setResetTarget(u); setNewPassword(''); }} className="flex items-center gap-2"><Lock className="w-4 h-4" /> Reset Password</DropdownMenuItem>
                            {u.isActive ? (
                              <DropdownMenuItem onClick={() => setDeactivateTarget(u)} className="flex items-center gap-2 text-red-600 focus:text-red-600"><UserX className="w-4 h-4" /> Deactivate</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => activate.mutate(u.id)} className="flex items-center gap-2 text-green-600 focus:text-green-600"><UserCheck className="w-4 h-4" /> Activate</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 border-t border-sail-border">
              <Pagination page={usersFilter.page} limit={20} total={total} onPageChange={(p) => setUsersFilter({ page: p })} />
            </div>
          </>
        )}
      </div>

      {/* Create / Edit User Modal */}
      {userModal && (
        <Modal
          title={userModal.mode === 'create' ? `Add ${ROLE_LABELS[userModal.role] || 'User'}` : 'Edit User'}
          onClose={() => setUserModal(null)}
        >
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', placeholder: 'Full name', type: 'text' },
              { label: 'Email Address', key: 'email', placeholder: 'user@miom.sail.in', type: 'email' },
              { label: 'Employee ID', key: 'employeeId', placeholder: 'SAIL-1234', type: 'text' },
              { label: 'Phone Number', key: 'phone', placeholder: '9800000000', type: 'tel' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">{label}</label>
                <input
                  type={type}
                  value={formData[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20"
                />
              </div>
            ))}

            {userModal.mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Temporary Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="Min 8 characters — share securely with the user"
                  className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20"
                />
                <p className="text-xs text-sail-text-muted mt-1">The user can change this after first login.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Location</label>
              <select
                value={formData.locationId}
                onChange={(e) => setField('locationId', e.target.value)}
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 bg-white"
              >
                <option value="">Select location…</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setField('department', e.target.value)}
                placeholder="e.g. Electrical, Maintenance, Operations"
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20"
              />
              <p className="text-xs text-sail-text-muted mt-1">Used to group complaints in the Department Report.</p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setUserModal(null)} className="px-4 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleSubmitUser}
                disabled={
                  createUser.isPending || updateUser.isPending ||
                  (userModal.mode === 'create' && (!formData.name || !formData.email || !formData.employeeId || (formData.password || '').length < 8))
                }
                className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
              >
                <Save className="w-4 h-4" />
                {(createUser.isPending || updateUser.isPending) ? 'Saving…' : userModal.mode === 'create' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <Modal title={`Reset Password — ${resetTarget.name}`} onClose={() => setResetTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-sail-text-secondary">Set a new password for <strong>{resetTarget.name}</strong>. They will need to change it on next login.</p>
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2.5 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setResetTarget(null)} className="px-4 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword || newPassword.length < 8 || resetPassword.isPending}
                className="px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary disabled:opacity-60 transition-colors"
              >
                {resetPassword.isPending ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => { deactivate.mutate(deactivateTarget.id); setDeactivateTarget(null); }}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${deactivateTarget?.name}? They will lose access immediately.`}
        confirmLabel="Deactivate"
        isLoading={deactivate.isPending}
      />
    </div>
  );
}
