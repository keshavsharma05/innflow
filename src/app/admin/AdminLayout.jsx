import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { AdminDataProvider } from './AdminContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    document.documentElement.classList.add('admin-html-no-scrollbar');
    document.body.classList.add('admin-body-no-scrollbar');
    return () => {
      document.documentElement.classList.remove('admin-html-no-scrollbar');
      document.body.classList.remove('admin-body-no-scrollbar');
    };
  }, []);

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

