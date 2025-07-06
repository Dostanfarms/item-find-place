import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEmployees } from '@/hooks/useEmployees';
import { Search, Plus, Users, UserCheck, UserX, Menu } from 'lucide-react';
import AddEmployeeDialog from '@/components/employees/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/employees/EditEmployeeDialog';
import EmployeeTable from '@/components/employees/EmployeeTable';
import ProtectedAction from '@/components/ProtectedAction';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Employee } from '@/utils/types';

const Employees = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { employees, loading, deleteEmployee, updateEmployee, addEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.phone && employee.phone.includes(searchTerm))
  );

  const handleEdit = (employee: any) => {
    if (!hasPermission('employees', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit employees",
        variant: "destructive"
      });
      return;
    }

    console.log('Editing employee:', employee);
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

    console.log('Adding employee with data:', employeeData);
    setIsLoading(true);
    try {
      const result = await addEmployee({
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone || '',
        password: employeeData.password,
        role: employeeData.role,
        profile_photo: employeeData.profile_photo,
        state: employeeData.state,
        district: employeeData.district,
        village: employeeData.village,
        account_holder_name: employeeData.account_holder_name,
        account_number: employeeData.account_number,
        bank_name: employeeData.bank_name,
        ifsc_code: employeeData.ifsc_code,
        is_active: employeeData.is_active !== false,
        branch_id: employeeData.branch_id
      });

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

    console.log('Updating employee with data:', employeeData);
    setIsLoading(true);
    try {
      const updateData: any = {
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone || '',
        role: employeeData.role,
        profile_photo: employeeData.profile_photo,
        state: employeeData.state,
        district: employeeData.district,
        village: employeeData.village,
        account_holder_name: employeeData.account_holder_name,
        account_number: employeeData.account_number,
        bank_name: employeeData.bank_name,
        ifsc_code: employeeData.ifsc_code,
        is_active: employeeData.is_active !== false,
        branch_id: employeeData.branch_id
      };

      if (employeeData.password) {
        updateData.password = employeeData.password;
      }

      const result = await updateEmployee(editingEmployee.id, updateData);
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
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, role, or mobile..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
      </div>

      <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-green-600">All employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveEmployees()}</div>
            <p className="text-xs text-green-600">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length - getActiveEmployees()}</div>
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
              {searchTerm ? 'No employees match your search criteria.' : 'Get started by adding your first employee.'}
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
