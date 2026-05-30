import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronDown,
  Calendar,
  Gamepad2,
  UserPlus,
  RefreshCw,
  ClipboardList,
  UserCheck,
  Briefcase,
  Receipt,
  TrendingDown,
  BookOpen as Library,
  Repeat,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';
import { UserRole } from '../../types/auth';

// ─── Modèle de la sidebar ───────────────────────────────────────────────────
// Une sidebar est désormais composée de SECTIONS (avec un titre en majuscules,
// type "Utilisateurs" / "Finances" / "Services"). Chaque section contient un
// ou plusieurs éléments cliquables, listés verticalement sous l'en-tête.
//
// Les éléments naviguent vers une URL avec query params (ex: ?tab=eleves&sub=
// preinscription). Le composant cible (AdminUsers, AdminAccounting...) lit ces
// paramètres et bascule sur l'onglet correspondant.

interface SidebarItem {
  id: string;             // identifiant unique (sert au highlight actif)
  label: string;
  icon: React.ReactNode;
  href: string;
  /** Sous-items affichés en accordéon (ex: Élèves → Pré-inscription, Inscription, Réinscription). */
  subItems?: SidebarItem[];
  badge?: {
    count: number;
    color: 'red' | 'orange' | 'blue' | 'vert' | 'or';
  };
}

interface SidebarSection {
  /** Titre affiché en petit, en majuscules. Optionnel pour la 1ère section. */
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: UserRole;
  userName: string;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, userRole, userName, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // L'URL complète (path + search) sert à savoir quel sous-item est actif
  // (ex: /admin/utilisateurs?tab=eleves&sub=preinscription).
  const currentSearch = location.search;
  const currentPath = location.pathname;

