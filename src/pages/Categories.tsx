
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import CategoryManagement from '@/components/categories/CategoryManagement';

const Categories = () => {
  const { setOpenMobile } = useSidebar();

  // Close sidebar automatically when component mounts
  React.useEffect(() => {
    setOpenMobile(false);
  }, [setOpenMobile]);

  return <CategoryManagement />;
};

export default Categories;
