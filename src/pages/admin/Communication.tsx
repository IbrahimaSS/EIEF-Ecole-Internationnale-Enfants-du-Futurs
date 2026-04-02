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
  Search, 
  Mail, 
  Smartphone,
  ChevronRight,
  MoreVertical,
  Megaphone
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar } from '../../components/ui';

const AdminCommunication: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'Tous' | 'Annonce' | 'Message' | 'Urgent'>('Tous');

  const messages = [
    { id: 1, titre: 'Réunion Parents-Professeurs', contenu: 'Veuillez noter que la réunion annuelle se tiendra samedi prochain à 10h...', date: 'Aujourd\'hui, 14:30', cible: 'Parents', statut: 'Envoyé', type: 'Annonce', urgent: false },
    { id: 2, titre: 'Mise à jour Emploi du Temps', contenu: 'Les cours de mathématiques de la classe de 3ème A sont déplacés de 8h à 10h...', date: 'Hier, 10:15', cible: 'Élèves', statut: 'Envoyé', type: 'Message', urgent: true },
    { id: 3, titre: 'Fermeture Exceptionnelle', contenu: 'En raison des travaux de voirie, l\'établissement sera fermé exceptionnellement...', date: '25 Mars', cible: 'Tous', statut: 'Programmé', type: 'Annonce', urgent: true },
    { id: 4, titre: 'Lancement Cantine Digitale', contenu: 'Nous avons le plaisir de vous annoncer le lancement du nouveau système...', date: '22 Mars', cible: 'Parents', statut: 'Envoyé', type: 'Annonce', urgent: false },
  ];

  const filteredMessages = messages.filter(m => {
    if (activeFilter === 'Tous') return true;
    if (activeFilter === 'Urgent') return m.urgent;
    return m.type === activeFilter;
  });

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
            <Megaphone className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-semibold gradient-bleu-or-text">Espace Communication</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Annonces globales et messagerie ciblée</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex gap-2 dark:border-white/10 dark:text-white text-[10px] font-semibold   px-5 h-11">
            <Mail size={18} /> Historique Email
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-semibold   text-[10px] h-11 px-6">
            <Send size={18} /> Nouvelle Annonce
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Messages Envoyés"
          value="452"
          subtitle="Ce trimestre"
          icon={<Send />}
          color="bleu"
        />
        <StatCard
          title="Taux d'ouverture"
          value="78%"
          subtitle="Parents & Élèves"
          icon={<Smartphone />}
          color="bleu"
        />
        <StatCard
          title="Alertes Urgentes"
          value="02"
          subtitle="Actives"
          icon={<AlertCircle />}
          color="rouge"
        />
        <StatCard
          title="Canaux Actifs"
          value="3"
          subtitle="Mail, SMS, In-App"
          icon={<MessageSquare />}
          color="or"
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LISTE DES MESSAGES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {['Tous', 'Annonce', 'Message', 'Urgent'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`
                  px-5 py-2.5 rounded-2xl text-[10px] font-semibold   transition-all whitespace-nowrap
                  ${activeFilter === f 
                    ? 'bg-bleu-600 dark:bg-or-500 text-white shadow-lg shadow-bleu-500/20' 
                    : 'bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border border-transparent shadow-soft'
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>

          <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <div className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-transparent">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="p-6 hover:bg-gray-50/80 dark:hover:bg-white/5 transition-all group relative cursor-pointer">
                  {msg.urgent && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rouge-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-5">
                      <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${msg.urgent ? 'bg-rouge-50 dark:bg-rouge-900/20 text-rouge-600 dark:text-rouge-400' : 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600 dark:text-bleu-400'}`}>
                         {msg.type === 'Annonce' ? <Megaphone size={24} /> : <MessageSquare size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white   text-lg">{msg.titre}</h4>
                          {msg.urgent && <Badge variant="error" className="text-[8px] animate-pulse px-2 py-0.5">Urgent</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed font-medium">{msg.contenu}</p>
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2 text-[9px] font-semibold  text-gray-400 dark:text-gray-500 ">
                            <Users size={14} className="text-bleu-500" /> Cible: {msg.cible}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-semibold  text-gray-400 dark:text-gray-500 ">
                            <Clock size={14} className="text-or-500" /> {msg.date}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-semibold  text-vert-500 dark:text-vert-400 ">
                            <CheckCircle2 size={14} /> {msg.statut}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-gray-300 dark:text-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AUDIENCE SUMMARY & SHORTCUTS */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-soft bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-bleu-500/10 rounded-full blur-[40px]" />
             <h3 className="font-semibold   text-[10px] text-bleu-400 mb-8 flex items-center gap-3">
               <Users size={16} />
               Canaux de Diffusion
             </h3>
             <div className="space-y-8">
               {[
                 { label: 'Parents inscrits', count: '1,240', status: '98% Actif', color: 'bg-vert-500' },
                 { label: 'Enseignants connectés', count: '84', status: 'Connectés', color: 'bg-bleu-500' },
                 { label: 'Forfaits SMS restants', count: '8,520', status: 'Pack Pro', color: 'bg-or-500' },
               ].map((c, i) => (
                 <div key={i} className="flex items-center justify-between group cursor-pointer">
                   <div>
                     <p className="text-[10px] font-semibold text-gray-500   mb-1 group-hover:text-bleu-400 transition-colors">{c.label}</p>
                     <p className="text-2xl font-semibold ">{c.count}</p>
                   </div>
                   <Badge variant="default" className="bg-white/5 text-gray-300 border-white/10 text-[8px] font-semibold  px-2">{c.status}</Badge>
                 </div>
               ))}
             </div>
             <Button className="w-full mt-10 bg-white dark:bg-or-500 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-or-400 border-none font-semibold   text-[10px] h-12 flex gap-3 shadow-lg">
               Tester un envoi SMS <ChevronRight size={16} />
             </Button>
          </Card>

          <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
            <h3 className="font-semibold text-gray-900 dark:text-white   mb-6">Alerte Prochaine</h3>
            <div className="p-5 bg-or-50 dark:bg-or-900/20 border border-or-100 dark:border-or-500/20 rounded-3xl flex items-start gap-5">
              <div className="p-3 bg-or-500 text-white rounded-2xl shadow-lg shadow-or-500/20">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-[10px] font-semibold  text-or-600 dark:text-or-400 mb-1 ">Rappel Automatique</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed ">Relance des impayés prévue demain à 09:00.</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </motion.div>
  );
};

export default AdminCommunication;
