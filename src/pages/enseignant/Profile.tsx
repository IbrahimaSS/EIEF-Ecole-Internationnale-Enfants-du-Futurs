import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Shield, 
  Save,
  CheckCircle2,
  BookOpen,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Card, Input, Button, Badge } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

const EnseignantProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'informations' | 'securite'>('informations');
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarPreview(reader.result as string);
        } else {
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
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
      className="space-y-8 pb-8"
    >
      {/* HEADER WITH COVER OVERLAY */}
      <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-gray-900 shadow-soft border border-gray-100 dark:border-white/5">
         <div className="h-64 md:h-80 w-full relative group">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-bleu-900 via-indigo-900 to-or-900" />
            )}
            
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
               <input 
                 type="file" 
                 ref={coverInputRef} 
                 onChange={(e) => handleImageUpload(e, 'cover')} 
                 accept="image/*" 
                 className="hidden" 
               />
               <Button 
                  onClick={() => coverInputRef.current?.click()}
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white backdrop-blur-md rounded-xl hover:bg-white/20 h-10 px-6 font-bold text-[11px]"
               >
                  <Camera size={16} className="mr-2" />
                  Modifier la couverture
               </Button>
            </div>
         </div>

         <div className="px-8 pb-8 relative -mt-20 sm:-mt-24 flex flex-col sm:flex-row gap-6 items-center sm:items-end">
            <div className="relative group">
               <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-xl relative z-10">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-bleu-100 to-bleu-50 dark:from-bleu-900 dark:to-gray-800 flex items-center justify-center text-bleu-600 dark:text-bleu-400">
                      <User size={64} />
                    </div>
                  )}
               </div>
               
               <input 
                 type="file" 
                 ref={avatarInputRef} 
                 onChange={(e) => handleImageUpload(e, 'avatar')} 
                 accept="image/*" 
                 className="hidden" 
               />
               <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-full shadow-lg border border-gray-100 dark:border-white/10 hover:scale-110 transition-transform z-20 group-hover:bg-bleu-50 dark:group-hover:bg-bleu-900"
               >
                  <Camera size={18} />
               </button>
            </div>

            <div className="flex-1 text-center sm:text-left mb-2">
               <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{user?.firstName} {user?.lastName}</h1>
               <div className="flex flex-col sm:flex-row gap-3 mt-3 justify-center sm:justify-start items-center">
                  <Badge className="bg-bleu-50 text-bleu-600 dark:bg-bleu-900/30 dark:text-bleu-400 border-none font-bold">
                     Enseignant
                  </Badge>
                  <Badge className="bg-or-50 text-or-600 dark:bg-or-900/30 dark:text-or-400 border-none font-bold">
                     Mathématiques & Physique
                  </Badge>
               </div>
            </div>

            <div className="w-full sm:w-auto">
               <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full sm:w-auto h-12 px-8 bg-bleu-600 text-white rounded-2xl font-bold shadow-lg shadow-bleu-500/20 border-none hover:scale-[1.02]"
               >
                  {isSaving ? (
                     <><span className="animate-spin mr-2">⏳</span> Enregistrement...</>
                  ) : (
                     <><Save size={18} className="mr-2" /> Enregistrer</>
                  )}
               </Button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* SIDEBAR STATS */}
         <div className="space-y-6">
            <Card className="p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
               <h3 className="font-bold text-gray-900 dark:text-white mb-6">À propos</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                     <div className="p-2 bg-bleu-50 dark:bg-white/5 rounded-lg text-bleu-600 dark:text-bleu-400"><Briefcase size={16} /></div>
                     <div>
                        <p className="font-bold text-gray-900 dark:text-white">Département</p>
                        <p className="text-gray-500 text-[11px] font-semibold">Sciences Exactes</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <div className="p-2 bg-vert-50 dark:bg-white/5 rounded-lg text-vert-600 dark:text-vert-400"><BookOpen size={16} /></div>
                     <div>
                        <p className="font-bold text-gray-900 dark:text-white">Classes actuelles</p>
                        <p className="text-gray-500 text-[11px] font-semibold">4 Groupes assignés</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <div className="p-2 bg-or-50 dark:bg-white/5 rounded-lg text-or-600 dark:text-or-400"><Calendar size={16} /></div>
                     <div>
                        <p className="font-bold text-gray-900 dark:text-white">Depuis</p>
                        <p className="text-gray-500 text-[11px] font-semibold">Septembre 2024</p>
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         {/* MAIN CONTENT */}
         <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="flex gap-4 border-b border-gray-100 dark:border-white/5">
               <button 
                  onClick={() => setActiveTab('informations')}
                  className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'informations' ? 'text-bleu-600 dark:text-or-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
               >
                  Informations Générales
                  {activeTab === 'informations' && <motion.div layoutId="profile-tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-current rounded-full" />}
               </button>
               <button 
                  onClick={() => setActiveTab('securite')}
                  className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'securite' ? 'text-bleu-600 dark:text-or-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
               >
                  Sécurité & Mot de Passe
                  {activeTab === 'securite' && <motion.div layoutId="profile-tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-current rounded-full" />}
               </button>
            </div>

            <AnimatePresence mode="wait">
               {activeTab === 'informations' && (
                  <motion.div key="informations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <Card className="p-8 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Nom</label>
                              <Input defaultValue={user?.lastName} className="font-semibold" />
                           </div>
                           <div>
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Prénom</label>
                              <Input defaultValue={user?.firstName} className="font-semibold" />
                           </div>
                           <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Adresse Email</label>
                              <Input defaultValue={user?.email} type="email" className="font-semibold" icon={Mail} />
                           </div>
                           <div>
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Téléphone</label>
                              <Input defaultValue="+224 62X XX XX XX" className="font-semibold" icon={Phone} />
                           </div>
                           <div>
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Localisation</label>
                              <Input defaultValue="Conakry, Guinée" className="font-semibold" icon={MapPin} />
                           </div>
                           <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Matières Enseignées</label>
                              <Input defaultValue="Mathématiques, Physique-Chimie" className="font-semibold" />
                           </div>
                        </div>
                     </Card>
                  </motion.div>
               )}

               {activeTab === 'securite' && (
                  <motion.div key="securite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <Card className="p-8 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50">
                        <div className="flex items-center gap-4 mb-8 p-4 bg-or-50 dark:bg-or-900/10 rounded-2xl text-or-600">
                           <Shield size={24} />
                           <div>
                              <p className="font-bold text-sm">Sécurisation du compte</p>
                              <p className="text-[10px] text-or-600/80 font-semibold mt-0.5">Il est recommandé de changer votre mot de passe tous les 3 mois.</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Mot de passe actuel</label>
                              <Input type="password" placeholder="••••••••" className="font-semibold" />
                           </div>
                           <div>
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Nouveau mot de passe</label>
                              <Input type="password" placeholder="••••••••" className="font-semibold" />
                           </div>
                           <div>
                              <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Confirmer le nouveau mot de passe</label>
                              <Input type="password" placeholder="••••••••" className="font-semibold" />
                           </div>
                        </div>
                     </Card>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

      {isSuccess && (
         <motion.div
           initial={{ opacity: 0, y: 50, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           className="fixed bottom-8 right-8 z-50 flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-vert-100 min-w-[300px]"
         >
           <div className="flex items-center gap-4">
             <div className="p-2 bg-vert-100 text-vert-500 rounded-xl">
               <CheckCircle2 size={24} />
             </div>
             <div className="text-left font-bold">
               <p className="text-sm text-gray-900 dark:text-white">Sauvegarde réussie</p>
               <p className="text-[11px] text-gray-500 font-semibold">Votre profil est à jour.</p>
             </div>
           </div>
         </motion.div>
      )}
    </motion.div>
  );
};

export default EnseignantProfile;
