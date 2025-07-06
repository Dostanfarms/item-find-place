
import { Permission } from './types';

// Define role-based permissions
export const rolePermissions: Record<string, Permission[]> = {
  admin: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'products', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'customers', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'farmers', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'tickets', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'categories', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'coupons', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'banners', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'branches', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'employees', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'roles', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'transactions', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'settlements', actions: ['view', 'create', 'edit', 'delete'] }
  ],
  manager: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'products', actions: ['view', 'create', 'edit'] },
    { resource: 'orders', actions: ['view', 'edit'] },
    { resource: 'customers', actions: ['view', 'edit'] },
    { resource: 'farmers', actions: ['view', 'create', 'edit'] },
    { resource: 'tickets', actions: ['view', 'edit'] },
    { resource: 'categories', actions: ['view', 'create', 'edit'] },
    { resource: 'coupons', actions: ['view', 'create', 'edit'] },
    { resource: 'banners', actions: ['view', 'edit'] },
    { resource: 'branches', actions: ['view'] },
    { resource: 'employees', actions: ['view'] },
    { resource: 'transactions', actions: ['view'] },
    { resource: 'settlements', actions: ['view'] }
  ],
  sales: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'products', actions: ['view'] },
    { resource: 'orders', actions: ['view', 'create', 'edit'] },
    { resource: 'customers', actions: ['view', 'create', 'edit'] },
    { resource: 'farmers', actions: ['view'] },
    { resource: 'tickets', actions: ['view', 'create'] },
    { resource: 'transactions', actions: ['view', 'create'] }
  ]
};

export const getAccessibleResources = (userRole: string): string[] => {
  const permissions = rolePermissions[userRole.toLowerCase()] || [];
  return permissions.map(permission => permission.resource);
};

export const hasPermission = (userRole: string, resource: string, action: string): boolean => {
  const permissions = rolePermissions[userRole.toLowerCase()] || [];
  const resourcePermission = permissions.find(p => p.resource === resource);
  return resourcePermission?.actions.includes(action as any) || false;
};
