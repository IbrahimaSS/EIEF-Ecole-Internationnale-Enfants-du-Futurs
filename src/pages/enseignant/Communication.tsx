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
  ChevronRight,
  Megaphone,
  X,
  Eye,
  CornerDownRight,
  Plus
} from 'lucide-react';
import { Card, Badge, Button, Avatar, Modal, Input } from '../../components/ui';
import { cn } from '../../utils/cn';

const EnseignantCommunication: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'annonces' | 'forum'>('annonces');
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedForumId, setExpandedForumId] = useState<number | null>(null);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);

  const [forumMessages, setForumMessages] = useState([
    { id: 1, user: 'Dr. Keita', role: 'Enseignant', content: 'Quelqu\'un a-t-il les supports pour le cours de demain ?', date: 'il y a 2h', replies: 5, repliesList: [{ id: 101, user: 'Admin EIEF', date: 'il y a 30 min', content: 'Oui, tout est prêt sur le portail ! Vous pouvez les télécharger.' }] },
    { id: 2, user: 'Mme Soumah', role: 'Parent', content: 'La fête de l\'école est-elle toujours maintenue pour vendredi ?', date: 'il y a 4h', replies: 12, repliesList: [] },
  ]);

  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (threadId: number) => {
    if (!replyText.trim()) return;
    setForumMessages(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies + 1,
          repliesList: [...t.repliesList, { id: Date.now(), user: 'Vous', date: 'À l\'instant', content: replyText }]
        };
      }
      return t;
    }));
    setReplyText('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const annonces = [
    { id: 1, titre: 'Réunion parents-professeurs', contenu: 'Veuillez noter que la réunion annuelle se tiendra samedi prochain à 10h. Votre présence est requise.', date: 'Aujourd\'hui, 14:30', expediteur: 'Direction', type: 'Annonce', urgent: false },
    { id: 2, titre: 'Nouveau calendrier scolaire', contenu: 'Le calendrier des examens du second trimestre est désormais disponible.', date: 'Aujourd\'hui, 10:15', expediteur: 'Scolarité', type: 'Message', urgent: false },
    { id: 3, titre: 'Alerte météo : École fermée', contenu: 'En raison des fortes pluies, l\'établissement sera fermé ce jour.', date: 'Hier, 07:30', expediteur: 'Administration', type: 'Urgent', urgent: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="text-left font-bold w-full">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
              <Megaphone size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black gradient-bleu-or-text tracking-tight">Espace Communication</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Consultez les annonces et participez au forum</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
             <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveMainTab('annonces')}
                  className={cn(
                    "text-sm font-bold transition-all relative pb-2",
                    activeMainTab === 'annonces' ? "text-bleu-600 dark:text-or-400" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Annonces & Messages
                  {activeMainTab === 'annonces' && <motion.div layoutId="main-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
                </button>
                <button 
                  onClick={() => setActiveMainTab('forum')}
                  className={cn(
                    "text-sm font-bold transition-all relative pb-2",
                    activeMainTab === 'forum' ? "text-bleu-600 dark:text-or-400" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Espace Forum
                  {activeMainTab === 'forum' && <motion.div layoutId="main-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
                </button>
             </div>
             
             {activeMainTab === 'forum' && (
                <Button 
                   onClick={() => setIsAddTopicModalOpen(true)}
                   className="bg-bleu-600 text-white font-bold h-10 px-6 rounded-xl shadow-lg border-none hover:scale-[1.02] flex items-center gap-2"
                >
                   <Plus size={16} /> Nouveau Sujet
                </Button>
             )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeMainTab === 'annonces' && (
          <motion.div key="annonces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <Card className="p-6 bg-gradient-to-br from-bleu-900 to-indigo-900 text-white border-none shadow-soft flex items-center gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl">
                     <Bell size={24} className="text-or-400" />
                  </div>
                  <div>
                     <p className="text-[11px] font-bold opacity-80">Annonces direction</p>
                     <h3 className="text-2xl font-black">{annonces.filter(a => a.type === 'Annonce').length}</h3>
                  </div>
               </Card>
               <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-4">
                  <div className="p-4 bg-rouge-50 dark:bg-rouge-500/10 rounded-2xl text-rouge-500">
                     <AlertCircle size={24} />
                  </div>
                  <div>
                     <p className="text-[11px] font-bold text-gray-500">Alertes urgentes</p>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white">{annonces.filter(a => a.urgent).length}</h3>
                  </div>
               </Card>
            </div>

            <Card className="p-0 overflow-hidden border-none shadow-soft dark:bg-gray-900/50">
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {annonces.map((msg) => (
                  <div key={msg.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl flex-shrink-0 border shadow-sm ${msg.urgent ? 'bg-rouge-50 border-rouge-100 text-rouge-600 dark:bg-rouge-500/10' : 'bg-white border-gray-100 text-bleu-600 dark:bg-gray-800'}`}>
                          {msg.urgent ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                       </div>
                       <div className="text-left font-bold">
                          <h3 className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                             {msg.titre}
                             {msg.urgent && <Badge variant="error" className="h-5 text-[9px] px-1.5 border-none">URGENT</Badge>}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-semibold line-clamp-1 mt-1 max-w-lg">{msg.contenu}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 justify-end">
                       <div className="text-right">
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white">{msg.expediteur}</p>
                          <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 justify-end mt-0.5">
                             <Clock size={10} /> {msg.date}
                          </p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeMainTab === 'forum' && (
          <motion.div key="forum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <Users className="text-bleu-500" size={24} /> 
               Discussions
            </h2>
            <div className="grid gap-4">
              {forumMessages.map(thread => (
                 <Card key={thread.id} className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm dark:bg-gray-900/50">
                    <div className="p-6">
                       <div className="flex items-start gap-4">
                          <Avatar name={thread.user} size="md" />
                          <div className="flex-1 text-left">
                             <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{thread.user}</h4>
                                <Badge className="bg-gray-100 text-gray-500 font-bold border-none text-[9px] h-5">{thread.role}</Badge>
                                <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1"><Clock size={10} /> {thread.date}</span>
                             </div>
                             <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">{thread.content}</p>
                             
                             <div className="flex gap-4 mt-4">
                                <button 
                                  onClick={() => setExpandedForumId(expandedForumId === thread.id ? null : thread.id)}
                                  className="text-[11px] font-bold text-bleu-600 hover:text-bleu-700 flex items-center gap-1 bg-bleu-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                   <MessageSquare size={12} /> {thread.replies} Réponses
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>

                    <AnimatePresence>
                      {expandedForumId === thread.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5"
                        >
                           <div className="p-6 space-y-4 text-left">
                              {thread.repliesList.map(reply => (
                                 <div key={reply.id} className="flex items-start gap-3 pl-8 relative">
                                    <CornerDownRight className="absolute left-2 top-2 text-gray-300" size={16} />
                                    <Avatar name={reply.user} size="sm" />
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm flex-1 border border-gray-100 dark:border-white/5">
                                       <div className="flex items-center justify-between mb-1">
                                          <span className="text-[11px] font-bold text-gray-900 dark:text-white">{reply.user}</span>
                                          <span className="text-[9px] font-semibold text-gray-400">{reply.date}</span>
                                       </div>
                                       <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{reply.content}</p>
                                    </div>
                                 </div>
                              ))}

                              {/* Formulaire de réponse */}
                              <div className="pl-8 pt-4 flex gap-3">
                                 <Avatar name="Vous" size="sm" />
                                 <div className="flex-1 relative">
                                    <Input 
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Votre réponse..." 
                                      className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white dark:bg-gray-800 text-sm font-semibold border-gray-200 dark:border-white/10"
                                      onKeyDown={(e) => {
                                         if (e.key === 'Enter') handleReplySubmit(thread.id);
                                      }}
                                    />
                                    <button 
                                      onClick={() => handleReplySubmit(thread.id)}
                                      className="absolute right-2 top-1.5 p-1.5 bg-bleu-600 text-white rounded-xl hover:bg-bleu-700 transition-colors"
                                    >
                                       <Send size={14} />
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

      <Modal isOpen={isAddTopicModalOpen} onClose={() => setIsAddTopicModalOpen(false)} title="Nouveau Sujet">
         <div className="space-y-4">
            <Input placeholder="Titre de votre sujet" className="font-semibold" />
            <textarea placeholder="Exprimez-vous..." className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-sm font-semibold focus:border-bleu-500 focus:ring-1 focus:ring-bleu-500 outline-none resize-none"></textarea>
            <div className="flex justify-end pt-4">
               <Button className="bg-bleu-600 text-white font-bold px-6 border-none" onClick={() => setIsAddTopicModalOpen(false)}>Publier</Button>
            </div>
         </div>
      </Modal>

      {/* TOAST SUCCESS */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-vert-100 min-w-[300px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-vert-100 text-vert-500 rounded-xl">
                <CheckCircle2 size={24} />
              </div>
              <div className="text-left font-bold">
                <p className="text-sm text-gray-900 dark:text-white">Réponse envoyée</p>
                <p className="text-[11px] text-gray-500 font-semibold">Votre message est publié</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnseignantCommunication;
