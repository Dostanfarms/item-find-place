
import React from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import TopLevelMenu from './TopLevelMenu';
import ManageMenu from './ManageMenu';
import MastersMenu from './MastersMenu';

const SidebarComponent = () => {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <SidebarTrigger className="-ml-1" />
          <img 
            src="/lovable-uploads/67ff7785-0e07-470a-a478-3e19a67e7253.png" 
            alt="Dostan Mart" 
            className="h-6 w-auto"
          />
          {open && (
            <h2 className="text-lg font-semibold sr-only">Dostan Mart</h2>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex flex-col">
        <div className="flex-1">
          <TopLevelMenu />
          <ManageMenu />
          <MastersMenu />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarComponent;
