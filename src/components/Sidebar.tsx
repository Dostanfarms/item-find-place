
import React from 'react';
import { Sidebar as SidebarComponent } from './sidebar/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

// This wrapper component now properly accepts children and renders them alongside the sidebar
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <SidebarComponent />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
