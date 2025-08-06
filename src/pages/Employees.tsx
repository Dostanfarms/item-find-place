import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import EmployeeFormBase from '@/components/employees/EmployeeFormBase';
import { useAuth } from '@/context/AuthContext';
import { canAccess } from '@/utils/employeeData';

interface EmployeeFormProps {
  employee?: Employee;
  onClose: () => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'dateJoined'>) => void;
}

const Employees = () => {
  const navigate = useNavigate();
  const { employees, loading, deleteEmployee } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const { checkPermission } = useAuth();

  const handleAddEmployee = () => {
    setShowAddDialog(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowConfirmDialog(true);
  };

  const confirmDeleteEmployee = async () => {
    if (selectedEmployee) {
      const { success, error } = await deleteEmployee(selectedEmployee.id);
      if (success) {
        toast({
          title: "Success",
          description: "Employee deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to delete employee: ${error}`,
          variant: "destructive",
        });
      }
      setShowConfirmDialog(false);
      setSelectedEmployee(null);
    }
  };

  const handleEmployeeAdded = () => {
    setShowAddDialog(false);
  };

  const handleEmployeeUpdated = () => {
    setShowEditDialog(false);
    setSelectedEmployee(null);
  };

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedEmployee(null);
  };

  const renderEmployeeRow = (employee: Employee) => (
    <TableRow key={employee.id}>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={employee.profilePhoto} />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{employee.name}</span>
        </div>
      </TableCell>
      <TableCell>{employee.email}</TableCell>
      <TableCell>{employee.phone}</TableCell>
      <TableCell>{employee.role}</TableCell>
      <TableCell>{employee.isActive ? 'Active' : 'Inactive'}</TableCell>
      <TableCell className="flex justify-end gap-4">
        {checkPermission('employee', 'update') && (
          <Button size="sm" onClick={() => handleEditEmployee(employee)}>
            Edit
          </Button>
        )}
        {checkPermission('employee', 'delete') && (
          <Button size="sm" variant="destructive" onClick={() => handleDeleteEmployee(employee)}>
            Delete
          </Button>
        )}
      </TableCell>
    </TableRow>
  );

  const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSubmit }) => {
    const handleSubmit = (employeeData: Omit<Employee, 'id' | 'dateJoined'>) => {
      onSubmit(employeeData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <EmployeeFormBase
            employee={employee}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    );
  };

  const mockEmployee: Employee = {
    id: 'new',
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales',
    profilePhoto: '',
    dateJoined: new Date().toISOString(),
    state: '',
    district: '',
    village: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    isActive: true,
    branchIds: []
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Employees</h1>
        {checkPermission('employee', 'create') && (
          <Button onClick={handleAddEmployee}>Add Employee</Button>
        )}
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of your employees.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(renderEmployeeRow)}
            </TableBody>
          </Table>
        </div>
      )}

      {showAddDialog && (
        <EmployeeForm
          onClose={handleCloseAddDialog}
          onSubmit={async (employeeData) => {
            // Call the addEmployee function from the useEmployees hook
            // and handle success/error messages
            // For example:
            /*
            const { success, error } = await addEmployee(employeeData);
            if (success) {
              toast({
                title: "Success",
                description: "Employee added successfully",
              });
              handleEmployeeAdded();
            } else {
              toast({
                title: "Error",
                description: `Failed to add employee: ${error}`,
                variant: "destructive",
              });
            }
            */
            navigate('/add-employee');
          }}
        />
      )}

      {showEditDialog && selectedEmployee && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={handleCloseEditDialog}
          onSubmit={async (employeeData) => {
            // Call the updateEmployee function from the useEmployees hook
            // and handle success/error messages
            // For example:
            /*
            const { success, error } = await updateEmployee(selectedEmployee.id, employeeData);
            if (success) {
              toast({
                title: "Success",
                description: "Employee updated successfully",
              });
              handleEmployeeUpdated();
            } else {
              toast({
                title: "Error",
                description: `Failed to update employee: ${error}`,
                variant: "destructive",
              });
            }
            */
            navigate(`/edit-employee/${selectedEmployee.id}`);
          }}
        />
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            Delete Employee
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete {selectedEmployee?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEmployee}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Employees;
