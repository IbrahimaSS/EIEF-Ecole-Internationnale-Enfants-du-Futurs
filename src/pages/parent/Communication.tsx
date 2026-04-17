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
  Megaphone,
  CornerDownRight,
  Search,
  Paperclip,
  GraduationCap
} from 'lucide-react';
import { Card, Badge, Button, Avatar, Input } from '../../components/ui';
import { cn } from '../../utils/cn';

const ParentCommunication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'annonces' | 'messagerie' | 'forum'>('annonces');
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedForumId, setExpandedForumId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [searchConversation, setSearchConversation] = useState('');

  // ANNONCES (lecture seule)
  const annonces = [
    { id: 1, titre: 'Réunion Parents-Professeurs', contenu: 'La réunion trimestrielle se tiendra ce samedi de 09h à 12h dans les salles de classe respectives. Votre présence est vivement souhaitée.', date: "Aujourd'hui, 09:00", expediteur: 'Direction', urgent: false },
    { id: 2, titre: 'Nouveau calendrier d\'examens', contenu: 'Le calendrier des examens du 2nd semestre est disponible. Consultez-le dans l\'onglet Documents.', date: "Hier, 14:30", expediteur: 'Scolarité', urgent: false },
    { id: 3, titre: 'Alerte météo : Cours suspendus', contenu: 'En raison des fortes pluies annoncées, les cours de demain matin sont suspendus jusqu\'à 10h.', date: "02 Avr, 18:00", expediteur: 'Administration', urgent: true },
    { id: 4, titre: 'Inscription cantine', contenu: 'Les inscriptions pour la cantine du mois de mai sont ouvertes. Merci de régler avant le 25 avril.', date: "01 Avr, 10:00", expediteur: 'Intendance', urgent: false },
  ];

  // MESSAGERIE (conversations avec les profs)
  const [conversations] = useState([
    { 
      id: 1, 
      enseignant: 'Mme Aïssatou Diallo', 
      matiere: 'Mathématiques', 
      enfant: 'Aïssatou', 
      lastMessage: 'Bonjour M. Bah, je voulais vous informer que les résultats du devoir seront disponibles lundi.', 
      time: 'il y a 30 min', 
      unread: true,
      messages: [
        { id: 1, sender: 'enseignant', text: 'Bonjour M. Bah, comment allez-vous ?', time: '10:00' },
        { id: 2, sender: 'parent', text: 'Bonjour Mme Diallo ! Très bien, merci. Je voulais savoir comment Aïssatou se comporte en classe ?', time: '10:05' },
        { id: 3, sender: 'enseignant', text: 'Aïssatou est une élève très sérieuse. Elle participe activement et ses résultats sont excellents. Elle est dans le top 5 de la classe.', time: '10:15' },
        { id: 4, sender: 'parent', text: 'Merci beaucoup, ça me rassure ! Et pour le devoir de ce samedi ?', time: '10:20' },
        { id: 5, sender: 'enseignant', text: 'Bonjour M. Bah, je voulais vous informer que les résultats du devoir seront disponibles lundi.', time: '14:30' },
      ]
    },
    { 
      id: 2, 
      enseignant: 'M. Ibrahima Sow', 
      matiere: 'Français', 
      enfant: 'Mamadou', 
      lastMessage: 'Mamadou doit rattraper le devoir qu\'il a manqué la semaine dernière.', 
      time: 'il y a 2h', 
      unread: true,
      messages: [
        { id: 1, sender: 'enseignant', text: 'Bonjour M. Bah, Mamadou a été absent mardi dernier. Il doit rattraper le devoir de conjugaison.', time: '09:00' },
        { id: 2, sender: 'enseignant', text: 'Mamadou doit rattraper le devoir qu\'il a manqué la semaine dernière.', time: '12:00' },
      ]
    },
    { 
      id: 3, 
      enseignant: 'Mme Fatoumata Camara', 
      matiere: 'Physique-Chimie', 
      enfant: 'Aïssatou', 
      lastMessage: 'Pas de souci, les TP seront reportés à vendredi.', 
      time: 'Hier', 
      unread: false,
      messages: [
        { id: 1, sender: 'parent', text: 'Bonjour Madame, Aïssatou ne pourra pas être présente au TP de jeudi.', time: '16:00' },
        { id: 2, sender: 'enseignant', text: 'Pas de souci, les TP seront reportés à vendredi.', time: '16:30' },
      ]
    },
  ]);

  // FORUM (lecture + réponse uniquement)
  const [forumMessages, setForumMessages] = useState([
    { id: 1, user: 'Direction', role: 'Admin', content: 'Rappel : Les parents souhaitant participer au comité de l\'école peuvent s\'inscrire avant vendredi auprès de Mme Sylla.', date: 'il y a 3h', replies: 8, repliesList: [
      { id: 101, user: 'Mme Condé', date: 'il y a 1h', content: 'Je suis intéressée, comment s\'inscrire concrètement ?' },
      { id: 102, user: 'Admin EIEF', date: 'il y a 30 min', content: 'Passez directement au secrétariat ou envoyez un email.' },
    ]},
    { id: 2, user: 'Mme Touré', role: 'Parent', content: 'Bonjour à tous ! Quelqu\'un sait-il si les uniformes doivent être changés pour le 2nd semestre ?', date: 'il y a 5h', replies: 3, repliesList: [
      { id: 201, user: 'M. Diallo', date: 'il y a 4h', content: 'Non, les mêmes uniformes restent valables jusqu\'à la fin de l\'année.' },
    ]},
    { id: 3, user: 'Dr. Keita', role: 'Enseignant', content: 'Les supports de révision pour le bac blanc sont disponibles sur le portail. Pensez à les imprimer pour vos enfants !', date: 'Hier', replies: 15, repliesList: [] },
  ]);

  const handleReplySubmit = (threadId: number) => {
    if (!replyText.trim()) return;
    setForumMessages(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies + 1,
          repliesList: [...t.repliesList, { id: Date.now(), user: 'Mamadou Bah', date: 'À l\'instant', content: replyText }]
        };
      }
      return t;
    }));
    setReplyText('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setNewMessage('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const filteredConversations = conversations.filter(c => 
    c.enseignant.toLowerCase().includes(searchConversation.toLowerCase()) ||
    c.matiere.toLowerCase().includes(searchConversation.toLowerCase()) ||
    c.enfant.toLowerCase().includes(searchConversation.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <Megaphone size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Communication</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Annonces, messagerie enseignants et forum parents</p>
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
              {tab === 'annonces' ? 'Annonces' : tab === 'messagerie' ? 'Mes Enseignants' : 'Forum Parents'}
              {activeTab === tab && <motion.div layoutId="parent-comm-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ========== ANNONCES (LECTURE SEULE) ========== */}
        {activeTab === 'annonces' && (
          <motion.div key="annonces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <Card className="p-5 bg-gradient-to-br from-bleu-900 to-indigo-900 text-white border-none shadow-soft flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl"><Bell size={22} className="text-or-400" /></div>
                  <div>
                     <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Annonces</p>
                     <h3 className="text-2xl font-black">{annonces.length}</h3>
                  </div>
               </Card>
               <Card className="p-5 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 shadow-soft flex items-center gap-4">
                  <div className="p-3 bg-rouge-50 dark:bg-rouge-900/10 rounded-2xl text-rouge-500"><AlertCircle size={22} /></div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Urgentes</p>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white">{annonces.filter(a => a.urgent).length}</h3>
                  </div>
               </Card>
               <Card className="p-5 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 shadow-soft flex items-center gap-4">
                  <div className="p-3 bg-vert-50 dark:bg-vert-900/10 rounded-2xl text-vert-500"><CheckCircle2 size={22} /></div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lues</p>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white">{annonces.length - 1}</h3>
                  </div>
               </Card>
            </div>

            <Card className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {annonces.map((msg) => (
                  <div key={msg.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl flex-shrink-0 ${msg.urgent ? 'bg-rouge-50 text-rouge-600 dark:bg-rouge-900/10' : 'bg-bleu-50 text-bleu-600 dark:bg-bleu-900/10'}`}>
                          {msg.urgent ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                       </div>
                       <div className="text-left font-bold">
                          <h3 className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                             {msg.titre}
                             {msg.urgent && <Badge className="bg-rouge-100 text-rouge-600 border-none h-5 text-[9px] px-1.5 font-bold">Urgent</Badge>}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-semibold line-clamp-1 mt-1 max-w-lg">{msg.contenu}</p>
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

        {/* ========== MESSAGERIE ENSEIGNANTS ========== */}
        {activeTab === 'messagerie' && (
          <motion.div key="messagerie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
              <div className="flex h-[520px]">
                
                {/* LISTE DES CONVERSATIONS */}
                <div className="w-80 border-r border-gray-100 dark:border-white/5 flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-white/5">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        value={searchConversation}
                        onChange={(e) => setSearchConversation(e.target.value)}
                        placeholder="Rechercher un enseignant..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl text-[12px] font-semibold text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-bleu-500/30 border border-transparent focus:border-bleu-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                    {filteredConversations.map(conv => (
                      <button 
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={cn(
                          "w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors",
                          selectedConversation === conv.id && "bg-bleu-50/50 dark:bg-bleu-900/10 border-l-2 border-l-bleu-500"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar name={conv.enseignant} size="md" className="flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-[12px] font-bold text-gray-900 dark:text-white truncate">{conv.enseignant}</h4>
                              {conv.unread && <div className="w-2 h-2 bg-bleu-500 rounded-full flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Badge className="bg-gray-100 dark:bg-white/10 text-gray-500 border-none text-[8px] font-bold h-4 px-1.5">{conv.matiere}</Badge>
                              <span className="text-[9px] text-gray-400 font-semibold">• {conv.enfant}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-semibold truncate leading-relaxed">{conv.lastMessage}</p>
                            <p className="text-[9px] text-gray-400 font-semibold mt-1.5 flex items-center gap-1"><Clock size={9}/> {conv.time}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ZONE DE CHAT */}
                <div className="flex-1 flex flex-col">
                  {selectedConv ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center gap-4">
                        <Avatar name={selectedConv.enseignant} size="md" />
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{selectedConv.enseignant}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <GraduationCap size={12} className="text-bleu-500" />
                            <span className="text-[10px] font-semibold text-gray-500">{selectedConv.matiere} • {selectedConv.enfant}</span>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {selectedConv.messages.map(msg => (
                          <div key={msg.id} className={cn("flex", msg.sender === 'parent' ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                              "max-w-[75%] p-3.5 rounded-2xl text-sm font-semibold shadow-sm",
                              msg.sender === 'parent' 
                                ? 'bg-bleu-600 text-white rounded-br-md' 
                                : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-bl-md border border-gray-100 dark:border-white/10'
                            )}>
                              <p className="leading-relaxed">{msg.text}</p>
                              <p className={cn(
                                "text-[9px] font-semibold mt-2",
                                msg.sender === 'parent' ? 'text-bleu-200' : 'text-gray-400'
                              )}>{msg.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                          <button className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                            <Paperclip size={18} />
                          </button>
                          <div className="flex-1 relative">
                            <input 
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                              placeholder="Écrire un message..."
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-bleu-500/30 border border-transparent focus:border-bleu-500"
                            />
                          </div>
                          <button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="p-2.5 bg-bleu-600 hover:bg-bleu-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-md"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center p-8">
                      <div>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare size={32} className="text-gray-300" />
                        </div>
                        <p className="font-bold text-gray-400">Sélectionnez une conversation</p>
                        <p className="text-[11px] text-gray-400 font-semibold mt-1">Choisissez un enseignant pour voir la discussion</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ========== FORUM PARENTS ========== */}
        {activeTab === 'forum' && (
          <motion.div key="forum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-bleu-500" size={22} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Discussions communautaires</h2>
            </div>

            <div className="space-y-4">
              {forumMessages.map(thread => (
                <Card key={thread.id} className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm dark:bg-gray-900/50">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar name={thread.user} size="md" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{thread.user}</h4>
                          <Badge className={cn(
                            "font-bold border-none text-[9px] h-5",
                            thread.role === 'Admin' ? 'bg-or-50 text-or-600 dark:bg-or-900/20 dark:text-or-400' 
                            : thread.role === 'Enseignant' ? 'bg-bleu-50 text-bleu-600 dark:bg-bleu-900/20 dark:text-bleu-400' 
                            : 'bg-gray-100 text-gray-500 dark:bg-white/10'
                          )}>{thread.role}</Badge>
                          <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1"><Clock size={10} /> {thread.date}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{thread.content}</p>

                        <button 
                          onClick={() => setExpandedForumId(expandedForumId === thread.id ? null : thread.id)}
                          className="mt-4 text-[11px] font-bold text-bleu-600 hover:text-bleu-700 flex items-center gap-1 bg-bleu-50 dark:bg-bleu-900/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <MessageSquare size={12} /> {thread.replies} Réponses
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedForumId === thread.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5"
                      >
                        <div className="p-5 space-y-4 text-left">
                          {thread.repliesList.map(reply => (
                            <div key={reply.id} className="flex items-start gap-3 pl-8 relative">
                              <CornerDownRight className="absolute left-2 top-2 text-gray-300 dark:text-gray-600" size={16} />
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
                          <div className="pl-8 pt-2 flex gap-3">
                            <Avatar name="Mamadou Bah" size="sm" />
                            <div className="flex-1 relative">
                              <input 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Votre réponse..." 
                                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white dark:bg-gray-800 text-sm font-semibold border border-gray-200 dark:border-white/10 outline-none focus:border-bleu-500 focus:ring-1 focus:ring-bleu-500/30"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleReplySubmit(thread.id);
                                }}
                              />
                              <button 
                                onClick={() => handleReplySubmit(thread.id)}
                                className="absolute right-2 top-1.5 p-2 bg-bleu-600 text-white rounded-xl hover:bg-bleu-700 transition-colors"
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
              <div className="p-2 bg-vert-100 text-vert-500 rounded-xl">
                <CheckCircle2 size={24} />
              </div>
              <div className="text-left font-bold">
                <p className="text-sm text-gray-900 dark:text-white">Message envoyé</p>
                <p className="text-[11px] text-gray-500 font-semibold">Votre message a été transmis</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ParentCommunication;
