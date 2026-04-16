import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  LayoutDashboard,
  Users,
  CalendarDays,
  FileBarChart,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

const EmployeLanding: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tools = [
    {
      icon: FileBarChart,
      title: "Gestion Pédagogique",
      desc: "Interface unifiée de saisie des notes, suivi des absences et édition rapide des bulletins trimestriels.",
      features: ["Saisie centralisée", "Génération de rapports", "Outils de statistiques"]
    },
    {
      icon: Users,
      title: "Ressources Humaines",
      desc: "Accédez à votre dossier professionnel, demandez vos congés et téléchargez vos fiches de paie.",
      features: ["Fiches de paie sécurisées", "Planification des congés", "Évaluations annuelles"]
    },
    {
      icon: CalendarDays,
      title: "Planification & Salles",
      desc: "Visualisez en temps réel l'emploi du temps global, la disponibilité des salles et les réunions programmées.",
      features: ["Réservation en un clic", "Vues par enseignant", "Notifications de changements"]
    },
    {
      icon: MessageCircle,
      title: "Communication",
      desc: "Canal direct avec la direction pour les circulaires officielles et la messagerie instantanée entre collègues.",
      features: ["Circulaires prioritaires", "Messagerie cryptée", "Groupes de travail"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans overflow-x-hidden selection:bg-emerald-500/30">

      {/* 🛑 HEADER STICKY (DARK THEME) */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
          ? 'bg-[#0B1120]/80 backdrop-blur-2xl border-b border-white/10 shadow-lg'
          : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between">

            {/* Logo & Retour */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Accueil Principal</span>
              </button>

              <div className="h-6 w-px bg-white/20 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl p-0.5 shadow-lg shadow-emerald-500/20">
                  <img src="/logo_eief.jpeg" alt="EIEF Logo" className="w-full h-full object-contain rounded-[10px] bg-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <h1 className="text-sm font-[900]   leading-none text-white">Portail Collaborateur</h1>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:bg-white hover:text-[#0B1120] hover:scale-105 transition-all duration-300"
            >
              <LayoutDashboard size={18} />
              Se Connecter
            </button>

          </div>
        </div>
      </nav>

      {/* 🌟 HERO SECTION (CENTERED, DARK HIGH-END) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Abstract Dark Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] opacity-70" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 animate-fade-in-up">
            <ShieldCheck className="text-emerald-400" size={16} />
            <span className="text-xs font-semibold text-emerald-300  ">Réseau Interne Sécurisé</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-[900] text-white leading-[1.1] mb-8  animate-fade-in-up delay-100">
            Le moteur de notre <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Excellence.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
            Une interface nouvelle génération conçue spécifiquement pour le corps enseignant et l'administration de l'EIEF. Efficacité, rapidité et clarté.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300"
            >
              Accéder au Portail <ArrowRight size={20} />
            </button>
            <button
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-white/5 text-white rounded-2xl font-semibold text-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <Layers size={20} /> Guide d'intégration
            </button>
          </div>
        </div>
      </section>

      {/* 🧩 OUTILS METIERS (GLASSMORPHISM CARDS) */}
      <section className="py-24 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-[900] text-white  mb-4">
              Vos outils du quotidien
            </h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg">
              Tout ce dont vous avez besoin pour gérer vos classes, vos documents et votre communication, regroupé au sein d'un seul tableau de bord analytique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {tools.map((tool, i) => (
              <div
                key={i}
                className="group relative bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] p-10 border border-white/5 hover:border-emerald-500/50 hover:bg-[#111827] transition-all duration-500 overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-300">
                    <tool.icon size={32} />
                  </div>

                  <h3 className="text-2xl font-[800] text-white mb-4">{tool.title}</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    {tool.desc}
                  </p>

                  <div className="space-y-3">
                    {tool.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                        <CheckCircle2 className="text-emerald-500" size={18} />
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📊 WHY THIS PORTAL */}
      <section className="py-24 px-6 border-y border-white/5 bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full mb-6">
                <Sparkles className="text-cyan-400" size={16} />
                <span className="text-xs font-semibold text-cyan-400  ">Performances</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-[900] text-white  mb-6 leading-tight">
                Zéro perte de temps.<br />
                <span className="text-slate-500">100% focus sur l'enseignement.</span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Notre architecture a été pensée pour éliminer la charge administrative redondante. Que ce soit pour valider un congé, réserver une salle audiovisuelle ou notifier les parents d'un devoir, le faire n'a jamais été aussi rapide.
              </p>

              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-1">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Single Sign-On (SSO)</h4>
                    <p className="text-slate-500">Une seule connexion pour tous vos services internes EIEF.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-cyan-400 mt-1">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Hautement Sécurisé</h4>
                    <p className="text-slate-500">Toutes les données RH et pédagogiques sont chiffrées de bout en bout.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-2 shadow-2xl border border-white/10">
                <div className="bg-[#0B1120] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px]" />
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="pb-8 border-b border-white/10">
                      <p className="text-slate-500 font-semibold mb-2   text-xs">Temps moyen de saisie</p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-white">60%</span>
                        <span className="text-emerald-400 font-semibold mb-1">rapide</span>
                      </div>
                    </div>
                    <div className="pb-8 border-b border-white/10">
                      <p className="text-slate-500 font-semibold mb-2   text-xs">Satisfaction globale</p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-white">4.9</span>
                        <span className="text-cyan-400 font-semibold mb-1">/ 5</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-2   text-xs">Disponibilité système</p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-white">99.9%</span>
                        <span className="text-emerald-400 font-semibold mb-1">uptime</span>
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
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-[#0B1120] to-cyan-900/30" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-[900] text-white mb-8 ">
            Votre Espace vous attend.
          </h2>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#0B1120] rounded-full font-black text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300"
          >
            Se Connecter Maintenant <ArrowRight size={20} />
          </button>
        </div>
      </section>

    </div>
  );
};

export default EmployeLanding;
