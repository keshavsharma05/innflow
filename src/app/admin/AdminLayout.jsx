import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { AdminDataProvider } from './AdminContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggle = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <AdminDataProvider>
      <div className={`admin-container-v3 ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <AdminSidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
        <main className="admin-content-v3">
          <Outlet />
        </main>
      </div>
    </AdminDataProvider>
  );
};

export default AdminLayout;

