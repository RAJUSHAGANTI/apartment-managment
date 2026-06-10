export const ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Owner',
  TENANT: 'Tenant',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];
