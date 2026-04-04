import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  Mail,
  EyeOff,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Card, Button } from '../../components/ui';

const EnseignantPreferences: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Toggles
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);
  const [hideEmail, setHideEmail] = useState(false);
  const [hidePhone, setHidePhone] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  const Toggle = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${active ? 'bg-bleu-500' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <span className={`w-4 h-4 rounded-full bg-white shadow-sm absolute transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 max-w-5xl mx-auto"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl shadow-inner text-gray-600 dark:text-gray-300">
            <SettingsIcon size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Préférences</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Personnalisez votre expérience et vos notifications</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-bleu-600 text-white rounded-xl font-bold shadow-lg shadow-bleu-500/20 border-none hover:scale-[1.02] px-8 h-11"
        >
          {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Save size={16} className="mr-2" />}
          Sauvegarder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* APPARENCE */}
         <Card className="p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-or-50 dark:bg-or-900/10 text-or-500 rounded-xl"><Moon size={20} /></div>
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Apparence</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
               <button 
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-bleu-500 bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600' : 'border-gray-100 dark:border-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
               >
                  <Sun size={24} />
                  <span className="text-[11px] font-bold">Clair</span>
               </button>
               <button 
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-bleu-500 bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600' : 'border-gray-100 dark:border-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
               >
                  <Moon size={24} />
                  <span className="text-[11px] font-bold">Sombre</span>
               </button>
               <button 
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'system' ? 'border-bleu-500 bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600' : 'border-gray-100 dark:border-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
               >
                  <Monitor size={24} />
                  <span className="text-[11px] font-bold">Système</span>
               </button>
            </div>
         </Card>

         {/* NOTIFICATIONS */}
         <Card className="p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-bleu-50 dark:bg-bleu-900/10 text-bleu-500 rounded-xl"><Bell size={20} /></div>
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                     <Mail size={18} className="text-gray-400" />
                     <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Emails récapitulatifs</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Recevoir un résumé journalier de votre planning.</p>
                     </div>
                  </div>
                  <Toggle active={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
               </div>
               
               <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                     <Smartphone size={18} className="text-gray-400" />
                     <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Push Notifications</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Alertes immédiates pour les emplois du temps.</p>
                     </div>
                  </div>
                  <Toggle active={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
               </div>

               <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                     <Bell size={18} className="text-gray-400" />
                     <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Nouveaux messages</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Vous alerter lorsqu'un parent vous contacte.</p>
                     </div>
                  </div>
                  <Toggle active={messageNotif} onChange={() => setMessageNotif(!messageNotif)} />
               </div>
            </div>
         </Card>

         {/* CONFIDENTIALITÉ */}
         <Card className="p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-rouge-50 dark:bg-rouge-900/10 text-rouge-500 rounded-xl"><EyeOff size={20} /></div>
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Confidentialité</h2>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Cacher mon adresse Email</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Les parents communiqueront via la messagerie interne.</p>
                     </div>
                  </div>
                  <Toggle active={hideEmail} onChange={() => setHideEmail(!hideEmail)} />
               </div>
               
               <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Cacher mon numéro personnel</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Ne pas afficher votre téléphone au grand public.</p>
                     </div>
                  </div>
                  <Toggle active={hidePhone} onChange={() => setHidePhone(!hidePhone)} />
               </div>
            </div>
         </Card>

         {/* SÉCURITÉ */}
         <Card className="p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-vert-50 dark:bg-vert-900/10 text-vert-500 rounded-xl"><ShieldCheck size={20} /></div>
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sécurité renforcée</h2>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                     <Lock size={18} className="text-gray-400" />
                     <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Authentification à 2 facteurs</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Renforcer la connexion via votre mobile.</p>
                     </div>
                  </div>
                  <Toggle active={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
               </div>
            </div>
         </Card>
      </div>

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
               <p className="text-sm text-gray-900 dark:text-white">Préférences enregistrées</p>
               <p className="text-[11px] text-gray-500 font-semibold">Vos paramètres ont été mis à jour avec succès.</p>
             </div>
           </div>
         </motion.div>
      )}

    </motion.div>
  );
};

// Simple wrapper for settings icon
const SettingsIcon = ({ size }: { size: number }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export default EnseignantPreferences;
