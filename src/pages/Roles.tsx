
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Settings, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoles, Role } from '@/hooks/useRoles';

const resources = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'farmers', name: 'Farmers' },
  { id: 'customers', name: 'Customers' },
  { id: 'products', name: 'Products' },
  { id: 'categories', name: 'Categories' },
  { id: 'sales', name: 'Sales' },
  { id: 'transactions', name: 'Transactions' },
  { id: 'settlements', name: 'Settlements' },
  { id: 'coupons', name: 'Coupons' },
  { id: 'employees', name: 'Employees' },
  { id: 'roles', name: 'Roles' },
  { id: 'tickets', name: 'Tickets' }
];

const actions = [
  { id: 'view', name: 'View' },
  { id: 'create', name: 'Create' },
  { id: 'edit', name: 'Edit' },
  { id: 'delete', name: 'Delete' }
];

const Roles = () => {
  const { toast } = useToast();
  const { roles, loading, addRole, updateRole } = useRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  useEffect(() => {
    if (selectedRole) {
      let rolePermissions = selectedRole.permissions;
      
      if (!rolePermissions) {
        rolePermissions = [];
      } else if (typeof rolePermissions === 'string') {
        try {
          rolePermissions = JSON.parse(rolePermissions);
        } catch (e) {
          console.error('Error parsing permissions:', e);
          rolePermissions = [];
        }
      } else if (!Array.isArray(rolePermissions)) {
        rolePermissions = [];
      }
      
      setPermissions(Array.isArray(rolePermissions) ? rolePermissions : []);
    }
  }, [selectedRole]);

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setPermissions(prev => {
      const resourceIndex = prev.findIndex(p => p.resource === resource);
      
      if (resourceIndex === -1 && checked) {
        return [...prev, { resource, actions: [action] }];
      }
      
      if (resourceIndex >= 0) {
        const updatedPermissions = [...prev];
        const resourcePermission = { ...updatedPermissions[resourceIndex] };
        
        if (checked) {
          resourcePermission.actions = [...resourcePermission.actions, action];
        } else {
          resourcePermission.actions = resourcePermission.actions.filter(a => a !== action);
        }
        
        updatedPermissions[resourceIndex] = resourcePermission;
        
        if (resourcePermission.actions.length === 0) {
          updatedPermissions.splice(resourceIndex, 1);
        }
        
        return updatedPermissions;
      }
      
      return prev;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    const result = await updateRole(selectedRole.id, { permissions });
    
    if (result?.success) {
      toast({
        title: "Permissions Updated",
        description: `Permissions for ${selectedRole.name} role have been updated successfully.`
      });
    }
  };

  const hasPermission = (resource: string, action: string) => {
    if (!Array.isArray(permissions)) {
      return false;
    }
    
    const resourcePermission = permissions.find(p => p.resource === resource);
    return resourcePermission?.actions.includes(action) || false;
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Role name required",
        description: "Please provide a name for the new role.",
        variant: "destructive"
      });
      return;
    }
    
    const newRole = {
      name: newRoleName,
      permissions: [{ resource: 'dashboard', actions: ['view'] }],
      is_active: true
    };
    
    const result = await addRole(newRole);
    
    if (result?.success) {
      setCreateRoleDialogOpen(false);
      setNewRoleName('');
      setSelectedRole(result.data);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage permissions for different roles in the system</p>
        </div>
        <Button 
          onClick={() => setCreateRoleDialogOpen(true)}
          className="bg-agri-primary hover:bg-agri-secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex-none">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>Manage permissions for different roles in the system</CardDescription>
            
            <div className="pt-4">
              <label className="block text-sm font-medium mb-2">Select Role</label>
              <Select 
                value={selectedRole?.id || ''} 
                onValueChange={(value) => {
                  const role = roles.find(r => r.id === value);
                  setSelectedRole(role || null);
                }}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <span className="font-medium">{role.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col min-h-0">
            {selectedRole && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Resource</TableHead>
                        {actions.map(action => (
                          <TableHead key={action.id}>{action.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.map(resource => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{resource.name}</TableCell>
                          {actions.map(action => (
                            <TableCell key={action.id}>
                              <Checkbox 
                                checked={hasPermission(resource.id, action.id)}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(resource.id, action.id, checked === true)
                                }
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex-none mt-6 flex justify-end">
                  <Button onClick={handleSavePermissions}>
                    Save Permissions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={createRoleDialogOpen} onOpenChange={setCreateRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role to the system. You can set permissions after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right">
                Role Name
              </Label>
              <Input
                id="roleName"
                placeholder="e.g., Store Manager"
                className="col-span-3"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;
