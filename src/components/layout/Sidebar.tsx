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
  Calendar,
  Gamepad2,
  FileBarChart,
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
    color: 'red' | 'orange' | 'blue' | 'vert' | 'or';
  };
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: 'admin' | 'enseignant' | 'parent' | 'eleve' | 'manager' | 'comptable';
  userName: string;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, userRole, userName, currentPage }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const adminItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
    { id: 'users', label: 'Utilisateurs', icon: <Users size={20} />, href: '/admin/utilisateurs' },
    { id: 'scolarite', label: 'Scolarité', icon: <GraduationCap size={20} />, href: '/admin/scolarite' },
    { id: 'comptabilite', label: 'Comptabilité', icon: <Wallet size={20} />, href: '/admin/comptabilite' },
    { id: 'cantine', label: 'Cantine', icon: <Utensils size={20} />, href: '/admin/cantine' },
    { id: 'superette', label: 'Supérette', icon: <ShoppingBag size={20} />, href: '/admin/superette', badge: { count: 3, color: 'or' } },
    { id: 'bibliotheque', label: 'Bibliothèque', icon: <BookOpen size={20} />, href: '/admin/bibliotheque' },
    { id: 'transport', label: 'Transport', icon: <Bus size={20} />, href: '/admin/transport' },
    { id: 'communication', label: 'Communication', icon: <MessageSquare size={20} />, href: '/admin/communication', badge: { count: 12, color: 'vert' } },
    { id: 'administration', label: 'Administration', icon: <Settings size={20} />, href: '/admin/administration' },
  ];

  const enseignantItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/enseignant/dashboard' },
    { id: 'classes', label: 'Mes classes', icon: <GraduationCap size={20} />, href: '/enseignant/classes' },
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
    { id: 'jeux', label: 'Jeux Éducatifs', icon: <Gamepad2 size={20} />, href: '/eleve/jeux', badge: { count: 1, color: 'or' } },
    { id: 'communication', label: 'Communication', icon: <MessageSquare size={20} />, href: '/eleve/communication' },
  ];

  const managerItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/manager/dashboard' },
    { id: 'scolarite', label: 'Scolarité & Pointage', icon: <GraduationCap size={20} />, href: '/manager/scolarite' },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: <Users size={20} />, href: '/manager/utilisateurs' },
  ];

  const comptableItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/comptable/dashboard' },
    { id: 'encaissements', label: 'Encaissements', icon: <Wallet size={20} />, href: '/comptable/encaissements' },
    { id: 'depenses', label: 'Dépenses', icon: <ShoppingBag size={20} />, href: '/comptable/depenses' },
    { id: 'scolarite', label: 'Scolarité', icon: <GraduationCap size={20} />, href: '/comptable/scolarite' },
    { id: 'rapport', label: 'Rapport Mensuel', icon: <FileBarChart size={20} />, href: '/comptable/rapport' },
  ];

  const getItemsByRole = () => {
    switch (userRole) {
      case 'admin': return adminItems;
      case 'enseignant': return enseignantItems;
      case 'parent': return parentItems;
      case 'eleve': return eleveItems;
      case 'manager': return managerItems;
      case 'comptable': return comptableItems;
      default: return [];
    }
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case 'red': return 'bg-rouge-500 text-white';
      case 'orange':
      case 'or': return 'bg-or-500 text-gray-950';
      case 'blue': return 'bg-bleu-500 text-white';
      case 'vert': return 'bg-vert-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administration',
    enseignant: 'Enseignant',
    parent: 'Parent',
    eleve: 'Élève',
    manager: 'Manager',
    comptable: 'Comptable',
  };

  const sidebarItems = getItemsByRole();

  return (
    <div
      className={cn(
        'relative h-screen flex flex-col z-40 overflow-hidden transition-all duration-300',
        // Dégradé EIEF : vert turquoise → bleu nuit → or (couleurs école)
        'bg-gradient-to-b from-vert-800 via-bleu-800 to-bleu-900',
        'shadow-[10px_0_40px_rgba(0,0,0,0.3)]',
        isOpen ? 'w-72' : 'w-20'
      )}
    >
      {/* Halos décoratifs or */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-or-500/15 rounded-full blur-[100px] pointer-events-none -mr-24 -mt-24" />
      <div className="absolute bottom-1/3 left-0 w-40 h-40 bg-vert-400/10 rounded-full blur-[80px] pointer-events-none -ml-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-or-500/10 rounded-full blur-[80px] pointer-events-none -mr-16 -mb-16" />

      {/* Liseré or sur le côté droit */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-or-500/30 to-transparent" />

      {/* Header / Branding */}
      <div className="relative p-6 border-b border-white/5 flex-shrink-0">
        <div className={cn('flex items-center gap-3', !isOpen && 'justify-center')}>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-gold p-1.5 overflow-hidden ring-2 ring-or-400/40 shrink-0">
            <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
          </div>
          {isOpen && (
            <div className="flex flex-col text-left flex-1 min-w-0">
              <h3 className="text-white font-black text-lg leading-tight tracking-tighter">EIEF</h3>
              <p className="text-or-300 text-[9px] font-black uppercase tracking-[0.3em] truncate">{roleLabels[userRole] ?? userRole}</p>
            </div>
          )}
          {isOpen && (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-or-400 transition-all shrink-0"
              title="Réduire"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-5 space-y-1.5 overflow-y-auto no-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-white/10 backdrop-blur-md text-white font-black border border-white/10 shadow-lg'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              )}
              title={!isOpen ? item.label : undefined}
            >
              {/* Indicateur or actif */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-or-400 rounded-r-full shadow-gold"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <div
                className={cn(
                  'transition-all duration-300 shrink-0',
                  isActive ? 'text-or-300 scale-110' : 'group-hover:text-or-300 group-hover:scale-110'
                )}
              >
                {item.icon}
              </div>

              {isOpen && (
                <>
                  <span className="flex-1 text-xs font-bold tracking-wide truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[9px] font-black px-2 py-0.5 rounded-md shadow-md',
                        getBadgeClasses(item.badge.color)
                      )}
                    >
                      {item.badge.count}
                    </span>
                  )}
                </>
              )}
              {!isOpen && item.badge && (
                <span
                  className={cn(
                    'absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-bleu-900 shadow-md',
                    getBadgeClasses(item.badge.color).split(' ')[0]
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer : profil + logout */}
      <div className="relative p-4 border-t border-white/5 bg-black/20 flex-shrink-0">
        <div className={cn('flex items-center gap-3', !isOpen && 'justify-center')}>
          <Avatar name={userName} size="sm" className="ring-2 ring-or-500/40" />
          {isOpen && (
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-white text-xs font-black truncate">{userName}</p>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-gray-400 hover:text-or-400 text-[10px] font-bold flex items-center gap-1 transition-all mt-0.5 uppercase tracking-widest"
              >
                <LogOut size={11} />
                Quitter
              </button>
            </div>
          )}
        </div>
        {!isOpen && (
          <button
            onClick={onToggle}
            className="w-full mt-4 py-2 flex items-center justify-center text-white/40 hover:text-or-400 transition-all"
            title="Étendre"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
