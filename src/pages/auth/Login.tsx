import React, { useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  GraduationCap, 
  Users, 
  UserCheck, 
  BookOpen, 
  CheckCircle2,
  ArrowRight,
   AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { Button, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';

const Login: React.FC = () => {
  const navigate = useNavigate();
   const location = useLocation();
   const { login, isLoading, error, clearError, isAuthenticated, user, isInitialized } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' as UserRole
  });

   useEffect(() => {
      if (!isInitialized || !isAuthenticated || !user) {
         return;
      }

      const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      const fallbackPath = `/${user.role}/dashboard`;
      const targetPath = fromPath && fromPath.startsWith(`/${user.role}`) ? fromPath : fallbackPath;

      navigate(targetPath, { replace: true });
   }, [isAuthenticated, isInitialized, location.state, navigate, user]);

  const roles = [
    { value: 'admin' as UserRole, label: 'Administration', icon: Users, color: 'bg-gradient-to-r from-bleu-700 to-indigo-900', glow: 'bg-bleu-500/20', bg: 'bg-or-50', text: 'text-or-600', ring: 'ring-or-400/20' },
    { value: 'comptable' as UserRole, label: 'Comptable', icon: CheckCircle2, color: 'bg-gradient-to-r from-bleu-700 to-indigo-900', glow: 'bg-bleu-500/20', bg: 'bg-or-50', text: 'text-or-600', ring: 'ring-or-400/20' },
    { value: 'enseignant' as UserRole, label: 'Enseignant', icon: BookOpen, color: 'bg-gradient-to-r from-bleu-700 to-indigo-900', glow: 'bg-bleu-500/20', bg: 'bg-or-50', text: 'text-or-600', ring: 'ring-or-400/20' },
    { value: 'parent' as UserRole, label: 'Espace Parent', icon: UserCheck, color: 'bg-gradient-to-r from-bleu-700 to-indigo-900', glow: 'bg-bleu-500/20', bg: 'bg-or-50', text: 'text-or-600', ring: 'ring-or-400/20' },
    { value: 'eleve' as UserRole, label: 'Espace Élève', icon: GraduationCap, color: 'bg-gradient-to-r from-bleu-600 to-indigo-800', glow: 'bg-bleu-500/20', bg: 'bg-or-50', text: 'text-or-600', ring: 'ring-or-400/20' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
         const actualRole = await login({
            email: formData.email,
            password: formData.password
         });

         navigate(`/${actualRole}/dashboard`, { replace: true });
      } catch (_err) {}
  };

  const handleInputChange = (field: string, value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const selectedRoleData = roles.find(r => r.value === formData.role)!;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/40 to-slate-950 z-10" />
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          src="/modern_school_interior_blur_1775250431386.png" 
          alt="School Background" 
          className="w-full h-full object-cover opacity-40 blur-[2px]"
        />
      </div>

      {/* Background Animated Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
           animate={{ 
             x: [0, 100, 0], 
             y: [0, -100, 0],
             scale: [1, 1.2, 1]
           }} 
           transition={{ duration: 15, repeat: Infinity }}
           className={cn("absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000", selectedRoleData.glow)}
        />
        <motion.div 
           animate={{ 
             x: [0, -100, 0], 
             y: [0, 100, 0],
             scale: [1, 1.1, 1]
           }} 
           transition={{ duration: 12, repeat: Infinity }}
           className={cn("absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000", selectedRoleData.glow)}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 bg-white/5 backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden relative z-10"
      >
        {/* Branding Column */}
        <div className="lg:col-span-5 p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden group bg-gradient-to-b from-bleu-900 via-bleu-800 to-or-600/80">
           <div className="absolute inset-0 bg-black/20 pointer-events-none" />
           <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
           
           <div className="relative z-10 text-left">
              <button 
                onClick={() => navigate('/')} 
                className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/10 group/btn"
              >
                <ArrowRight className="rotate-180 group-hover/btn:-translate-x-1 transition-transform" size={14} /> Retour à l'accueil
              </button>

              <div className="inline-flex items-center gap-3 mb-10 group-hover:scale-105 transition-transform">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-2xl rotate-[-6deg]">
                    <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-white font-black text-2xl tracking-tighter leading-none">EIEF</span>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Éducation d'Excellence</span>
                 </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6 mt-4">
                 Construisons le <br />
                 <span className="inline-block mt-1 transition-all duration-500 bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-500 to-or-700">
                    Futur
                 </span> Ensemble.
              </h1>
              <p className="text-white/60 font-medium text-sm leading-relaxed max-w-xs mb-10">
                 Votre plateforme centralisée pour une gestion éducative innovante et performante.
              </p>

              <div className="grid grid-cols-1 gap-4">
                 {[
                   { label: "Suivi en temps réel", desc: "Notes, absences et exercices" },
                   { label: "Communication fluide", desc: "Chat dédié parents/profs" },
                   { label: "Sécurité garantie", desc: "Données cryptées et accès limité" }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/10">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                         <CheckCircle2 size={20} />
                      </div>
                      <div className="text-left">
                         <p className="text-white font-bold text-sm leading-none pt-1">{item.label}</p>
                         <p className="text-white/40 text-[10px] font-semibold mt-1">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="relative z-10 pt-16 flex items-center justify-between border-t border-white/5">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white/40">U{i}</div>
                 ))}
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Rejoignez-nous !</p>
           </div>
        </div>

        {/* Login Form Column */}
        <div className="lg:col-span-7 bg-white/95 p-12 lg:p-16 border-l border-white/5 flex flex-col justify-center relative overflow-hidden">
           <AnimatePresence mode="wait">
              <motion.div 
                key={formData.role} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md mx-auto"
              >
                 <div className="text-left mb-10">
                    <Badge className={cn("mb-4 border-none font-black text-[10px] uppercase tracking-[0.2em] px-3 h-7", selectedRoleData.bg, selectedRoleData.text)}>
                       Accès {selectedRoleData.label}
                    </Badge>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Portail de Connexion</h2>
                    <p className="text-gray-500 font-semibold text-sm mt-3 uppercase tracking-widest opacity-60">Saisissez vos identifiants institutionnels</p>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role chips as tabs */}
                    <div className="flex flex-wrap gap-2 mb-8">
                       {roles.map(r => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => handleInputChange('role', r.value)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all border-2",
                              formData.role === r.value
                                ? `bg-white ${r.text} border-current shadow-xl shadow-current/10 ring-4 ${r.ring}`
                                : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"
                            )}
                          >
                             <r.icon size={14} />
                             {r.label}
                          </button>
                       ))}
                    </div>

                    <div className="space-y-4">
                       <div className="relative group text-left">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Identifiant Email</label>
                          <div className="relative">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-current transition-colors" size={18} />
                             <input 
                               type="email"
                               placeholder="email@eief.edu.gn"
                               value={formData.email}
                               onChange={(e) => handleInputChange('email', e.target.value)}
                               className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-current focus:ring-4 focus:ring-current/10 outline-none transition-all placeholder:text-gray-300"
                               style={{ color: '#2563eb' }}
                               required
                             />
                          </div>
                       </div>

                       <div className="relative group text-left">
                          <div className="flex items-center justify-between mb-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mot de passe</label>
                             <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Oublié ?</button>
                          </div>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-current transition-colors" size={18} />
                             <input 
                               type="password"
                               placeholder="••••••••"
                               value={formData.password}
                               onChange={(e) => handleInputChange('password', e.target.value)}
                               className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-current focus:ring-4 focus:ring-current/10 outline-none transition-all placeholder:text-gray-300"
                               required
                             />
                          </div>
                       </div>
                    </div>

                    <div className="rounded-2xl border border-bleu-100 bg-bleu-50/80 px-4 py-3 text-left">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-bleu-700">Rôle détecté automatiquement</p>
                       <p className="mt-1 text-xs font-semibold text-bleu-900/80">
                          Le portail affiché après connexion dépend du rôle renvoyé par votre compte backend.
                       </p>
                    </div>

                    {error && (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-red-700">
                         <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Connexion impossible</p>
                            <p className="mt-1 text-sm font-semibold">{error}</p>
                         </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 px-1 py-2">
                       <input type="checkbox" id="remember" className="w-5 h-5 rounded-lg border-gray-200 text-current focus:ring-current/20 transition-all cursor-pointer" style={{ color: '#2563eb' }} />
                       <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer">Maintenir ma session active</label>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-2xl transition-all active:scale-[0.98] mt-4",
                        selectedRoleData.color,
                        "shadow-current/30 hover:scale-[1.02]"
                      )}
                    >
                       {isLoading ? "Vérification..." : (
                          <span className="flex items-center justify-center gap-2">
                             Se connecter <ArrowRight size={18} />
                          </span>
                       )}
                    </Button>
                 </form>

                 <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-3">Connexion backend</p>
                    <p className="text-xs font-semibold text-gray-500">
                      Les identifiants de démonstration locaux ont été retirés. Utilisez maintenant un compte existant du backend.
                    </p>
                 </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Branding for legal/support */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none">
         <span>© 2026 EIEF EDUCATION</span>
         <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
         <span>SUPPORT TECHNIQUE</span>
         <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
         <span>VIE PRIVÉE</span>
      </div>
    </div>
  );
};

export default Login;
