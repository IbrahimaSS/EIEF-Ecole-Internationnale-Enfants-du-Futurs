import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  ChevronRight,
  MoreVertical,
  Megaphone,
  X,
  History,
  Activity,
  Filter,
  Eye,
  Trash2,
  Edit,
  Zap
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar, Modal, Input, Select, Popover } from '../../components/ui';
import { cn } from '../../utils/cn';

const AdminCommunication: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'messagerie' | 'forum'>('messagerie');
  const [activeFilter, setActiveFilter] = useState<'Tous' | 'Annonce' | 'Message' | 'Urgent'>('Tous');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string>('Tous');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [expandedForumId, setExpandedForumId] = useState<number | null>(null);

  const [forumMessages, setForumMessages] = useState([
    { id: 1, user: 'Dr. Keita', role: 'Enseignant', content: 'Quelqu\'un a-t-il les supports pour le cours de demain ?', date: 'il y a 2h', replies: 5, repliesList: [{ id: 101, user: 'Admin EIEF', date: 'il y a 30 min', content: 'Oui, tout est prêt sur le portail ! Vous pouvez les télécharger.' }] },
    { id: 2, user: 'Mme Soumah', role: 'Parent', content: 'La fête de l\'école est-elle toujours maintenue pour vendredi ?', date: 'il y a 4h', replies: 12, repliesList: [] },
    { id: 3, user: 'Admin EIEF', role: 'Administration', content: 'N’oubliez pas de valider vos listes d’élèves d’ici demain soir.', date: 'il y a 1j', replies: 8, repliesList: [] },
  ]);

  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (threadId: number) => {
    if (!replyText.trim()) return;
    setForumMessages(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies + 1,
          repliesList: [...t.repliesList, { id: Date.now(), user: 'Admin EIEF', date: 'À l\'instant', content: replyText }]
        };
      }
      return t;
    }));
    setReplyText('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const messages = [
    { id: 1, titre: 'Réunion parents-professeurs', contenu: 'Veuillez noter que la réunion annuelle se tiendra samedi prochain à 10h...', date: 'Aujourd\'hui, 14:30', cible: 'Parents', statut: 'Envoyé', type: 'Annonce', urgent: false },
    { id: 2, titre: 'Nouveau calendrier scolaire', contenu: 'Le calendrier des examens du second trimestre est désormais disponible.', date: 'Aujourd\'hui, 10:15', cible: 'Tous', statut: 'Envoyé', type: 'Message', urgent: false },
    { id: 3, titre: 'Alerte météo : École fermée', contenu: 'En raison des fortes pluies, l\'établissement sera fermé ce jour.', date: 'Hier, 07:30', cible: 'Tous', statut: 'Délivré', type: 'Urgent', urgent: true },
    { id: 4, titre: 'Frais de scolarité', contenu: 'Le délai de paiement pour le mois d\'Avril approche. Merci de régulariser.', date: 'Hier, 16:45', cible: 'Parents', statut: 'Envoyé', type: 'Message', urgent: false },
  ];

  const filteredMessages = activeFilter === 'Tous' 
    ? messages 
    : messages.filter(m => m.type === activeFilter || (activeFilter === 'Urgent' && m.urgent));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2" onClick={() => setOpenMenuId(null)}>
        <div className="text-left font-bold">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-soft">
              <Megaphone className="text-bleu-600 dark:text-bleu-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight uppercase">Communication</h1>
              <div className="flex items-center gap-8 mt-3">
                 <button 
                   onClick={() => setActiveMainTab('messagerie')}
                   className={cn(
                     "text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-2",
                     activeMainTab === 'messagerie' ? "text-bleu-600 dark:text-or-400" : "text-gray-400 hover:text-gray-600"
                   )}
                 >
                   Messagerie & Annonces
                   {activeMainTab === 'messagerie' && <motion.div layoutId="main-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
                 </button>
                 <button 
                   onClick={() => setActiveMainTab('forum')}
                   className={cn(
                     "text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-2",
                     activeMainTab === 'forum' ? "text-bleu-600 dark:text-or-400" : "text-gray-400 hover:text-gray-600"
                   )}
                 >
                   Espace forum
                   {activeMainTab === 'forum' && <motion.div layoutId="main-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
                 </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            <History size={18} /> Historique email
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20 active:scale-95 transition-all"
          >
            <Send size={18} /> Nouvelle annonce
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Messages envoyés"
          value="452"
          subtitle="Trimestre en cours"
          icon={<Send />}
          trend={{ value: "+12.5%", direction: "up" }}
          color="bleu"
        />
        <StatCard
          title="Taux d'ouverture"
          value="78%"
          subtitle="Engagement global"
          icon={<Activity />}
          color="or"
        />
        <StatCard
          title="Alertes urgentes"
          value="02"
          subtitle="Actions requises"
          icon={<AlertCircle />}
          color="rouge"
        />
        <StatCard
          title="Canaux actifs"
          value="3/3"
          subtitle="Omnicanalité active"
          icon={<Zap />}
          color="vert"
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeMainTab === 'messagerie' ? (
              <motion.div
                key="messagerie"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                  <div className="p-1 px-2 bg-white dark:bg-white/5 rounded-2xl flex items-center gap-1 shadow-soft border border-gray-100 dark:border-white/5">
                    {['Tous', 'Annonce', 'Message', 'Urgent'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f as any)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                          activeFilter === f 
                            ? 'bg-bleu-600 dark:bg-or-500 text-white shadow-lg' 
                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="ml-auto">
                     <button className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-gray-400 hover:text-bleu-600 transition-all shadow-sm">
                       <Filter size={18} />
                     </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredMessages.map((msg) => (
                    <Card key={msg.id} className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md group relative hover:shadow-xl transition-all duration-300">
                      {msg.urgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rouge-600 to-rouge-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse" />}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex gap-6">
                            <div className={cn(
                              "p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm ring-1 ring-black/5 dark:ring-white/5",
                              msg.urgent 
                                ? 'bg-rouge-50 dark:bg-rouge-900/20 text-rouge-600' 
                                : msg.type === 'Annonce' 
                                  ? 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600' 
                                  : 'bg-or-50 dark:bg-or-900/20 text-or-600'
                            )}>
                               {msg.type === 'Annonce' ? <Megaphone size={26} strokeWidth={2.5} /> : <MessageSquare size={26} strokeWidth={2.5} />}
                            </div>
                            <div className="text-left font-bold" onClick={() => setOpenMenuId(null)}>
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h4 className="text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-bleu-600 transition-colors">{msg.titre}</h4>
                                {msg.urgent && (
                                  <Badge variant="error" className="text-[9px] font-bold px-3 py-0.5 border-none shadow-sm uppercase tracking-widest animate-bounce">
                                    Urgent
                                  </Badge>
                                )}
                                <Badge className="bg-gray-100 dark:bg-white/5 text-gray-500 border-none text-[8px] font-bold px-2 uppercase tracking-widest leading-none">
                                  {msg.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-5 leading-relaxed font-semibold italic">"{msg.contenu}"</p>
                              <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  <Users size={14} className="text-bleu-500" /> <span className="opacity-60">Cible :</span> <span className="text-gray-600 dark:text-gray-300">{msg.cible}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  <Clock size={14} className="text-or-500" /> <span className="opacity-60">Date :</span> <span className="text-gray-600 dark:text-gray-300">{msg.date}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[10px] font-bold text-vert-500 uppercase tracking-widest">
                                  <CheckCircle2 size={14} /> {msg.statut}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Popover
                            isOpen={openMenuId === msg.id}
                            onClose={() => setOpenMenuId(null)}
                            trigger={
                              <button 
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === msg.id ? null : msg.id); }}
                                className="p-2 text-gray-300 dark:text-gray-700 hover:text-gray-900 dark:hover:text-white transition-all bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                              >
                                <MoreVertical size={20} />
                              </button>
                            }
                          >
                            <div className="bg-white dark:bg-gray-900 rounded-[1.2rem] shadow-2xl border border-gray-100 dark:border-white/10 p-2 min-w-[200px] text-left">
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                                <Eye size={16} className="text-bleu-600" /> Voir les statistiques
                              </button>
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                                <Edit size={16} className="text-or-600" /> Modifier l'envoi
                              </button>
                              <div className="h-px bg-gray-50 dark:bg-white/5 my-1 mx-2" />
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
                                <Trash2 size={16} /> Supprimer
                              </button>
                            </div>
                          </Popover>
                        </div>
                      </div>
                      <div className="px-6 py-3 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between border-t border-gray-100 dark:border-white/5 invisible group-hover:visible transition-all">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Taux de lecture : <span className="text-bleu-600">84%</span></p>
                         <button className="text-[10px] font-bold text-bleu-600 hover:underline uppercase tracking-widest flex items-center gap-1">Détails de diffusion <ChevronRight size={12} /></button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="forum"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-1 rounded-2xl shadow-soft border border-gray-100 dark:border-white/10">
                    {['Tous', 'Enseignants', 'Parents', 'Général'].map((f) => (
                      <button key={f} className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-all">
                        {f}
                      </button>
                    ))}
                  </div>
                  <Button 
                    onClick={() => setIsAddTopicModalOpen(true)}
                    className="bg-gradient-to-r from-or-600 to-or-400 text-gray-900 h-12 px-8 rounded-2xl font-bold text-[11px] uppercase tracking-widest border-none shadow-lg shadow-or-500/20 active:scale-95 transition-all"
                  >
                    Nouveau sujet
                  </Button>
                </div>

                <div className="space-y-4">
                  {forumMessages.map((t) => (
                    <Card key={t.id} className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md group hover:shadow-lg transition-all">
                      <div 
                        className="p-6 flex items-start gap-6 cursor-pointer"
                        onClick={() => setExpandedForumId(expandedForumId === t.id ? null : t.id)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Avatar name={t.user} size="md" className="ring-2 ring-gray-100 dark:ring-white/5 group-hover:ring-or-500 transition-all" />
                          <div className={cn("w-1 flex-1 rounded-full min-h-[40px] transition-all", expandedForumId === t.id ? "bg-or-500/50" : "bg-gray-50 dark:bg-white/5")} />
                        </div>
                        <div className="flex-1 text-left font-bold">
                           <div className="flex items-center gap-3 mb-2">
                             <p className="text-sm text-gray-900 dark:text-white uppercase tracking-tight font-black">{t.user}</p>
                             <Badge className="bg-bleu-50 text-bleu-600 dark:bg-bleu-900/20 dark:text-bleu-400 border-none text-[8px] font-bold px-2 uppercase tracking-widest">{t.role}</Badge>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-auto">{t.date}</p>
                           </div>
                           <p className="text-lg text-gray-800 dark:text-gray-200 mb-4 leading-relaxed font-bold italic">"{t.content}"</p>
                           <div className="flex items-center gap-6">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-or-500 transition-colors">
                               <MessageSquare size={14} className="text-or-500" /> {t.replies} <span className="opacity-60">réponses</span>
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                               <Eye size={14} className="text-bleu-500" /> 124 <span className="opacity-60">vues</span>
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* ZONE DE RÉPONSE EN LIGNE */}
                      <AnimatePresence>
                        {expandedForumId === t.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5"
                          >
                            <div className="p-6 pl-20 space-y-6">
                              {/* Anciennes réponses mockées */}
                              <div className="space-y-4">
                                {t.repliesList.map(r => (
                                  <div key={r.id} className="flex items-start gap-4">
                                    <Avatar name={r.user} size="sm" className="ring-1 ring-white/10" />
                                    <div className="flex-1 bg-white dark:bg-gray-900/50 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{r.user}</p>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{r.date}</p>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold italic">"{r.content}"</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Champ pour nouvelle réponse */}
                              <div className="flex items-start gap-4 pt-2">
                                <Avatar name="Moi" size="sm" className="ring-2 ring-or-500/30" />
                                <div className="flex-1 relative">
                                  <textarea 
                                    value={replyText}
                                    onChange={(e: any) => setReplyText(e.target.value)}
                                    className="w-full h-20 p-4 pr-14 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-or-500/20 outline-none transition-all font-semibold italic text-sm resize-none shadow-inner"
                                    placeholder="Écrire une réponse..."
                                  />
                                  <button 
                                    onClick={() => handleReplySubmit(t.id)}
                                    className="absolute right-2 top-2 p-2.5 bg-or-500 hover:bg-or-600 text-white rounded-xl shadow-lg shadow-or-500/30 active:scale-95 transition-all flex items-center justify-center"
                                  >
                                    <Send size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AUDIENCE SUMMARY & SHORTCUTS */}
        <div className="space-y-8">
          <Card className="p-8 border-none shadow-soft bg-gradient-to-br from-gray-900 via-gray-900 to-bleu-950 dark:from-gray-950 dark:via-gray-950 dark:to-bleu-900/40 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-bleu-500/10 rounded-full blur-[60px] -mr-24 -mt-24 group-hover:bg-bleu-500/20 transition-all duration-1000" />
             <h3 className="font-bold text-[11px] text-bleu-400 mb-8 flex items-center gap-3 uppercase tracking-widest">
               <Activity size={18} />
               Canaux de diffusion
             </h3>
             <div className="space-y-8">
               {[
                 { label: 'Parents inscrits', count: '1,240', status: '98% Actifs', color: 'bg-vert-500' },
                 { label: 'Enseignants connectés', count: '84', status: 'Temps réel', color: 'bg-bleu-500' },
                 { label: 'Forfaits SMS restants', count: '8,520', status: 'Pack pro', color: 'bg-or-500' },
               ].map((c, i) => (
                 <div key={i} className="flex items-center justify-between group/item cursor-pointer">
                   <div className="text-left font-bold">
                     <p className="text-[11px] font-bold text-gray-500 mb-1 group-hover/item:text-bleu-400 transition-colors uppercase tracking-widest">{c.label}</p>
                     <p className="text-3xl font-bold tracking-tight">{c.count}</p>
                   </div>
                   <Badge className="bg-white/5 text-gray-300 border-white/10 text-[9px] font-bold px-3 py-1 uppercase tracking-widest">{c.status}</Badge>
                 </div>
               ))}
             </div>
             <Button 
               onClick={() => setIsTestModalOpen(true)}
               className="w-full mt-10 bg-white/10 hover:bg-white text-white hover:text-bleu-900 border border-white/20 hover:border-white font-bold text-[11px] h-12 flex gap-3 shadow-xl transition-all uppercase tracking-widest backdrop-blur-sm"
             >
               Tester un envoi SMS <ChevronRight size={18} />
             </Button>
          </Card>

          <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md text-left group">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-[11px]">Alerte programmée</h3>
            <div className="p-6 bg-or-50/50 dark:bg-or-950/20 border border-or-100 dark:border-or-500/20 rounded-[2rem] flex items-start gap-6 group-hover:border-or-500/40 transition-all">
              <div className="p-3 bg-or-500 text-white rounded-2xl shadow-lg shadow-or-500/20 animate-pulse">
                <Bell size={22} />
              </div>
              <div className="font-bold">
                <p className="text-[11px] text-or-600 dark:text-or-400 mb-2 uppercase tracking-widest">Rappel automatique</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed italic line-clamp-2">Relance des impayés prévue demain à 09:00 via SMS.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL : NOUVELLE ANNONCE */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl text-bleu-600 shadow-inner">
              <Megaphone size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Nouvelle annonce</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Diffusion globale ou ciblée</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Titre de l'annonce</label>
              <Input placeholder="Ex: Réunion de rentrée..." className="h-12 rounded-2xl border-gray-100 dark:border-white/10" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type de message</label>
              <Select 
                defaultValue="annonce" 
                className="h-[3.2rem] rounded-2xl border-gray-100 dark:border-white/10"
                options={[
                  { value: 'annonce', label: 'Annonce officielle' },
                  { value: 'message', label: 'Message simple' },
                  { value: 'urgent', label: 'Alerte urgente' }
                ]}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Audience cible</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Tous', 'Parents', 'Enseignants', 'Élèves'].map(c => (
                <button 
                  key={c} 
                  onClick={() => setSelectedAudience(c)}
                  className={cn(
                    "p-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95",
                    selectedAudience === c 
                      ? "bg-bleu-600 dark:bg-or-500 text-white border-transparent shadow-lg shadow-bleu-500/20 scale-[1.02]" 
                      : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-bleu-400 hover:bg-bleu-50 dark:hover:bg-bleu-900/10 text-gray-400 dark:text-gray-500"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contenu du message</label>
            <textarea 
              className="w-full h-32 p-4 rounded-[2rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-bleu-500/20 outline-none transition-all font-semibold italic text-sm"
              placeholder="Saisissez votre message ici..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl border-none bg-gray-50 dark:bg-white/5" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
            <Button 
              className="flex-1 h-12 bg-bleu-600 text-white shadow-lg shadow-bleu-600/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:scale-[1.02]"
              onClick={() => { setIsAddModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }}
            >
              Diffuser l'annonce
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL : TEST SMS */}
      <Modal 
        isOpen={isTestModalOpen} 
        onClose={() => setIsTestModalOpen(false)}
        size="md"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600 shadow-inner">
              <Smartphone size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Test d'envoi SMS</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Vérification de la passerelle</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="p-6 bg-bleu-50 dark:bg-bleu-900/10 rounded-3xl border border-bleu-100 dark:border-bleu-900/20 text-left">
            <p className="text-xs font-semibold text-bleu-800 dark:text-bleu-300 leading-relaxed italic">
              Cette action utilisera <span className="text-bleu-600 font-extrabold">1 crédit SMS</span> de votre forfait (8,520 restants). Un code de vérification sera envoyé au numéro spécifié.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Numéro de téléphone</label>
            <Input placeholder="+224 620 00 00 00" className="h-12 rounded-2xl border-gray-100 dark:border-white/10 shadow-sm" />
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl border-none bg-gray-50 dark:bg-white/5" onClick={() => setIsTestModalOpen(false)}>Fermer</Button>
            <Button 
              className="flex-1 h-12 bg-or-500 text-gray-900 shadow-lg shadow-or-500/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl border-none hover:bg-or-600 hover:scale-[1.02]"
              onClick={() => { setIsTestModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }}
            >
              Envoyer le test
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL : HISTORIQUE EMAIL */}
      <Modal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)}
        size="xl"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-600 dark:text-gray-400 shadow-inner">
              <History size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Historique des envois</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Suivi détaillé des communications</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
           <div className="overflow-hidden rounded-[2rem] border border-gray-100 dark:border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Destinataire</th>
                    <th className="px-6 py-4">Sujet</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {[
                    { to: 'keita@eief.gn', sub: 'Réunion Rentré', date: '02 Avril, 14:00', status: 'Délivré' },
                    { to: 'soumah@gmail.com', sub: 'Fête École', date: '01 Avril, 09:30', status: 'Ouvert' },
                    { to: 'camara@yahoo.fr', sub: 'Alerte Absence', date: '30 Mars, 11:20', status: 'Délivré' },
                  ].map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-semibold italic">
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{h.to}</td>
                      <td className="px-6 py-4 text-gray-500">{h.sub}</td>
                      <td className="px-6 py-4 text-[10px] text-gray-400 uppercase">{h.date}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-vert-50 text-vert-600 border-none px-3 py-1 text-[9px] font-bold uppercase tracking-widest leading-none">
                          {h.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           <div className="flex justify-end">
             <Button variant="outline" className="h-11 rounded-2xl text-[10px] font-bold uppercase tracking-widest px-8" onClick={() => setIsHistoryModalOpen(false)}>Fermer</Button>
           </div>
        </div>
      </Modal>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-vert-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 backdrop-blur-md">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
                <CheckCircle2 size={28} />
              </div>
              <div className="text-left font-bold">
                <p className="text-base tracking-tight">Message transmis !</p>
                <p className="text-[12px] text-white/80 italic">La diffusion a été lancée avec succès.</p>
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
      {/* MODAL : NOUVEAU SUJET FORUM */}
      <Modal 
        isOpen={isAddTopicModalOpen} 
        onClose={() => setIsAddTopicModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600 shadow-inner">
              <MessageSquare size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Nouveau sujet</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Lancer une discussion communautaire</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sujet de discussion</label>
              <Input placeholder="Ex: Organisation de la fête..." className="h-12 rounded-2xl border-gray-100 dark:border-white/10" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Catégorie</label>
              <Select 
                defaultValue="general" 
                className="h-[3.2rem] rounded-2xl border-gray-100 dark:border-white/10"
                options={[
                  { value: 'general', label: 'Général' },
                  { value: 'entraide', label: 'Entraide & Supports' },
                  { value: 'evenement', label: 'Événements' },
                  { value: 'suggestion', label: 'Suggestions' }
                ]}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message initial</label>
            <textarea 
              className="w-full h-32 p-4 rounded-[2rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-bleu-500/20 outline-none transition-all font-semibold italic text-sm"
              placeholder="Décrivez votre sujet ici..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl border-none bg-gray-50 dark:bg-white/5" onClick={() => setIsAddTopicModalOpen(false)}>Annuler</Button>
            <Button 
              className="flex-1 h-12 bg-or-600 text-gray-900 shadow-lg shadow-or-500/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:scale-[1.02]"
              onClick={() => { setIsAddTopicModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }}
            >
              Publier le sujet
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminCommunication;
