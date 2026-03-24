import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import './SidebarLayout.css';

export const SidebarLayout: React.FC = () => {
  return (
    <div className="sidebar-layout">
      <Sidebar />
      <main className="sidebar-main-content">
        <div className="sidebar-topbar">
          {/* Add topbar elements here if needed, like search or notifications */}
        </div>
        <div className="sidebar-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
