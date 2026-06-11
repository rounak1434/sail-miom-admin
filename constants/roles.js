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
  if (role === ROLES.SUPERADMIN) return true;
  return ROLE_PERMISSIONS[role]?.includes(page) ?? false;
};
