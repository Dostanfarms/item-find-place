
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
import { useToast } from '@/hooks/use-toast';

const Employees = () => {
  const { toast } = useToast();
  const { employees, loading, deleteEmployee, updateEmployee, addEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    state: '',
    district: '',
    village: '',
    profilePhoto: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    isActive: true
  });
  const [showPassword, setShowPassword] = useState(false);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.phone && employee.phone.includes(searchTerm))
  );

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      password: '',
      role: employee.role || 'sales',
      state: employee.state || '',
      district: employee.district || '',
      village: employee.village || '',
      profilePhoto: employee.profile_photo || '',
      accountHolderName: employee.account_holder_name || '',
      accountNumber: employee.account_number || '',
      bankName: employee.bank_name || '',
      ifscCode: employee.ifsc_code || '',
      isActive: employee.is_active !== false
    });
  };

  const handleDelete = async (id: string) => {
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

  const handleAddEmployee = async () => {
    const result = await addEmployee({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      profile_photo: formData.profilePhoto,
      state: formData.state,
      district: formData.district,
      village: formData.village,
      account_holder_name: formData.accountHolderName,
      account_number: formData.accountNumber,
      bank_name: formData.bankName,
      ifsc_code: formData.ifscCode,
      is_active: formData.isActive
    });

    if (result?.success) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    const updateData: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      profile_photo: formData.profilePhoto,
      state: formData.state,
      district: formData.district,
      village: formData.village,
      account_holder_name: formData.accountHolderName,
      account_number: formData.accountNumber,
      bank_name: formData.bankName,
      ifsc_code: formData.ifscCode,
      is_active: formData.isActive
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    const result = await updateEmployee(editingEmployee.id, updateData);
    if (result?.success) {
      setEditingEmployee(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      state: '',
      district: '',
      village: '',
      profilePhoto: '',
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      isActive: true
    });
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setEditingEmployee(null);
    resetForm();
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
          <Button 
            className="bg-agri-primary hover:bg-agri-secondary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Employees Table */}
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
            canEdit={true}
            canDelete={true}
          />
        )}
      </div>

      <AddEmployeeDialog 
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        formData={formData}
        onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
        showPassword={showPassword}
        togglePasswordVisibility={() => setShowPassword(!showPassword)}
        onAddEmployee={handleAddEmployee}
        onCancel={handleCancel}
      />

      {editingEmployee && (
        <EditEmployeeDialog 
          isOpen={!!editingEmployee}
          setIsOpen={(open) => !open && setEditingEmployee(null)}
          formData={formData}
          onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
          showPassword={showPassword}
          togglePasswordVisibility={() => setShowPassword(!showPassword)}
          onUpdateEmployee={handleUpdateEmployee}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Employees;
