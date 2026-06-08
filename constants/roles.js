export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  ENGINEER: 'engineer',
  CONTRACTOR: 'contractor',
  VIEWER: 'viewer',
};

export const ROLE_PERMISSIONS = {
  superadmin: ['all'],
  admin: ['dashboard', 'complaints', 'drawings', 'maintenance', 'users', 'reports', 'settings'],
  viewer: ['dashboard', 'reports'],
};

export const canAccess = (role, page) => {
  if (!role) return false;
  if (role === ROLES.SUPERADMIN) return true;
  return ROLE_PERMISSIONS[role]?.includes(page) ?? false;
};
