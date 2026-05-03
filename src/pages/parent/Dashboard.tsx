import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Wallet, 
  Calendar, 
  Bell, 
  TrendingUp, 
  Activity,
  CreditCard,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Avatar, Badge } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { StudentResponse } from '../../services/userService';
import { studentService, StudentDashboardResponse } from '../../services/studentService';
import {
  isOpenParentPaymentStatus,
  ParentPaymentResponse,
  parentFinanceService,
  ParentTuitionStatusResponse,
} from '../../services/parentFinanceService';

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
   const user = useAuthStore((state) => state.user);
   const token = useAuthStore((state) => state.token);

   const [students, setStudents] = useState<StudentResponse[]>([]);
   const [studentDashboards, setStudentDashboards] = useState<Record<string, StudentDashboardResponse>>({});
   const [payments, setPayments] = useState<ParentPaymentResponse[]>([]);
   const [tuitionStatus, setTuitionStatus] = useState<ParentTuitionStatusResponse | null>(null);

   useEffect(() => {
      const loadData = async () => {
         if (!user?.id || !token) {
            return;
         }

         try {
            const overview = await parentFinanceService.getOverview(token, user.id);
            const linkedStudents = overview.students;
            const dashboards = await Promise.all(
               linkedStudents.map((student) => studentService.getDashboard(student.id)),
            );

            const dashboardMap: Record<string, StudentDashboardResponse> = {};
            linkedStudents.forEach((student, index) => {
               dashboardMap[student.id] = dashboards[index];
            });

            setStudents(linkedStudents);
            setStudentDashboards(dashboardMap);
            setPayments(overview.payments);
            setTuitionStatus(overview.tuitionStatus);
         } catch (_error) {
            setStudents([]);
            setStudentDashboards({});
            setPayments([]);
            setTuitionStatus(null);
         }
      };

      loadData();
   }, [token, user?.id]);

   const openGenericPayments = useMemo(
      () => payments.filter((payment) => isOpenParentPaymentStatus(payment.status)),
      [payments],
   );

   const totalGenericPaid = useMemo(
      () => payments.filter((payment) => payment.status === 'PAID').reduce((sum, payment) => sum + Number(payment.amount), 0),
      [payments],
   );

   const totalGenericPending = useMemo(
      () => openGenericPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      [openGenericPayments],
   );

   const tuitionPending = Number(tuitionStatus?.totalRemaining || 0);
   const tuitionPaid = Number(tuitionStatus?.totalPaid || 0);
   const totalPaid = totalGenericPaid + tuitionPaid;
   const totalPending = totalGenericPending + tuitionPending;
   const genericOverdueCount = useMemo(
      () => payments.filter((payment) => payment.status === 'OVERDUE').length,
      [payments],
   );
   const totalOverdueCount = genericOverdueCount + Number(tuitionStatus?.overdueCount || 0);
   const hasFinancialAlert = totalPending > 0 || totalOverdueCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 max-w-7xl mx-auto"
    >
      {/* HEADER HERO */}
      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-bleu-900 via-indigo-900 to-or-900 p-8 sm:p-12 shadow-2xl">
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-or-500/20 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-bleu-400/20 rounded-full blur-[60px] pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6">
                  <Users size={14} className="text-or-400" />
                  <span className="text-[11px] font-bold tracking-wide">Espace Famille</span>
               </div>
               <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
                  Bonjour, {user?.firstName || 'Famille'}
               </h1>
               <p className="text-sm font-semibold text-white/80 max-w-lg leading-relaxed">
                  Bienvenue sur votre portail. Suivez en temps réel la scolarité de vos enfants, gérez vos paiements et communiquez avec l'équipe pédagogique.
               </p>
            </div>
            
            <div className="flex gap-4">
               <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center min-w-[120px]">
                  <p className="text-3xl font-black text-or-400">{students.length}</p>
                  <p className="text-[11px] font-bold text-white mt-1">Enfants inscrits</p>
               </Card>
               <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center min-w-[120px]">
                  <p className="text-3xl font-black text-vert-400">{hasFinancialAlert ? 'Alerte' : 'A jour'}</p>
                  <p className="text-[11px] font-bold text-white mt-1">Scolarité</p>
               </Card>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* LEFT COLUMN: ENFANTS */}
         <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap size={20} className="text-bleu-600 dark:text-bleu-400" /> Mes enfants
               </h2>
               <Button onClick={() => navigate('/parent/eleves')} variant="ghost" className="text-[11px] font-bold text-bleu-600 hover:bg-bleu-50 dark:hover:bg-bleu-900/20">
                  Voir tout
               </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {students.length === 0 && (
                  <Card className="p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
                    <p className="text-sm font-semibold text-gray-500">Aucun enfant lie au compte parent.</p>
                  </Card>
               )}

               {students.map((student) => {
                 const dashboard = studentDashboards[student.id];
                 const firstAssignment = dashboard?.upcomingAssignments?.[0];
                 const avg = dashboard?.averageGrade ?? 0;
                 const absencesEstimate = Math.max(0, Math.round((100 - (dashboard?.attendanceRate ?? 100)) / 10));
                 const cardGradient = avg >= 14 ? 'from-bleu-50' : 'from-or-50';
                 const classColor = avg >= 14 ? 'text-bleu-600 dark:text-bleu-400' : 'text-or-600 dark:text-or-400';

                 return (
                   <Card key={student.id} className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-lg transition-all dark:bg-gray-900/50 group">
                      <div className={`bg-gradient-to-r ${cardGradient} to-white dark:to-transparent p-5 border-b border-gray-50 dark:border-white/5`}>
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                               <Avatar name={`${student.firstName} ${student.lastName}`} size="lg" className="ring-4 ring-white dark:ring-gray-800 shadow-sm" />
                               <div>
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{student.firstName} {student.lastName}</h3>
                                  <p className={`text-sm font-semibold ${classColor}`}>{student.className || 'Classe non renseignee'}</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="p-5 space-y-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-semibold flex items-center gap-2"><TrendingUp size={16} /> Moyenne Gle</span>
                            <span className="font-black text-gray-900 dark:text-white text-lg">{avg.toFixed(2)}<span className="text-[10px] text-gray-400 font-semibold">/20</span></span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-semibold flex items-center gap-2"><Activity size={16} /> Absences</span>
                            <Badge className="bg-vert-50 text-vert-600 dark:bg-vert-900/20 dark:text-vert-400 border-none font-bold">{absencesEstimate} heure</Badge>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-semibold flex items-center gap-2"><FileText size={16} /> Prochain devoir</span>
                            <span className="font-bold text-gray-900 dark:text-white text-[11px]">{firstAssignment?.title || 'Aucun devoir planifie'}</span>
                         </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                         <Button onClick={() => navigate('/parent/eleves')} className="w-full text-[11px] font-bold h-10 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 transition-colors">
                            Détails scolarité
                         </Button>
                      </div>
                   </Card>
                 );
               })}
            </div>
            
            {/* RÉCENT ANNONCES */}
            <div className="flex items-center justify-between mb-2 mt-8">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell size={20} className="text-or-500" /> Annonces de l'école
               </h2>
            </div>
            <div className="space-y-4">
               <Card className="p-5 border border-gray-100 dark:border-white/5 shadow-sm dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer flex gap-4">
                  <div className="p-3 bg-or-50 dark:bg-or-900/20 text-or-600 rounded-2xl h-fit">
                     <MessageCircle size={20} />
                  </div>
                  <div>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">Réunion Parents-Professeurs</h3>
                        <Badge className="bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400 border-none text-[9px] font-bold w-fit">Aujourd'hui, 09:00</Badge>
                     </div>
                     <p className="text-[12px] font-semibold text-gray-500 leading-relaxed max-w-2xl">
                        La réunion trimestrielle se tiendra ce samedi de 09h00 à 12h00 dans les salles de classe respectives de vos enfants. Votre présence est vivement souhaitée.
                     </p>
                  </div>
               </Card>
            </div>
         </div>

         {/* RIGHT COLUMN: PAIEMENTS & AGENDA */}
         <div className="col-span-1 space-y-6">
            
            {/* SITUATION FINANCIÈRE */}
            <Card className="p-0 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50 overflow-hidden">
               <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center gap-3">
                  <div className="p-2 bg-vert-100 dark:bg-vert-900/30 text-vert-600 rounded-xl">
                     <Wallet size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Situation financière</h2>
               </div>
               
               <div className="p-6">
                  <div className="mb-6">
                     <p className="text-[11px] font-bold text-gray-500 mb-1">État global des paiements</p>
                     <p className="text-2xl font-black text-vert-600 dark:text-vert-400 flex items-center gap-2">
                        {totalOverdueCount > 0 ? 'Retards' : totalPending > 0 ? 'En attente' : 'Réglée'} <CheckCircle2 size={24} className="text-vert-500" />
                     </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                     <div className="flex justify-between items-center text-[12px] font-semibold text-gray-600 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-white/5">
                        <span>Total payé</span>
                        <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('fr-FR').format(totalPaid)} GNF</span>
                     </div>
                     <div className="flex justify-between items-center text-[12px] font-semibold text-gray-600 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-white/5">
                        <span>Scolarité restante</span>
                        <span className="font-bold text-rouge-500">{new Intl.NumberFormat('fr-FR').format(tuitionPending)} GNF</span>
                     </div>
                     <div className="flex justify-between items-center text-[12px] font-semibold text-gray-600 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-white/5">
                        <span>Autres paiements ouverts</span>
                        <span className="font-bold text-rouge-500">{new Intl.NumberFormat('fr-FR').format(totalGenericPending)} GNF</span>
                     </div>
                     <div className="flex justify-between items-center text-[12px] font-semibold text-gray-600 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-white/5">
                        <span>Retards détectés</span>
                        <span className="font-bold text-rouge-500">{totalOverdueCount}</span>
                     </div>
                     <div className="flex justify-between items-center text-[12px] font-semibold text-gray-600 dark:text-gray-400">
                        <span>Reste à payer</span>
                        <span className="font-bold text-rouge-500">{new Intl.NumberFormat('fr-FR').format(totalPending)} GNF</span>
                     </div>
                  </div>

                  <Button onClick={() => navigate('/parent/paiements')} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-[12px] h-12 rounded-xl shadow-lg border-none hover:scale-[1.02] flex items-center justify-center gap-2">
                     <CreditCard size={16} /> Effectuer un paiement
                  </Button>
               </div>
            </Card>

            {/* AGENDA */}
            <Card className="p-0 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50 overflow-hidden">
               <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center gap-3">
                  <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 text-bleu-600 rounded-xl">
                     <Calendar size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agenda Familial</h2>
               </div>
               
               <div className="divide-y divide-gray-50 dark:divide-white/5">
                  <div className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                     <div className="flex flex-col items-center justify-center min-w-[50px] p-2 bg-rouge-50 dark:bg-rouge-900/20 text-rouge-600 rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Avr</span>
                        <span className="text-lg font-black leading-none mt-1">10</span>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Examen Blanc (Aïssatou)</p>
                        <p className="text-[11px] font-semibold text-gray-500 mt-1 flex items-center gap-1"><Clock size={12}/> 08:00 - 12:00</p>
                     </div>
                  </div>

                  <div className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                     <div className="flex flex-col items-center justify-center min-w-[50px] p-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Avr</span>
                        <span className="text-lg font-black leading-none mt-1">15</span>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Date limite paiement 3e T</p>
                        <p className="text-[11px] font-semibold text-gray-500 mt-1 flex items-center gap-1"><Clock size={12}/> Bureau scolarité</p>
                     </div>
                  </div>
               </div>
            </Card>

         </div>
      </div>
    </motion.div>
  );
};

export default ParentDashboard;
