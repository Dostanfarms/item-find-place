
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBranches } from '@/hooks/useBranches';
import { useEmployeeBranches } from '@/hooks/useEmployeeBranches';
import { useAuth } from '@/context/AuthContext';
import { canAccessBranch } from '@/utils/employeeData';

interface MultiBranchSelectorProps {
  employeeId?: string;
  selectedBranchIds: string[];
  onBranchChange: (branchIds: string[]) => void;
  disabled?: boolean;
}

const MultiBranchSelector: React.FC<MultiBranchSelectorProps> = ({
  employeeId,
  selectedBranchIds,
  onBranchChange,
  disabled = false
}) => {
  const { branches } = useBranches();
  const { getEmployeeBranches } = useEmployeeBranches();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  console.log('MultiBranchSelector props:', { employeeId, selectedBranchIds, disabled });

  // Filter branches based on user permissions
  const accessibleBranches = branches.filter(branch => {
    if (currentUser?.role?.toLowerCase() === 'admin') {
      return true;
    }
    const userBranchIds = currentUser?.branchIds || (currentUser?.branch_id ? [currentUser.branch_id] : []);
    return canAccessBranch(currentUser?.role || '', userBranchIds, branch.id);
  });

  console.log('Accessible branches:', accessibleBranches.length);

  useEffect(() => {
    if (employeeId && selectedBranchIds.length === 0) {
      console.log('Loading branches for employee:', employeeId);
      setIsLoading(true);
      getEmployeeBranches(employeeId).then(branchIds => {
        console.log('Loaded branch IDs:', branchIds);
        onBranchChange(branchIds);
        setIsLoading(false);
      }).catch(error => {
        console.error('Error loading branches:', error);
        setIsLoading(false);
      });
    }
  }, [employeeId, getEmployeeBranches, selectedBranchIds.length, onBranchChange]);

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    if (disabled) return;
    
    console.log('Branch toggle:', { branchId, checked, currentSelection: selectedBranchIds });
    
    let updatedBranchIds;
    if (checked) {
      updatedBranchIds = [...selectedBranchIds, branchId];
    } else {
      updatedBranchIds = selectedBranchIds.filter(id => id !== branchId);
    }
    
    console.log('Updated branch IDs:', updatedBranchIds);
    onBranchChange(updatedBranchIds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Branch Assignment *</CardTitle>
        <p className="text-xs text-muted-foreground">Select one or more branches for this employee</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading branches...</div>
        ) : accessibleBranches.length === 0 ? (
          <div className="text-sm text-muted-foreground">No branches available</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
            {accessibleBranches.map((branch) => {
              const isChecked = selectedBranchIds.includes(branch.id);
              console.log(`Branch ${branch.branch_name} checked:`, isChecked);
              
              return (
                <div key={branch.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={`branch-${branch.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleBranchToggle(branch.id, !!checked)}
                    disabled={disabled}
                  />
                  <Label 
                    htmlFor={`branch-${branch.id}`} 
                    className="text-sm cursor-pointer flex-1 font-medium"
                  >
                    {branch.branch_name}
                    <div className="text-xs text-muted-foreground">{branch.state}</div>
                  </Label>
                </div>
              );
            })}
          </div>
        )}
        {selectedBranchIds.length > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <strong>{selectedBranchIds.length}</strong> branch(es) selected
            {selectedBranchIds.length > 1 && (
              <div className="text-xs text-blue-600 mt-1">
                Primary branch: {accessibleBranches.find(b => b.id === selectedBranchIds[0])?.branch_name}
              </div>
            )}
          </div>
        )}
        {selectedBranchIds.length === 0 && !isLoading && (
          <div className="text-xs text-red-600 pt-2 border-t">
            Please select at least one branch
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiBranchSelector;
