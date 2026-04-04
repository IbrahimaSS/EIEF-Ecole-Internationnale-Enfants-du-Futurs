import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Users, 
  AlertCircle, 
  Clock, 
  Megaphone,
  CornerDownRight,
  Search,
  Paperclip,
  UserCheck
} from 'lucide-react';
import { Card, Badge, Button, Avatar, Input } from '../../components/ui';
import { cn } from '../../utils/cn';

const EleveCommunication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'annonces' | 'messagerie' | 'forum'>('annonces');
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedForumId, setExpandedForumId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [searchConversation, setSearchConversation] = useState('');

  // ANNONCES (lecture seule)
  const annonces = [
    { id: 1, titre: 'Examen blanc - Planning', contenu: 'Le planning définitif des examens blancs est affiché devant la vie scolaire et disponible sur le portail.', date: "Aujourd'hui, 11:30", expediteur: 'Scolarité', urgent: true },
    { id: 2, titre: 'Sortie pédagogique au Musée', contenu: 'Prévue pour le vendredi 10 mai, le départ est prévu à 08h précises.', date: "Hier, 16:00", expediteur: 'Administration', urgent: false },
    { id: 3, titre: 'Cours de Rattrapage (Maths)', contenu: 'M. Diallo organisera un cours de soutien ce mercredi à 14h en salle 402 pour les 3èmes.', date: "02 Avr, 10:00", expediteur: 'Direction', urgent: false },
  ];

  // MESSAGERIE (conversations avec les profs)
  const [conversations] = useState([
    { 
      id: 1, 
      enseignant: 'Pr. Diallo', 
      matiere: 'Mathématiques', 
      lastMessage: 'Bonjour Fatoumata, n\'oublie pas d\'amener ton compas demain.', 
      time: 'il y a 20 min', 
      unread: true,
      messages: [
        { id: 1, sender: 'prof', text: 'Bonjour Fatoumata !', time: '10:00' },
        { id: 2, sender: 'eleve', text: 'Bonjour Monsieur ! J\'ai une question sur l\'exercice 4 du DM...', time: '10:05' },
        { id: 3, sender: 'prof', text: 'Regarde bien la formule de Thalès, tu as une erreur de calcul au début.', time: '10:15' },
        { id: 4, sender: 'prof', text: 'Bonjour Fatoumata, n\'oublie pas d\'amener ton compas demain.', time: '14:30' },
      ]
    },
    { 
      id: 2, 
      enseignant: 'Dr. Condé', 
      matiere: 'Physique-Chimie', 
      lastMessage: 'Ton compte-rendu de TP est excellent, bravo !', 
      time: 'Hier', 
      unread: false,
      messages: [
        { id: 1, sender: 'prof', text: 'Ton compte-rendu de TP est excellent, bravo !', time: '12:00' },
      ]
    }
  ]);

  // FORUM (lecture + réponse uniquement)
  const [forumMessages, setForumMessages] = useState([
    { id: 1, user: 'Scolarité', role: 'Admin', content: 'On cherche des volontaires pour organiser la fête de fin d\'année !', date: 'il y a 5h', replies: 12, repliesList: [
      { id: 101, user: 'Camara Aly', date: 'il y a 1h', content: 'Moi je veux bien aider pour la déco !' },
    ]},
    { id: 2, user: 'Kaba Ibrahima', role: 'Eleve', content: 'Est-ce que quelqu\'un a les notes du cours d\'Histoire de ce matin ? J\'étais à l\'infirmerie.', date: 'il y a 8h', replies: 3, repliesList: [
      { id: 201, user: 'Touré Mariam', date: 'il y a 4h', content: 'Oui je te les envoie sur WhatsApp.' },
    ]}
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setNewMessage('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleReplySubmit = (threadId: number) => {
    if (!replyText.trim()) return;
    setForumMessages(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies + 1,
          repliesList: [...t.repliesList, { id: Date.now(), user: 'Fatoumata Camara', date: 'À l\'instant', content: replyText }]
        };
      }
      return t;
    }));
    setReplyText('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const filteredConversations = conversations.filter(c => 
    c.enseignant.toLowerCase().includes(searchConversation.toLowerCase()) ||
    c.matiere.toLowerCase().includes(searchConversation.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <Megaphone size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Espace Echanges</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Annonces, questions aux profs et entraide élèves</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {(['annonces', 'messagerie', 'forum'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-sm font-bold transition-all relative pb-2 capitalize",
                activeTab === tab ? "text-bleu-600 dark:text-or-400" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab === 'annonces' ? 'Annonces EIEF' : tab === 'messagerie' ? 'Mes Professeurs' : 'Forum Entraide'}
              {activeTab === tab && <motion.div layoutId="eleve-comm-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ========== ANNONCES ========== */}
        {activeTab === 'annonces' && (
          <motion.div key="annonces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <Card className="p-6 bg-gradient-to-br from-bleu-900 to-indigo-900 text-white border-none shadow-soft flex items-center gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl"><Bell size={24} className="text-or-400" /></div>
                  <div>
                     <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Messages officiels</p>
                     <h3 className="text-2xl font-black">{annonces.length}</h3>
                  </div>
               </Card>
               <Card className="p-6 bg-white dark:bg-gray-900/50 border-none shadow-soft flex items-center gap-4">
                  <div className="p-4 bg-rouge-50 dark:bg-rouge-900/20 text-rouge-500 rounded-2xl"><AlertCircle size={24} /></div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Alertes urgentes</p>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white">{annonces.filter(a => a.urgent).length}</h3>
                  </div>
               </Card>
            </div>

            <Card className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50">
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {annonces.map((msg) => (
                  <div key={msg.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl flex-shrink-0 ${msg.urgent ? 'bg-rouge-50 text-rouge-600 dark:bg-rouge-900/10' : 'bg-bleu-50 text-bleu-600 dark:bg-bleu-900/10'}`}>
                          {msg.urgent ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                       </div>
                       <div className="text-left font-bold">
                          <h3 className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                             {msg.titre}
                             {msg.urgent && <Badge className="bg-rouge-600 text-white border-none text-[8px] px-1.5 h-5 font-black">IMPORTANT</Badge>}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-semibold line-clamp-1 mt-1 max-w-lg leading-relaxed">{msg.contenu}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 justify-end flex-shrink-0">
                       <div className="text-right">
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white">{msg.expediteur}</p>
                          <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 justify-end mt-0.5"><Clock size={10} /> {msg.date}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ========== MESSAGERIE PROFS ========== */}
        {activeTab === 'messagerie' && (
          <motion.div key="messagerie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50 h-[550px] flex">
               {/* SIDEBAR CONVS */}
               <div className="w-80 border-r border-gray-100 dark:border-white/5 h-full flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-white/5">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        value={searchConversation}
                        onChange={(e) => setSearchConversation(e.target.value)}
                        placeholder="Chercher un prof..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-bleu-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                     {filteredConversations.map(conv => (
                       <button 
                         key={conv.id}
                         onClick={() => setSelectedConversation(conv.id)}
                         className={cn(
                           "w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all relative overflow-hidden",
                           selectedConversation === conv.id && "bg-bleu-50/50 dark:bg-bleu-900/10"
                         )}
                       >
                          {selectedConversation === conv.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-bleu-600" />}
                          <div className="flex gap-3">
                             <Avatar name={conv.enseignant} size="md" />
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                   <p className="text-xs font-black text-gray-900 dark:text-white">{conv.enseignant}</p>
                                   {conv.unread && <div className="w-2 h-2 bg-bleu-500 rounded-full" />}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mb-2">{conv.matiere}</p>
                                <p className="text-[11px] font-semibold text-gray-500 line-clamp-1">{conv.lastMessage}</p>
                             </div>
                          </div>
                       </button>
                     ))}
                  </div>
               </div>
               
               {/* CHAT AREA */}
               <div className="flex-1 h-full flex flex-col relative">
                  {selectedConv ? (
                    <>
                       <div className="p-4 border-b border-gray-50 dark:border-white/5 flex items-center gap-3">
                          <Avatar name={selectedConv.enseignant} size="md" />
                          <div className="text-left font-bold">
                             <p className="text-sm text-gray-900 dark:text-white">{selectedConv.enseignant}</p>
                             <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <UserCheck size={10} className="text-vert-500" /> Enseignant en ligne
                             </div>
                          </div>
                       </div>
                       <div className="flex-1 p-6 overflow-y-auto space-y-6">
                          {selectedConv.messages.map(m => (
                            <div key={m.id} className={cn("flex", m.sender === 'eleve' ? 'justify-end' : 'justify-start')}>
                               <div className={cn(
                                 "max-w-[75%] p-4 rounded-3xl text-sm font-semibold shadow-sm",
                                 m.sender === 'eleve' 
                                   ? 'bg-bleu-600 text-white rounded-br-md text-right' 
                                   : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-bl-md text-left'
                               )}>
                                  <p className="leading-relaxed">{m.text}</p>
                                  <p className={cn("text-[9px] mt-2 font-bold opacity-60", m.sender === 'eleve' ? 'text-white' : 'text-gray-400')}>{m.time}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                       <div className="p-4 border-t border-gray-50 dark:border-white/5">
                          <div className="flex items-center gap-3">
                             <button className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-2xl hover:text-gray-900 transition-colors"><Paperclip size={18} /></button>
                             <div className="flex-1 relative">
                                <input 
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  placeholder="Pose ta question..."
                                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-bleu-500/20"
                                  onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }}
                                />
                             </div>
                             <button onClick={handleSendMessage} className="p-3 bg-bleu-600 text-white rounded-2xl hover:bg-bleu-700 transition-shadow shadow-lg shadow-bleu-500/30">
                                <Send size={18} />
                             </button>
                          </div>
                       </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                       <MessageSquare size={100} strokeWidth={0.5} />
                       <p className="mt-4 font-black">Choisis une discussion</p>
                    </div>
                  )}
               </div>
            </Card>
          </motion.div>
        )}

        {/* ========== FORUM ========== */}
        {activeTab === 'forum' && (
          <motion.div key="forum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white px-2">Espace d'entraide entre élèves</h2>
            <div className="space-y-4">
               {forumMessages.map(thread => (
                 <Card key={thread.id} className="p-0 overflow-hidden border-none shadow-soft bg-white dark:bg-gray-900/50">
                    <div className="p-6 text-left">
                       <div className="flex items-start gap-4">
                          <Avatar name={thread.user} size="md" />
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                   <p className="text-sm font-black text-gray-900 dark:text-white">{thread.user}</p>
                                   <Badge className={cn("bg-gray-100 text-gray-500 border-none font-black text-[8px] h-5 px-1.5", thread.role === 'Admin' && 'bg-or-50 text-or-600')}>
                                      {thread.role}
                                   </Badge>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{thread.date}</span>
                             </div>
                             <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">{thread.content}</p>
                             <button 
                               onClick={() => setExpandedForumId(expandedForumId === thread.id ? null : thread.id)}
                               className="mt-4 text-[11px] font-black text-bleu-600 bg-bleu-50 px-3 py-1.5 rounded-xl hover:bg-bleu-100 transition-colors flex items-center gap-2"
                             >
                                <MessageSquare size={12} /> {thread.replies} Réponses
                             </button>
                          </div>
                       </div>
                    </div>

                    <AnimatePresence>
                       {expandedForumId === thread.id && (
                         <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                            <div className="p-6 space-y-6">
                               {thread.repliesList.map(item => (
                                 <div key={item.id} className="flex gap-4 pl-8 relative">
                                    <div className="absolute left-2 top-2 text-gray-200"><CornerDownRight size={20} /></div>
                                    <Avatar name={item.user} size="sm" />
                                    <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-50 text-left">
                                       <div className="flex items-center justify-between mb-1">
                                          <p className="text-xs font-black text-gray-900 dark:text-white">{item.user}</p>
                                          <p className="text-[9px] font-bold text-gray-400">{item.date}</p>
                                       </div>
                                       <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 leading-relaxed">{item.content}</p>
                                    </div>
                                 </div>
                               ))}
                               <div className="pl-8 pt-4 flex gap-4">
                                  <Avatar name="Fatoumata Camara" size="sm" />
                                  <div className="flex-1 relative">
                                     <input 
                                       value={replyText}
                                       onChange={(e) => setReplyText(e.target.value)}
                                       onKeyDown={(e) => { if(e.key === 'Enter') handleReplySubmit(thread.id); }}
                                       placeholder="Ajoute ton aide..."
                                       className="w-full pl-5 pr-12 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl text-xs font-semibold shadow-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-bleu-500/20"
                                     />
                                     <button onClick={() => handleReplySubmit(thread.id)} className="absolute right-1.5 top-1.5 p-2 bg-bleu-600 text-white rounded-xl"><Send size={12} /></button>
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

      {/* TOAST SUCCESS */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-vert-100 min-w-[300px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-vert-100 text-vert-500 rounded-xl"><UserCheck size={24} /></div>
              <div className="text-left font-bold">
                <p className="text-sm text-gray-900 dark:text-white">Message envoyé</p>
                <p className="text-[11px] text-gray-500 font-semibold">Ton message a été publié</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EleveCommunication;
