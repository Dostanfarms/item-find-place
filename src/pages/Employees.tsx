import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee } from '@/utils/types';
import EmployeeTable from '@/components/employees/EmployeeTable';
import AddEmployeeDialog from '@/components/employees/AddEmployeeDialog';
import EditEmployeeDialog from '@/components/employees/EditEmployeeDialog';
import BranchFilter from '@/components/BranchFilter';
import ProtectedAction from '@/components/ProtectedAction';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Employees: React.FC = () => {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { currentUser, hasPermission } = useAuth();
  const { toast } = useToast();

  const handleEditEmployee = (employee: Employee) => {
    setEditEmployee(employee);
    setShowEditDialog(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!hasPermission('employees', 'delete')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete employees",
        variant: "destructive"
      });
      return;
    }

    if (confirm('Are you sure you want to delete this employee?')) {
      const result = await deleteEmployee(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Employee deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete employee",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'dateJoined' | 'createdAt' | 'updatedAt'>) => {
    const result = await addEmployee(employeeData);
    if (result.success) {
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Employee added successfully"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add employee",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    const result = await updateEmployee(id, employeeData);
    if (result.success) {
      setShowEditDialog(false);
      setEditEmployee(null);
      toast({
        title: "Success",
        description: "Employee updated successfully"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update employee",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Employees</h1>
          <BranchFilter />
        </div>
        <ProtectedAction resource="employees" action="create">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </ProtectedAction>
      </div>

      <EmployeeTable
        employees={employees}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

      <AddEmployeeDialog
        isOpen={showAddDialog}
        setIsOpen={setShowAddDialog}
        onAddEmployee={handleAddEmployee}
        onSubmit={handleAddEmployee}
        onClose={() => setShowAddDialog(false)}
        onCancel={() => setShowAddDialog(false)}
      />

      {editEmployee && (
        <EditEmployeeDialog
          employee={editEmployee}
          isOpen={showEditDialog}
          setIsOpen={setShowEditDialog}
          onUpdateEmployee={(data) => handleUpdateEmployee(editEmployee.id, data)}
          onSubmit={(id, data) => handleUpdateEmployee(id, data)}
          onClose={() => {
            setShowEditDialog(false);
            setEditEmployee(null);
          }}
          onCancel={() => {
            setShowEditDialog(false);
            setEditEmployee(null);
          }}
        />
      )}
    </div>
  );
};

export default Employees;
