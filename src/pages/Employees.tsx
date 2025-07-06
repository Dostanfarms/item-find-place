import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEmployees } from '@/hooks/useEmployees';
import { useBranches } from '@/hooks/useBranches';
import { Plus, Users, UserCheck, UserX, Menu } from 'lucide-react';
import AddEmployeeDialog from '@/components/employees/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/employees/EditEmployeeDialog';
import EmployeeTable from '@/components/employees/EmployeeTable';
import ProtectedAction from '@/components/ProtectedAction';
import BranchFilter from '@/components/BranchFilter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Employee } from '@/utils/types';

const Employees = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { employees, loading, deleteEmployee, updateEmployee, addEmployee } = useEmployees();
  const { branches } = useBranches();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter employees based on search term and branch
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.phone && employee.phone.includes(searchTerm));

    const matchesBranch = !selectedBranch || employee.branch_id === selectedBranch;

    // Also search by branch name if search term is provided
    const matchesBranchName = !searchTerm || (employee.branch_id && branches.some(branch => 
      branch.id === employee.branch_id && 
      (branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       branch.branch_owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
    ));

    return matchesSearch && matchesBranch && matchesBranchName;
  });

  const handleEdit = (employee: any) => {
    if (!hasPermission('employees', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit employees",
        variant: "destructive"
      });
      return;
    }

    setEditingEmployee(employee);
  };

  const handleDelete = async (id: string) => {
    if (!hasPermission('employees', 'delete')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete employees",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this employee?')) {
      const result = await deleteEmployee(id);
      if (result?.success) {
        toast({
          title: "Employee deleted",
          description: "Employee has been deleted successfully."
        });
      }
    }
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'date_joined'>) => {
    if (!hasPermission('employees', 'create')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create employees",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await addEmployee(employeeData);

      if (result?.success) {
        setIsAddDialogOpen(false);
        toast({
          title: "Employee added",
          description: "Employee has been created successfully."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'date_joined'>) => {
    if (!editingEmployee) return;

    if (!hasPermission('employees', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit employees",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateEmployee(editingEmployee.id, employeeData);
      if (result?.success) {
        setEditingEmployee(null);
        toast({
          title: "Employee updated",
          description: "Employee has been updated successfully."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setEditingEmployee(null);
  };

  const getActiveEmployees = () => employees.filter(emp => emp.is_active !== false).length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex-none flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Manage your team members and their roles</p>
          </div>
        </div>
        <ProtectedAction resource="employees" action="create">
          <Button 
            className="bg-agri-primary hover:bg-agri-secondary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </ProtectedAction>
      </div>

      {/* Branch Filter */}
      <div className="flex-none mb-6">
        <BranchFilter
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by name, email, role, phone, branch name or owner..."
        />
      </div>

      <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEmployees.length}</div>
            <p className="text-xs text-green-600">
              {selectedBranch ? 'In selected branch' : 'All employees'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEmployees.filter(emp => emp.is_active !== false).length}
            </div>
            <p className="text-xs text-green-600">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEmployees.filter(emp => emp.is_active === false).length}
            </div>
            <p className="text-xs text-red-600">Inactive accounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No employees found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedBranch ? 
                'No employees match your search criteria.' : 
                'Get started by adding your first employee.'}
            </p>
          </div>
        ) : (
          <EmployeeTable 
            employees={filteredEmployees}
            onEditClick={handleEdit}
            onDeleteEmployee={handleDelete}
            canEdit={hasPermission('employees', 'edit')}
            canDelete={hasPermission('employees', 'delete')}
          />
        )}
      </div>

      {hasPermission('employees', 'create') && (
        <AddEmployeeDialog 
          isOpen={isAddDialogOpen}
          setIsOpen={setIsAddDialogOpen}
          onAddEmployee={handleAddEmployee}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

      {editingEmployee && hasPermission('employees', 'edit') && (
        <EditEmployeeDialog 
          isOpen={!!editingEmployee}
          setIsOpen={(open) => !open && setEditingEmployee(null)}
          employee={editingEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Employees;
