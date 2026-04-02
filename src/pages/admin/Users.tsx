import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users as UsersIcon, 
  GraduationCap, 
  UserPlus, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Table, Badge, Avatar, Button, Card } from '../../components/ui';

// Importation des données mockées
import elevesData from '../../data/eleves.json';
import enseignantsData from '../../data/enseignants.json';

const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'eleves' | 'enseignants'>('eleves');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'eleves', label: 'Élèves', icon: GraduationCap, count: elevesData.length },
    { id: 'enseignants', label: 'Enseignants', icon: UsersIcon, count: enseignantsData.length },
  ];

  // Filtrage des données selon l'onglet et la recherche
  const filteredData = activeTab === 'eleves' 
    ? elevesData.filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.matricule.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : enseignantsData.filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.matiere.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Configuration des colonnes pour les ÉLÈVES
  const eleveColumns = [
    {
      key: 'lastName',
      label: 'Élève',
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <div className="font-bold text-gray-900">{row.firstName} {row.lastName}</div>
            <div className="text-xs text-gray-500">{row.matricule}</div>
          </div>
        </div>
      )
    },
    { key: 'classe', label: 'Classe', sortable: true },
    {
      key: 'statut',
      label: 'Statut',
      render: (val: string) => (
        <Badge variant={val === 'actif' ? 'success' : 'default'}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </Badge>
      )
    },
    {
      key: 'contactParent',
      label: 'Parent / Contact',
      render: (_: any, row: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-700">{row.nomParent}</div>
          <div className="text-gray-500 text-xs">{row.contactParent}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: () => (
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
          <MoreVertical size={18} />
        </button>
      )
    }
  ];

  // Configuration des colonnes pour les ENSEIGNANTS
  const enseignantColumns = [
    {
      key: 'lastName',
      label: 'Enseignant',
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <div className="font-bold text-gray-900">{row.firstName} {row.lastName}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'matiere', label: 'Matière', sortable: true },
    {
      key: 'classes',
      label: 'Classes',
      render: (val: string[]) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {val.map((c, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{c}</span>
          ))}
        </div>
      )
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (val: string) => (
        <Badge variant={val === 'actif' ? 'success' : 'default'}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: () => (
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
          <MoreVertical size={18} />
        </button>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UsersIcon className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-2xl font-black gradient-bleu-or-text uppercase tracking-tighter">Annuaire des Utilisateurs</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gérez les élèves, enseignants et le personnel administratif</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex gap-2 dark:border-white/10 dark:text-white text-[10px] font-black uppercase tracking-widest px-5 h-11">
            <Filter size={18} /> Filtres
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-black uppercase tracking-widest text-[10px] h-11 px-6">
            <UserPlus size={18} /> Ajouter
          </Button>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none overflow-visible">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-3 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300
                    ${isActive 
                      ? 'bg-white dark:bg-or-500 text-bleu-600 dark:text-white shadow-sm' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon size={16} />
                  {tab.label}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-bleu-50 dark:bg-white/20 text-bleu-600 dark:text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder={`Rechercher un ${activeTab === 'eleves' ? 'élève (nom, matricule...)' : 'enseignant (nom, matière...)'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-bold text-gray-700 dark:text-white shadow-sm"
            />
          </div>
        </div>
      </Card>

      {/* DATA TABLE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-2 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <Table 
              data={filteredData as any} 
              columns={(activeTab === 'eleves' ? eleveColumns : enseignantColumns) as any} 
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-8 border-none bg-gradient-to-br from-bleu-500/10 to-or-500/10 dark:from-bleu-900/20 dark:to-or-900/20 overflow-hidden relative group cursor-pointer backdrop-blur-sm">
          <div className="relative z-10">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Inscriptions Récentes</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">+12 cette semaine</h3>
          </div>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-bleu-200 dark:text-bleu-900/40 group-hover:translate-x-2 transition-transform" size={48} />
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminUsers;
