import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, User, Sun, Moon } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  userName,
  notificationCount = 0,
  onSearch,
  onNotificationClick,
  onProfileClick
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Initial check
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100/50 dark:border-white/5 sticky top-0 z-30 h-20 transition-colors">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left side - Title and breadcrumb */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white  ">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium  tracking-[0.1em] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-bleu-600 dark:hover:text-or-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all duration-300"
            title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {/* Search */}
          {onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-64 h-10 pl-10 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm dark:text-white focus:outline-none focus:border-bleu-500 focus:ring-2 focus:ring-bleu-100 dark:focus:ring-bleu-900/20 transition-all duration-200"
              />
            </div>
          )}

          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {notificationCount > 99 ? '99' : notificationCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              <Avatar name={userName} size="sm" className="ring-2 ring-gray-100 dark:ring-white/5" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:block  ">
                {userName.split(' ')[0]}
              </span>
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 py-2 z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 dark:border-white/5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white  truncate">{userName}</p>
                  <p className="text-[10px] font-semibold text-gray-400 capitalize mt-0.5">
                    {user?.role === 'admin' ? 'Administrateur' : user?.role || 'Utilisateur'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate(`/${user?.role || 'admin'}/profil`);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-5 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-bleu-600 dark:hover:text-or-400 flex items-center gap-4 transition-all"
                >
                  <User size={18} />
                  Mon Profil
                </button>

                <button
                  onClick={() => {
                    navigate(`/${user?.role || 'admin'}/${user?.role === 'admin' ? 'administration' : 'preferences'}`);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-5 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-bleu-600 dark:hover:text-or-400 flex items-center gap-4 transition-all"
                >
                  <Settings size={18} />
                  Préférences
                </button>

                <div className="border-t border-gray-50 dark:border-white/5 mt-2 pt-2">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-4 transition-all  "
                  >
                    <LogOut size={18} />
                    Quitter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
