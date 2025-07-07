
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useBranches } from '@/hooks/useBranches';

interface BranchFilterProps {
  onBranchChange?: (branchId: string | null) => void;
  className?: string;
}

const BranchFilter: React.FC<BranchFilterProps> = ({ onBranchChange, className }) => {
  const { currentUser, selectedBranch, setSelectedBranch } = useAuth();
  const { branches } = useBranches();

  // Only show for admin users
  if (currentUser?.role?.toLowerCase() !== 'admin') {
    return null;
  }

  const handleBranchChange = (value: string) => {
    const branchId = value === 'all' ? null : value;
    setSelectedBranch(branchId);
    onBranchChange?.(branchId);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Branch:</span>
      <Select value={selectedBranch || 'all'} onValueChange={handleBranchChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {branches.filter(branch => branch.is_active).map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.branch_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BranchFilter;
