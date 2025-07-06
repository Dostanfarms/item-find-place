
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBranches } from '@/hooks/useBranches';
import { Search } from 'lucide-react';

interface BranchFilterProps {
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  placeholder?: string;
}

const BranchFilter: React.FC<BranchFilterProps> = ({
  selectedBranch,
  onBranchChange,
  searchTerm,
  onSearchChange,
  placeholder = "Search by branch name or owner..."
}) => {
  const { branches, loading } = useBranches();

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={selectedBranch} onValueChange={onBranchChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="All Branches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Branches</SelectItem>
          {!loading && branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.branch_name} - {branch.branch_owner_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BranchFilter;
