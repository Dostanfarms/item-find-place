
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new category products page
    navigate('/category-products', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-muted-foreground text-lg">Redirecting...</div>
    </div>
  );
};

export default Products;
