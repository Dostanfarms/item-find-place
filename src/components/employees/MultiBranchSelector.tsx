
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

  // Filter branches based on user permissions
  const accessibleBranches = branches.filter(branch => 
    canAccessBranch(currentUser?.role || '', currentUser?.branch_id || null, branch.id)
  );

  useEffect(() => {
    if (employeeId) {
      setIsLoading(true);
      getEmployeeBranches(employeeId).then(branchIds => {
        onBranchChange(branchIds);
        setIsLoading(false);
      });
    }
  }, [employeeId]);

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    if (disabled) return;
    
    let updatedBranchIds;
    if (checked) {
      updatedBranchIds = [...selectedBranchIds, branchId];
    } else {
      updatedBranchIds = selectedBranchIds.filter(id => id !== branchId);
    }
    
    onBranchChange(updatedBranchIds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Branch Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading branches...</div>
        ) : accessibleBranches.length === 0 ? (
          <div className="text-sm text-muted-foreground">No branches available</div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {accessibleBranches.map((branch) => (
              <div key={branch.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`branch-${branch.id}`}
                  checked={selectedBranchIds.includes(branch.id)}
                  onCheckedChange={(checked) => handleBranchToggle(branch.id, !!checked)}
                  disabled={disabled}
                />
                <Label 
                  htmlFor={`branch-${branch.id}`} 
                  className="text-sm cursor-pointer flex-1"
                >
                  {branch.branch_name} - {branch.state}
                </Label>
              </div>
            ))}
          </div>
        )}
        {selectedBranchIds.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {selectedBranchIds.length} branch(es) selected
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiBranchSelector;
