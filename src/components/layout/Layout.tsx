import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  userRole: 'admin' | 'enseignant' | 'parent' | 'eleve' | 'manager' | 'comptable';
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
  notificationCount,
}) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden">
      {/* Halos décoratifs très subtils en arrière-plan global */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] bg-or-500/[0.03] dark:bg-or-500/[0.04] rounded-full blur-[120px] -mr-40 -mt-40 z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 w-[400px] h-[400px] bg-vert-500/[0.03] dark:bg-vert-500/[0.04] rounded-full blur-[120px] z-0" />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={onSidebarToggle || (() => {})}
        userRole={userRole}
        userName={userName}
        currentPage={currentPage}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header
          title={title}
          subtitle={subtitle}
          userName={userName}
          notificationCount={notificationCount}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
