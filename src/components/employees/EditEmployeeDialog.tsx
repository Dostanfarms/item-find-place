
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
import { ArrowLeft } from 'lucide-react';

interface EditEmployeeDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  employee: Employee;
  onUpdateEmployee: (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'date_joined'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  isOpen,
  setIsOpen,
  employee,
  onUpdateEmployee,
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
        <DialogHeader className="flex flex-row items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information and permissions.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <EmployeeFormBase
          employee={employee}
          onSubmit={onUpdateEmployee}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
