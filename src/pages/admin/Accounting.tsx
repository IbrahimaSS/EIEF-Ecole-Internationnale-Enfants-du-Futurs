import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
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
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  X,
  CreditCard as BankIcon
} from 'lucide-react';
import { Table, Badge, StatCard, Card, Button, Modal, Input, Select, Popover, Avatar } from '../../components/ui';

// Importation des données mockées
import paiementsData from '../../data/paiements.json';
import elevesData from '../../data/eleves.json';

const AdminAccounting: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterService, setFilterService] = useState('Tous');
  const [isEncaissementModalOpen, setIsEncaissementModalOpen] = useState(false);
  const [isRapportsModalOpen, setIsRapportsModalOpen] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
      key: 'eleveNom',
      label: 'Élève / Client',
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div className="flex flex-col text-left">
            <span className="font-bold text-gray-900 dark:text-white leading-tight">{val}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Élève EIEF</span>
          </div>
        </div>
      )
    },
    {
      key: 'service',
      label: 'Service',
      render: (val: string) => (
        <span className="px-3 py-1 bg-bleu-50 dark:bg-bleu-900/30 rounded-xl text-[10px] font-bold text-bleu-600 dark:text-or-400 border border-bleu-100 dark:border-bleu-800/30 uppercase tracking-widest leading-none">
          {val}
        </span>
      )
    },
    {
      key: 'montant',
      label: 'Engagement Financier',
      render: (_: any, row: any) => (
        <div className="text-left">
          <div className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(row.montantPaye)}</div>
          {row.montantRestant > 0 ? (
            <div className="flex items-center gap-1.5 mt-1">
               <span className="w-1 h-3 bg-rouge-500 rounded-full" />
               <span className="text-[10px] text-rouge-500 font-bold uppercase tracking-wider">Reste: {formatCurrency(row.montantRestant)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
               <span className="w-1 h-3 bg-vert-500 rounded-full" />
               <span className="text-[10px] text-vert-500 font-bold uppercase tracking-wider">Soldé</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'methode',
      label: 'Mode de Paiement',
      render: (val: string) => (
        <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
          <div className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-lg">
            {getMethodIcon(val)}
          </div>
          {val}
        </div>
      )
    },
    {
      key: 'statut',
      label: 'Statut de Caisse',
      render: (val: string) => (
        <Badge variant={val === 'Payé' ? 'success' : val === 'Partiel' ? 'warning' : 'error'} className="text-[9px] px-3 font-bold uppercase tracking-widest">
          {val}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Transaction',
      sortable: true,
      render: (val: string, row: any) => (
        <div className="text-left">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">{row.reference}</p>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <div className="relative group flex justify-end pr-2" onClick={(e) => e.stopPropagation()}>
          <Popover 
            isOpen={openMenuRowId === row.reference} 
            onClose={() => setOpenMenuRowId(null)}
            trigger={
              <button 
                onClick={() => setOpenMenuRowId(openMenuRowId === row.reference ? null : row.reference)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-bleu-600 dark:hover:text-or-400 hover:bg-bleu-50 dark:hover:bg-or-900/20 transition-all border border-gray-100 dark:border-white/5"
              >
                <MoreVertical size={18} />
              </button>
            }
          >
             <div className="w-56 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 space-y-1">
              <button className="w-full flex items-center gap-3 p-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 hover:text-bleu-600 rounded-xl transition-all">
                <FileText size={16} /> Voir le Reçu
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 hover:text-bleu-600 rounded-xl transition-all">
                <Edit2 size={16} /> Modifier l'entrée
              </button>
              <div className="h-px bg-gray-50 dark:bg-white/5 my-1" />
              <button className="w-full flex items-center gap-3 p-3 text-xs font-bold text-rouge-500 hover:bg-rouge-50 dark:hover:bg-rouge-900/20 rounded-xl transition-all">
                <Trash2 size={16} /> Supprimer l'opération
              </button>
            </div>
          </Popover>
        </div>
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
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Wallet className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-bold gradient-bleu-or-text tracking-tight">Comptabilité & Finances</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Suivi stratégique des encaissements et du recouvrement de l'EIEF</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsRapportsModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white h-11 px-5 text-[10px] uppercase tracking-widest font-bold"
          >
            <Download size={18} /> Rapports
          </Button>
          <Button 
            onClick={() => setIsEncaissementModalOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-bold text-[10px] uppercase tracking-widest h-11 px-6 shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Nouvel Encaissement
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
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
        <Card className="flex flex-col justify-center border-none shadow-soft p-6 dark:bg-gray-900/50 dark:backdrop-blur-md text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Dernière Clôture</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">24 Mars 2024</h3>
          <div className="flex items-center gap-2 mt-3">
             <div className="w-8 h-8 rounded-xl bg-vert-50 dark:bg-vert-900/20 flex items-center justify-center text-vert-500">
                <CheckCircle2 size={16} />
             </div>
             <div>
               <p className="text-[10px] text-gray-800 dark:text-gray-200 font-bold uppercase tracking-wide">Caisse équilibrée</p>
               <p className="text-[9px] text-gray-400 font-medium leading-none">Journal validé par l'Admin</p>
             </div>
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
                  px-4 py-2 rounded-xl text-[10px] font-semibold   whitespace-nowrap transition-all
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
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm"
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

      {/* MODALE: NOUVEL ENCAISSEMENT */}
      <Modal 
        isOpen={isEncaissementModalOpen} 
        onClose={() => setIsEncaissementModalOpen(false)}
        title={
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 dark:text-or-400 shadow-inner">
              <BankIcon size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">Saisir un Encaissement</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-8 text-left py-2 font-bold uppercase tracking-widest">
           <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-bleu-500 rounded-full" /> Identification & Service
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Élève concerné" 
                options={elevesData.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} 
              />
              <Select 
                label="Type de Service" 
                options={services.filter(s => s !== 'Tous').map(s => ({ value: s, label: s }))} 
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-or-500 rounded-full" /> Détails de la Transaction
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Montant à payer (FGN)" placeholder="ex: 2 500 000" type="number" />
              <Select 
                label="Mode de Paiement" 
                options={[
                  { value: 'Mobile Money', label: 'Mobile Money' },
                  { value: 'Espèces', label: 'Espèces' },
                  { value: 'Banque', label: 'Banque' },
                ]} 
              />
            </div>
          </div>

          <div className="flex gap-5 pt-8 border-t border-gray-100 dark:border-white/5 uppercase">
            <Button variant="outline" onClick={() => setIsEncaissementModalOpen(false)} className="flex-1 h-12 text-[10px] tracking-wider font-bold">Annuler</Button>
            <Button 
              onClick={() => { setIsEncaissementModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }} 
              className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold text-[10px] tracking-wider"
            >
              Confirmer l'encaissement
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODALE: RAPPORTS FINANCIERS */}
      <Modal 
        isOpen={isRapportsModalOpen} 
        onClose={() => setIsRapportsModalOpen(false)}
        title={
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600 shadow-inner">
              <Download size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">Export de Rapports</span>
          </div>
        }
        size="md"
      >
        <div className="space-y-6 text-left py-2 font-bold   uppercase tracking-widest">
           <div className="space-y-3">
              {[
                { name: 'Journal de Caisse (Aujourd\'hui)', desc: 'Toutes les opérations du jour', type: 'PDF' },
                { name: 'Relevé Mensuel des Recettes', desc: 'Analyse détaillée des encaissements', type: 'EXCEL' },
                { name: 'Liste des Impayés par Classe', desc: 'Rapport stratégique de recouvrement', type: 'PDF' }
              ].map((rep, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl group hover:border-bleu-500/50 transition-all font-bold tracking-widest uppercase">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-bleu-600 transition-colors shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div className="text-left font-bold tracking-widest uppercase">
                      <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest leading-none mb-1">{rep.name}</p>
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest leading-none">{rep.desc}</p>
                    </div>
                  </div>
                  <Badge variant={rep.type === 'PDF' ? 'error' : 'success'} className="text-[8px] px-2">{rep.type}</Badge>
                </button>
              ))}
           </div>
           <Button variant="outline" onClick={() => setIsRapportsModalOpen(false)} className="w-full h-12 font-bold uppercase text-[10px] tracking-wider">Fermer</Button>
        </div>
      </Modal>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-[100] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 border border-green-100 dark:border-green-900/30 flex items-center gap-4 min-w-[300px]"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-green-200/50">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-left flex-1 font-bold   uppercase tracking-widest">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-widest font-bold">Transaction Validée</p>
              <p className="text-[10px] text-gray-500 font-semibold leading-none uppercase tracking-widest">La caisse a été mise à jour avec succès.</p>
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

export default AdminAccounting;
