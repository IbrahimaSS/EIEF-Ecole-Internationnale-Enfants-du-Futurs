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
  Loader2,
  Printer,
} from 'lucide-react';
import { Table, Badge, StatCard, Card, Button, Modal, Input, Select, Popover, Avatar } from '../../components/ui';
import { apiRequest } from '../../services/api';

// ─── Types alignés avec le backend ───────────────────────────────────────────

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

// Enrichi avec registrationNumber et className pour le reçu
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber?: string;
  className?: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────

const AdminAccounting: React.FC = () => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [isEncaissementModalOpen, setIsEncaissementModalOpen] = useState(false);
  const [isRapportsModalOpen, setIsRapportsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
  // Élève résolu pour enrichir le reçu (matricule, classe)
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] = useState<Student | null>(null);
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PaymentRequest>({
    amount: 0,
    reference: '',
    method: 'CASH',
    studentId: '',
    categoryId: null,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);
  };

  const getApiBaseUrl = () =>
    (process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8080/api/v1');

  const getToken = (): string | null => {
    try {
      const raw = window.localStorage.getItem('auth-storage');
      return raw ? (JSON.parse(raw)?.state?.token ?? null) : null;
    } catch { return null; }
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest<PaymentResponse[]>('/payments', { method: 'GET' });
      setPayments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX : endpoint corrigé /users/students (et non /students)
  const fetchStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>('/users/students', { method: 'GET' });
      setStudents(data);
    } catch (err: any) {
      console.error('Erreur chargement élèves:', err);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, [fetchPayments, fetchStudents]);

  // ── KPIs ──────────────────────────────────────────────────────────────────

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

  // ── Formatage ─────────────────────────────────────────────────────────────

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-GN').format(amount) + ' FGN';

  const formatDate = (val: string | null) =>
    val
      ? new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '-';

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'MOBILE_MONEY':  return <Smartphone size={14} className="text-orange-500" />;
      case 'CASH':          return <Banknote size={14} className="text-green-500" />;
      case 'BANK_TRANSFER': return <CreditCard size={14} className="text-blue-500" />;
      case 'CHECK':         return <FileText size={14} className="text-purple-500" />;
      default:              return null;
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'MOBILE_MONEY':  return 'Mobile Money';
      case 'CASH':          return 'Espèces';
      case 'BANK_TRANSFER': return 'Virement';
      case 'CHECK':         return 'Chèque';
      default:              return method;
    }
  };

  const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':    return 'Payé';
      case 'PARTIAL': return 'Partiel';
      case 'PENDING': return 'En attente';
      case 'OVERDUE': return 'En retard';
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const cls = 'text-[9px] px-3 font-bold uppercase tracking-widest';
    switch (status) {
      case 'PAID':    return <Badge variant="success" className={cls}>Payé</Badge>;
      case 'PARTIAL': return <Badge variant="warning" className={cls}>Partiel</Badge>;
      case 'PENDING': return <Badge variant="default" className={cls}>En attente</Badge>;
      case 'OVERDUE': return <Badge variant="error"   className={cls}>En retard</Badge>;
    }
  };

  // Résoudre l'élève depuis la liste par correspondance de nom
  const resolveStudentByName = (name: string): Student | null =>
    students.find(s => `${s.firstName} ${s.lastName}` === name) ?? null;

  // ── Actions backend ───────────────────────────────────────────────────────

  const handleCreatePayment = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await apiRequest<PaymentResponse>('/payments', {
        method: 'POST',
        body: JSON.stringify({ ...formData, amount: Number(formData.amount) }),
      });
      // ✅ Conserver l'élève sélectionné pour enrichir le reçu
      const student = students.find(s => s.id === formData.studentId) ?? null;
      setSelectedStudentForReceipt(student);
      setIsEncaissementModalOpen(false);
      showSuccess('Encaissement créé avec succès');
      setFormData({ amount: 0, reference: '', method: 'CASH', studentId: '', categoryId: null });
      fetchPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await apiRequest<PaymentResponse>(`/payments/${id}/pay`, { method: 'PATCH' });
      showSuccess('Paiement marqué comme payé');
      fetchPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;
    try {
      const token = getToken();
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/payments/${id}`, {
        method: 'DELETE',
        headers: token ? { 'enfantsfuture-auth-token': `enfantsfuture ${token}` } : {},
      });
      if (!res.ok && res.status !== 204) throw new Error(`Erreur HTTP ${res.status}`);
      showSuccess('Paiement supprimé');
      fetchPayments();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // ── Reçu ─────────────────────────────────────────────────────────────────

  // ✅ Ouvrir le reçu en résolvant l'élève depuis la liste
  const openReceiptModal = (payment: PaymentResponse) => {
    setSelectedPayment(payment);
    setSelectedStudentForReceipt(resolveStudentByName(payment.studentName));
    setIsReceiptModalOpen(true);
    setOpenMenuRowId(null);
  };

  // ✅ printReceipt accepte un student optionnel pour enrichir le reçu
  const printReceipt = (payment: PaymentResponse, student?: Student | null) => {
    const resolvedStudent = student !== undefined ? student : selectedStudentForReceipt;

    const metaLine = [
      resolvedStudent?.registrationNumber ? `Matricule : ${resolvedStudent.registrationNumber}` : '',
      resolvedStudent?.className ? `Classe : ${resolvedStudent.className}` : '',
    ].filter(Boolean).join(' &nbsp;•&nbsp; ');

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Reçu – ${payment.reference}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #fff;
            color: #1a1a2e;
            padding: 40px;
          }
          .receipt {
            max-width: 520px;
            margin: 0 auto;
            border: 2px solid #1a1a2e;
            border-radius: 16px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 32px 28px 24px;
            text-align: center;
          }
          .school-name { font-size: 20px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
          .subtitle { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #c9a227; margin-top: 4px; }
          .receipt-title {
            margin-top: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.25em;
            text-transform: uppercase; background: rgba(201,162,39,0.15);
            border: 1px solid rgba(201,162,39,0.4); border-radius: 8px;
            display: inline-block; padding: 6px 18px; color: #c9a227;
          }
          .body { padding: 28px; }
          .ref-row {
            display: flex; justify-content: space-between; align-items: center;
            background: #f7f7fa; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;
          }
          .ref-label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.15em; }
          .ref-value { font-size: 12px; font-weight: 800; font-family: monospace; color: #1a1a2e; }
          .amount-block {
            text-align: center;
            background: linear-gradient(135deg, #f0f9f4 0%, #e8f5e9 100%);
            border: 2px solid #2ecc71; border-radius: 14px; padding: 20px; margin-bottom: 20px;
          }
          .amount-label { font-size: 9px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.2em; }
          .amount-value { font-size: 30px; font-weight: 900; color: #1a1a2e; margin-top: 4px; }
          .amount-status { font-size: 10px; font-weight: 700; color: #2ecc71; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px; }
          /* ✅ Bloc élève enrichi */
          .student-block {
            background: #f0f4ff; border-left: 4px solid #1e40af;
            border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;
          }
          .student-label { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 5px; }
          .student-name { font-size: 16px; font-weight: 800; color: #1a1a2e; }
          .student-meta { font-size: 10px; color: #6b7280; margin-top: 4px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
          .detail-item { background: #fafafa; border-radius: 10px; padding: 12px 14px; }
          .detail-label { font-size: 9px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.15em; }
          .detail-value { font-size: 12px; font-weight: 700; color: #1a1a2e; margin-top: 3px; }
          .signature-row {
            display: flex; justify-content: space-between;
            margin-top: 28px; padding-top: 24px; border-top: 1px solid #eee;
          }
          .signature-box { text-align: center; }
          .signature-line { width: 140px; height: 1px; background: #1a1a2e; margin: 32px auto 6px; }
          .signature-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; }
          .footer {
            border-top: 1px dashed #ddd; padding: 18px 28px; text-align: center;
          }
          .footer p { font-size: 9px; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.7; }
          @media print {
            body { padding: 0; }
            .receipt { border: none; border-radius: 0; }
            @page { size: A5; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="school-name">École EIEF</div>
            <div class="subtitle">Institut d'Enseignement Islamique et Francophone</div>
            <div class="receipt-title">Reçu de Paiement</div>
          </div>

          <div class="body">
            <div class="ref-row">
              <div>
                <div class="ref-label">Référence</div>
                <div class="ref-value">${payment.reference}</div>
              </div>
              <div style="text-align:right">
                <div class="ref-label">Date</div>
                <div class="ref-value" style="font-family:inherit;font-size:12px">
                  ${payment.paidAt
                    ? new Date(payment.paidAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                  }
                </div>
              </div>
            </div>

            <div class="amount-block">
              <div class="amount-label">Montant payé</div>
              <div class="amount-value">${new Intl.NumberFormat('fr-GN').format(Number(payment.amount))} FGN</div>
              <div class="amount-status">${getStatusLabel(payment.status)}</div>
            </div>

            <div class="student-block">
              <div class="student-label">Élève</div>
              <div class="student-name">${payment.studentName}</div>
              ${metaLine ? `<div class="student-meta">${metaLine}</div>` : ''}
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Service</div>
                <div class="detail-value">${payment.categoryName || 'Non catégorisé'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Mode de paiement</div>
                <div class="detail-value">${getMethodLabel(payment.method)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Statut</div>
                <div class="detail-value">${getStatusLabel(payment.status)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Généré le</div>
                <div class="detail-value">${new Date().toLocaleDateString('fr-FR')}</div>
              </div>
            </div>

            <div class="signature-row">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Signature du Payeur</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Cachet de l'École</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Ce reçu est un document officiel délivré par l'École EIEF.</p>
            <p>Conservez-le précieusement — il fait foi de votre paiement.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=640,height=820');
    if (!win) { setError('Veuillez autoriser les popups pour imprimer.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────

  const categoriesList = [
    'Tous',
    ...Array.from(new Set(payments.map(p => p.categoryName).filter(Boolean))),
  ];

  const filteredPaiements = payments.filter(p => {
    const matchesSearch =
      p.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'Tous' || p.categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Colonnes ──────────────────────────────────────────────────────────────

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
      ),
    },
    {
      key: 'categoryName',
      label: 'Service',
      render: (val: string) => (
        <span className="px-3 py-1 bg-bleu-50 dark:bg-bleu-900/30 rounded-xl text-[10px] font-bold text-bleu-600 dark:text-or-400 border border-bleu-100 dark:border-bleu-800/30 uppercase tracking-widest leading-none">
          {val || 'Non catégorisé'}
        </span>
      ),
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
      ),
    },
    {
      key: 'method',
      label: 'Mode de Paiement',
      render: (val: PaymentMethod) => (
        <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
          <div className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-lg">{getMethodIcon(val)}</div>
          {getMethodLabel(val)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val: PaymentStatus) => getStatusBadge(val),
    },
    {
      key: 'paidAt',
      label: 'Transaction',
      sortable: true,
      render: (val: string | null, row: PaymentResponse) => (
        <div className="text-left">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatDate(val)}</p>
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">{row.reference}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: PaymentResponse) => (
        <div className="relative group flex justify-end pr-2" onClick={e => e.stopPropagation()}>
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
              <button
                onClick={() => openReceiptModal(row)}
                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 hover:text-bleu-600 rounded-xl transition-all"
              >
                <Eye size={16} /> Voir les détails
              </button>

              {/* ✅ Passer l'élève résolu directement à printReceipt */}
              <button
                onClick={() => {
                  printReceipt(row, resolveStudentByName(row.studentName));
                  setOpenMenuRowId(null);
                }}
                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
              >
                <Printer size={16} /> Imprimer le reçu
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
      ),
    },
  ];

  // ── Rendu ─────────────────────────────────────────────────────────────────

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
          <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Wallet className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-bold gradient-bleu-or-text tracking-tight">Comptabilité & Finances</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            Suivi stratégique des encaissements et du recouvrement de l'EIEF
          </p>
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
          trend={{ value: '+8.2%', direction: 'up' }}
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
          trend={{ value: '+2% vs fév.', direction: 'up' }}
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

      {/* FILTER & TABLE */}
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
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm"
            />
          </div>
        </div>

        <Card className="p-2 overflow-hidden border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-bleu-600" size={32} />
            </div>
          ) : filteredPaiements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Wallet size={40} className="opacity-20" />
              <span className="text-sm font-medium">Aucune transaction trouvée</span>
            </div>
          ) : (
            <Table data={filteredPaiements} columns={columns as any} />
          )}
        </Card>
      </div>

      {/* ── MODALE: NOUVEL ENCAISSEMENT ────────────────────────────────────── */}
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
              {/* ✅ Select élèves avec données réelles depuis /users/students */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Élève concerné *
                </label>
                <select
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bleu-500"
                >
                  <option value="">
                    {students.length === 0 ? 'Chargement des élèves...' : 'Sélectionner un élève'}
                  </option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                      {s.className ? ` — ${s.className}` : ''}
                      {s.registrationNumber ? ` (${s.registrationNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Type de Service
                </label>
                <select
                  value={formData.categoryId?.toString() || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ ...formData, categoryId: val ? Number(val) : null });
                  }}
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
                label="Montant à payer (FGN) *"
                placeholder="ex: 2500000"
                type="number"
                value={formData.amount.toString()}
                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
              <Input
                label="Référence *"
                placeholder="ex: PAY-2024-001"
                value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Mode de Paiement
                </label>
                <select
                  value={formData.method}
                  onChange={e => setFormData({ ...formData, method: e.target.value as PaymentMethod })}
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
            <Button
              variant="outline"
              onClick={() => setIsEncaissementModalOpen(false)}
              className="flex-1 h-12 text-[10px] tracking-wider font-bold"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreatePayment}
              disabled={!formData.studentId || !formData.amount || !formData.reference || isSubmitting}
              className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold text-[10px] tracking-wider"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Traitement...
                </span>
              ) : (
                "Confirmer l'encaissement"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODALE: APERÇU & IMPRESSION DU REÇU ──────────────────────────── */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => { setIsReceiptModalOpen(false); setSelectedStudentForReceipt(null); }}
        title={
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 shadow-inner">
              <Printer size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">Reçu de Paiement</span>
          </div>
        }
        size="md"
      >
        {selectedPayment && (
          <div className="py-2 space-y-6">
            <div className="border-2 border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
              {/* En-tête reçu */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 text-center">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-yellow-400">École EIEF</p>
                <p className="text-[8px] text-gray-400 tracking-widest uppercase mt-1">
                  Institut d'Enseignement Islamique et Francophone
                </p>
                <div className="mt-3 inline-block bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-1.5">
                  <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-yellow-400">Reçu de Paiement</p>
                </div>
              </div>

              {/* Corps */}
              <div className="p-5 space-y-4 bg-white dark:bg-gray-900">
                {/* Référence + date */}
                <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Référence</p>
                    <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">{selectedPayment.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Date</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{formatDate(selectedPayment.paidAt)}</p>
                  </div>
                </div>

                {/* Montant */}
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800/40 rounded-xl p-4 text-center">
                  <p className="text-[8px] font-bold text-green-600 uppercase tracking-widest">Montant payé</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {formatCurrency(Number(selectedPayment.amount))}
                  </p>
                  <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-1">
                    {getStatusLabel(selectedPayment.status)}
                  </p>
                </div>

                {/* ✅ Bloc élève enrichi avec matricule et classe */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-bleu-600 rounded-xl p-3">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Élève</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedPayment.studentName}</p>
                  {(selectedStudentForReceipt?.registrationNumber || selectedStudentForReceipt?.className) && (
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                      {[
                        selectedStudentForReceipt.registrationNumber
                          ? `Matricule : ${selectedStudentForReceipt.registrationNumber}`
                          : '',
                        selectedStudentForReceipt.className
                          ? `Classe : ${selectedStudentForReceipt.className}`
                          : '',
                      ].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>

                {/* Détails */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Service',          value: selectedPayment.categoryName || 'Non catégorisé' },
                    { label: 'Mode de paiement', value: getMethodLabel(selectedPayment.method) },
                    { label: 'Statut',           value: getStatusLabel(selectedPayment.status) },
                    { label: 'Généré le',        value: new Date().toLocaleDateString('fr-FR') },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Signatures */}
                <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="text-center">
                    <div className="w-24 h-8 border-b border-gray-300 dark:border-gray-600 mb-1" />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Signature du Payeur</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-8 border-b border-gray-300 dark:border-gray-600 mb-1" />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Cachet de l'École</p>
                  </div>
                </div>
              </div>

              {/* Pied */}
              <div className="bg-gray-50 dark:bg-white/5 px-5 py-3 text-center border-t border-gray-100 dark:border-white/10">
                <p className="text-[8px] text-gray-400 uppercase tracking-widest">
                  Ce reçu est un document officiel délivré par l'École EIEF.
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => { setIsReceiptModalOpen(false); setSelectedStudentForReceipt(null); }}
                className="flex-1 h-11 text-[10px] tracking-wider font-bold"
              >
                Fermer
              </Button>
              <Button
                onClick={() => printReceipt(selectedPayment, selectedStudentForReceipt)}
                className="flex-1 h-11 font-bold text-[10px] tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 border-none shadow-lg shadow-indigo-600/20"
              >
                <Printer size={16} /> Imprimer le reçu
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODALE: RAPPORTS FINANCIERS ───────────────────────────────────── */}
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
              {
                name: "Journal de Caisse (Aujourd'hui)",
                desc: 'Toutes les opérations du jour',
                type: 'PDF',
                action: () => window.open(`${getApiBaseUrl()}/payments/report/daily`, '_blank'),
              },
              {
                name: 'Relevé Mensuel des Recettes',
                desc: 'Analyse détaillée des encaissements',
                type: 'EXCEL',
                action: () => window.open(`${getApiBaseUrl()}/payments/report/monthly`, '_blank'),
              },
              {
                name: 'Liste des Impayés',
                desc: 'Rapport stratégique de recouvrement',
                type: 'PDF',
                action: () => window.open(`${getApiBaseUrl()}/payments/overdue`, '_blank'),
              },
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
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest leading-none mb-1">{rep.name}</p>
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest leading-none">{rep.desc}</p>
                  </div>
                </div>
                <Badge variant={rep.type === 'PDF' ? 'error' : 'success'} className="text-[8px] px-2">{rep.type}</Badge>
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setIsRapportsModalOpen(false)}
            className="w-full h-12 font-bold uppercase text-[10px] tracking-wider"
          >
            Fermer
          </Button>
        </div>
      </Modal>

      {/* ── SUCCESS TOAST ──────────────────────────────────────────────────── */}
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
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-widest">Succès</p>
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
