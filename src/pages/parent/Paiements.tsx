import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  History,
  ShieldCheck,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../components/ui';

const ParentPaiements: React.FC = () => {
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEnfant, setSelectedEnfant] = useState('aissatou');
  const [selectedType, setSelectedType] = useState('scolarite');
  const [montant, setMontant] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'orange' | 'mtn'>('orange');

  const transactions = [
    { id: 'TRX-8921', date: '05 Avril 2026', type: 'Scolarité (Avril) - Aïssatou', amount: '150 000 GNF', status: 'payé' },
    { id: 'TRX-8920', date: '05 Avril 2026', type: 'Cantine - Aïssatou', amount: '50 000 GNF', status: 'payé' },
    { id: 'TRX-8919', date: '01 Avril 2026', type: 'Transport - Mamadou', amount: '80 000 GNF', status: 'en_attente' },
    { id: 'TRX-8801', date: '05 Mars 2026', type: 'Scolarité (Mars) - Famille', amount: '300 000 GNF', status: 'payé' },
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPayModalOpen(false);
      setIsSuccess(true);
      setMontant('');
      setTimeout(() => setIsSuccess(false), 3000);
    }, 2000);
  };

  const openPayForOverdue = (enfant: string, type: string, amount: string) => {
    setSelectedEnfant(enfant);
    setSelectedType(type);
    setMontant(amount);
    setIsPayModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 max-w-6xl mx-auto"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-vert-100 dark:bg-vert-900/30 rounded-2xl shadow-inner text-vert-600">
            <Wallet size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Finances & Paiements</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Gérez vos frais de scolarité, cantine et transport</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsPayModalOpen(true)}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg border-none hover:scale-[1.02] px-6 h-11 flex items-center gap-2"
        >
          <CreditCard size={16} /> Effectuer un paiement
        </Button>
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 bg-gradient-to-br from-bleu-900 to-indigo-900 border-none text-white shadow-xl shadow-bleu-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none" />
            <p className="text-[11px] font-bold text-bleu-200 uppercase tracking-widest mb-2">Total Payé (Année)</p>
            <p className="text-3xl font-black tracking-tight mb-1">2 150 000 <span className="text-lg text-bleu-300">GNF</span></p>
            <p className="text-[10px] font-semibold text-bleu-200 mt-4 flex items-center gap-1">
               <ShieldCheck size={12} /> Paiements sécurisés
            </p>
         </Card>

         <Card className="p-6 bg-rouge-50 dark:bg-rouge-900/10 border-none relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
               <AlertCircle size={60} className="text-rouge-500" />
            </div>
            <p className="text-[11px] font-bold text-rouge-600 dark:text-rouge-400 uppercase tracking-widest mb-2">Reste à payer</p>
            <p className="text-3xl font-black text-rouge-600 dark:text-rouge-400 tracking-tight mb-1">80 000 <span className="text-lg opacity-70">GNF</span></p>
            <p className="text-[10px] font-semibold text-rouge-500/80 mt-2">
               Échéance dépassée: Transport (Mamadou)
            </p>
            <button 
               onClick={() => openPayForOverdue('mamadou', 'transport', '80000')}
               className="mt-3 w-full h-9 bg-rouge-600 hover:bg-rouge-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
               <CreditCard size={14} /> Régulariser maintenant
            </button>
         </Card>

         <Card className="p-6 bg-vert-50 dark:bg-vert-900/10 border-none">
            <div className="flex justify-between items-start mb-2">
               <p className="text-[11px] font-bold text-vert-600 dark:text-vert-400 uppercase tracking-widest">Prochaine Mensualité</p>
               <Calendar className="text-vert-500" size={16} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">300 000 <span className="text-sm text-gray-500">GNF</span></p>
            <p className="text-[10px] font-bold text-gray-500 mt-2">Avant le 05 Mai 2026</p>
            <Badge className="bg-vert-200 text-vert-700 dark:bg-vert-900/30 dark:text-vert-400 border-none font-bold text-[9px] mt-3">À venir</Badge>
         </Card>
      </div>

      {/* HISTORIQUE */}
      <Card className="p-0 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50 overflow-hidden">
         <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center gap-3">
            <History size={18} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Historique des transactions</h2>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID Transaction</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Montant</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {transactions.map((trx) => (
                     <tr key={trx.id} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{trx.id}</td>
                        <td className="px-6 py-4 text-[12px] font-semibold text-gray-500">{trx.date}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{trx.type}</td>
                        <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-white">{trx.amount}</td>
                        <td className="px-6 py-4">
                           {trx.status === 'payé' ? (
                              <Badge className="bg-vert-50 text-vert-600 dark:bg-vert-900/20 dark:text-vert-400 border-none font-bold text-[10px]">
                                 <CheckCircle2 size={10} className="mr-1" /> Payé
                              </Badge>
                           ) : (
                              <Badge className="bg-rouge-50 text-rouge-600 dark:bg-rouge-900/20 dark:text-rouge-400 border-none font-bold text-[10px]">
                                 <AlertCircle size={10} className="mr-1" /> En attente
                              </Badge>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           {trx.status === 'payé' ? (
                              <button className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-bleu-600 rounded-lg transition-colors" title="Télécharger le reçu">
                                 <Download size={16} />
                              </button>
                           ) : (
                              <button 
                                 onClick={() => openPayForOverdue(
                                    trx.type.toLowerCase().includes('mamadou') ? 'mamadou' : trx.type.toLowerCase().includes('aïssatou') ? 'aissatou' : 'famille',
                                    trx.type.toLowerCase().includes('transport') ? 'transport' : trx.type.toLowerCase().includes('cantine') ? 'cantine' : 'scolarite',
                                    trx.amount.replace(/[^0-9]/g, '')
                                 )}
                                 className="px-3 py-1.5 bg-rouge-600 hover:bg-rouge-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                 <CreditCard size={12} /> Payer
                              </button>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      {/* MODAL PAIEMENT */}
      <Modal 
        isOpen={isPayModalOpen} 
        onClose={() => !isProcessing && setIsPayModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gray-900 dark:bg-white rounded-2xl text-white dark:text-gray-900 shadow-inner">
              <CreditCard size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl text-gray-900 dark:text-white">Effectuer un paiement</h2>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold">Choisissez l'enfant, le type de frais et le montant</p>
            </div>
          </div>
        }
      >
         <div className="space-y-5 pt-2 pb-2">

            {/* ÉTAPE 1 : ENFANT + TYPE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5 ml-1">Pour quel enfant ?</label>
                  <Select
                     value={selectedEnfant}
                     onChange={(e) => setSelectedEnfant(e.target.value)}
                     className="w-full font-semibold"
                     options={[
                        { value: 'aissatou', label: 'Aïssatou Bah (Terminale S1)' },
                        { value: 'mamadou', label: 'Mamadou Bah (4ème B)' },
                        { value: 'famille', label: 'Toute la famille' },
                     ]}
                  />
               </div>
               <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5 ml-1">Type de frais</label>
                  <Select
                     value={selectedType}
                     onChange={(e) => setSelectedType(e.target.value)}
                     className="w-full font-semibold"
                     options={[
                        { value: 'scolarite', label: 'Frais de scolarité' },
                        { value: 'cantine', label: 'Cantine' },
                        { value: 'transport', label: 'Transport scolaire' },
                        { value: 'fournitures', label: 'Fournitures scolaires' },
                        { value: 'uniforme', label: 'Uniforme' },
                        { value: 'inscription', label: 'Inscription / Réinscription' },
                        { value: 'excursion', label: 'Sortie / Excursion' },
                        { value: 'autre', label: 'Autre paiement' },
                     ]}
                  />
               </div>
            </div>

            {/* ÉTAPE 2 : MONTANT */}
            <div>
               <label className="text-[11px] font-bold text-gray-500 block mb-1.5 ml-1">Montant à payer (GNF)</label>
               <Input 
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Ex: 150 000" 
                  className="font-black text-xl h-14"
               />
            </div>

            {/* ÉTAPE 3 : MODE DE PAIEMENT */}
            <div>
               <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Moyen de paiement</label>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                     onClick={() => setSelectedMethod('orange')}
                     className={`h-14 border-2 rounded-xl flex items-center justify-center font-bold text-[12px] gap-2 transition-all ${
                        selectedMethod === 'orange' 
                           ? 'border-or-400 bg-or-50/50 text-or-600 shadow-sm' 
                           : 'border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-500 hover:border-or-300'
                     }`}
                  >
                     🟠 Orange Money
                  </button>
                  <button 
                     onClick={() => setSelectedMethod('mtn')}
                     className={`h-14 border-2 rounded-xl flex items-center justify-center font-bold text-[12px] gap-2 transition-all ${
                        selectedMethod === 'mtn' 
                           ? 'border-or-400 bg-or-50/50 text-or-600 shadow-sm' 
                           : 'border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-500 hover:border-bleu-300'
                     }`}
                  >
                     🟡 MTN MoMo
                  </button>
               </div>
            </div>

            {/* ÉTAPE 4 : NUMÉRO */}
            <div>
               <label className="text-[11px] font-bold text-gray-500 block mb-1.5 ml-1">Numéro de téléphone affilié</label>
               <Input placeholder="Ex: 620 XX XX XX" className="font-bold text-lg h-12" />
            </div>

            {/* RÉCAPITULATIF */}
            {montant && (
               <div className="p-4 bg-bleu-50 dark:bg-bleu-900/10 rounded-xl border border-bleu-100 dark:border-bleu-900/30">
                  <p className="text-[10px] font-bold text-bleu-600 uppercase tracking-widest mb-2">Récapitulatif</p>
                  <div className="space-y-1 text-sm">
                     <div className="flex justify-between"><span className="font-semibold text-gray-500">Enfant</span><span className="font-bold text-gray-900 dark:text-white">{selectedEnfant === 'aissatou' ? 'Aïssatou Bah' : selectedEnfant === 'mamadou' ? 'Mamadou Bah' : 'Famille Bah'}</span></div>
                     <div className="flex justify-between"><span className="font-semibold text-gray-500">Type</span><span className="font-bold text-gray-900 dark:text-white capitalize">{selectedType.replace('_', ' ')}</span></div>
                     <div className="flex justify-between border-t border-bleu-100 dark:border-bleu-900/30 pt-2 mt-2"><span className="font-bold text-bleu-600">Total</span><span className="font-black text-xl text-bleu-600">{parseInt(montant).toLocaleString('fr-FR')} GNF</span></div>
                  </div>
               </div>
            )}

            <Button 
               onClick={handlePayment}
               disabled={isProcessing || !montant}
               className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-[13px] rounded-xl border-none hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
               {isProcessing ? <span className="animate-spin">⏳</span> : montant ? `Payer ${parseInt(montant).toLocaleString('fr-FR')} GNF` : 'Entrez un montant'}
            </Button>
            
            <p className="text-center text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1">
               <ShieldCheck size={12} /> Transaction sécurisée et chiffrée
            </p>
         </div>
      </Modal>

      {/* TOAST SUCCESS */}
      {isSuccess && (
         <motion.div
           initial={{ opacity: 0, y: 50, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           className="fixed bottom-8 right-8 z-[100] flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-vert-100 min-w-[300px]"
         >
           <div className="flex items-center gap-4">
             <div className="p-2 bg-vert-100 text-vert-500 rounded-xl">
               <CheckCircle2 size={24} />
             </div>
             <div className="text-left font-bold">
               <p className="text-sm text-gray-900 dark:text-white">Paiement Réussi</p>
               <p className="text-[11px] text-gray-500 font-semibold">Le reçu a été généré avec succès.</p>
             </div>
           </div>
         </motion.div>
      )}

    </motion.div>
  );
};

export default ParentPaiements;