  // ── ADMIN ─────────────────────────────────────────────────────────────
  const adminSections: SidebarSection[] = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, href: '/admin/dashboard' },
      ],
    },
    {
      title: 'Utilisateurs',
      items: [
        {
          id: 'eleves',
          label: 'Élèves',
          icon: <GraduationCap size={18} />,
          href: '/admin/utilisateurs?tab=eleves&sub=inscription',
          subItems: [
            { id: 'preinscription', label: 'Pré-inscriptions', icon: <ClipboardList size={16} />, href: '/admin/utilisateurs?tab=eleves&sub=preinscription' },
            { id: 'inscription',    label: 'Inscriptions',    icon: <UserPlus size={16} />,     href: '/admin/utilisateurs?tab=eleves&sub=inscription' },
            { id: 'reinscription',  label: 'Réinscriptions',  icon: <RefreshCw size={16} />,    href: '/admin/utilisateurs?tab=eleves&sub=reinscription' },
          ],
        },
        { id: 'familles',       label: 'Familles',        icon: <UserCheck size={18} />,    href: '/admin/utilisateurs?tab=familles' },
        { id: 'enseignants',    label: 'Enseignants',     icon: <Users size={18} />, href: '/admin/utilisateurs?tab=enseignants' },
        { id: 'employes',       label: 'Employés',        icon: <Briefcase size={18} />,    href: '/admin/utilisateurs?tab=employes' },
      ],
    },
    {
      title: 'Scolarité',
      items: [
        { id: 'coordination',           label: 'Tableau Scolarité',    icon: <LayoutDashboard size={18} />, href: '/admin/coordination' },
        { 
          id: 'coordination-scolarite', 
          label: 'Classes & Pointage',   
          icon: <GraduationCap size={18} />,   
          href: '/admin/coordination/scolarite?tab=emplois',
          subItems: [
            { id: 'emplois', label: 'Emplois du temps', icon: <Calendar size={16} />, href: '/admin/coordination/scolarite?tab=emplois' },
            { id: 'notes',   label: 'Relevés de notes', icon: <ClipboardList size={16} />, href: '/admin/coordination/scolarite?tab=notes' },
            { id: 'pointage', label: 'Pointage',        icon: <UserCheck size={16} />,    href: '/admin/coordination/scolarite?tab=pointage' },
            { id: 'cartes',   label: 'Cartes scolaires', icon: <TrendingDown size={16} />, href: '/admin/coordination/scolarite?tab=cartes' },
          ]
        },
        { id: 'coordination-teachers',  label: 'Enseignants',          icon: <UserCheck size={18} />,       href: '/admin/coordination/enseignants' },
        { id: 'coordination-permutation', label: 'Permutation par merite', icon: <Repeat size={18} />,       href: '/admin/coordination/permutation' },
      ],
    },
    {
      title: 'Finances',
      items: [
        { id: 'payments',  label: 'Encaissements',     icon: <Receipt size={18} />,    href: '/admin/comptabilite?tab=payments' },
        { id: 'tuition',   label: 'Frais de Scolarité', icon: <BookOpen size={18} />,   href: '/admin/comptabilite?tab=tuition' },
        { id: 'expenses',  label: 'Dépenses',          icon: <TrendingDown size={18} />, href: '/admin/comptabilite?tab=expenses' },
      ],
    },
    {
      title: 'Services',
      items: [
        { id: 'cantine',      label: 'Cantine',      icon: <Utensils size={18} />,    href: '/admin/cantine' },
        { id: 'superette',    label: 'Supérette',    icon: <ShoppingBag size={18} />, href: '/admin/superette' },
        { id: 'bibliotheque', label: 'Bibliothèque', icon: <Library size={18} />,     href: '/admin/bibliotheque' },
        { id: 'transport',    label: 'Transport',    icon: <Bus size={18} />,         href: '/admin/transport' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { id: 'communication', label: 'Communication', icon: <MessageSquare size={18} />, href: '/admin/communication' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { id: 'administration', label: 'Paramètres', icon: <Settings size={18} />, href: '/admin/administration' },
      ],
    },
  ];

  // ── COMPTABLE ──────────────────────────────────────────────────────────
  const comptableSections: SidebarSection[] = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, href: '/comptable/dashboard' },
      ],
    },
    {
      title: 'Utilisateurs',
      items: [
        {
          id: 'eleves',
          label: 'Élèves',
          icon: <GraduationCap size={18} />,
          href: '/comptable/utilisateurs?tab=eleves&sub=inscription',
          subItems: [
            { id: 'preinscription', label: 'Pré-inscriptions', icon: <ClipboardList size={16} />, href: '/comptable/utilisateurs?tab=eleves&sub=preinscription' },
            { id: 'inscription',    label: 'Inscriptions',    icon: <UserPlus size={16} />,     href: '/comptable/utilisateurs?tab=eleves&sub=inscription' },
            { id: 'reinscription',  label: 'Réinscriptions',  icon: <RefreshCw size={16} />,    href: '/comptable/utilisateurs?tab=eleves&sub=reinscription' },
          ],
        },
        { id: 'familles',       label: 'Familles',        icon: <UserCheck size={18} />,    href: '/comptable/utilisateurs?tab=familles' },
      ],
    },
    {
      title: 'Finances',
      items: [
        { id: 'payments',  label: 'Encaissements',     icon: <Receipt size={18} />,    href: '/comptable/comptabilite?tab=payments' },
        { id: 'tuition',   label: 'Frais de Scolarité', icon: <BookOpen size={18} />,   href: '/comptable/comptabilite?tab=tuition' },
        { id: 'expenses',  label: 'Dépenses',          icon: <TrendingDown size={18} />, href: '/comptable/comptabilite?tab=expenses' },
      ],
    },
    {
      title: 'Services',
      items: [
        { id: 'cantine',      label: 'Cantine',      icon: <Utensils size={18} />,    href: '/comptable/cantine' },
        { id: 'superette',    label: 'Supérette',    icon: <ShoppingBag size={18} />, href: '/comptable/superette' },
        { id: 'bibliotheque', label: 'Bibliothèque', icon: <Library size={18} />,     href: '/comptable/bibliotheque' },
        { id: 'transport',    label: 'Transport',    icon: <Bus size={18} />,         href: '/comptable/transport' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { id: 'communication', label: 'Communication', icon: <MessageSquare size={18} />, href: '/comptable/communication' },
      ],
    },
  ];

  // ── COORDINATEUR ────────────────────────────────────────────────────────
  const coordinatorSections: SidebarSection[] = [{
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, href: '/coordinator/dashboard' },
      { 
        id: 'scolarite', 
        label: 'Classes & Pointage', 
        icon: <GraduationCap size={18} />, 
        href: '/coordinator/scolarite?tab=emplois',
        subItems: [
          { id: 'emplois', label: 'Emplois du temps', icon: <Calendar size={16} />, href: '/coordinator/scolarite?tab=emplois' },
          { id: 'notes',   label: 'Relevés de notes', icon: <ClipboardList size={16} />, href: '/coordinator/scolarite?tab=notes' },
          { id: 'pointage', label: 'Pointage',        icon: <UserCheck size={16} />,    href: '/coordinator/scolarite?tab=pointage' },
          { id: 'cartes',   label: 'Cartes scolaires', icon: <TrendingDown size={16} />, href: '/coordinator/scolarite?tab=cartes' },
        ]
      },
      { id: 'enseignants', label: 'Enseignants', icon: <Users size={18} />, href: '/coordinator/enseignants' },
      { id: 'devoirs',     label: 'Devoirs',    icon: <ClipboardList size={18} />, href: '/coordinator/devoirs' },
      { id: 'permutation', label: 'Permutation par merite', icon: <Repeat size={18} />, href: '/coordinator/permutation' },
    ],
  }];

  // ── Autres rôles (inchangés, une seule section sans titre) ─────────────
  const enseignantSections: SidebarSection[] = [{
    items: [
      { id: 'dashboard',     label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, href: '/enseignant/dashboard' },
      { id: 'classes',       label: 'Mes classes',     icon: <GraduationCap size={18} />, href: '/enseignant/classes' },
      { id: 'devoirs',       label: 'Devoirs',         icon: <ClipboardList size={18} />, href: '/enseignant/devoirs' },
      { id: 'communication', label: 'Communication',   icon: <MessageSquare size={18} />, href: '/enseignant/communication' },
      { id: 'ressources',    label: 'Ressources',      icon: <BookOpen size={18} />,      href: '/enseignant/ressources' },
    ],
  }];

  const parentSections: SidebarSection[] = [{
    items: [
      { id: 'dashboard',     label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, href: '/parent/dashboard' },
      { id: 'eleves',        label: 'Mes enfants',     icon: <GraduationCap size={18} />, href: '/parent/eleves' },
      { id: 'notes',         label: 'Relevés de notes', icon: <ClipboardList size={18} />, href: '/parent/notes' },
      { id: 'emploi',        label: 'Emploi du temps',   icon: <Calendar size={18} />,      href: '/parent/emploi' },
      { id: 'devoirs',       label: 'Devoirs de mes enfants', icon: <BookOpen size={18} />,      href: '/parent/devoirs' },
      { id: 'paiements',     label: 'Paiements',       icon: <Wallet size={18} />,        href: '/parent/paiements' },
      { id: 'communication', label: 'Communication',   icon: <MessageSquare size={18} />, href: '/parent/communication' },
    ],
  }];

  const eleveSections: SidebarSection[] = [{
    items: [
      { id: 'dashboard',     label: 'Tableau de bord',   icon: <LayoutDashboard size={18} />, href: '/eleve/dashboard' },
      { id: 'notes',         label: 'Mes notes',         icon: <GraduationCap size={18} />, href: '/eleve/notes' },
      { id: 'emploi',        label: 'Emploi du temps',   icon: <Calendar size={18} />,      href: '/eleve/emploi' },
      { id: 'devoirs',       label: 'Mes devoirs',       icon: <ClipboardList size={18} />, href: '/eleve/devoirs' },
      { id: 'ressources',    label: 'Ressources',        icon: <BookOpen size={18} />,      href: '/eleve/ressources' },
      { id: 'jeux',          label: 'Jeux Éducatifs',    icon: <Gamepad2 size={18} />,      href: '/eleve/jeux', badge: { count: 1, color: 'or' } },
      { id: 'communication', label: 'Communication',     icon: <MessageSquare size={18} />, href: '/eleve/communication' },
    ],
  }];

  const managerSections: SidebarSection[] = [{
    items: [
      { id: 'dashboard',    label: 'Tableau de bord',    icon: <LayoutDashboard size={18} />, href: '/manager/dashboard' },
      { 
        id: 'scolarite', 
        label: 'Classes & Pointage', 
        icon: <GraduationCap size={18} />, 
        href: '/manager/scolarite?tab=emplois',
        subItems: [
          { id: 'emplois', label: 'Emplois du temps', icon: <Calendar size={16} />, href: '/manager/scolarite?tab=emplois' },
          { id: 'notes',   label: 'Relevés de notes', icon: <ClipboardList size={16} />, href: '/manager/scolarite?tab=notes' },
          { id: 'pointage', label: 'Pointage',        icon: <UserCheck size={16} />,    href: '/manager/scolarite?tab=pointage' },
          { id: 'cartes',   label: 'Cartes scolaires', icon: <TrendingDown size={16} />, href: '/manager/scolarite?tab=cartes' },
        ]
      },
      { id: 'utilisateurs', label: 'Utilisateurs',       icon: <Users size={18} />,         href: '/manager/utilisateurs' },
    ],
  }];

  const getSectionsByRole = (): SidebarSection[] => {
    switch (userRole) {
      case 'admin':       return adminSections;
      case 'enseignant':  return enseignantSections;
      case 'parent':      return parentSections;
      case 'eleve':       return eleveSections;
      case 'manager':     return managerSections;
      case 'comptable':   return comptableSections;
      case 'coordinator': return coordinatorSections;
      default:            return [];
    }
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case 'red':    return 'bg-rouge-500 text-white';
      case 'orange':
      case 'or':     return 'bg-or-500 text-gray-950';
      case 'blue':   return 'bg-bleu-500 text-white';
      case 'vert':   return 'bg-vert-500 text-white';
      default:       return 'bg-gray-500 text-white';
    }
  };

  /** Détermine si un item est actif en comparant son href complet
   *  (path + query string) avec la route courante. */
  const isItemActive = (item: SidebarItem): boolean => {
    const [path, query = ''] = item.href.split('?');
    if (path !== currentPath) return false;
    if (!query) {
      // Item sans query → actif uniquement si la page courante n'a pas de query
      // (sinon un sous-item plus précis prend la priorité ailleurs).
      return currentSearch === '' || currentSearch === '?';
    }
    // Comparaison robuste des query params (l'ordre des clés peut varier).
    // On utilise `forEach` plutôt que `for...of` car URLSearchParams n'est
    // itérable qu'avec target ≥ ES2015 (cf. flag --downlevelIteration).
    const expected = new URLSearchParams(query);
    const actual = new URLSearchParams(currentSearch);
    let mismatch = false;
    expected.forEach((v, k) => {
      if (actual.get(k) !== v) mismatch = true;
    });
    return !mismatch;
  };

  /** Un parent est actif si lui ou un de ses sous-items l'est. */
  const isParentOrChildActive = (item: SidebarItem): boolean => {
    if (isItemActive(item)) return true;
    if (item.subItems) return item.subItems.some(sub => isItemActive(sub));
    return false;
  };

  // ── Gestion de l'expansion des items parents (Élèves) ──────────────────
  // Auto-ouvre le parent si l'URL active correspond à un de ses sous-items.
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const sections = getSectionsByRole();
    const newExpanded: Record<string, boolean> = {};
    sections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems && item.subItems.some(sub => isItemActive(sub))) {
          newExpanded[item.id] = true;
        }
      });
    });
    setExpandedItems(prev => ({ ...prev, ...newExpanded }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, currentSearch, userRole]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administration',
    enseignant: 'Enseignant',
    parent: 'Parent',
    eleve: 'Élève',
    manager: 'Manager',
    comptable: 'Comptable',
    coordinator: 'Coordinateur',
  };

  const sections = getSectionsByRole();

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

      {/* Navigation : sections avec titres et items */}
      <nav className="relative flex-1 px-3 py-4 space-y-4 overflow-y-auto no-scrollbar">
        {sections.map((section, sectionIndex) => (
          <div key={section.title || `section-${sectionIndex}`} className="space-y-1">
            {/* En-tête de section (caché quand la sidebar est réduite) */}
            {isOpen && section.title && (
              <p className="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-or-300/80">
                {section.title}
              </p>
            )}
            {/* Séparateur or discret entre sections quand sidebar fermée */}
            {!isOpen && sectionIndex > 0 && section.title && (
              <div className="mx-3 my-2 h-px bg-white/10" />
            )}

            {/* Items de la section */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const hasSubItems = !!item.subItems && item.subItems.length > 0;
                const isExpanded = !!expandedItems[item.id];
                const active = hasSubItems
                  ? isParentOrChildActive(item) || currentPage === item.id
                  : isItemActive(item) || currentPage === item.id;

                // ── ITEM PARENT AVEC SOUS-ITEMS (ex: Élèves) ──
                if (hasSubItems) {
                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          // Toggle l'expansion. On NE navigue PAS automatiquement
                          // pour laisser le choix à l'utilisateur du sous-item.
                          if (!isOpen) {
                            // Sidebar réduite : on développe d'abord la sidebar
                            // puis on déploie l'item.
                            onToggle();
                            setExpandedItems(prev => ({ ...prev, [item.id]: true }));
                          } else {
                            toggleExpanded(item.id);
                          }
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden text-left',
                          active
                            ? 'bg-white/10 backdrop-blur-md text-white font-black border border-white/10 shadow-lg'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        )}
                        title={!isOpen ? item.label : undefined}
                      >
                        {active && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-or-400 rounded-r-full shadow-gold"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div
                          className={cn(
                            'transition-all duration-200 shrink-0',
                            active ? 'text-or-300 scale-110' : 'group-hover:text-or-300 group-hover:scale-110'
                          )}
                        >
                          {item.icon}
                        </div>
                        {isOpen && (
                          <>
                            <span className="flex-1 text-[11px] font-bold tracking-wide truncate">{item.label}</span>
                            <ChevronDown
                              size={14}
                              className={cn(
                                'transition-transform duration-200 shrink-0',
                                isExpanded ? 'rotate-180 text-or-300' : 'text-white/40 group-hover:text-or-300'
                              )}
                            />
                          </>
                        )}
                      </button>

                      {/* Sous-items animés */}
                      <AnimatePresence initial={false}>
                        {isOpen && isExpanded && (
                          <motion.div
                            key={`${item.id}-sub`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 ml-3 my-1 border-l border-or-400/20 space-y-0.5">
                              {item.subItems!.map(sub => {
                                const subActive = isItemActive(sub);
                                return (
                                  <Link
                                    key={sub.id}
                                    to={sub.href}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group relative',
                                      subActive
                                        ? 'bg-or-400/10 text-or-200 font-black border-l-2 border-or-400'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        'transition-all duration-200 shrink-0',
                                        subActive ? 'text-or-300' : 'text-white/50 group-hover:text-or-300'
                                      )}
                                    >
                                      {sub.icon}
                                    </div>
                                    <span className="flex-1 text-[10.5px] font-bold tracking-wide truncate">{sub.label}</span>
                                    {sub.badge && (
                                      <span
                                        className={cn(
                                          'text-[9px] font-black px-2 py-0.5 rounded-md shadow-md',
                                          getBadgeClasses(sub.badge.color)
                                        )}
                                      >
                                        {sub.badge.count}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                // ── ITEM SIMPLE (sans sous-items) ──
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                      active
                        ? 'bg-white/10 backdrop-blur-md text-white font-black border border-white/10 shadow-lg'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    )}
                    title={!isOpen ? item.label : undefined}
                  >
                    {/* Indicateur or actif */}
                    {active && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-or-400 rounded-r-full shadow-gold"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div
                      className={cn(
                        'transition-all duration-200 shrink-0',
                        active ? 'text-or-300 scale-110' : 'group-hover:text-or-300 group-hover:scale-110'
                      )}
                    >
                      {item.icon}
                    </div>

                    {isOpen && (
                      <>
                        <span className="flex-1 text-[11px] font-bold tracking-wide truncate">{item.label}</span>
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
            </div>
          </div>
        ))}
      </nav>

      {/* Footer : profil + logout */}
      <div className="relative p-4 border-t border-white/5 bg-black/20 flex-shrink-0">
        <div className={cn('flex items-center gap-3', !isOpen && 'justify-center')}>
          <Avatar name={userName} size="sm" src={user?.avatarUrl} className="ring-2 ring-or-500/40" />
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
