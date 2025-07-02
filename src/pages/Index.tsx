
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the app landing page
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-muted-foreground text-lg">Redirecting...</div>
    </div>
  );
};

export default Index;
