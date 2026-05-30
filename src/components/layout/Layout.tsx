import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { UserRole } from '../../types/auth';

interface LayoutProps {
  userRole: UserRole;
  userName: string;
  currentPage: string;
  title: string;
  subtitle?: string;
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
  onSearch,
  onNotificationClick,
  onProfileClick,
  notificationCount,
}) => {
  const location = useLocation();

  // Desktop: sidebar expanded by default. Mobile: closed by default.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Close sidebar if window resized to mobile
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden">
      {/* Halos décoratifs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] bg-or-500/[0.03] dark:bg-or-500/[0.04] rounded-full blur-[120px] -mr-40 -mt-40 z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 w-[400px] h-[400px] bg-vert-500/[0.03] dark:bg-vert-500/[0.04] rounded-full blur-[120px] z-0" />

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar — sur mobile: fixed + translate, desktop: normal flow */}
      <div className={`
        lg:relative fixed inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(prev => !prev)}
          userRole={userRole}
          userName={userName}
          currentPage={currentPage}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          userName={userName}
          notificationCount={notificationCount}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
          onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
