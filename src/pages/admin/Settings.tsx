import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Bell, 
  Building2, 
  Key, 
  History, 
  Save, 
  RefreshCw, 
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar } from '../../components/ui';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'systeme' | 'securite' | 'donnees' | 'logs'>('systeme');

  const auditLogs = [
    { id: 1, action: 'Modification de note', utilisateur: 'Admin Soumah', date: 'Hier, 16:20', statut: 'Confirmé', module: 'Scolarité' },
    { id: 2, action: 'Nouvel élève inscrit', utilisateur: 'Admin Soumah', date: 'Hier, 11:30', statut: 'Confirmé', module: 'Élèves' },
    { id: 3, action: 'Suppression transaction', utilisateur: 'Admin Soumah', date: '25 Mars, 09:12', statut: 'Alerte', module: 'Finance' },
    { id: 4, action: 'Modif. Menu Cantine', utilisateur: 'Resp. Cantine', date: '24 Mars, 14:00', statut: 'Confirmé', module: 'Cantine' },
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
            <SettingsIcon className="text-gray-900 dark:text-white" size={28} />
            <h1 className="text-xl font-semibold gradient-bleu-or-text">Configuration Système</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Administration générale, sécurité et maintenance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex gap-2 dark:border-white/10 dark:text-white text-[10px] font-semibold   px-5 h-11">
            <RefreshCw size={18} /> Réinitialiser
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-or-600 dark:to-or-400 shadow-xl border-none font-semibold   text-[10px] h-11 px-6">
            <Save size={18} /> Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* NAV SIDEBAR SETTINGS */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 'systeme', label: 'Établissement', icon: Building2 },
            { id: 'securite', label: 'Sécurité & Accès', icon: Shield },
            { id: 'donnees', label: 'Gestion Données', icon: Database },
            { id: 'logs', label: 'Logs d\'Audit', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-semibold   transition-all
                ${activeTab === tab.id 
                  ? 'bg-white dark:bg-or-500 text-bleu-600 dark:text-white shadow-soft border-l-4 border-bleu-600 dark:border-white' 
                  : 'text-gray-400 dark:text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300 border-l-4 border-transparent'
                }
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* SETTINGS CONTENT */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'systeme' && (
              <motion.div
                key="systeme"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8 border-none shadow-soft space-y-8 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 group hover:border-bleu-200 dark:hover:border-or-500/50 transition-all">
                        <label className="text-[9px] font-semibold  text-gray-400 dark:text-gray-500  block mb-1">Nom de l'établissement</label>
                        <input type="text" defaultValue="Écoles Internationales Enfants du Futur" className="w-full bg-transparent font-semibold text-gray-900 dark:text-white border-none outline-none p-0 focus:ring-0  " />
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 group hover:border-bleu-200 dark:hover:border-or-500/50 transition-all">
                        <label className="text-[9px] font-semibold  text-gray-400 dark:text-gray-500  block mb-1">Slogan / Devise</label>
                        <input type="text" defaultValue="Faisons Plus !" className="w-full bg-transparent font-semibold text-gray-900 dark:text-white border-none outline-none p-0 focus:ring-0 italic" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 relative group cursor-pointer hover:border-bleu-400 dark:hover:border-or-500 transition-all">
                       <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 overflow-hidden mb-4 group-hover:scale-110 transition-transform">
                          <img src="/logo_eief.jpeg" alt="Logo" className="w-full h-full object-contain" />
                       </div>
                       <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500  ">Logo Principal</p>
                       <div className="absolute inset-0 bg-bleu-600/0 dark:bg-or-500/0 group-hover:bg-bleu-600/5 dark:group-hover:bg-or-500/5 transition-all rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <RefreshCw className="text-bleu-600 dark:text-or-400 animate-spin-slow" />
                       </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                        <label className="text-[9px] font-semibold  text-gray-400 dark:text-gray-500  block mb-1">Email Administrative</label>
                        <input type="email" defaultValue="admin@eief.edu.gn" className="w-full bg-transparent font-semibold text-gray-900 dark:text-white border-none outline-none p-0 focus:ring-0" />
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                        <label className="text-[9px] font-semibold  text-gray-400 dark:text-gray-500  block mb-1">Téléphone</label>
                        <input type="text" defaultValue="+224 622 00 00 00" className="w-full bg-transparent font-semibold text-gray-900 dark:text-white border-none outline-none p-0 focus:ring-0" />
                      </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'securite' && (
              <motion.div
                key="securite"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-8 border-none shadow-soft space-y-6 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <div className="flex items-center gap-5 p-5 border border-gray-100 dark:border-white/5 rounded-3xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="p-4 bg-red-100 dark:bg-rouge-900/20 text-red-600 dark:text-rouge-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <Lock size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white  ">Authentification à deux facteurs</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Renforcez la sécurité des comptes administrateurs.</p>
                    </div>
                    <Badge variant="default" className="bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 font-semibold  text-[9px]">Désactivé</Badge>
                  </div>

                  <div className="flex items-center gap-5 p-5 border border-gray-100 dark:border-white/5 rounded-3xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="p-4 bg-bleu-100 dark:bg-bleu-900/20 text-bleu-600 dark:text-bleu-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <UserCheck size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white  ">Gestion des Rôles</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Définissez qui peut accéder à quoi (8 rôles définis).</p>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 dark:text-gray-700 group-hover:text-gray-900 dark:group-hover:text-white transition-all shadow-sm" />
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
                   <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-transparent text-gray-900 dark:text-white font-semibold  text-[10px] ">
                      Journal d'audit système
                      <Search size={18} className="text-gray-400 dark:text-gray-600" />
                   </div>
                   <div className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-transparent">
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-6 hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-5">
                              <div className={`p-3 rounded-xl shadow-sm transition-transform group-hover:scale-110 ${log.statut === 'Alerte' ? 'bg-rouge-100 dark:bg-rouge-900/20 text-rouge-600 dark:text-rouge-400' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                                 <History size={20} />
                              </div>
                              <div>
                                 <p className="font-semibold text-gray-900 dark:text-white  ">{log.action}</p>
                                 <p className="text-[9px] font-semibold  text-gray-400 dark:text-gray-500 ">{log.utilisateur} • {log.date}</p>
                              </div>
                           </div>
                           <Badge variant={log.statut === 'Confirmé' ? 'success' : 'error'} className="text-[9px]  font-semibold px-2">{log.statut}</Badge>
                        </div>
                      ))}
                   </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};

export default AdminSettings;
