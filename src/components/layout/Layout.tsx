import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  userRole: 'admin' | 'enseignant' | 'parent' | 'eleve';
  userName: string;
  currentPage: string;
  title: string;
  subtitle?: string;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
}

const Layout: React.FC<LayoutProps> = ({
  userRole,
  userName,
  currentPage,
  title,
  subtitle,
  onSidebarToggle,
  isSidebarOpen = true,
  onSearch,
  onNotificationClick,
  onProfileClick,
  notificationCount
}) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={onSidebarToggle || (() => {})}
        userRole={userRole}
        userName={userName}
        currentPage={currentPage}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          userName={userName}
          notificationCount={notificationCount}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
