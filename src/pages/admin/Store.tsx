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
  TrendingDown
} from 'lucide-react';
import { Table, Badge, Card, StatCard, Button } from '../../components/ui';

// Importation des données mockées
import produitsData from '../../data/produits.json';

const AdminStore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');

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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
            <Package size={20} />
          </div>
          <div>
            <div className="font-bold text-gray-900 line-clamp-1">{row.nom}</div>
            <div className="text-xs text-gray-500 font-medium">{row.fournisseur}</div>
          </div>
        </div>
      )
    },
    { key: 'categorie', label: 'Catégorie', sortable: true },
    {
      key: 'prix',
      label: 'Prix Unitaire',
      render: (val: number) => <span className="font-bold text-gray-900">{formatCurrency(val)}</span>
    },
    {
      key: 'stock',
      label: 'Niveau Stock',
      render: (val: number, row: any) => {
        const isCritical = val <= row.stockMin;
        const isOut = val === 0;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black ${isOut ? 'text-rouge-600' : isCritical ? 'text-or-600' : 'text-gray-900'}`}>
                {val} unités
              </span>
              {isOut && <Badge variant="error" className="text-[10px]">Rupture</Badge>}
              {!isOut && isCritical && <Badge variant="warning" className="text-[10px]">Critique</Badge>}
            </div>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${isOut ? 'w-0' : isCritical ? 'bg-or-500 w-[20%]' : 'bg-vert-500 w-[80%]'}`}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: '',
      render: () => (
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 group">
          <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
            <ShoppingBag className="text-or-600 dark:text-or-400" size={28} />
            <h1 className="text-2xl font-black gradient-bleu-or-text uppercase tracking-tighter">Gestion de la Supérette</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Inventaire des fournitures, tenues et accessoires</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex gap-2 dark:border-white/10 dark:text-white">
            <History size={18} /> Historique Ventes
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-or-700 to-or-500 shadow-gold border-none font-black uppercase tracking-widest text-[10px] h-11 px-6">
            <Plus size={18} /> Nouvel Article
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
          trend={{ value: "4 urgences", direction: "down" }}
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
          value={formatCurrency(Math.round(totalStockValue / 1000000)) + "M"}
          subtitle="Évaluation actifs"
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
                className={`
                  px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                  ${activeCategory === cat 
                    ? 'bg-white dark:bg-or-500 text-or-600 dark:text-white shadow-sm' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }
                `}
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
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-or-500/10 transition-all font-bold text-gray-700 dark:text-white shadow-sm"
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
          <Card className="p-2 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <Table 
              data={filteredProduits} 
              columns={columns as any}
            />
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminStore;
