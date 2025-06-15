
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AccessDenied = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="mb-4">
            You do not have permission to access this resource.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Need Access?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Contact your administrator for assistance
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>admin@dostanfarms.com</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 9502395261</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleGoBack}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccessDenied;
