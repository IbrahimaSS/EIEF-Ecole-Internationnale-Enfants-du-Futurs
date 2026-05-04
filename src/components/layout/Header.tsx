import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, LogOut, User, Sun, Moon } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface HeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  enseignant: 'Enseignant',
  parent: 'Parent',
  eleve: 'Élève',
  manager: 'Manager',
  comptable: 'Comptable',
};

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  userName,
  notificationCount = 0,
  onSearch,
  onNotificationClick,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

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

  const userRoleLabel = user?.role ? roleLabels[user.role] ?? user.role : 'Utilisateur';

  return (
    <header className="bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-30 h-20 transition-colors shadow-sm">
      <div className="h-full px-6 md:px-8 flex items-center justify-between gap-4">
        {/* Titre + sous-titre */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-vert-700 dark:text-or-400 font-black uppercase tracking-[0.3em] mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-vert-600 dark:hover:text-or-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-white/10"
            title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {isDarkMode ? <Sun size={18} className="text-or-400" /> : <Moon size={18} />}
          </button>

          {/* Search */}
          {onSearch && (
            <div className="hidden md:block relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-56 lg:w-64 h-10 pl-11 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:border-vert-500 dark:focus:border-or-400 focus:ring-4 focus:ring-vert-500/10 dark:focus:ring-or-400/10 transition-all duration-200"
              />
            </div>
          )}

          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="relative w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-white/10"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-rouge-500 text-white text-[9px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black ring-2 ring-white dark:ring-gray-900 shadow-md">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={cn(
                'flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl transition-all duration-200 border',
                showProfileMenu
                  ? 'bg-gray-100 dark:bg-white/5 border-vert-300 dark:border-or-400/40 shadow-md'
                  : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-100 dark:hover:border-white/10'
              )}
            >
              <Avatar name={userName} size="sm" className="ring-2 ring-or-400/30" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-black text-gray-900 dark:text-white leading-none">
                  {userName.split(' ')[0]}
                </span>
                <span className="text-[9px] font-bold text-vert-700 dark:text-or-400 uppercase tracking-widest mt-0.5">
                  {userRoleLabel}
                </span>
              </div>
            </button>

            {/* Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {/* Bandeau dégradé en haut */}
                <div className="px-5 py-4 bg-gradient-to-br from-vert-700 via-bleu-700 to-bleu-800 -mx-2 -mt-2 mb-2 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-or-400/30 rounded-full blur-[60px]" />
                  <div className="relative flex items-center gap-3">
                    <Avatar name={userName} size="md" className="ring-2 ring-or-400/50 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white truncate">{userName}</p>
                      <p className="text-[9px] font-black text-or-300 uppercase tracking-widest mt-0.5">
                        {userRoleLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate(`/${user?.role || 'admin'}/profil`);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-vert-50 dark:hover:bg-white/5 hover:text-vert-700 dark:hover:text-or-400 flex items-center gap-3 transition-all"
                >
                  <User size={16} />
                  Mon profil
                </button>

                <button
                  onClick={() => {
                    navigate(`/${user?.role || 'admin'}/${user?.role === 'admin' ? 'administration' : 'preferences'}`);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-vert-50 dark:hover:bg-white/5 hover:text-vert-700 dark:hover:text-or-400 flex items-center gap-3 transition-all"
                >
                  <Settings size={16} />
                  Préférences
                </button>

                <div className="border-t border-gray-100 dark:border-white/5 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full px-5 py-3 text-sm font-black text-rouge-600 hover:bg-rouge-50 dark:hover:bg-rouge-500/10 flex items-center gap-3 transition-all uppercase tracking-widest text-xs"
                  >
                    <LogOut size={16} />
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
