
export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  name: string;
  permissions: Permission[];
}

// Define available resources and their actions
export const availableResources = [
  'dashboard',
  'farmers',
  'customers', 
  'products',
  'categories',
  'sales',
  'sales-dashboard',
  'transactions',
  'tickets',
  'coupons',
  'banners',
  'employees',
  'roles',
  'settlements'
] as const;

export const availableActions = ['view', 'create', 'edit', 'delete'] as const;

// Predefined roles with their permissions
export const predefinedRoles: Role[] = [
  {
    name: 'admin',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'customers', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'products', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'categories', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'sales', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'sales-dashboard', actions: ['view'] },
      { resource: 'transactions', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'tickets', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'coupons', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'banners', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'employees', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'roles', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'settlements', actions: ['view', 'create', 'edit', 'delete'] }
    ]
  },
  {
    name: 'manager',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view', 'create', 'edit'] },
      { resource: 'customers', actions: ['view', 'create', 'edit'] },
      { resource: 'products', actions: ['view', 'create', 'edit'] },
      { resource: 'categories', actions: ['view', 'create', 'edit'] },
      { resource: 'sales', actions: ['view', 'create', 'edit'] },
      { resource: 'sales-dashboard', actions: ['view'] },
      { resource: 'transactions', actions: ['view'] },
      { resource: 'tickets', actions: ['view', 'create', 'edit'] },
      { resource: 'coupons', actions: ['view', 'create', 'edit'] },
      { resource: 'banners', actions: ['view', 'create', 'edit'] },
      { resource: 'employees', actions: ['view'] },
      { resource: 'settlements', actions: ['view', 'create', 'edit'] }
    ]
  },
  {
    name: 'sales',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'customers', actions: ['view', 'create', 'edit'] },
      { resource: 'products', actions: ['view'] },
      { resource: 'categories', actions: ['view'] },
      { resource: 'sales', actions: ['view', 'create', 'edit'] },
      { resource: 'sales-dashboard', actions: ['view'] },
      { resource: 'transactions', actions: ['view'] },
      { resource: 'tickets', actions: ['view', 'create'] },
      { resource: 'coupons', actions: ['view'] }
    ]
  }
];

// Helper function to get accessible resources for a role
export const getAccessibleResources = (roleName: string): string[] => {
  const role = predefinedRoles.find(r => r.name === roleName);
  if (!role) return [];
  
  return role.permissions.map(permission => permission.resource);
};

// Helper function to check if a role has permission for a specific action on a resource
export const hasPermission = (roleName: string, resource: string, action: string): boolean => {
  const role = predefinedRoles.find(r => r.name === roleName);
  if (!role) return false;
  
  const permission = role.permissions.find(p => p.resource === resource);
  return permission ? permission.actions.includes(action) : false;
};
