import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  open:        'badge-open',
  in_progress: 'badge-in-progress',
  resolved:    'badge-resolved',
  closed:      'badge-closed',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function StatusBadge({ status, className }) {
  // Backend returns enum values in UPPERCASE (OPEN, IN_PROGRESS …); normalize.
  const key = String(status || '').toLowerCase();
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      STATUS_STYLES[key] || 'bg-slate-100 text-slate-600 border-slate-200',
      className
    )}>
      {STATUS_LABELS[key] || status}
    </span>
  );
}

const PRIORITY_STYLES = {
  critical: 'badge-critical',
  high:     'badge-high',
  medium:   'badge-medium',
  low:      'badge-low',
};

const PRIORITY_LABELS = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
};

export function PriorityBadge({ priority, className }) {
  // Backend returns enum values in UPPERCASE (CRITICAL, HIGH …); normalize.
  const key = String(priority || '').toLowerCase();
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      PRIORITY_STYLES[key] || 'bg-slate-100 text-slate-600 border-slate-200',
      className
    )}>
      {PRIORITY_LABELS[key] || priority}
    </span>
  );
}

export function UserRoleBadge({ role, className }) {
  const key = String(role || '').toLowerCase();
  const roleStyles = {
    superadmin: 'bg-purple-100 text-purple-700 border-purple-200',
    admin: 'bg-blue-100 text-blue-700 border-blue-200',
    engineer: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    contractor: 'bg-orange-100 text-orange-700 border-orange-200',
    staff: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    viewer: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const roleLabels = { superadmin: 'Super Admin', admin: 'Admin', engineer: 'Engineer', contractor: 'Contractor', staff: 'Staff', viewer: 'Viewer' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', roleStyles[key] || roleStyles.viewer, className)}>
      {roleLabels[key] || role}
    </span>
  );
}
