
import React from 'react';
import { 
  Sidebar as SidebarContainer, 
  SidebarContent, 
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import TopLevelMenu from './TopLevelMenu';
import ManageMenu from './ManageMenu';
import UserSection from './UserSection';
import { Package, Menu } from 'lucide-react';

export const Sidebar = () => {
  const { state } = useSidebar();
  
  return (
    <>
      {/* Desktop sidebar */}
      <SidebarContainer collapsible="icon">
        <SidebarHeader className="py-6">
          <div className="flex items-center px-4 gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-agri-primary" />
              {state === 'expanded' && (
                <span className="text-lg font-bold">Dostanfarms Admin</span>
              )}
            </div>
            {/* Desktop toggle button - only shows when sidebar is expanded */}
            {state === 'expanded' && (
              <SidebarTrigger className="bg-transparent hover:bg-gray-100 p-1 rounded-md">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <TopLevelMenu />
          <ManageMenu />
          <UserSection />
        </SidebarContent>
      </SidebarContainer>
      
      {/* Floating toggle button that appears when sidebar is collapsed */}
      {state === 'collapsed' && (
        <div className="fixed z-50 top-4 left-4">
          <SidebarTrigger className="bg-white shadow-lg border rounded-md p-2 hover:bg-gray-50">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      )}
    </>
  );
};
