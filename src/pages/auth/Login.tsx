import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, Users, UserCheck, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { Button, Input } from '../../components/ui';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' as UserRole
  });

  const roles: Array<{ value: UserRole; label: string; icon: React.ReactNode }> = [
    { value: 'admin', label: 'Admin', icon: <Users className="w-5 h-5" /> },
    { value: 'enseignant', label: 'Enseignant', icon: <BookOpen className="w-5 h-5" /> },
    { value: 'parent', label: 'Parent', icon: <UserCheck className="w-5 h-5" /> },
    { value: 'eleve', label: 'Élève', icon: <GraduationCap className="w-5 h-5" /> }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate(`/${formData.role}/dashboard`);
    } catch (err) {}
  };

  const handleInputChange = (field: string, value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleDemoLogin = (role: UserRole) => {
    const demoCredentials = {
      admin: { email: 'admin@eief.edu.gn', password: 'admin123' },
      enseignant: { email: 'enseignant@eief.edu.gn', password: 'prof123' },
      parent: { email: 'parent@eief.edu.gn', password: 'parent123' },
      eleve: { email: 'eleve@eief.edu.gn', password: 'eleve123' }
    };
    const creds = demoCredentials[role];
    setFormData(prev => ({ ...prev, ...creds, role }));
  };

  const themes = {
    admin: {
      leftBg: 'bg-[#0a192f]',
      glow1: 'bg-[#FFB800]/20',
      glow2: 'bg-bleu-500/20',
      accentText: 'text-[#FFB800]',
      activeTab: 'bg-slate-50 border-[#0a192f] text-[#0a192f] shadow-lg shadow-gray-200',
      activeTabIcon: 'bg-[#0a192f] text-[#FFB800]',
      submitBtn: 'bg-[#0a192f] hover:bg-[#112240] text-white shadow-xl shadow-gray-300',
      linkColor: 'text-[#0a192f] hover:text-[#112240]',
      checkboxColor: 'text-[#0a192f] focus:ring-[#0a192f]'
    },
    enseignant: {
      leftBg: 'bg-vert-900',
      glow1: 'bg-vert-400/20',
      glow2: 'bg-bleu-400/20',
      accentText: 'text-vert-400',
      activeTab: 'bg-vert-50 border-vert-500 text-vert-700 shadow-lg shadow-vert-100',
      activeTabIcon: 'bg-vert-100 text-vert-600',
      submitBtn: 'bg-vert-600 hover:bg-vert-700 text-white shadow-xl shadow-vert-200',
      linkColor: 'text-vert-600 hover:text-vert-700',
      checkboxColor: 'text-vert-600 focus:ring-vert-500'
    },
    parent: {
      leftBg: 'bg-rouge-900',
      glow1: 'bg-rouge-400/20',
      glow2: 'bg-orange-400/20',
      accentText: 'text-rouge-400',
      activeTab: 'bg-rouge-50 border-rouge-500 text-rouge-700 shadow-lg shadow-rouge-100',
      activeTabIcon: 'bg-rouge-100 text-rouge-600',
      submitBtn: 'bg-rouge-600 hover:bg-rouge-700 text-white shadow-xl shadow-rouge-200',
      linkColor: 'text-rouge-600 hover:text-rouge-700',
      checkboxColor: 'text-rouge-600 focus:ring-rouge-500'
    },
    eleve: {
      leftBg: 'bg-bleu-900',
      glow1: 'bg-bleu-400/20',
      glow2: 'bg-cyan-400/20',
      accentText: 'text-bleu-400',
      activeTab: 'bg-bleu-50 border-bleu-500 text-bleu-700 shadow-lg shadow-bleu-100',
      activeTabIcon: 'bg-bleu-100 text-bleu-600',
      submitBtn: 'bg-bleu-600 hover:bg-bleu-700 text-white shadow-xl shadow-bleu-200',
      linkColor: 'text-bleu-600 hover:text-bleu-700',
      checkboxColor: 'text-bleu-600 focus:ring-bleu-500'
    }
  };

  const currentTheme = themes[formData.role] || themes.admin;

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Colonne gauche - Branding & Marketing */}
      <div className={`hidden lg:flex lg:w-[45%] ${currentTheme.leftBg} relative overflow-hidden transition-colors duration-700`}>
        {/* Abstract Background Decorations */}
        <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] ${currentTheme.glow1} rounded-full blur-[120px] transition-colors duration-700`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] ${currentTheme.glow2} rounded-full blur-[120px] transition-colors duration-700`} />
        
        {/* Animated Grid Pattern (Subtle) */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', 
          backgroundSize: '30px 30px' 
        }} />

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-16 text-white text-center">
          {/* Logo with Premium Presentation */}
          <div className="relative mb-12 group">
            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-125 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative w-56 h-56 bg-white rounded-[40px] shadow-2xl flex items-center justify-center p-6 border-8 border-white/10 group-hover:rotate-3 transition-transform duration-500">
              <img src="/logo_eief.jpeg" alt="Logo EIEF" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl font-extrabold ">
              École Internationale <br /> 
              <span className={`${currentTheme.accentText} transition-colors duration-700`}>Les Enfants du Futur</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[2px] w-12 bg-white/30 rounded-full" />
              <p className="text-xl font-medium italic text-gray-300">Faisons Plus !</p>
              <div className="h-[2px] w-12 bg-white/30 rounded-full" />
            </div>
          </div>
          
          {/* Features Grid - Glassmorphism */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {[
              { icon: <GraduationCap className="text-red-400" />, text: 'Excellence' },
              { icon: <Users className="text-green-400" />, text: 'Communauté' },
              { icon: <ShieldCheck className="text-yellow-400" />, text: 'Sécurité' },
              { icon: <CheckCircle2 className="text-blue-400" />, text: 'Réussite' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="p-2 bg-white/10 rounded-lg">{f.icon}</div>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-lg">
          {/* Header Mobile Only Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl p-3 flex items-center justify-center border-4 border-gray-100">
              <img src="/logo_eief.jpeg" alt="Logo EIEF" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-10 sm:p-12 border border-gray-100 relative">
            {/* Form Header */}
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Bon retour !</h2>
              <p className="text-gray-500">Accédez à votre espace sécurisé</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selection Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400   px-1">
                  Quel est votre rôle ?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleInputChange('role', role.value)}
                      className={`
                        flex flex-col items-center gap-2 py-3 rounded-2xl transition-all duration-300 border-2
                        ${formData.role === role.value
                          ? currentTheme.activeTab
                          : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:border-gray-200'
                        }
                      `}
                    >
                      <div className={`p-2 rounded-xl transition-colors duration-300 ${formData.role === role.value ? currentTheme.activeTabIcon : 'bg-white text-gray-400'}`}>
                        {role.icon}
                      </div>
                      <span className="text-[10px] font-semibold  ">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <Input
                  label="Email Institutionnel"
                  type="email"
                  placeholder="nom.prenom@eief.edu.gn"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg"
                  required
                />

                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center group cursor-pointer">
                  <input type="checkbox" className={`w-5 h-5 rounded-lg border-gray-200 transition-all ${currentTheme.checkboxColor}`} />
                  <span className="ml-3 text-sm text-gray-500 group-hover:text-gray-700 font-medium">Resté connecté</span>
                </label>
                <button type="button" className={`text-sm font-semibold transition-colors ${currentTheme.linkColor}`}>
                  Oublié ?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className={`w-full py-6 text-xl rounded-2xl transition-all duration-300 active:scale-[0.98] ${currentTheme.submitBtn}`}
                loading={isLoading}
              >
                {isLoading ? 'Authentification...' : 'S\'identifier'}
              </Button>
            </form>

            {/* Quick Demo Footer */}
            <div className="mt-12 pt-8 border-t border-gray-50">
              <p className="text-center text-xs font-semibold text-gray-300   mb-6">Accès Démo</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['admin', 'enseignant', 'parent'].map(r => (
                  <button 
                    key={r}
                    onClick={() => handleDemoLogin(r as UserRole)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-xs font-semibold transition-colors border border-gray-100"
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-center mt-8 text-sm text-gray-400">
            Besoin d'aide ? <button className="text-green-600 font-semibold hover:underline">Support Technique</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
