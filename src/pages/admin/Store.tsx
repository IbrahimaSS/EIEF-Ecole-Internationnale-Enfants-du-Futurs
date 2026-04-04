import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Package, 
  AlertTriangle, 
  ArrowUpRight,
  Filter,
  Layers,
  History,
  TrendingDown,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Table, Badge, Card, StatCard, Button, Modal, Input, Select, Popover, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';

// Importation des données mockées
import produitsData from '../../data/produits.json';

const AdminStore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // KPIs
  const totalArticles = produitsData.length;
  const stockCritiqueCount = produitsData.filter(p => p.stock <= p.stockMin).length;
  const totalStockValue = produitsData.reduce((acc, curr) => acc + (curr.prix * curr.stock), 0);
  const outOfStockCount = produitsData.filter(p => p.stock === 0).length;

  const categories = ['Tous', ...Array.from(new Set(produitsData.map(p => p.categorie)))];

  const filteredProduits = produitsData.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Tous' || p.categorie === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GN').format(amount) + ' FGN';
  };

  const columns = [
    {
      key: 'nom',
      label: 'Article',
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-4 py-1">
          <div className="p-2.5 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 bg-gradient-to-br from-bleu-800 via-bleu-600 to-or-500 shadow-bleu-500/20">
            {row.categorie === 'Fournitures' ? <Package size={20} /> : <Briefcase size={20} />}
          </div>
          <div className="text-left font-bold">
            <div className="font-bold text-gray-900 dark:text-white leading-tight mb-0.5 text-[13px]">{row.nom}</div>
            <div className="text-[11px] text-gray-400 font-semibold italic">{row.fournisseur}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'categorie', 
      label: 'Catégorie', 
      sortable: true,
      render: (val: string) => (
        <Badge variant="default" className={cn(
          "text-[10px] font-bold px-3 py-1 border-none bg-opacity-10",
          val === 'Fournitures' ? 'bg-bleu-600 text-bleu-600' : 'bg-or-600 text-or-600'
        )}>
          {val}
        </Badge>
      )
    },
    {
      key: 'prix',
      label: 'Prix Unitaire',
      render: (val: number) => <span className="font-bold text-gray-900 dark:text-white text-xs">{formatCurrency(val)}</span>
    },
    {
      key: 'stock',
      label: 'État du Stock',
      render: (val: number, row: any) => {
        const isCritical = val <= row.stockMin && val > 0;
        const isOut = val === 0;
        const percentage = Math.min((val / (row.stockMin * 3)) * 100, 100);
        return (
          <div className="flex flex-col gap-2 min-w-[120px] text-left">
            <div className="flex items-center justify-between font-bold">
              <span className={cn(
                "text-[11px]",
                isOut ? 'text-red-500' : isCritical ? 'text-orange-500' : 'text-green-500'
              )}>
                {val} <span className="text-[9px] opacity-60 font-medium lowercase">Unités</span>
              </span>
              <Badge variant={isOut ? 'error' : isCritical ? 'warning' : 'success'} className="text-[8px] px-2 h-5 border-none font-bold uppercase tracking-wider">
                {isOut ? 'Rupture' : isCritical ? 'Critique' : 'Disponible'}
              </Badge>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isOut ? 'bg-red-500' : isCritical ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                )}
              />
            </div>
          </div>
        );
      }
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
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options Article</p>
            </div>
            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
              <Eye size={16} className="text-bleu-600" /> Détails Article
            </button>
            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
              <Edit size={16} className="text-or-600" /> Modifier
            </button>
            <div className="h-px bg-gray-50 dark:bg-white/5 my-2 mx-2" />
            <button onClick={() => setOpenMenuId(null)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all font-bold">
              <Trash2 size={16} /> Supprimer du Stock
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
              <ShoppingBag className="text-bleu-600 dark:text-bleu-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight">Gestion de la Supérette</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Inventaire des fournitures, tenues et accessoires scolaires</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsSaleModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm"
          >
            <DollarSign size={18} /> Saisir une vente
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Nouvel article
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Articles Référencés"
          value={totalArticles.toString()}
          subtitle="Catalogue complet"
          icon={<Layers />}
          color="bleu"
        />
        <StatCard
          title="Stock Critique"
          value={stockCritiqueCount.toString()}
          subtitle="Alertes réappro"
          icon={<AlertTriangle />}
          color="or"
          trend={{ value: "Action requise", direction: "down" }}
        />
        <StatCard
          title="Ruptures de Stock"
          value={outOfStockCount.toString()}
          subtitle="Disponibilité nulle"
          icon={<TrendingDown />}
          color="rouge"
        />
        <StatCard
          title="Valeur de Stock"
          value={formatCurrency(Math.round(totalStockValue))}
          subtitle="Total actifs"
          icon={<ShoppingBag />}
          color="vert"
        />
      </div>

      {/* FILTERS & SEARCH */}
      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none relative overflow-visible">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit overflow-x-auto no-scrollbar max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                  activeCategory === cat 
                    ? 'bg-gradient-to-r from-bleu-700 to-bleu-500 text-white shadow-lg' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Chercher une fourniture, tenue..."
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
          key={activeCategory}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <Table 
              data={filteredProduits} 
              columns={columns as any}
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* MODALS */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={<span className="gradient-bleu-or-text">Nouvel Article</span>}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nom de l'article" placeholder="ex: Chemise Blanche EIEF" />
            <Select 
              label="Catégorie" 
              options={[
                { value: 'Fournitures', label: 'Fournitures' },
                { value: 'Tenues', label: 'Tenues' },
                { value: 'Accessoires', label: 'Accessoires' }
              ]} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Prix Unitaire (FGN)" type="number" placeholder="0" />
            <Input label="Stock Initial" type="number" placeholder="0" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Stock Minimum (Alerte)" type="number" placeholder="5" />
            <Input label="Fournisseur" placeholder="Nom du fournisseur" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
            <Button className="bg-bleu-600 text-white" onClick={() => { setIsAddModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }}>Ajouter l'Article</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isSaleModalOpen} 
        onClose={() => setIsSaleModalOpen(false)} 
        title={<span className="gradient-bleu-or-text">Saisir une Vente</span>}
      >
        <div className="space-y-6">
          <Select 
            label="Choisir un Article" 
            options={produitsData.map(p => ({ value: p.id, label: p.nom }))} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Quantité" type="number" placeholder="1" />
            <Input label="Prix de vente Total" placeholder="0 FGN" value="0 FGN (Calcul automatique)" disabled />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsSaleModalOpen(false)}>Annuler</Button>
            <Button className="bg-vert-600 text-white" onClick={() => { setIsSaleModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }}>Valider la Vente</Button>
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
                <p className="text-[12px] text-white/80 font-semibold italic">L'inventaire de la supérette a été mis à jour.</p>
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

export default AdminStore;
