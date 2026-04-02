import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
  Database,
  Activity,
  Users,
  Settings,
  PieChart,
  Cpu,
  CheckCircle2
} from 'lucide-react';

const AdminLanding: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const modules = [
    {
      title: 'Contrôle Global',
      desc: 'Vue panoramique sur tous les campus, les flux financiers et les statistiques démographiques en temps réel.',
      icon: Globe
    },
    {
      title: 'Sécurité Maximale',
      desc: 'Gestion granulaire des rôles et permissions. Audit logs intégrés pour tracer la moindre modification système.',
      icon: Lock
    },
    {
      title: 'Architecture Données',
      desc: 'Gérez les bases de données, les sauvegardes planifiées et la conformité des données personnelles.',
      icon: Database
    },
    {
      title: 'Monitoring Technique',
      desc: 'État des serveurs, logs d\'erreurs, et gestion des intégrations. Anticipation des congestions réseau.',
      icon: Cpu
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-neutral-800 font-sans overflow-x-hidden selection:bg-or-500/30">
      
      {/* 🛑 HEADER STICKY */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
          ? 'bg-[#091A33]/95 backdrop-blur-2xl border-b border-or-500/20 shadow-lg'
          : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between">
            
            {/* Logo & Retour */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold ${scrolled ? 'text-white/80 hover:text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Accueil Principal</span>
              </button>

              <div className="h-6 w-px bg-white/20 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-or-400 to-or-600 rounded-xl p-0.5 shadow-lg">
                  <img src="/logo_eief.jpeg" alt="EIEF Logo" className="w-full h-full object-contain rounded-[10px] bg-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <h1 className="text-sm font-[900]   leading-none text-white">Espace Admin</h1>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all duration-300 ${scrolled ? 'bg-or-500 text-[#091A33] hover:scale-105 hover:bg-or-400' : 'bg-white/10 border border-white/20 text-white hover:bg-or-500 hover:text-[#091A33] hover:border-or-500 hover:scale-105'}`}
            >
              <ShieldAlert size={18} />
              Identification
            </button>
            
          </div>
        </div>
      </nav>

      {/* 🌟 HERO SECTION (DEGRADÉ BLEU NUIT + OR) */}
      <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-20 overflow-hidden flex flex-col justify-center min-h-[90vh] bg-gradient-to-br from-[#0a192f] via-[#091A33] via-50% to-or-500">
        
        {/* Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-or-500/20 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#0a192f] rounded-full blur-[120px]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Side: Text */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-or-500/10 border border-or-500/20 rounded-full mb-8 animate-fade-in-up">
              <Lock className="text-or-400" size={14} />
              <span className="text-xs font-semibold text-or-400 tracking-[0.3em] ">Réseau d'Administration EIEF</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[900] text-white leading-[1.1] mb-6  animate-fade-in-up delay-100 ">
              Système de pilotage <br />
              <span className="text-or-400">Centralisé.</span>
            </h1>
            
            <p className="text-base md:text-lg text-white/80 font-medium max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-fade-in-up delay-200">
              Interface de supervision stratégique. Assurez la gestion intégrale des infrastructures, attribuez les privilèges utilisateurs et supervisez l'activité réseau en temps réel.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 animate-fade-in-up delay-300">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-transparent border-2 border-or-500 text-or-400 rounded-full font-black text-lg shadow-[0_0_30px_rgba(255,184,0,0.15)] hover:shadow-[0_0_50px_rgba(255,184,0,0.4)] hover:bg-or-500 hover:text-[#091A33] transition-all duration-300  tracking-wide"
              >
                Authentification <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Right Side: Abstract Tropical/UI Circles */}
          <div className="w-full lg:w-1/2 relative flex justify-center items-center min-h-[400px]">
            {/* Outer dotted spinning ring */}
            <div className="absolute w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] border-2 border-dashed border-or-500/30 rounded-full animate-[spin_40s_linear_infinite]" />
            {/* Middle glowing ring */}
            <div className="absolute w-[250px] h-[250px] sm:w-[320px] sm:h-[320px] border border-white/10 rounded-full bg-gradient-to-tr from-or-500/10 to-transparent backdrop-blur-sm animate-[spin_20s_linear_infinite_reverse]" />
            {/* Inner solid ring */}
            <div className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] border-4 border-or-500/40 rounded-full" />
            
            {/* Center Lock / Core */}
            <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 bg-[#091A33] border border-or-500/50 shadow-[0_0_50px_rgba(255,184,0,0.5)] rounded-full flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="text-or-400" size={28} />
              <div className="text-[9px] sm:text-[10px] font-semibold text-white  ">Sécurisé</div>
            </div>

            {/* Orbiting particles */}
            <div className="absolute w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] animate-[spin_12s_linear_infinite]">
              <div className="absolute top-[10%] left-[50%] -ml-2 w-4 h-4 bg-or-400 rounded-full shadow-[0_0_15px_#FFB800]" />
              <div className="absolute bottom-[20%] right-[15%] w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
            </div>
          </div>

        </div>

        {/* Bottom wave matching F0F4F8 */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,100 1080,0 1440,60 L1440,100 L0,100 Z" fill="#F0F4F8"/>
          </svg>
        </div>
      </section>

      {/* 🧩 PANNEAU CENTRAL - METRICS & MODULES */}
      <section className="py-24 px-6 relative z-20 bg-[#F0F4F8]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-3xl sm:text-5xl font-[900] text-[#091A33]  mb-4">
                Architecture Système
              </h2>
              <p className="text-neutral-500 font-medium max-w-xl text-lg">
                Supervision intégrale des modules de gestion de l'infrastructure scolaire. Un pilotage basé sur la donnée.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-or-600 bg-or-50 px-6 py-3 rounded-full border border-or-100">
              <Activity className="text-or-500 animate-pulse" size={18} />
              Système Opérationnel
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((mod, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 border border-neutral-100 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-[#091A33]/5 rounded-2xl flex items-center justify-center text-[#091A33] mb-8 group-hover:scale-110 group-hover:bg-or-500 group-hover:text-white transition-all duration-300">
                  <mod.icon size={28} />
                </div>
                
                <h3 className="text-xl font-[800] text-[#091A33] mb-3">{mod.title}</h3>
                <p className="text-neutral-500 font-medium text-sm leading-relaxed">
                  {mod.desc}
                </p>

                <div className="mt-8 flex justify-end opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="text-or-500" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📊 SÉCURITÉ & AUDIT COMPLIANCE */}
      <section className="py-32 px-6 relative bg-white border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-or-500 rounded-[3rem] p-1 shadow-2xl overflow-hidden">
            <div className="bg-[#091A33] rounded-[2.5rem] p-10 md:p-16 lg:p-20 relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#091A33] rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-or-500/10 rounded-full blur-[100px]" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-[900] text-white mb-6  ">
                    Audit Log & <br/> <span className="text-or-400">Traçabilité</span>
                  </h2>
                  <p className="text-xl text-white/70 mb-8 font-medium">
                    Ne perdez jamais de vue ce qui se passe sur la plateforme. Chaque connexion, modification de note ou paiement est horodaté et sécurisé.
                  </p>
                  
                  <ul className="space-y-4">
                    {['Rapports financiers croisés automatiquement', 'Blocage dynamique des tentatives d\'intrusion', 'Sauvegardes chiffrées quotidiennes'].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-white font-medium">
                        <CheckCircle2 className="text-or-400" size={20} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="w-full lg:w-[400px] flex-shrink-0">
                  <div className="bg-[#0B1E3E] rounded-3xl border border-white/5 p-8 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-3 h-3 rounded-full bg-or-400 animate-pulse" />
                      <span className="font-semibold text-sm   text-[#6B8BB4]">Monitoring Actif</span>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[#6B8BB4]">Charge Serveur</span>
                          <span className="text-white font-semibold">12%</span>
                        </div>
                        <div className="w-full h-2 bg-[#1B3254] rounded-full overflow-hidden">
                          <div className="w-[12%] h-full bg-blue-400 rounded-full" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[#6B8BB4]">Taux de Requêtes</span>
                          <span className="text-white font-semibold">450 req/s</span>
                        </div>
                        <div className="w-full h-2 bg-[#1B3254] rounded-full overflow-hidden">
                          <div className="w-[30%] h-full bg-or-400 rounded-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[#6B8BB4]">Intégrité DB</span>
                          <span className="text-white font-semibold">Stable</span>
                        </div>
                        <div className="w-full h-2 bg-[#1B3254] rounded-full overflow-hidden">
                          <div className="w-full h-full bg-blue-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 BOTTOM CTA FULL WIDTH */}
      <section className="bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-[900] text-[#091A33]   mb-2">
              L'excellence requiert le contrôle
            </h2>
            <p className="text-neutral-500 font-semibold text-sm">
              Authentification stricte requise pour accéder aux modules d'administration.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-or-500 text-[#091A33] hover:bg-or-600 rounded-2xl font-black shadow-xl hover:scale-105 transition-all duration-300   text-sm"
          >
            Se Connecter <Lock size={18} />
          </button>
        </div>
      </section>

    </div>
  );
};

export default AdminLanding;
