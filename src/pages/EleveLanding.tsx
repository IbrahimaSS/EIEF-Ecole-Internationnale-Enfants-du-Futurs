import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Activity,
  ChevronLeft,
  Trophy,
  Laptop,
  Library,
  Star,
  Calendar,
  FileText,
  Award,
  Video,
  CheckCircle
} from 'lucide-react';

const EleveLanding: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('ressources');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activities = [
    {
      icon: BookOpen,
      title: "Apprentissage d'Excellence",
      desc: "Des cours approfondis et des ressources pédagogiques adaptées pour viser l'excellence dans toutes les matières.",
      color: "text-bleu-500",
      bg: "bg-bleu-50",
      border: "border-bleu-100"
    },
    {
      icon: Laptop,
      title: "Outils Numériques",
      desc: "Accédez à tout moment à vos cours, exercices interactifs, et à la plateforme en ligne.",
      color: "text-or-500",
      bg: "bg-or-50",
      border: "border-or-100"
    },
    {
      icon: Activity,
      title: "Vie Associative & Clubs",
      desc: "Clubs d'anglais, d'informatique, de lecture et activités sportives pour développer vos talents.",
      color: "text-vert-500",
      bg: "bg-vert-50",
      border: "border-vert-100"
    },
    {
      icon: Trophy,
      title: "Compétitions & Défis",
      desc: "Participez aux olympiades, hackathons scolaires et compétitions sportives inter-classes.",
      color: "text-rouge-500",
      bg: "bg-rouge-50",
      border: "border-rouge-100"
    }
  ];

  const toolsTabs = [
    { 
      id: 'ressources', 
      label: 'Cahier & Devoirs', 
      icon: FileText, 
      title: 'Mon Cahier de Textes Numérique',
      desc: 'Suivez vos leçons abordées en classe et vos devoirs à faire à la maison. Plus aucune excuse pour oublier un exercice !',
      features: ['Emploi du temps intégré', 'Remise de devoirs en ligne', 'Notification de nouveaux exercices']
    },
    { 
      id: 'notes', 
      label: 'Notes & Résultats', 
      icon: Award, 
      title: 'Suivi de mes Évaluations',
      desc: 'Consultez vos notes dès qu\'elles sont publiées. Un accès direct et privé pour vous et vos parents.',
      features: ['Historique par semestre', 'Calcul de moyenne automatique', 'Graphe de progression']
    },
    { 
      id: 'planning', 
      label: 'Emploi du temps', 
      icon: Calendar, 
      title: 'Planning & Absences',
      desc: 'Visualisez vos cours de la semaine, les changements exceptionnels de salle ou les absences de professeurs.',
      features: ['Synchronisation instantanée', 'Justification d\'absence', 'Rappels de cours']
    },
    { 
      id: 'biblio', 
      label: 'Bibliothèque', 
      icon: Library, 
      title: 'Médiathèque Virtuelle',
      desc: 'Une immense collection d\'ouvrages, de vidéos pédagogiques et d\'anciennes épreuves pour vos révisions.',
      features: ['Accès 24/7', 'Modules de révision par matière', 'Corrections et corrigés-types']
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-neutral-800 font-sans overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════ */}
      {/* 🔷 HEADER / NAVIGATION STICKY              */}
      {/* ═══════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-2xl shadow-lg border-b border-neutral-200/50' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between">
            
            {/* Logo & Retour */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold ${scrolled ? 'text-neutral-600 hover:bg-neutral-100' : 'text-white hover:bg-white/20'}`}
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Accueil Principal</span>
              </button>
              
              <div className="h-6 w-px bg-white/30 hidden sm:block" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-bleu-or rounded-xl p-1 shadow-lg">
                  <img src="/logo_eief.jpeg" alt="EIEF Logo" className="w-full h-full object-contain rounded-lg bg-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <h1 className={`text-sm font-[900]  leading-none ${scrolled ? 'text-neutral-900' : 'text-white'}`}>Portail Élève</h1>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-bleu-600 rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Users size={18} />
              Se Connecter
            </button>
            
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════ */}
      {/* 🌟 HERO SECTION                            */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden gradient-bleu-or">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute top-40 -left-20 w-72 h-72 bg-or-500/20 rounded-full blur-[80px]" />
          
          <svg className="absolute bottom-0 left-0 w-full h-24 text-[#F0F4F8] fill-current" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
            <Star className="text-or-300" size={16} />
            <span className="text-sm font-semibold text-white tracking-wide ">L'avenir vous appartient</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-[900] text-white leading-tight mb-6">
            Découvrez <span className="text-or-300">l'Expérience Élève</span><br/>
            à la plateforme EIEF
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
            Un environnement conçu pour stimuler votre curiosité, développer vos talents et vous préparer aux défis de demain. Connectez-vous pour accéder à votre espace personnel.
          </p>

          <button 
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-bleu-600 rounded-2xl font-black text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
          >
            Accéder à mon Espace
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* 📚 CE QUE FONT LES ÉLÈVES                  */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-[900] text-neutral-900  mb-4">
              Votre quotidien à <span className="gradient-bleu-or-text">l'EIEF</span>
            </h2>
            <p className="text-neutral-500 font-medium max-w-2xl mx-auto">
              Bien plus qu'une simple école, l'EIEF est un lieu de vie, de découverte et d'épanouissement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((act, i) => (
              <div key={i} className={`bg-white rounded-3xl p-8 border ${act.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group`}>
                <div className={`w-14 h-14 ${act.bg} ${act.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <act.icon size={28} />
                </div>
                <h3 className="text-xl font-[800] text-neutral-900 mb-3">{act.title}</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                  {act.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* 🛠️ ONGLETS INTERACTIFS (FONCTIONNALITÉS)   */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-or-50 rounded-full mb-6">
              <Laptop className="text-or-500" size={16} />
              <span className="text-xs font-semibold text-or-600  ">Plateforme Numérique</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-[900] text-neutral-900  mb-4">
              Les outils pour ta <span className="gradient-bleu-or-text">Réussite</span>
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Tabs Sidebar */}
            <div className="w-full lg:w-1/3 flex flex-col gap-3">
              {toolsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-bleu-50 border-2 border-bleu-500 shadow-md' 
                      : 'bg-[#F0F4F8] hover:bg-neutral-100 border-2 border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activeTab === tab.id ? 'bg-bleu-500 text-white' : 'bg-white text-neutral-400'
                  }`}>
                    <tab.icon size={24} />
                  </div>
                  <span className={`font-semibold text-lg ${activeTab === tab.id ? 'text-bleu-600' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="w-full lg:w-2/3">
              {toolsTabs.map((tab) => (
                <div 
                  key={tab.id} 
                  className={`bg-[#F0F4F8] rounded-[2.5rem] p-8 md:p-12 transition-all duration-500 ${
                    activeTab === tab.id ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-bleu-500 mb-8 shadow-sm">
                    <tab.icon size={32} />
                  </div>
                  <h3 className="text-3xl font-[900] text-neutral-900 mb-4">{tab.title}</h3>
                  <p className="text-lg text-neutral-600 mb-8 leading-relaxed max-w-2xl">
                    {tab.desc}
                  </p>
                  
                  <div className="space-y-4">
                    {tab.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="text-or-500 flex-shrink-0" size={24} />
                        <span className="text-neutral-700 font-semibold">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10">
                    <button 
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-2 font-semibold text-bleu-600 hover:text-or-500 transition-colors"
                    >
                      Découvrir ce module <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* 🎬 VIDEO / EXTRA SECTION                   */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden bg-neutral-900 aspect-video shadow-2xl group">
            <img 
              src="/logo_eief.jpeg" 
              alt="EIEF Campus" 
              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <button className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white mb-6 hover:bg-white hover:text-bleu-600 transition-all hover:scale-110 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                <Video size={32} className="ml-2" />
              </button>
              <h3 className="text-3xl md:text-5xl font-[900] text-white  mb-4">
                Visitez notre campus
              </h3>
              <p className="text-white/80 font-medium max-w-xl">
                Plongez au cœur de l'EIEF et découvrez les espaces où vous construirez votre avenir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* 🚀 LOGIN CTA                               */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-neutral-900 rounded-[3rem] p-12 lg:p-16 relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-bleu-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-or-500/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-[900] text-white mb-4">
                Prêt à consulter vos résultats ?
              </h2>
              <p className="text-neutral-400 font-medium md:text-lg">
                Connectez-vous à la plateforme EIEF pour accéder à vos notes, vos devoirs, votre emploi du temps et bien plus.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <button 
                onClick={() => navigate('/login')}
                className="group flex items-center gap-3 px-8 py-4 gradient-bleu-or rounded-2xl text-white font-semibold shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <GraduationCap size={24} />
                <span className="text-lg text-white">Se connecter</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EleveLanding;
