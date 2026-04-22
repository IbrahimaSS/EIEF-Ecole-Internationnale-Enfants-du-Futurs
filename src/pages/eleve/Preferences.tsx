import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Lock, 
  Smartphone, 
  Mail,
  Save,
  CheckCircle2,
  Settings,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';

const ElevePreferences: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [emailNotif, setEmailNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [noteNotif, setNoteNotif] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1200);
  };

  const Toggle = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-all relative flex items-center ${active ? 'bg-bleu-600 shadow-inner' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <span className={`w-5 h-5 rounded-full bg-white shadow-xl absolute transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <Settings size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight text-left">Réglages Système</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1 text-left">Personnalise ton expérience sur le portail</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-bleu-600 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-bleu-500/20 border-none hover:scale-[1.02] px-8 h-12"
        >
          {isSaving ? 'Enregistrement...' : <><Save size={16} className="mr-2" /> Enregistrer</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* APPARENCE */}
         <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-bleu-50 dark:bg-bleu-900/10 text-bleu-500 rounded-2xl"><Moon size={22} /></div>
               <h2 className="text-lg font-black text-gray-900 dark:text-white">Apparence</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
               {[
                 { key: 'light' as const, icon: Sun, label: 'Clair' },
                 { key: 'dark' as const, icon: Moon, label: 'Sombre' },
                 { key: 'system' as const, icon: Monitor, label: 'Auto' },
               ].map(t => (
                 <button 
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${theme === t.key ? 'border-bleu-500 bg-bleu-50/50 dark:bg-bleu-900/20 text-bleu-600' : 'border-gray-50 dark:border-white/5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                 >
                    <t.icon size={28} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                 </button>
               ))}
            </div>
         </Card>

         {/* NOTIFICATIONS */}
         <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-or-50 dark:bg-or-900/10 text-or-500 rounded-2xl"><Bell size={22} /></div>
               <h2 className="text-lg font-black text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                  <div className="flex items-center gap-4 text-left">
                     <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl text-gray-400 shadow-sm"><Smartphone size={18} /></div>
                     <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white">Alertes Push</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Sur l'application mobile.</p>
                     </div>
                  </div>
                  <Toggle active={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                  <div className="flex items-center gap-4 text-left">
                     <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl text-gray-400 shadow-sm"><LayoutDashboard size={18} /></div>
                     <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white">Nouvelles Notes</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Dès qu'une note est publiée.</p>
                     </div>
                  </div>
                  <Toggle active={noteNotif} onChange={() => setNoteNotif(!noteNotif)} />
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                  <div className="flex items-center gap-4 text-left">
                     <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl text-gray-400 shadow-sm"><Mail size={18} /></div>
                     <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white">Email</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Résumé des alertes importantes.</p>
                     </div>
                  </div>
                  <Toggle active={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
               </div>
            </div>
         </Card>

         {/* SÉCURITÉ */}
         <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-vert-50 dark:bg-vert-900/10 text-vert-500 rounded-2xl"><ShieldCheck size={22} /></div>
               <h2 className="text-lg font-black text-gray-900 dark:text-white">Sécurité avancée</h2>
            </div>
            <div className="flex items-center justify-between p-6 bg-vert-50 dark:bg-vert-900/20 rounded-[2rem]">
               <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-vert-500 shadow-sm"><Lock size={20} /></div>
                  <div>
                     <p className="text-sm font-black text-gray-900 dark:text-white">Double validation</p>
                     <p className="text-[11px] text-gray-500 font-semibold mt-1">Sécurisé via ton téléphone.</p>
                  </div>
               </div>
               <Toggle active={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
            </div>
         </Card>

         {/* INFOS SYSTÈME */}
         <Card className="p-8 border-none shadow-soft bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden group">
            <div className="relative z-10 text-left">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">Version Portail</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[11px] font-bold opacity-60">
                    <span>App Version</span>
                    <span>v2.1.0-gold</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-bold opacity-60">
                    <span>Dernière connexion</span>
                    <span>Il y a 10 minutes</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-bold opacity-60">
                    <span>Serveur</span>
                    <span>EIEF-Cloud-GN</span>
                 </div>
              </div>
              <Badge className="mt-8 bg-bleu-600 text-white border-none font-black text-[9px] px-3 h-7">Système OK</Badge>
            </div>
         </Card>
      </div>

      <AnimatePresence>
         {isSuccess && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed bottom-10 right-10 z-[100] flex items-center p-5 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-vert-100 min-w-[320px]">
               <div className="flex items-center gap-5">
                  <div className="p-3 bg-vert-500 text-white rounded-2xl shadow-lg shadow-vert-200"><CheckCircle2 size={24} /></div>
                  <div className="text-left">
                     <p className="text-sm font-black text-gray-900 dark:text-white">Réglages enregistrés</p>
                     <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Tes choix sont appliqués</p>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ElevePreferences;
