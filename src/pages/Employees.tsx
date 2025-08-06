
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { useAuth } from '@/context/AuthContext';
import { hasPermission } from '@/utils/employeeData';
import AddEmployeeDialog from '@/components/employees/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/employees/EditEmployeeDialog';
import EmployeeTable from '@/components/employees/EmployeeTable';

const Employees = () => {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { currentUser } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const canCreateEmployees = currentUser ? hasPermission(currentUser.role, 'employees', 'create') : false;
  const canEditEmployees = currentUser ? hasPermission(currentUser.role, 'employees', 'edit') : false;
  const canDeleteEmployees = currentUser ? hasPermission(currentUser.role, 'employees', 'delete') : false;

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'dateJoined' | 'createdAt' | 'updatedAt'>) => {
    const result = await addEmployee(employeeData);
    if (result.success) {
      setIsAddDialogOpen(false);
    }
    return result;
  };

  const handleEditEmployee = async (id: string, employeeData: Partial<Employee>) => {
    const result = await updateEmployee(id, employeeData);
    if (result.success) {
      setEditingEmployee(null);
    }
    return result;
  };

  const handleDeleteEmployee = async (id: string) => {
    return await deleteEmployee(id);
  };

  // Get employee stats
  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const totalEmployees = employees.length;
  const roleDistribution = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mockEmployee = {
    id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee',
    profilePhoto: '',
    dateJoined: new Date().toISOString().split('T')[0],
    state: '',
    district: '',
    village: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchIds: []
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Employee Management</h1>
        </div>
        {canCreateEmployees && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Badge variant="outline">{Object.keys(roleDistribution).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(roleDistribution).map(([role, count]) => (
                <div key={role} className="flex justify-between text-sm">
                  <span className="capitalize">{role}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={employees}
            onEdit={canEditEmployees ? setEditingEmployee : undefined}
            onDelete={canDeleteEmployees ? handleDeleteEmployee : undefined}
          />
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddEmployee}
      />

      {/* Edit Employee Dialog */}
      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSubmit={handleEditEmployee}
        />
      )}
    </div>
  );
};

export default Employees;
