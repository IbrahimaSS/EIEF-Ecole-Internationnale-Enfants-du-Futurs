import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Search, 
  Filter, 
  CreditCard, 
  Banknote,
  Smartphone,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Table, Badge, StatCard, Card, Button } from '../../components/ui';

// Importation des données mockées
import paiementsData from '../../data/paiements.json';

const AdminAccounting: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterService, setFilterService] = useState('Tous');

  // Calculs des KPIs
  const totalRecettes = paiementsData.reduce((acc, curr) => acc + curr.montantPaye, 0);
  const totalImpayes = paiementsData.reduce((acc, curr) => acc + (curr.montantRestant || 0), 0);
  const totalAttendu = paiementsData.reduce((acc, curr) => acc + curr.montant, 0);
  const tauxRecouvrement = Math.round((totalRecettes / totalAttendu) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GN').format(amount) + ' FGN';
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Mobile Money': return <Smartphone size={14} className="text-orange-500" />;
      case 'Espèces': return <Banknote size={14} className="text-green-500" />;
      case 'Banque': return <CreditCard size={14} className="text-blue-500" />;
      default: return null;
    }
  };

  const services = ['Tous', ...Array.from(new Set(paiementsData.map(p => p.service)))];

  const filteredPaiements = paiementsData.filter(p => {
    const matchesSearch = p.eleveNom.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = filterService === 'Tous' || p.service === filterService;
    return matchesSearch && matchesService;
  });

  const columns = [
    {
      key: 'reference',
      label: 'Réf.',
      render: (val: string) => <span className="font-mono text-xs font-bold text-gray-500">{val}</span>
    },
    {
      key: 'eleveNom',
      label: 'Élève',
      sortable: true,
      render: (val: string) => <span className="font-bold text-gray-900">{val}</span>
    },
    {
      key: 'service',
      label: 'Service',
      render: (val: string) => (
        <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-wider">
          {val}
        </span>
      )
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (_: any, row: any) => (
        <div>
          <div className="font-bold text-gray-900">{formatCurrency(row.montantPaye)}</div>
          {row.montantRestant > 0 && (
            <div className="text-[10px] text-rouge-500 font-medium">Reste: {formatCurrency(row.montantRestant)}</div>
          )}
        </div>
      )
    },
    {
      key: 'methode',
      label: 'Méthode',
      render: (val: string) => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
          {getMethodIcon(val)}
          {val}
        </div>
      )
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (val: string) => (
        <Badge variant={val === 'Payé' ? 'success' : val === 'Partiel' ? 'warning' : 'error'}>
          {val}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val: string) => <span className="text-sm text-gray-500">{new Date(val).toLocaleDateString('fr-FR')}</span>
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black gradient-bleu-or-text uppercase tracking-tighter">Comptabilité & Finances</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Suivi stratégique des encaissements et du recouvrement de l'EIEF</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex gap-2 dark:border-white/10 dark:text-white">
            <Download size={18} /> Rapports
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-vert-600 to-vert-500 shadow-lg shadow-vert-600/20 border-none font-black uppercase tracking-widest text-xs">
            <Plus size={18} /> Nouvel Encaissement
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Recettes Totales"
          value={formatCurrency(totalRecettes)}
          subtitle="Cumul annuel"
          icon={<Wallet />}
          color="bleu"
          trend={{ value: "+8.2%", direction: "up" }}
        />
        <StatCard
          title="Impayés Globaux"
          value={formatCurrency(totalImpayes)}
          subtitle="Sommes à recouvrer"
          icon={<AlertCircle />}
          color="rouge"
        />
        <StatCard
          title="Taux de Recouvrement"
          value={`${tauxRecouvrement}%`}
          subtitle="Objectif: 95%"
          icon={<TrendingUp />}
          color="or"
          trend={{ value: "+2% vs fév.", direction: "up" }}
        />
        <Card className="flex flex-col justify-center border-none shadow-soft p-6 dark:bg-gray-900/50 dark:backdrop-blur-md">
          <p className="text-[10px] font-black gradient-bleu-or-text uppercase tracking-widest mb-2">Dernière Clôture</p>
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">24 Mars 2024</h3>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 bg-vert-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">
              Caisse équilibrée
            </p>
          </div>
        </Card>
      </div>

      {/* FILTER & TABLE SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {services.map(s => (
              <button
                key={s}
                onClick={() => setFilterService(s)}
                className={`
                  px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                  ${filterService === s 
                    ? 'bg-gray-900 dark:bg-or-500 text-white shadow-lg' 
                    : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5'
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
          
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-bold text-gray-700 dark:text-white shadow-sm"
            />
          </div>
        </div>

        <Card className="p-2 overflow-hidden border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
          <Table 
            data={filteredPaiements} 
            columns={columns as any}
          />
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminAccounting;
