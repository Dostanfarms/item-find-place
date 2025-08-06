
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
    { resource: 'settlements', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'fashion_products', actions: ['view', 'create', 'edit', 'delete'] }
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
    { resource: 'roles', actions: ['view'] },
    { resource: 'transactions', actions: ['view'] },
    { resource: 'settlements', actions: ['view'] },
    { resource: 'fashion_products', actions: ['view', 'create', 'edit'] }
  ],
  sales: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'products', actions: ['view'] },
    { resource: 'orders', actions: ['view', 'create', 'edit'] },
    { resource: 'customers', actions: ['view', 'create', 'edit'] },
    { resource: 'farmers', actions: ['view'] },
    { resource: 'tickets', actions: ['view', 'create'] },
    { resource: 'transactions', actions: ['view', 'create'] },
    { resource: 'fashion_products', actions: ['view'] }
  ],
  employee: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'products', actions: ['view', 'create', 'edit'] },
    { resource: 'orders', actions: ['view', 'create', 'edit'] },
    { resource: 'customers', actions: ['view', 'create', 'edit'] },
    { resource: 'farmers', actions: ['view', 'create', 'edit'] },
    { resource: 'tickets', actions: ['view', 'create'] },
    { resource: 'categories', actions: ['view', 'create', 'edit'] },
    { resource: 'coupons', actions: ['view', 'create', 'edit'] },
    { resource: 'banners', actions: ['view', 'edit'] },
    { resource: 'branches', actions: ['view'] },
    { resource: 'employees', actions: ['view'] },
    { resource: 'roles', actions: ['view'] },
    { resource: 'transactions', actions: ['view', 'create'] },
    { resource: 'settlements', actions: ['view'] },
    { resource: 'fashion_products', actions: ['view', 'create', 'edit'] }
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

// Branch access restrictions - Fixed logic
export const canAccessBranch = (userRole: string, userBranchId: string | null, targetBranchId: string | null): boolean => {
  console.log('Branch access check:', { userRole, userBranchId, targetBranchId });
  
  // Admin can access all branches
  if (userRole.toLowerCase() === 'admin') {
    return true;
  }
  
  // If user has no branch assigned, they can only access items with no branch
  if (!userBranchId) {
    return targetBranchId === null;
  }
  
  // User can access their assigned branch and items with no branch assignment
  return userBranchId === targetBranchId || targetBranchId === null;
};

export const getBranchRestrictedData = <T extends { branch_id?: string | null }>(
  data: T[], 
  userRole: string, 
  userBranchId: string | null
): T[] => {
  console.log('Filtering data:', { 
    totalItems: data.length, 
    userRole, 
    userBranchId,
    sampleItem: data[0] 
  });
  
  // Admin can see all data
  if (userRole.toLowerCase() === 'admin') {
    console.log('Admin user - returning all data');
    return data;
  }
  
  // Filter data based on branch access
  const filteredData = data.filter(item => {
    const hasAccess = canAccessBranch(userRole, userBranchId, item.branch_id);
    console.log('Item access check:', { 
      itemId: (item as any).id, 
      itemBranch: item.branch_id, 
      hasAccess 
    });
    return hasAccess;
  });
  
  console.log('Filtered data count:', filteredData.length);
  return filteredData;
};

// Role-specific branch access restrictions
export const canManageRoles = (userRole: string): boolean => {
  return userRole.toLowerCase() === 'admin';
};

export const canCreateInBranch = (userRole: string, userBranchId: string | null, targetBranchId: string | null): boolean => {
  return canAccessBranch(userRole, userBranchId, targetBranchId);
};

export const canEditInBranch = (userRole: string, userBranchId: string | null, targetBranchId: string | null): boolean => {
  return canAccessBranch(userRole, userBranchId, targetBranchId);
};
