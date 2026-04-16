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
  History,
  Eye,
  Edit,
  Trash2,
  X,
  ArrowRight,
  BookCopy,
  User,
  Settings
} from 'lucide-react';
import { Table, Badge, Card, StatCard, Button, Modal, Input, Select, Popover, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';

// Importation des données mockées
import livresData from '../../data/livres.json';

const AdminLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Tous' | 'Disponible' | 'Emprunté' | 'En retard'>('Tous');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
        <div className="flex items-center gap-4 py-1">
          <div className="p-2.5 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 bg-gradient-to-br from-bleu-800 via-bleu-600 to-or-500 shadow-bleu-600/20">
            <Book size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-gray-900 dark:text-white leading-tight mb-0.5 text-[13px]">{row.titre}</div>
            <div className="text-[11px] text-gray-400 font-semibold italic">Par {row.auteur}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'matiere', 
      label: 'Catégorie', 
      sortable: true,
      render: (val: string) => (
        <Badge variant="default" className="text-[10px] font-bold px-3 py-1 border-none bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400">
          {val}
        </Badge>
      )
    },
    { 
      key: 'classeCible', 
      label: 'Niveau',
      render: (val: string) => (
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{val}</span>
      )
    },
    {
      key: 'disponibilite',
      label: 'Statut',
      render: (val: string) => {
        const variant = val === 'Disponible' ? 'success' : val === 'Emprunté' ? 'warning' : 'error';
        return <Badge variant={variant} className="text-[9px] font-bold h-6 px-2.5 border-none shadow-sm uppercase tracking-wider">{val}</Badge>;
      }
    },
    {
      key: 'emprunteur',
      label: 'Détention',
      render: (val: string | null, row: any) => {
        if (!val) return <span className="text-gray-300 italic text-xs">—</span>;
        return (
          <div className="flex items-center gap-3 text-left">
            <Avatar src="" alt={val} className="w-7 h-7 border-none shadow-sm" />
            <div className="leading-tight">
              <div className="text-[12px] font-bold text-gray-800 dark:text-gray-200">{val}</div>
              <div className="text-[10px] text-red-500 font-semibold mt-0.5">Retour: {row.dateRetourPrevue}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'exemplairesDisponibles',
      label: 'Stock en rayons',
      render: (val: number, row: any) => (
        <div className="flex flex-col gap-2 min-w-[110px] text-left">
          <div className="flex items-center justify-between font-bold">
            <span className={cn("text-[11px]", val === 0 ? 'text-red-500 font-bold' : 'text-gray-700 dark:text-gray-300')}>
              {val} <span className="text-[9px] opacity-60 font-medium">Exemplaires</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(val / row.nombreExemplaires) * 100}%` }}
              className={cn("h-full rounded-full transition-all duration-1000", val === 0 ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]')}
            />
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <Popover
          isOpen={openMenuId === row.id}
          onClose={() => setOpenMenuId(null)}
          trigger={
            <button 
              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id); }}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all text-gray-400 group"
            >
              <ArrowRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          }
        >
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] shadow-2xl border border-gray-100 dark:border-white/10 p-2.5 min-w-[220px] text-left">
            <div className="px-4 py-2 border-b border-gray-50 dark:border-white/5 mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options Ouvrage</p>
            </div>
            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
              <Eye size={16} className="text-bleu-600" /> Fiche Ouvrage
            </button>
            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
              <BookCopy size={16} className="text-or-600" /> Enregistrer Emprunt
            </button>
            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
              <Edit size={16} className="text-gray-400" /> Modifier Informations
            </button>
            <div className="h-px bg-gray-50 dark:bg-white/5 my-2 mx-2" />
            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
              <Trash2 size={16} /> Retirer du Catalogue
            </button>
          </div>
        </Popover>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
      onClick={() => setOpenMenuId(null)}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-4 mb-2 text-left">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-soft">
              <BookOpen className="text-bleu-600 dark:text-bleu-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight">Bibliothèque Numérique</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Gestion du catalogue, des emprunts et des retards</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsBorrowModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm"
          >
            <BookCopy size={18} /> Nouvel Emprunt
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Ajouter un Livre
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
          subtitle="Livres sortis"
          icon={<Clock />}
          trend={{ value: "Action requise", direction: "up" }}
          color="or"
        />
        <StatCard
          title="Retards d'Échéance"
          value={livresEnRetard.toString()}
          subtitle="Alertes relances"
          icon={<AlertTriangle />}
          color="rouge"
        />
      </div>

      {/* FILTERS & SEARCH */}
      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full">
            {['Tous', 'Disponible', 'Emprunté', 'En retard'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={cn(
                  "px-8 py-3 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap",
                  activeFilter === f 
                    ? 'bg-gradient-to-r from-bleu-700 to-bleu-500 text-white shadow-lg' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Chercher par titre, auteur, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-bold text-gray-700 dark:text-white shadow-sm text-sm"
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
          <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <Table 
              data={filteredLivres} 
              columns={columns as any}
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* MODALS */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={<span className="gradient-bleu-or-text">Ajouter un nouvel ouvrage</span>}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Titre de l'ouvrage" placeholder="ex: Mathématiques 6ème" />
            <Input label="Auteur" placeholder="Nom complet de l'auteur" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select 
              label="Catégorie littéraire" 
              options={[
                { value: 'Mathématiques', label: 'Mathématiques' },
                { value: 'Français', label: 'Français' },
                { value: 'SVT', label: 'SVT' },
                { value: 'Histoire-Géo', label: 'Histoire-Géographie' }
              ]} 
            />
            <Input label="Numéro ISBN" placeholder="Format 13 chiffres" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Quantité en stock" type="number" placeholder="10" />
            <Input label="Niveau scolaire" placeholder="ex: Toutes classes" />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="px-8 h-12 rounded-xl text-sm font-bold">Annuler</Button>
            <Button className="bg-bleu-600 text-white px-8 h-12 rounded-xl text-sm font-bold" onClick={() => { setIsAddModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }}>Enregistrer l'ouvrage</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isBorrowModalOpen} 
        onClose={() => setIsBorrowModalOpen(false)} 
        title={<span className="gradient-bleu-or-text">Enregistrement d'un emprunt</span>}
      >
        <div className="space-y-6">
          <Select 
            label="Choisir l'ouvrage disponible" 
            options={livresData.filter(l => l.exemplairesDisponibles > 0).map(l => ({ value: l.id, label: l.titre }))} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nom de l'élève emprunteur" placeholder="Rechercher un élève..." />
            <Input label="Date limite de retour" type="date" />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsBorrowModalOpen(false)} className="px-8 h-12 rounded-xl text-sm font-bold">Annuler</Button>
            <Button className="bg-vert-600 text-white px-8 h-12 rounded-xl text-sm font-bold" onClick={() => { setIsBorrowModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }}>Confirmer l'emprunt</Button>
          </div>
        </div>
      </Modal>

      {/* SUCCESS MESSAGE */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-vert-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 backdrop-blur-md">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div className="text-left">
                <p className="font-bold text-base tracking-tight">Opération accomplie !</p>
                <p className="text-[12px] text-white/80 font-semibold italic">Les données de la bibliothèque ont été mises à jour.</p>
              </div>
              <button 
                onClick={() => setIsSuccess(false)}
                className="ml-6 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminLibrary;
