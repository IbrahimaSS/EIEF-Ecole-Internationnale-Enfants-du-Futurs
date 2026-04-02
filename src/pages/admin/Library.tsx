import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  BookMarked, 
  ExternalLink,
  Book,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';
import { Table, Badge, Card, StatCard, Button } from '../../components/ui';

// Importation des données mockées
import livresData from '../../data/livres.json';

const AdminLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Tous' | 'Disponible' | 'Emprunté' | 'En retard'>('Tous');

  // KPIs
  const totalLivres = livresData.length;
  const livresDisponible = livresData.filter(l => l.disponibilite === 'Disponible').length;
  const livresEmprunte = livresData.filter(l => l.disponibilite === 'Emprunté').length;
  const livresEnRetard = livresData.filter(l => l.disponibilite === 'En retard').length;

  const filteredLivres = livresData.filter(l => {
    const matchesSearch = l.titre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         l.auteur.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         l.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'Tous' || l.disponibilite === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      key: 'titre',
      label: 'Ouvrage',
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bleu-50 rounded-lg text-bleu-600">
            <Book size={20} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 line-clamp-1">{row.titre}</div>
            <div className="text-xs text-gray-500 font-medium">Par {row.auteur}</div>
          </div>
        </div>
      )
    },
    { key: 'matiere', label: 'Catégorie', sortable: true },
    { key: 'classeCible', label: 'Niveau' },
    {
      key: 'disponibilite',
      label: 'Statut',
      render: (val: string) => {
        const variant = val === 'Disponible' ? 'success' : val === 'Emprunté' ? 'warning' : 'error';
        return <Badge variant={variant}>{val}</Badge>;
      }
    },
    {
      key: 'emprunteur',
      label: 'Détention',
      render: (val: string | null, row: any) => {
        if (!val) return <span className="text-gray-300 italic text-xs">—</span>;
        return (
          <div className="text-xs">
            <div className="font-semibold text-gray-700">{val}</div>
            <div className="text-gray-500 font-medium">Retour: {row.dateRetourPrevue}</div>
          </div>
        );
      }
    },
    {
      key: 'exemplairesDisponibles',
      label: 'Stock',
      render: (val: number, row: any) => (
        <div className="text-xs font-semibold">
          <span className={val === 0 ? 'text-rouge-600' : 'text-gray-900'}>{val}</span>
          <span className="text-gray-400 font-normal"> / {row.nombreExemplaires}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: () => (
        <button className="p-2 hover:bg-bleu-50 rounded-lg transition-colors text-bleu-600 group">
          <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
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
            <BookOpen className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-semibold gradient-bleu-or-text">Bibliothèque Numérique</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gestion du catalogue, des emprunts et des retards</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex gap-2 dark:border-white/10 dark:text-white">
            <History size={18} /> Historique
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-semibold   text-[10px] h-11 px-6">
            <Plus size={18} /> Ajouter un livre
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Ouvrages"
          value={totalLivres.toString()}
          subtitle="Titres référencés"
          icon={<BookMarked />}
          color="bleu"
        />
        <StatCard
          title="Disponibles"
          value={livresDisponible.toString()}
          subtitle="En rayons"
          icon={<CheckCircle2 />}
          color="vert"
        />
        <StatCard
          title="Emprunts Actifs"
          value={livresEmprunte.toString()}
          subtitle="En circulation"
          icon={<Clock />}
          color="or"
        />
        <StatCard
          title="Retards de retour"
          value={livresEnRetard.toString()}
          subtitle="Alerte relance"
          icon={<AlertTriangle />}
          color="rouge"
        />
      </div>

      {/* FILTERS & SEARCH */}
      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
            {['Tous', 'Disponible', 'Emprunté', 'En retard'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`
                  px-4 py-2 rounded-lg text-[10px] font-semibold   transition-all duration-300
                  ${activeFilter === f 
                    ? 'bg-white dark:bg-or-500 text-bleu-600 dark:text-white shadow-sm' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Chercher par titre, auteur, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm"
            />
          </div>
        </div>
      </Card>

      {/* LIST SECTION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-2 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <Table 
              data={filteredLivres} 
              columns={columns as any}
            />
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminLibrary;
