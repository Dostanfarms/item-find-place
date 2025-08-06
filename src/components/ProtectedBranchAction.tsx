
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { canAccessBranch } from '@/utils/employeeData';
import { useToast } from '@/hooks/use-toast';

interface ProtectedBranchActionProps {
  targetBranchId: string | null;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  showAccessDeniedMessage?: boolean;
}

const ProtectedBranchAction: React.FC<ProtectedBranchActionProps> = ({
  targetBranchId,
  children,
  fallbackComponent,
  showAccessDeniedMessage = false
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleUnauthorizedClick = () => {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this branch's data",
      variant: "destructive"
    });
  };

  const hasAccess = canAccessBranch(
    currentUser?.role || '', 
    currentUser?.branch_id || null, 
    targetBranchId
  );

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (showAccessDeniedMessage) {
      return (
        <div className="text-muted-foreground text-sm">
          Branch access restricted
        </div>
      );
    }

    // Return a disabled version for buttons or hide completely
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        disabled: true,
        onClick: handleUnauthorizedClick,
        className: `${(children as any).props.className || ''} opacity-50 cursor-not-allowed`
      });
    }

    return null;
  }

  return <>{children}</>;
};

export default ProtectedBranchAction;
