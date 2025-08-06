
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmployeeFormBase from './EmployeeFormBase';
import { Employee } from '@/utils/types';

interface AddEmployeeDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAddEmployee: (employee: Omit<Employee, 'id' | 'dateJoined'>) => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'dateJoined'>) => void;
  onClose: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  isOpen,
  setIsOpen,
  onAddEmployee,
  onSubmit,
  onClose,
  onCancel,
  isLoading = false
}) => {
  const handleCancel = () => {
    onCancel();
    onClose();
    setIsOpen(false);
  };

  const handleSubmit = (employeeData: Omit<Employee, 'id' | 'dateJoined'>) => {
    onSubmit(employeeData);
    onAddEmployee(employeeData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account with role-based permissions.
          </DialogDescription>
        </DialogHeader>
        
        <EmployeeFormBase
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
