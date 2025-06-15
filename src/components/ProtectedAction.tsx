
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedActionProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  showAccessDeniedMessage?: boolean;
}

const ProtectedAction: React.FC<ProtectedActionProps> = ({
  resource,
  action,
  children,
  fallbackComponent,
  showAccessDeniedMessage = false
}) => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const handleUnauthorizedClick = () => {
    toast({
      title: "Access Denied",
      description: `You don't have permission to ${action} ${resource}`,
      variant: "destructive"
    });
  };

  const hasAccess = hasPermission(resource, action);

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (showAccessDeniedMessage) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span className="text-sm">Access restricted</span>
        </div>
      );
    }

    // Return a disabled/hidden version of the component
    if (React.isValidElement(children) && children.type === Button) {
      return React.cloneElement(children as React.ReactElement, {
        disabled: true,
        onClick: handleUnauthorizedClick,
        title: `Access denied: Cannot ${action} ${resource}`,
        className: `${children.props.className || ''} opacity-50 cursor-not-allowed`
      });
    }

    return null;
  }

  return <>{children}</>;
};

export default ProtectedAction;
