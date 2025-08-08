
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

// Enhanced branch access for multi-branch support
export const canAccessBranch = (userRole: string, userBranchIds: string[] | string | null, targetBranchId: string | null): boolean => {
  console.log('Branch access check:', { userRole, userBranchIds, targetBranchId });
  
  // Admin can access all branches
  if (userRole.toLowerCase() === 'admin') {
    return true;
  }
  
  // Convert userBranchIds to array for consistent handling
  let userBranches: string[] = [];
  if (Array.isArray(userBranchIds)) {
    userBranches = userBranchIds;
  } else if (userBranchIds) {
    userBranches = [userBranchIds];
  }
  
  // If user has no branch assigned, they can only access items with no branch
  if (userBranches.length === 0) {
    return targetBranchId === null;
  }
  
  // User can access their assigned branches and items with no branch assignment
  return userBranches.includes(targetBranchId || '') || targetBranchId === null;
};

// Enhanced data filtering for multi-branch support
export const getBranchRestrictedData = <T extends { branch_id?: string | null }>(
  data: T[], 
  userRole: string, 
  userBranchIds: string[] | string | null
): T[] => {
  console.log('Filtering data:', { 
    totalItems: data.length, 
    userRole, 
    userBranchIds,
    sampleItem: data[0] 
  });
  
  // Admin can see all data
  if (userRole.toLowerCase() === 'admin') {
    console.log('Admin user - returning all data');
    return data;
  }
  
  // Convert userBranchIds to array for consistent handling
  let userBranches: string[] = [];
  if (Array.isArray(userBranchIds)) {
    userBranches = userBranchIds;
  } else if (userBranchIds) {
    userBranches = [userBranchIds];
  }
  
  // Filter data based on branch access
  const filteredData = data.filter(item => {
    // Allow access to items that belong to user's assigned branches
    const hasAccess = userBranches.length === 0 
      ? item.branch_id === null 
      : userBranches.includes(item.branch_id || '') || item.branch_id === null;
    
    console.log('Item access check:', { 
      itemId: (item as any).id, 
      itemBranch: item.branch_id, 
      userBranches,
      hasAccess 
    });
    return hasAccess;
  });
  
  console.log('Filtered data count:', filteredData.length);
  return filteredData;
};

// New function to get user's accessible branches for multi-branch employees
export const getUserAccessibleBranches = (userRole: string, userBranchIds: string[] | string | null): string[] => {
  // Admin can access all branches - return empty array to indicate "all"
  if (userRole.toLowerCase() === 'admin') {
    return [];
  }
  
  // Convert to array format
  if (Array.isArray(userBranchIds)) {
    return userBranchIds;
  } else if (userBranchIds) {
    return [userBranchIds];
  }
  
  return [];
};

// Role-specific branch access restrictions
export const canManageRoles = (userRole: string): boolean => {
  return userRole.toLowerCase() === 'admin';
};

export const canCreateInBranch = (userRole: string, userBranchIds: string[] | string | null, targetBranchId: string | null): boolean => {
  return canAccessBranch(userRole, userBranchIds, targetBranchId);
};

export const canEditInBranch = (userRole: string, userBranchIds: string[] | string | null, targetBranchId: string | null): boolean => {
  return canAccessBranch(userRole, userBranchIds, targetBranchId);
};
