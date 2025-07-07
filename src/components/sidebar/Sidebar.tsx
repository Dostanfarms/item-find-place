
import React from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Package } from 'lucide-react';
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
          <Package className="h-6 w-6 text-primary" />
          {open && (
            <h2 className="text-lg font-semibold">Dostan Mart</h2>
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
