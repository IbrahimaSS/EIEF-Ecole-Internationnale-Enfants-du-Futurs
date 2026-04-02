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
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Table, Badge, Avatar, Button, Card, Modal, Input, Select } from '../../components/ui';
import { cn } from '../../utils/cn';

// Importation des données mockées
import elevesData from '../../data/eleves.json';
import enseignantsData from '../../data/enseignants.json';

const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'eleves' | 'enseignants'>('eleves');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);

  // Filtres avancés
  const [filters, setFilters] = useState({
    classe: 'tous',
    statut: 'tous',
    niveau: 'tous'
  });

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

  const renderActions = (_: any, row: any) => {
    const rowId = row.matricule || row.id || row.email;
    const isOpen = openMenuRowId === rowId;
    
    return (
      <div className="relative flex justify-end px-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuRowId(isOpen ? null : rowId);
          }}
          className={cn(
            "p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all text-gray-400 focus:outline-none",
            isOpen && "bg-gray-100 dark:bg-white/5 text-bleu-600 dark:text-or-400"
          )}
        >
          <MoreVertical size={18} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 10 }}
              className="absolute right-full mr-2 top-0 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[1.25rem] shadow-2xl border border-gray-100 dark:border-white/5 p-2 z-[60] ring-1 ring-black/5"
            >
              <div className="flex flex-col gap-1 text-left">
                <button className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-bleu-50 dark:hover:bg-bleu-900/40 hover:text-bleu-600 dark:hover:text-or-400 rounded-xl transition-all w-full">
                  <div className="w-8 h-8 rounded-lg bg-bleu-50 dark:bg-bleu-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span>Voir le profil</span>
                    <span className="text-[9px] font-normal text-gray-400">Consulter les détails</span>
                  </div>
                </button>
                <button className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-or-50 dark:hover:bg-or-900/40 hover:text-or-600 rounded-xl transition-all w-full">
                  <div className="w-8 h-8 rounded-lg bg-or-50 dark:bg-or-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Edit size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span>Modifier</span>
                    <span className="text-[9px] font-normal text-gray-400">Éditer les informations</span>
                  </div>
                </button>
                <div className="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2" />
                <button className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all w-full">
                  <div className="w-8 h-8 rounded-lg bg-red-50/10 dark:bg-red-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span>Supprimer</span>
                    <span className="text-[9px] font-normal text-red-400">Action irréversible</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

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
            <div className="font-semibold text-gray-900 dark:text-white leading-none mb-1">{row.firstName} {row.lastName}</div>
            <div className="text-[10px] text-gray-400 font-medium">Matricule: {row.matricule}</div>
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
          <div className="font-medium text-gray-700 dark:text-gray-300">{row.nomParent}</div>
          <div className="text-gray-400 text-[10px]">{row.contactParent}</div>
        </div>
      )
    },
    { key: 'actions', label: '', render: renderActions }
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
            <div className="font-semibold text-gray-900 dark:text-white leading-none mb-1">{row.firstName} {row.lastName}</div>
            <div className="text-[10px] text-gray-400 font-medium">{row.email}</div>
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
            <span key={i} className="text-[9px] px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-400 font-semibold">{c}</span>
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
    { key: 'actions', label: '', render: renderActions }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
      onClick={() => setOpenMenuRowId(null)}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UsersIcon className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-semibold gradient-bleu-or-text">Annuaire des Utilisateurs</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Gérez les élèves, enseignants et le personnel administratif</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button 
              variant="outline" 
              onClick={(e) => { e.stopPropagation(); setIsFilterModalOpen(!isFilterModalOpen); }}
              className={cn(
                "hidden sm:flex gap-2 dark:border-white/10 dark:text-white text-[10px] font-semibold px-5 h-11 transition-all",
                isFilterModalOpen && "border-bleu-500 bg-bleu-50 dark:bg-bleu-900/20"
              )}
            >
              <Filter size={18} /> Filtres
            </Button>

            <AnimatePresence>
              {isFilterModalOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 p-6 z-50 ring-1 ring-black/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-6 text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Filtrage Avancé</p>
                    <Select 
                      label="Niveau d'enseignement" 
                      options={[
                        { value: 'tous', label: 'Tous les niveaux' },
                        { value: 'creche', label: 'Crèche' },
                        { value: 'primaire', label: 'Primaire' },
                        { value: 'college', label: 'Collège' },
                        { value: 'lycee', label: 'Lycée' },
                      ]} 
                    />
                    <Select 
                      label="Statut du dossier" 
                      options={[
                        { value: 'tous', label: 'Tous les statuts' },
                        { value: 'actif', label: 'Actif' },
                        { value: 'suspendu', label: 'Suspendu' },
                      ]} 
                    />
                    <div className="flex gap-3 pt-4">
                      <Button variant="ghost" onClick={() => setIsFilterModalOpen(false)} className="flex-1 h-10 text-[10px] uppercase">Fermer</Button>
                      <Button onClick={() => setIsFilterModalOpen(false)} className="flex-1 h-10 text-[10px] uppercase font-semibold">Appliquer</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button 
            onClick={(e) => { e.stopPropagation(); setIsAddModalOpen(true); }}
            className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-semibold text-[10px] h-11 px-6 shadow-lg shadow-bleu-600/20"
          >
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
                  onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id as any); }}
                  className={`
                    flex items-center gap-3 px-6 py-2.5 rounded-lg text-[10px] font-semibold transition-all duration-300
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
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm text-sm"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <Card className="p-8 border-none bg-gradient-to-br from-bleu-500/10 to-or-500/10 dark:from-bleu-900/20 dark:to-or-900/20 overflow-hidden relative group cursor-pointer backdrop-blur-sm">
          <div className="relative z-10">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-semibold mb-2">Inscriptions Récentes</p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">+12 cette semaine</h3>
          </div>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-bleu-200 dark:text-bleu-900/40 group-hover:translate-x-2 transition-transform" size={48} />
        </Card>
      </div>

      {/* MODALE D'AJOUT */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={
          activeTab === 'eleves' ? (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 dark:text-or-400">
                <GraduationCap size={22} />
              </div>
              <span className="tracking-tight gradient-bleu-or-text font-bold">Nouvel Élève</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 dark:text-or-400">
                <UsersIcon size={22} />
              </div>
              <span className="tracking-tight gradient-bleu-or-text font-bold">Nouvel Enseignant</span>
            </div>
          )
        }
        size="lg"
      >
        <div className="space-y-8 text-left py-2" onClick={(e) => e.stopPropagation()}>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-bleu-500 rounded-full" /> Identité & État Civil
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Prénom" placeholder="ex: Mamadou Sory" />
              <Input label="Nom de famille" placeholder="ex: Bah" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-or-500 rounded-full" /> 
              {activeTab === 'eleves' ? "Informations Scolaires" : "Détails Professionnels"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeTab === 'eleves' ? (
                <>
                  <Select 
                    label="Classe d'affectation" 
                    options={[
                      { value: 'cp', label: 'CP' },
                      { value: 'ce1', label: 'CE1' },
                      { value: '6eme', label: '6ème' },
                      { value: '3eme', label: '3ème' },
                    ]} 
                  />
                  <Input label="Numéro Matricule" placeholder="EIEF2024..." />
                </>
              ) : (
                <>
                  <Input label="Matière principale" placeholder="ex: Mathématiques" />
                  <Select 
                    label="Statut contractuel" 
                    options={[
                      { value: 'titulaire', label: 'Titulaire' },
                      { value: 'vacataire', label: 'Vacataire' },
                    ]} 
                  />
                </>
              )}
            </div>
          </div>
          {activeTab === 'eleves' ? (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-rouge-500 rounded-full" /> Responsable Légal
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Nom du Tuteur" placeholder="Nom complet du parent" />
                <Input label="Téléphone Urgence" placeholder="+224 ..." />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-vert-500 rounded-full" /> Contact Pro
              </p>
              <Input label="Adresse Email EIEF" placeholder="nom@eief.edu.gn" />
            </div>
          )}
          <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-12">Annuler</Button>
            <Button onClick={() => { setIsAddModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }} className="flex-1 h-12 shadow-lg shadow-bleu-600/20">
              Enregistrer l'utilisateur
            </Button>
          </div>
        </div>
      </Modal>

      {/* NOTIFICATION DE SUCCÈS */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-[100] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 border border-green-100 dark:border-green-900/30 flex items-center gap-4 min-w-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Opération réussie</p>
              <p className="text-xs text-gray-500">Action validée avec succès.</p>
            </div>
            <button onClick={() => setIsSuccess(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsers;
