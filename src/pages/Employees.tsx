
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { Search, Plus, Users, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import AddEmployeeDialog from '@/components/employees/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/employees/EditEmployeeDialog';
import EmployeeTable from '@/components/employees/EmployeeTable';
import { useToast } from '@/hooks/use-toast';

const Employees = () => {
  const { toast } = useToast();
  const { employees, loading, deleteEmployee, updateEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
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

  const handleToggleStatus = async (employee: any) => {
    const result = await updateEmployee(employee.id, {
      is_active: !employee.is_active
    });
    
    if (result?.success) {
      toast({
        title: "Status updated",
        description: `Employee has been ${!employee.is_active ? 'activated' : 'deactivated'}.`
      });
    }
  };

  const getActiveEmployees = () => employees.filter(emp => emp.is_active).length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
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

      {/* Employees List */}
      <div className="flex-1 overflow-auto">
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No employees found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'No employees match your search criteria.' : 'Get started by adding your first employee.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <EmployeeTable 
            employees={filteredEmployees}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <Badge variant={employee.is_active ? "default" : "secondary"}>
                      {employee.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <div className="font-medium">{employee.email}</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Role:</span>
                      <div className="font-medium capitalize">{employee.role}</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <div className="font-medium">{employee.phone || 'Not provided'}</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Joined:</span>
                      <div className="font-medium">
                        {new Date(employee.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(employee)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant={employee.is_active ? "secondary" : "default"}
                      onClick={() => handleToggleStatus(employee)}
                    >
                      {employee.is_active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddEmployeeDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {editingEmployee && (
        <EditEmployeeDialog 
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
        />
      )}
    </div>
  );
};

export default Employees;
