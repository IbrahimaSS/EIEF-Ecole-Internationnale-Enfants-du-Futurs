import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, Mail, Phone, Briefcase, Save, CheckCircle2, Shield, Lock, Bell } from 'lucide-react';
import { Card, Input, Button, Avatar } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

const AdminProfile: React.FC = () => {
  const { user } = useAuthStore();
  const userName = user?.firstName + ' ' + user?.lastName || 'Ibrahima Soumah';
  
  const [activeTab, setActiveTab] = useState<'profil' | 'securite' | 'notifications'>('profil');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(URL.createObjectURL(e.target.files[0]));
    }
  };


  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Hidden File Inputs */}
      <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverChange} className="hidden" />
      <input type="file" accept="image/*" ref={profileInputRef} onChange={handleProfileChange} className="hidden" />

      {/* HEADER COUVERTURE & PROFIL */}
      <div className="relative w-full h-48 md:h-64 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(30,58,138,0.1)]">
         <div 
           className={`absolute inset-0 ${!coverImage ? 'bg-gradient-to-r from-bleu-800 via-bleu-600 to-or-400' : ''}`}
           style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
         >
           {!coverImage && <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />}
         </div>
         <div className="absolute top-4 right-4 animate-pulse">
            <Button 
              variant="outline" 
              onClick={() => coverInputRef.current?.click()}
              className="border-white/20 text-white bg-black/20 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest hover:bg-black/40"
            >
               <Camera size={16} className="mr-2" /> Modifier la couverture
            </Button>
         </div>
         <div className="absolute -bottom-1 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
      </div>

      <div className="px-8 -mt-20 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
         <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group cursor-pointer inline-block" onClick={() => profileInputRef.current?.click()}>
               <Avatar name={userName} src={profileImage || undefined} size="lg" className="w-32 h-32 ring-8 ring-gray-50 dark:ring-gray-950 shadow-2xl transition-transform group-hover:scale-105" />
               <div className="absolute bottom-2 right-2 p-2.5 bg-or-500 rounded-full text-white shadow-lg border-4 border-gray-50 dark:border-gray-950 group-hover:scale-110 group-hover:bg-or-400 transition-all">
                 <Camera size={18} />
               </div>
            </div>
            <div className="text-center md:text-left mb-2 md:mb-0">
               <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{userName}</h1>
               <div className="flex items-center gap-3 mt-1 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-bleu-100 text-bleu-700 dark:bg-bleu-900/30 dark:text-bleu-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                     Administrateur Principal
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1">
                     <Lock size={12} /> Accès total
                  </span>
               </div>
            </div>
         </div>

         <Button 
            onClick={handleSave}
            className="flex gap-2 bg-gradient-to-r from-or-600 to-or-400 text-gray-900 shadow-lg shadow-or-500/20 border-none font-bold uppercase tracking-widest text-[11px] h-12 px-8 rounded-[1rem] hover:scale-[1.02] active:scale-95 transition-all"
         >
            {isSaving ? <Save size={18} className="animate-spin" /> : <Save size={18} />} 
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* NAV SIDEBAR PROFIL */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 'profil', label: 'Informations Personnelles', icon: User },
            { id: 'securite', label: 'Sécurité du Compte', icon: Shield },
            { id: 'notifications', label: 'Préférences & Alertes', icon: Bell },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                w-full flex items-center gap-4 px-6 py-4 rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest transition-all
                ${activeTab === tab.id 
                  ? "bg-gradient-to-r from-bleu-600 to-bleu-500 text-white shadow-lg shadow-bleu-500/20" 
                  : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300"
                }
              `}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENU PROFIL */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profil' && (
              <motion.div
                key="profil"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold gradient-bleu-or-text tracking-tight uppercase">Informations Personnelles</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Gérez vos coordonnées et votre identité</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <User size={14} className="text-bleu-500" /> Nom complet
                      </label>
                      <Input defaultValue={userName} className="w-full h-12 rounded-2xl border-gray-100 dark:border-white/10 dark:bg-white/5 font-bold" />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Briefcase size={14} className="text-or-500" /> Poste
                      </label>
                      <Input defaultValue="Directeur des Opérations" className="w-full h-12 rounded-2xl border-gray-100 dark:border-white/10 dark:bg-white/5 font-semibold italic" />
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-8" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                           <Mail size={14} className="text-gray-400" /> Adresse Email
                        </label>
                        <Input type="email" defaultValue={`${userName.replace(/\s+/g, '.').toLowerCase()}@eief.edu.gn`} className="w-full h-12 rounded-2xl border-gray-100 dark:border-white/10 dark:bg-gray-50 dark:bg-white/5 font-semibold text-gray-500" readOnly />
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold ml-1 mt-2">Géré par l'administration système.</p>
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                           <Phone size={14} className="text-vert-500" /> Téléphone
                        </label>
                        <Input type="text" defaultValue="+224 620 00 00 00" className="w-full h-12 rounded-2xl border-gray-100 dark:border-white/10 dark:bg-white/5 font-bold" />
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
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="p-8 border-none shadow-soft space-y-8 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold gradient-bleu-or-text tracking-tight uppercase">Sécurité du Compte</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Paramètres de connexion</p>
                  </div>

                  <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-900 dark:text-white">
                              <Lock size={20} />
                           </div>
                           <div className="text-left">
                              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">Mot de passe</h3>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dernière modification il y a 3 mois</p>
                           </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input type="password" placeholder="Mot de passe actuel" className="w-full h-12 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-gray-900" />
                        <Input type="password" placeholder="Nouveau mot de passe" className="w-full h-12 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-gray-900" />
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-or-50/50 dark:bg-or-900/10 rounded-[2rem] border border-or-100 dark:border-or-900/30">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-or-600">
                           <Shield size={20} />
                        </div>
                        <div className="text-left">
                           <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">Authentification Double Facteur (2FA)</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Protège votre compte contre les accès non autorisés.</p>
                        </div>
                     </div>
                     <Button className="bg-or-600 text-gray-900 uppercase font-black text-[10px] tracking-widest shadow-lg shadow-or-500/20 px-6 h-10 rounded-xl border-none">
                        Activer
                     </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 border-none shadow-soft flex items-center justify-center min-h-[300px] bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
                   <div className="text-center">
                     <Bell size={48} className="text-gray-200 dark:text-white/10 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Préférences en cours de développement</h3>
                   </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* TOAST SUCCESS */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-vert-100 dark:border-vert-900/30 min-w-[300px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-vert-100 text-vert-500 rounded-xl">
                <CheckCircle2 size={24} />
              </div>
              <div className="text-left font-bold">
                <p className="text-sm text-gray-900 dark:text-white tracking-tight uppercase">Mise à jour réussie</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Vos informations ont été enregistrées.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminProfile;
