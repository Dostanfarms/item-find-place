
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmployeeFormBase from './EmployeeFormBase';
import { Employee } from '@/utils/types';

interface AddEmployeeDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAddEmployee: (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'date_joined'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  isOpen,
  setIsOpen,
  onAddEmployee,
  onCancel,
  isLoading = false
}) => {
  const handleCancel = () => {
    onCancel();
    setIsOpen(false);
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
          onSubmit={onAddEmployee}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
