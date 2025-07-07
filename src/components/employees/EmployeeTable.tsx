
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Pencil, Trash2, User } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';

interface EmployeeTableProps {
  employees: Employee[];
  onEditClick: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEditClick,
  onDeleteEmployee,
  canEdit,
  canDelete
}) => {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">
          No employees found
        </div>
        <div className="text-sm text-muted-foreground">
          Add employees using the "Add Employee" button above
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-4 font-medium">Employee</th>
            <th className="text-left p-4 font-medium">Contact</th>
            <th className="text-left p-4 font-medium">Role</th>
            <th className="text-left p-4 font-medium">Location</th>
            <th className="text-left p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium">Date Joined</th>
            <th className="text-right p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b hover:bg-muted/25">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm">
                  <div>{employee.phone || 'Not provided'}</div>
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm font-medium">
                  {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm">
                  {employee.state && employee.district ? 
                    `${employee.district}, ${employee.state}` : 
                    "Not specified"}
                </div>
              </td>
              <td className="p-4">
                <Badge 
                  variant={employee.isActive ? "default" : "destructive"}
                  className={employee.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {employee.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="p-4">
                <div className="text-sm">
                  {employee.dateJoined ? 
                    format(new Date(employee.dateJoined), 'MMM dd, yyyy') : 
                    'Not available'}
                </div>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditClick(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteEmployee(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
