import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  ShieldCheck,
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
    role: 'admin' as UserRole,
  });

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user) return;

    const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    const fallbackPath = `/${user.role}/dashboard`;
    const targetPath = fromPath && fromPath.startsWith(`/${user.role}`) ? fromPath : fallbackPath;

    navigate(targetPath, { replace: true });
  }, [isAuthenticated, isInitialized, location.state, navigate, user]);

  const roles: Array<{ value: UserRole; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { value: 'admin' as UserRole, label: 'Administration', icon: ShieldCheck },
    { value: 'comptable' as UserRole, label: 'Comptable', icon: CheckCircle2 },
    { value: 'enseignant' as UserRole, label: 'Enseignant', icon: BookOpen },
    { value: 'parent' as UserRole, label: 'Parent', icon: UserCheck },
    { value: 'eleve' as UserRole, label: 'Élève', icon: GraduationCap },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const actualRole = await login({ email: formData.email, password: formData.password });
      navigate(`/${actualRole}/dashboard`, { replace: true });
    } catch (_err) {
      /* error displayed via store */
    }
  };

  const handleInputChange = (field: string, value: string | UserRole) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const selectedRoleData = roles.find((r) => r.value === formData.role)!;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-gray-950">
      {/* IMAGE DE FOND PLEIN ÉCRAN — école */}
      <img
        src="/school-front.jpeg"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith('/Img1.jpeg')) img.src = '/Img1.jpeg';
        }}
        alt="EIEF"
        className="absolute inset-0 w-full h-full object-cover scale-105 opacity-50"
      />

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-tr from-vert-900/70 via-transparent to-bleu-900/50" />

      {/* HALOS */}
      <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-or-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-vert-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden relative z-10"
      >
        {/* COLONNE BRANDING */}
        <div className="lg:col-span-5 p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-vert-800 via-vert-700 to-bleu-800">
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-or-500/20 rounded-full blur-[80px]" />

          <div className="relative z-10 text-left">
            <button
              onClick={() => navigate('/')}
              className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/15 group/btn"
            >
              <ArrowRight className="rotate-180 group-hover/btn:-translate-x-1 transition-transform" size={14} /> Retour à l'accueil
            </button>

            <div className="inline-flex items-center gap-3 mb-10">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-2xl ring-2 ring-or-400/40 rotate-[-6deg]">
                <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-2xl tracking-tighter leading-none">EIEF</span>
                <span className="text-or-300 text-[10px] font-bold uppercase tracking-widest mt-1">Éducation d'Excellence</span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-6 italic">
              Construisons le <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-400 to-or-500">Futur</span> ensemble.
            </h1>
            <p className="text-white/75 font-medium text-sm leading-relaxed max-w-xs mb-10">
              Votre plateforme centralisée pour une gestion éducative innovante et performante.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Suivi en temps réel', desc: 'Notes, absences et exercices' },
                { label: 'Communication fluide', desc: 'Chat dédié parents/profs' },
                { label: 'Sécurité garantie', desc: 'Données cryptées et accès contrôlé' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 transition-all hover:bg-white/10">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-or-400/20 flex items-center justify-center text-or-300">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm leading-none pt-1">{item.label}</p>
                    <p className="text-white/50 text-[10px] font-semibold mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12 flex items-center justify-between border-t border-white/10 mt-8">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Faisons Plus !</p>
            <p className="text-or-300 text-[10px] font-black uppercase tracking-widest">© 2026 EIEF</p>
          </div>
        </div>

        {/* COLONNE FORMULAIRE */}
        <div className="lg:col-span-7 bg-white p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={formData.role}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="text-left mb-8">
                <Badge className="mb-4 bg-or-50 text-or-700 border border-or-200 font-black text-[10px] uppercase tracking-[0.2em] px-3 h-7">
                  Accès {selectedRoleData.label}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Portail de connexion</h2>
                <p className="text-gray-500 font-semibold text-xs mt-3 uppercase tracking-widest">
                  Saisissez vos identifiants
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Sélecteur de rôle */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => handleInputChange('role', r.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black transition-all border-2',
                        formData.role === r.value
                          ? 'bg-vert-50 text-vert-700 border-vert-500 shadow-md ring-4 ring-vert-500/10'
                          : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                      )}
                    >
                      <r.icon size={14} />
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="relative group text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 transition-colors" size={18} />
                      <input
                        type="email"
                        placeholder="email@eief.edu.gn"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative group text-left">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mot de passe</label>
                      <button type="button" className="text-[10px] font-bold text-or-600 hover:text-or-700 transition-colors uppercase tracking-widest">
                        Oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 transition-colors" size={18} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-vert-100 bg-vert-50/60 px-4 py-3 text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vert-700">Rôle détecté automatiquement</p>
                  <p className="mt-1 text-xs font-semibold text-vert-900/80">
                    Le portail affiché après connexion dépend du rôle renvoyé par votre compte.
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

                <div className="flex items-center gap-3 px-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-5 h-5 rounded-md border-gray-200 text-vert-600 focus:ring-vert-500/20 transition-all cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer">
                    Maintenir ma session active
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-950 bg-gradient-to-r from-or-500 to-or-600 hover:from-or-400 hover:to-or-500 shadow-gold transition-all active:scale-[0.98] hover:scale-[1.02]"
                >
                  {isLoading ? (
                    'Vérification...'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Se connecter <ArrowRight size={18} />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Connexion backend</p>
                <p className="text-xs font-semibold text-gray-500">
                  Utilisez un compte existant du backend EIEF.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer flottant */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none">
        <span>© 2026 EIEF EDUCATION</span>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <span>SUPPORT TECHNIQUE</span>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <span>VIE PRIVÉE</span>
      </div>
    </div>
  );
};

export default Login;

// Réservé pour usage futur — évite warning unused import si besoin.
export const _UsersIcon = Users;
