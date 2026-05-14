import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Camera, Shield,
  CheckCircle2, GraduationCap, Calendar, BookOpen
} from 'lucide-react';
import { Card, Input, Button, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { apiRequest } from '../../services/api';
import { StudentResponse } from '../../services/userService';

const EleveProfile: React.FC = () => {
  const { user, token, setUser } = useAuthStore();
  const [isSaving, setIsSaving]     = useState(false);
  const [isSuccess, setIsSuccess]   = useState(false);
  const [activeTab, setActiveTab]   = useState<'info' | 'securite'>('info');
  const [student, setStudent]       = useState<StudentResponse | null>(null);

  // Champs du formulaire info
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName]   = useState(user?.lastName ?? '');
  const [phone, setPhone]           = useState('');
  const [birthDate, setBirthDate]   = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Champs mot de passe
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError]     = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  // Charge le profil complet de l'élève
  useEffect(() => {
    apiRequest<StudentResponse>('/users/students/me')
      .then((s) => {
        setStudent(s);
        setPhone(s.phone ?? '');
        setBirthDate(s.birthDate ? s.birthDate.split('T')[0] : '');
        setFirstName(s.firstName || user?.firstName || '');
        setLastName(s.lastName || user?.lastName || '');
      })
      .catch(console.error);
  }, [user?.id]);

  const [imgError, setImgError] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Fichier sélectionné:", file?.name, file?.size);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Prévisualisation générée");
        setAvatarPreview(reader.result as string);
        setImgError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    console.log("Tentative de sauvegarde...", { id: user?.id, hasToken: !!token });
    
    if (!user?.id) {
      alert("Erreur : ID utilisateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    if (activeTab === 'securite') {
      if (newPwd !== confirmPwd) {
        setPwdError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (newPwd.length < 8) {
        setPwdError('Le mot de passe doit contenir au moins 8 caractères.');
        return;
      }
      setPwdError('');
    }

    setIsSaving(true);
    try {
      // On utilise la prévisualisation (Base64) directement si elle existe
      const finalAvatarUrl = avatarPreview || user.avatarUrl;
      
      const payload: any = {
        email: user.email,
        firstName,
        lastName,
        roleName: user.backendRole || (user.role === 'eleve' ? 'STUDENT' : user.role.toUpperCase()),
        password: currentPwd,
        avatarUrl: finalAvatarUrl,
        telephone: phone
      };

      if (activeTab !== 'info') {
        payload.password = newPwd;
      }

      console.log("Envoi du payload avec image Base64...");

      const updatedUser = await apiRequest<any>('/users/me', {
        method: 'PUT',
        token: token || undefined,
        body: JSON.stringify(payload),
      });

      // Mettre à jour le store local
      if (setUser) {
        setUser({
          ...user,
          firstName,
          lastName,
          telephone: phone,
          avatarUrl: finalAvatarUrl
        });
      }

      setIsSuccess(true);
      if (activeTab === 'securite') {
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      }
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erreur sauvegarde profil:', err);
      alert(`Erreur lors de la sauvegarde : ${err.message || 'Problème de connexion au serveur'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Formatage date ────────────────────────────────────────────────────────
  const formatDate = (iso?: string): string => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* BANNIÈRE + AVATAR */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-900 shadow-soft border border-gray-100 dark:border-white/5">
        <div className="h-64 w-full relative group bg-gradient-to-br from-bleu-600 to-indigo-800">
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
            <input type="file" ref={coverInputRef} className="hidden" />
            <Button onClick={() => coverInputRef.current?.click()} variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-md rounded-2xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-xl">
              <Camera size={18} className="mr-2" /> Modifier bannière
            </Button>
          </div>
        </div>
        <div className="px-10 pb-10 relative -mt-24 flex flex-col sm:flex-row gap-8 items-center sm:items-end">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[3rem] border-[6px] border-white dark:border-gray-900 overflow-hidden bg-white shadow-2xl relative z-10">
              {((avatarPreview || user?.avatarUrl) && !imgError) ? (
                <img 
                  src={avatarPreview || user?.avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-bleu-100 to-bleu-50 dark:from-bleu-900 dark:to-gray-800 flex items-center justify-center text-bleu-600 dark:text-bleu-400">
                  <User size={80} strokeWidth={1} />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={avatarInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-1 right-1 p-3.5 bg-bleu-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform z-20 border-4 border-white dark:border-gray-900">
              <Camera size={20} />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left mb-4">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start items-center">
              {student?.registrationNumber && (
                <Badge className="bg-bleu-50 text-bleu-600 dark:bg-bleu-900/30 border-none font-black text-[10px] px-3 h-7">
                  Matricule : {student.registrationNumber}
                </Badge>
              )}
              {student?.className && (
                <Badge className="bg-or-50 text-or-600 dark:bg-or-900/30 border-none font-black text-[10px] px-3 h-7">
                  {student.className}
                </Badge>
              )}
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto h-14 px-10 bg-bleu-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-bleu-500/20 border-none hover:translate-y-[-2px] active:translate-y-[0px] transition-all">
            {isSaving ? 'Enregistrement...' : 'Enregistrer le profil'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CARTE SCOLARITÉ */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Scolarité</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-bleu-50 dark:bg-white/5 rounded-2xl text-bleu-600"><GraduationCap size={20} /></div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Classe actuelle</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{student?.className || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-or-50 dark:bg-white/5 rounded-2xl text-or-600"><Calendar size={20} /></div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Date de naissance</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(student?.birthDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-vert-50 dark:bg-white/5 rounded-2xl text-vert-600"><BookOpen size={20} /></div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">N° Matricule</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{student?.registrationNumber || '—'}</p>
                </div>
              </div>
              {student?.parentName && (
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rouge-50 dark:bg-white/5 rounded-2xl text-rouge-600"><User size={20} /></div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Parent / Tuteur</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{student.parentName}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ONGLETS FORMULAIRE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-6 border-b border-gray-100 dark:border-white/5">
            {(['info', 'securite'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative",
                  activeTab === t ? "text-bleu-600 dark:text-or-400" : "text-gray-400 hover:text-gray-900"
                )}
              >
                {t === 'info' ? 'Mon Dossier' : 'Accès & Sécurité'}
                {activeTab === t && (
                  <motion.div layoutId="profile-tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-current rounded-full" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-10 border-none shadow-soft bg-white dark:bg-gray-900/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Prénom</label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="font-bold text-sm h-12 rounded-xl bg-gray-50/50"
                        icon={User}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Nom</label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="font-bold text-sm h-12 rounded-xl bg-gray-50/50"
                        icon={User}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Email Élève</label>
                      <Input
                        value={user?.email ?? ''}
                        readOnly
                        type="email"
                        className="font-bold text-sm h-12 rounded-xl bg-gray-50/50 opacity-60 cursor-not-allowed"
                        icon={Mail}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Date de naissance</label>
                      <Input
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        type="date"
                        className="font-bold text-sm h-12 rounded-xl bg-gray-50/50"
                        icon={Calendar}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Téléphone</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="font-bold text-sm h-12 rounded-xl bg-gray-50/50"
                        icon={Phone}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Parent / Tuteur</label>
                      <Input
                        value={student?.parentName ?? '—'}
                        readOnly
                        className="font-bold text-sm h-12 rounded-xl bg-gray-50/50 opacity-60 cursor-not-allowed"
                        icon={MapPin}
                      />
                    </div>
                    <div className="md:col-span-2 p-6 bg-or-50/50 dark:bg-or-900/10 rounded-2xl border border-or-100 dark:border-or-900/20">
                      <label className="text-[10px] font-black uppercase tracking-widest text-or-600 dark:text-or-400 block mb-3 ml-1">Confirmation requise</label>
                      <Input
                        type="password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder="Saisissez votre mot de passe actuel pour valider"
                        className="font-bold text-sm h-12 rounded-xl bg-white"
                        icon={Shield}
                      />
                      <p className="text-[9px] text-or-500 font-bold uppercase tracking-wider mt-3 ml-1 italic">Le serveur exige votre mot de passe pour enregistrer ces modifications.</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'securite' && (
              <motion.div key="securite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-10 border-none shadow-soft bg-white dark:bg-gray-900/50">
                  <div className="flex items-center gap-5 mb-10 p-6 bg-bleu-50 dark:bg-bleu-900/20 rounded-[2rem] text-bleu-700 dark:text-bleu-300">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"><Shield size={28} /></div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-wider">Sécurité du compte</p>
                      <p className="text-[11px] font-semibold opacity-70 mt-1">Change ton mot de passe si tu penses qu'on l'a découvert.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Mot de passe actuel</label>
                      <Input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" className="font-bold text-sm h-12 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Nouveau mot de passe</label>
                      <Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" className="font-bold text-sm h-12 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 ml-1">Confirmer</label>
                      <Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" className="font-bold text-sm h-12 rounded-xl" />
                    </div>
                    {pwdError && (
                      <p className="text-xs font-bold text-rouge-600 ml-1">{pwdError}</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* TOAST SUCCÈS */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed bottom-10 right-10 z-[100] flex items-center p-5 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-vert-100 min-w-[320px]">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-vert-500 text-white rounded-2xl shadow-lg shadow-vert-200"><CheckCircle2 size={24} /></div>
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white">Profil enregistré</p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Données mises à jour</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EleveProfile;