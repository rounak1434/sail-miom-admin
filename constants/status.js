// Status constants
export const COMPLAINT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const COMPLAINT_STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const COMPLAINT_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const COMPLAINT_PRIORITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const MAINTENANCE_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

export const MAINTENANCE_TYPE = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  HALF_YEARLY: 'half_yearly',
  YEARLY: 'yearly',
};

export const DRAWING_TYPES = [
  { value: 'transformer', label: 'Transformer' },
  { value: 'motor', label: 'Motor' },
  { value: 'breaker', label: 'Breaker' },
  { value: 'panel', label: 'Panel' },
  { value: 'cable', label: 'Cable Layout' },
  { value: 'substation', label: 'Substation' },
  { value: 'other', label: 'Other' },
];

export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  ENGINEER: 'engineer',
  CONTRACTOR: 'contractor',
  VIEWER: 'viewer',
};

export const USER_ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  engineer: 'Engineer',
  contractor: 'Contractor',
  viewer: 'Viewer',
};

export const SLA_HOURS = {
  critical: 4,
  high: 8,
  medium: 24,
  low: 72,
};

export const REPORT_TYPES = [
  { value: 'complaints', label: 'Complaint Report' },
  { value: 'sla', label: 'SLA Report' },
  { value: 'maintenance', label: 'Maintenance Report' },
  { value: 'contractor', label: 'Contractor Performance' },
];

export const STATUS_COLORS = {
  open: 'badge-open',
  in_progress: 'badge-in-progress',
  resolved: 'badge-resolved',
  closed: 'badge-closed',
};

export const PRIORITY_COLORS = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};
