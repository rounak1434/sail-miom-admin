export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  ENGINEER: 'engineer',
  CONTRACTOR: 'contractor',
  VIEWER: 'viewer',
};

export const ROLE_PERMISSIONS = {
  superadmin: ['all'],
  admin: ['dashboard', 'complaints', 'drawings', 'maintenance', 'work-orders', 'users', 'reports', 'settings'],
  engineer: ['dashboard', 'complaints', 'drawings', 'maintenance', 'work-orders', 'reports'],
  contractor: ['dashboard', 'complaints', 'work-orders'],
  viewer: ['dashboard', 'reports'],
};

export const canAccess = (role, page) => {
  if (!role) return false;
  // Backend Role enum is UPPERCASE (e.g. 'SUPERADMIN'); the keys here are
  // lowercase. Normalize so the comparison/lookup matches either casing —
  // without this, every page was denied and the sidebar rendered empty.
  const r = String(role).toLowerCase();
  if (r === ROLES.SUPERADMIN) return true;
  return ROLE_PERMISSIONS[r]?.includes(page) ?? false;
};
