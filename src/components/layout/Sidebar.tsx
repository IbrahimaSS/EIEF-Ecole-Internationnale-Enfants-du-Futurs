import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  Utensils,
  ShoppingBag,
  BookOpen,
  Bus,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: {
    count: number;
    color: 'red' | 'orange' | 'blue';
  };
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: 'admin' | 'enseignant' | 'parent' | 'eleve';
  userName: string;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  userRole,
  userName,
  currentPage
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const adminItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
    { id: 'users', label: 'Utilisateurs', icon: <Users size={20} />, href: '/admin/utilisateurs' },
    { id: 'scolarite', label: 'Scolarité', icon: <GraduationCap size={20} />, href: '/admin/scolarite' },
    {
      id: 'comptabilite',
      label: 'Comptabilité',
      icon: <Wallet size={20} />,
      href: '/admin/comptabilite',
      badge: { count: 5, color: 'red' }
    },
    { id: 'cantine', label: 'Cantine', icon: <Utensils size={20} />, href: '/admin/cantine' },
    {
      id: 'superette',
      label: 'Supérette',
      icon: <ShoppingBag size={20} />,
      href: '/admin/superette',
      badge: { count: 3, color: 'orange' }
    },
    { id: 'bibliotheque', label: 'Bibliothèque', icon: <BookOpen size={20} />, href: '/admin/bibliotheque' },
    { id: 'transport', label: 'Transport', icon: <Bus size={20} />, href: '/admin/transport' },
    {
      id: 'communication',
      label: 'Communication',
      icon: <MessageSquare size={20} />,
      href: '/admin/communication',
      badge: { count: 12, color: 'blue' }
    },
    { id: 'administration', label: 'Administration', icon: <Settings size={20} />, href: '/admin/administration' },
  ];

  const enseignantItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/enseignant/dashboard' },
    { id: 'classes', label: 'Mes classes', icon: <GraduationCap size={20} />, href: '/enseignant/classes' },
    { id: 'notes', label: 'Notes', icon: <BookOpen size={20} />, href: '/enseignant/notes' },
    { id: 'communication', label: 'Communication', icon: <MessageSquare size={20} />, href: '/enseignant/communication' },
    { id: 'ressources', label: 'Ressources', icon: <BookOpen size={20} />, href: '/enseignant/ressources' },
  ];

  const parentItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/parent/dashboard' },
    { id: 'eleves', label: 'Mes enfants', icon: <GraduationCap size={20} />, href: '/parent/eleves' },
    { id: 'paiements', label: 'Paiements', icon: <Wallet size={20} />, href: '/parent/paiements' },
    { id: 'communication', label: 'Communication', icon: <MessageSquare size={20} />, href: '/parent/communication' },
  ];

  const eleveItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/eleve/dashboard' },
    { id: 'notes', label: 'Mes notes', icon: <GraduationCap size={20} />, href: '/eleve/notes' },
    { id: 'emploi', label: 'Emploi du temps', icon: <Calendar size={20} />, href: '/eleve/emploi' },
    { id: 'ressources', label: 'Ressources', icon: <BookOpen size={20} />, href: '/eleve/ressources' },
    { id: 'communication', label: 'Communication', icon: <MessageSquare size={20} />, href: '/eleve/communication' },
  ];

  const getItemsByRole = () => {
    switch (userRole) {
      case 'admin': return adminItems;
      case 'enseignant': return enseignantItems;
      case 'parent': return parentItems;
      case 'eleve': return eleveItems;
      default: return [];
    }
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'blue': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const sidebarItems = getItemsByRole();

  return (
    <div className={cn(
      'bg-gradient-to-b from-bleu-900 via-bleu-800 to-or-600/80 h-screen flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.3)] transition-all duration-300 z-40 relative overflow-hidden active-sidebar-container',
      isOpen ? 'w-72' : 'w-20'
    )}>
      {/* Dynamic Gold Light Effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-or-500/10 rounded-full blur-[100px] pointer-events-none -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-bleu-400/5 rounded-full blur-[80px] pointer-events-none -ml-16 -mb-16" />

      {/* Decorative Gold Border */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-or-500/20 to-transparent" />

      {/* Header */}
      <div className="p-8 border-b border-white/5 mb-2 flex-shrink-0 relative">
        <div className="flex items-center justify-between">
          <div className={cn(
            'flex items-center gap-4',
            !isOpen && 'justify-center'
          )}>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-gold p-2 overflow-hidden ring-4 ring-or-500/20">
              <img src="/logo_eief.jpeg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            {isOpen && (
              <div className="flex flex-col text-left">
                <h3 className="text-white font-semibold  text-xl leading-tight">EIEF</h3>
                <p className="text-or-400 text-[10px]  font-semibold ">{userRole}</p>
              </div>
            )}
          </div>
          {isOpen && (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-or-400 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation - SCROLLABLE */}
      <nav className="flex-1 px-4 py-4 space-y-2.5 overflow-y-auto no-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                'flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-white/10 text-white font-semibold shadow-lg border border-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 w-1.5 h-1/2 bg-or-500 rounded-r-full shadow-gold"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={cn(
                'transition-all duration-300',
                isActive ? 'scale-110 text-or-400' : 'group-hover:scale-110 group-hover:text-or-300'
              )}>
                {item.icon}
              </div>
              {isOpen && (
                <>
                  <span className="flex-1 text-[11px] font-semibold  ">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      'text-[9px] font-semibold px-2 py-0.5 rounded-lg text-white shadow-lg',
                      getBadgeColor(item.badge.color)
                    )}>
                      {item.badge.count}
                    </span>
                  )}
                </>
              )}
              {!isOpen && item.badge && (
                <span className={cn(
                  'absolute top-2 right-2 w-2 h-2 rounded-full border border-gray-900 shadow-gold',
                  getBadgeColor(item.badge.color)
                )} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-black/10 flex-shrink-0">
        <div className={cn(
          'flex items-center gap-4',
          !isOpen && 'justify-center'
        )}>
          <Avatar name={userName} size="sm" className="ring-2 ring-or-500/30" />
          {isOpen && (
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-xs font-semibold   truncate">{userName}</p>
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-gray-500 hover:text-or-400 text-[10px] font-semibold   flex items-center gap-1 transition-all mt-0.5"
              >
                <LogOut size={12} />
                Quitter
              </button>
            </div>
          )}
        </div>
        {!isOpen && (
          <button
            onClick={onToggle}
            className="w-full mt-6 py-3 flex items-center justify-center text-white/20 hover:text-or-400 transition-all font-semibold"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
