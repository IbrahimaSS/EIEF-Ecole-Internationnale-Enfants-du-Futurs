import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Search, 
  CreditCard, 
  Banknote,
  Smartphone,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  X,
  CreditCard as BankIcon,
  Loader2
} from 'lucide-react';
import { Table, Badge, StatCard, Card, Button, Modal, Input, Select, Popover, Avatar } from '../../components/ui';

// Utilise le chemin correct vers ton fichier api.ts
// Adapte ce chemin selon ta structure réelle
import { apiRequest } from '../../services/api'; // ou '../../services/api' ou '../../utils/api'

// Si tu n'as pas de fichier api séparé, copie-colle ces fonctions ici:
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080/api/v1";
// const getStoredToken = () => { ... };
// export const apiRequest = async <T>(path: string, options: any): Promise<T> => { ... };

// Types basés sur ton backend
type PaymentMethod = 'MOBILE_MONEY' | 'CASH' | 'BANK_TRANSFER' | 'CHECK';
type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';

interface PaymentResponse {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  studentName: string;
  categoryName: string;
  status: PaymentStatus;
  paidAt: string | null;
}

interface PaymentRequest {
  amount: number;
  reference: string;
  method: PaymentMethod;
  studentId: string;
  categoryId: number | null;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

const AdminAccounting: React.FC = () => {
  // États
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [isEncaissementModalOpen, setIsEncaissementModalOpen] = useState(false);
  const [isRapportsModalOpen, setIsRapportsModalOpen] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Formulaire d'encaissement
  const [formData, setFormData] = useState<PaymentRequest>({
    amount: 0,
    reference: '',
    method: 'CASH',
    studentId: '',
    categoryId: null
  });

  // Récupère le token depuis localStorage si tu n'as pas de authStore
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem("auth-storage");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.token ?? null;
    } catch {
      return null;
    }
  };

  const token = getToken();

  // Chargement des paiements
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest<PaymentResponse[]>('/payments', {
        token,
        method: 'GET'
      });
      setPayments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Chargement des étudiants
  const fetchStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>('/students', {
        token,
        method: 'GET'
      });
      setStudents(data);
    } catch (err: any) {
      console.error('Erreur chargement élèves:', err);
    }
  }, [token]);

  // Chargement initial
  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, [fetchPayments, fetchStudents]);

  // Calculs des KPIs
  const totalRecettes = payments
    .filter(p => p.status === 'PAID')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
  const totalAttendu = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalImpayes = payments
    .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
  const tauxRecouvrement = totalAttendu > 0 
    ? Math.round((totalRecettes / totalAttendu) * 100) 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GN').format(amount) + ' FGN';
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'MOBILE_MONEY': return <Smartphone size={14} className="text-orange-500" />;
      case 'CASH': return <Banknote size={14} className="text-green-500" />;
      case 'BANK_TRANSFER': return <CreditCard size={14} className="text-blue-500" />;
      case 'CHECK': return <FileText size={14} className="text-purple-500" />;
      default: return null;
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'MOBILE_MONEY': return 'Mobile Money';
      case 'CASH': return 'Espèces';
      case 'BANK_TRANSFER': return 'Virement';
      case 'CHECK': return 'Chèque';
      default: return method;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID': return <Badge variant="success" className="text-[9px] px-3 font-bold uppercase tracking-widest">Payé</Badge>;
      case 'PARTIAL': return <Badge variant="warning" className="text-[9px] px-3 font-bold uppercase tracking-widest">Partiel</Badge>;
      case 'PENDING': return <Badge variant="default" className="text-[9px] px-3 font-bold uppercase tracking-widest">En attente</Badge>;
      case 'OVERDUE': return <Badge variant="error" className="text-[9px] px-3 font-bold uppercase tracking-widest">En retard</Badge>;
    }
  };

  // Extraction des catégories uniques
  const categoriesList = ['Tous', ...Array.from(new Set(payments.map(p => p.categoryName).filter(Boolean)))];

  // Filtrage
  const filteredPaiements = payments.filter(p => {
    const matchesSearch = p.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'Tous' || p.categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Création d'un paiement
  const handleCreatePayment = async () => {
    try {
      await apiRequest<PaymentResponse>('/payments', {
        token,
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });
      
      setIsEncaissementModalOpen(false);
      setSuccessMessage('Encaissement créé avec succès');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      
      // Reset form
      setFormData({
        amount: 0,
        reference: '',
        method: 'CASH',
        studentId: '',
        categoryId: null
      });
      
      fetchPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du paiement');
    }
  };

  // Marquer comme payé
  const handleMarkAsPaid = async (id: string) => {
    try {
      await apiRequest<PaymentResponse>(`/payments/${id}/pay`, {
        token,
        method: 'PATCH'
      });
      setSuccessMessage('Paiement marqué comme payé');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      fetchPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  // Suppression avec window.confirm
  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;
    
    try {
      await apiRequest<void>(`/payments/${id}`, {
        token,
        method: 'DELETE'
      });
      setSuccessMessage('Paiement supprimé');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      fetchPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'PARTIAL': return 'Partiel';
      case 'PENDING': return 'En attente';
      case 'OVERDUE': return 'En retard';
    }
  };

  // Handlers pour les Select corrigés
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({...formData, studentId: e.target.value});
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData({...formData, categoryId: val ? Number(val) : null});
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({...formData, method: e.target.value as PaymentMethod});
  };

  const columns = [
    {
      key: 'studentName',
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
      key: 'categoryName',
      label: 'Service',
      render: (val: string) => (
        <span className="px-3 py-1 bg-bleu-50 dark:bg-bleu-900/30 rounded-xl text-[10px] font-bold text-bleu-600 dark:text-or-400 border border-bleu-100 dark:border-bleu-800/30 uppercase tracking-widest leading-none">
          {val || 'Non catégorisé'}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (val: number, row: PaymentResponse) => (
        <div className="text-left">
          <div className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(Number(val))}</div>
          {row.status === 'PAID' ? (
            <div className="flex items-center gap-1.5 mt-1">
               <span className="w-1 h-3 bg-vert-500 rounded-full" />
               <span className="text-[10px] text-vert-500 font-bold uppercase tracking-wider">Soldé</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
               <span className="w-1 h-3 bg-rouge-500 rounded-full" />
               <span className="text-[10px] text-rouge-500 font-bold uppercase tracking-wider">{getStatusLabel(row.status)}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'method',
      label: 'Mode de Paiement',
      render: (val: PaymentMethod) => (
        <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
          <div className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-lg">
            {getMethodIcon(val)}
          </div>
          {getMethodLabel(val)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val: PaymentStatus) => getStatusBadge(val)
    },
    {
      key: 'paidAt',
      label: 'Transaction',
      sortable: true,
      render: (val: string | null, row: PaymentResponse) => (
        <div className="text-left">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {val ? new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
          </p>
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">{row.reference}</p>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: PaymentResponse) => (
        <div className="relative group flex justify-end pr-2" onClick={(e) => e.stopPropagation()}>
          <Popover 
            isOpen={openMenuRowId === row.id} 
            onClose={() => setOpenMenuRowId(null)}
            trigger={
              <button 
                onClick={() => setOpenMenuRowId(openMenuRowId === row.id ? null : row.id)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-bleu-600 dark:hover:text-or-400 hover:bg-bleu-50 dark:hover:bg-or-900/20 transition-all border border-gray-100 dark:border-white/5"
              >
                <MoreVertical size={18} />
              </button>
            }
          >
             <div className="w-56 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 space-y-1">
              <button className="w-full flex items-center gap-3 p-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 hover:text-bleu-600 rounded-xl transition-all">
                <Eye size={16} /> Voir les détails
              </button>
              {row.status !== 'PAID' && (
                <button 
                  onClick={() => { handleMarkAsPaid(row.id); setOpenMenuRowId(null); }}
                  className="w-full flex items-center gap-3 p-3 text-xs font-bold text-vert-600 hover:bg-vert-50 dark:hover:bg-vert-900/20 rounded-xl transition-all"
                >
                  <CheckCircle2 size={16} /> Marquer payé
                </button>
              )}
              <button className="w-full flex items-center gap-3 p-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 hover:text-bleu-600 rounded-xl transition-all">
                <Edit2 size={16} /> Modifier
              </button>
              <div className="h-px bg-gray-50 dark:bg-white/5 my-1" />
              <button 
                onClick={() => { handleDelete(row.id); setOpenMenuRowId(null); }}
                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-rouge-500 hover:bg-rouge-50 dark:hover:bg-rouge-900/20 rounded-xl transition-all"
              >
                <Trash2 size={16} /> Supprimer
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
      {/* Error Alert */}
      {error && (
        <div className="bg-rouge-50 border border-rouge-200 text-rouge-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

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
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`
                  px-4 py-2 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all
                  ${filterCategory === cat 
                    ? 'bg-gray-900 dark:bg-or-500 text-white shadow-lg' 
                    : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5'
                  }
                `}
              >
                {cat}
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-bleu-600" size={32} />
            </div>
          ) : (
            <Table 
              data={filteredPaiements} 
              columns={columns as any}
            />
          )}
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
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Élève concerné</label>
                <select
                  value={formData.studentId}
                  onChange={handleStudentChange}
                  className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bleu-500"
                >
                  <option value="">Sélectionner un élève</option>
                  {students.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Type de Service</label>
                <select
                  value={formData.categoryId?.toString() || ''}
                  onChange={handleCategoryChange}
                  className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bleu-500"
                >
                  <option value="">Sélectionner un service</option>
                  <option value="1">Frais de scolarité</option>
                  <option value="2">Cantine</option>
                  <option value="3">Transport</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-or-500 rounded-full" /> Détails de la Transaction
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Montant à payer (FGN)" 
                placeholder="ex: 2500000" 
                type="number"
                value={formData.amount.toString()}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              />
              <Input
                label="Référence"
                placeholder="ex: PAY-2024-001"
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mode de Paiement</label>
                <select
                  value={formData.method}
                  onChange={handleMethodChange}
                  className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bleu-500"
                >
                  <option value="CASH">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="BANK_TRANSFER">Virement Bancaire</option>
                  <option value="CHECK">Chèque</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-5 pt-8 border-t border-gray-100 dark:border-white/5 uppercase">
            <Button variant="outline" onClick={() => setIsEncaissementModalOpen(false)} className="flex-1 h-12 text-[10px] tracking-wider font-bold">Annuler</Button>
            <Button 
              onClick={handleCreatePayment}
              disabled={!formData.studentId || !formData.amount || !formData.reference}
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
        <div className="space-y-6 text-left py-2 font-bold uppercase tracking-widest">
           <div className="space-y-3">
              {[
                { name: 'Journal de Caisse (Aujourd\'hui)', desc: 'Toutes les opérations du jour', type: 'PDF', action: () => window.open(`${process.env.REACT_APP_API_BASE_URL}/payments/report/daily`, '_blank') },
                { name: 'Relevé Mensuel des Recettes', desc: 'Analyse détaillée des encaissements', type: 'EXCEL', action: () => window.open(`${process.env.REACT_APP_API_BASE_URL}/payments/report/monthly`, '_blank') },
                { name: 'Liste des Impayés', desc: 'Rapport stratégique de recouvrement', type: 'PDF', action: () => window.open(`${process.env.REACT_APP_API_BASE_URL}/payments/overdue`, '_blank') }
              ].map((rep, i) => (
                <button 
                  key={i} 
                  onClick={rep.action}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl group hover:border-bleu-500/50 transition-all font-bold tracking-widest uppercase"
                >
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
            <div className="text-left flex-1 font-bold uppercase tracking-widest">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-widest font-bold">Succès</p>
              <p className="text-[10px] text-gray-500 font-semibold leading-none uppercase tracking-widest">{successMessage}</p>
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