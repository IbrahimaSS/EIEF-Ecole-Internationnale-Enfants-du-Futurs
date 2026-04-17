import React, { useEffect, useState } from 'react';
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
  Settings,
  Loader2
} from 'lucide-react';
import { Table, Badge, Card, StatCard, Button, Modal, Input, Select, Popover, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useLibrary } from '../../hooks/useLibrary';
import { Resource, ResourceRequest } from '../../types/library';
import { ApiError } from '../../services/api';

// Interface pour les livres (basée sur votre backend BookResponse)
interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string | null;
  totalCopies: number;
  availableCopies: number;
}

const AdminLibrary: React.FC = () => {
  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Tous' | 'Disponible' | 'Emprunté' | 'En retard'>('Tous');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // États pour les formulaires
  const [formData, setFormData] = useState<ResourceRequest>({
    title: '',
    type: 'DOCUMENT',
    fileUrl: '',
    classId: ''
  });
  const [selectedBookId, setSelectedBookId] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [returnDate, setReturnDate] = useState('');
  
  // Récupérer l'ID utilisateur depuis le localStorage (à adapter selon votre auth)
  const getCurrentUserId = (): string => {
    try {
      const authStorage = window.localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.user?.id || '';
      }
    } catch {
      return '';
    }
    return '';
  };

  // Utiliser le hook useLibrary pour les ressources
  const {
    resources,
    loading,
    error,
    fetchResources,
    createResource,
    deleteResource,
    clearError
  } = useLibrary();

  // Charger les ressources au montage du composant
  useEffect(() => {
    loadResources();
  }, []);

  // Fonction pour charger les ressources avec filtres
  const loadResources = async () => {
    const filters: { search?: string; type?: string } = {};
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    // Mapper le filtre actif vers le type si nécessaire
    if (activeFilter !== 'Tous') {
      // Vous pouvez adapter cette logique selon vos types de ressources
      filters.type = activeFilter.toUpperCase();
    }
    
    await fetchResources(filters);
  };

  // Recharger quand les filtres changent (avec debounce pour la recherche)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadResources();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  // Calculer les KPIs à partir des données réelles
  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.type === 'Disponible').length;
  const borrowedResources = resources.filter(r => r.type === 'Emprunté').length;
  const lateResources = resources.filter(r => r.type === 'En retard').length;

  // Handler pour créer une ressource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = getCurrentUserId();
    if (!userId) {
      showError('Utilisateur non connecté');
      return;
    }

    try {
      await createResource(formData, userId);
      setIsAddModalOpen(false);
      setFormData({ title: '', type: 'DOCUMENT', fileUrl: '', classId: '' });
      showSuccess('Ressource créée avec succès !');
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message || 'Erreur lors de la création');
    }
  };

  // Handler pour supprimer une ressource
  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      try {
        await deleteResource(id);
        setOpenMenuId(null);
        showSuccess('Ressource supprimée avec succès !');
      } catch (err) {
        const apiError = err as ApiError;
        showError(apiError.message || 'Erreur lors de la suppression');
      }
    }
  };

  // Handler pour enregistrer un emprunt (à implémenter selon votre backend)
  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'appel API pour les emprunts quand vous aurez le endpoint
    setIsBorrowModalOpen(false);
    showSuccess('Emprunt enregistré avec succès !');
  };

  // Afficher un message de succès
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  // Afficher une erreur
  const showError = (message: string) => {
    // Vous pouvez utiliser un système de toast ou simplement le state error du hook
    alert(message); // À remplacer par un toast plus élégant
  };

  // Mapper les ressources pour le tableau (adaptation des champs)
  const mappedResources = resources.map(resource => ({
    id: resource.id,
    titre: resource.title,
    auteur: resource.uploadedByName, // Utilisé comme auteur par défaut
    isbn: '-', // Non disponible dans ResourceResponse
    matiere: resource.type,
    classeCible: resource.className || 'Toutes classes',
    disponibilite: 'Disponible', // À déterminer selon votre logique métier
    emprunteur: null,
    dateRetourPrevue: null,
    exemplairesDisponibles: 1, // À adapter selon votre logique
    nombreExemplaires: 1,
    // Garder la référence originale pour les actions
    originalResource: resource
  }));

  // Colonnes du tableau adaptées aux données du backend
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
      label: 'Type', 
      sortable: true,
      render: (val: string) => (
        <Badge variant="default" className="text-[10px] font-bold px-3 py-1 border-none bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400">
          {val}
        </Badge>
      )
    },
    { 
      key: 'classeCible', 
      label: 'Classe',
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
      label: 'Stock',
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
            <button 
              onClick={() => handleDeleteResource(row.id)} 
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all"
            >
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
            <Plus size={20} /> Ajouter une Ressource
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Ressources"
          value={totalResources.toString()}
          subtitle="Titres référencés"
          icon={<BookMarked />}
          color="bleu"
        />
        <StatCard
          title="Disponibles"
          value={availableResources.toString()}
          subtitle="En ligne"
          icon={<CheckCircle2 />}
          color="vert"
        />
        <StatCard
          title="Emprunts Actifs"
          value={borrowedResources.toString()}
          subtitle="Ressources sorties"
          icon={<Clock />}
          trend={{ value: "Action requise", direction: "up" }}
          color="or"
        />
        <StatCard
          title="Retards"
          value={lateResources.toString()}
          subtitle="Alertes relances"
          icon={<AlertTriangle />}
          color="rouge"
        />
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <span className="text-red-700 dark:text-red-300 font-semibold text-sm">{error}</span>
          </div>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </motion.div>
      )}

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
              placeholder="Chercher par titre, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-bold text-gray-700 dark:text-white shadow-sm text-sm"
            />
          </div>
        </div>
      </Card>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-bleu-600" size={40} />
          <span className="ml-4 text-gray-500 font-semibold">Chargement des ressources...</span>
        </div>
      )}

      {/* LIST SECTION */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
              {mappedResources.length > 0 ? (
                <Table 
                  data={mappedResources} 
                  columns={columns as any}
                />
              ) : (
                <div className="py-20 text-center">
                  <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-semibold">Aucune ressource trouvée</p>
                  <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres ou ajoutez une nouvelle ressource</p>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* MODAL: AJOUTER RESSOURCE */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={<span className="gradient-bleu-or-text">Ajouter une nouvelle ressource</span>}
      >
        <form onSubmit={handleCreateResource} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la ressource"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              >
                <option value="DOCUMENT">Document</option>
                <option value="PDF">PDF</option>
                <option value="VIDEO">Vidéo</option>
                <option value="IMAGE">Image</option>
                <option value="LIEN">Lien externe</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">URL du fichier</label>
            <input
              type="url"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">ID de la classe (optionnel)</label>
            <input
              type="text"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              placeholder="UUID de la classe"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setIsAddModalOpen(false)} 
              className="px-8 h-12 rounded-xl text-sm font-bold"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-bleu-600 text-white px-8 h-12 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Enregistrer la ressource'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EMPRUNT */}
      <Modal 
        isOpen={isBorrowModalOpen} 
        onClose={() => setIsBorrowModalOpen(false)} 
        title={<span className="gradient-bleu-or-text">Enregistrement d'un emprunt</span>}
      >
        <form onSubmit={handleBorrow} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Choisir la ressource</label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
            >
              <option value="">Sélectionner une ressource</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Nom de l'emprunteur</label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Nom complet"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Date de retour prévue</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setIsBorrowModalOpen(false)} 
              className="px-8 h-12 rounded-xl text-sm font-bold"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="bg-vert-600 text-white px-8 h-12 rounded-xl text-sm font-bold"
            >
              Confirmer l'emprunt
            </Button>
          </div>
        </form>
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
                <p className="font-bold text-base tracking-tight">Succès !</p>
                <p className="text-[12px] text-white/80 font-semibold italic">{successMessage}</p>
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