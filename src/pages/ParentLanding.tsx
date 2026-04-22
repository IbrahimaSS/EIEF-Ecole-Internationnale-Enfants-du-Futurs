import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  ChevronLeft,
  FileText,
  CreditCard,
  MessageSquare,
  Bus,
  Award,
  ShieldCheck,
  Star,
  CheckCircle,
  Bell
} from 'lucide-react';

const ParentLanding: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('scolarite');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Award,
      title: "Suivi Académique",
      desc: "Accédez en temps réel aux notes, bulletins et appréciations des professeurs de vos enfants.",
      color: "text-bleu-600",
      bg: "bg-bleu-50",
      border: "border-bleu-100"
    },
    {
      icon: MessageSquare,
      title: "Communication",
      desc: "Échangez directement avec l'administration ou les enseignants pour un accompagnement optimal.",
      color: "text-vert-600",
      bg: "bg-vert-50",
      border: "border-vert-100"
    },
    {
      icon: CreditCard,
      title: "Gestion Financière",
      desc: "Consultez l'état de vos paiements, téléchargez vos reçus et soyez alertés des échéances.",
      color: "text-bleu-700",
      bg: "bg-bleu-50",
      border: "border-bleu-200"
    },
    {
      icon: Bus,
      title: "Services Rapides",
      desc: "Inscrivez vos enfants à la cantine scolaire, au transport ou aux activités périscolaires.",
      color: "text-vert-500",
      bg: "bg-vert-50",
      border: "border-vert-200"
    }
  ];

  const toolsTabs = [
    { 
      id: 'scolarite', 
      label: 'Dossier Scolaire', 
      icon: FileText, 
      title: 'Vue globale sur la scolarité',
      desc: 'Supervisez tous les aspects pédagogiques de l\'année. De l\'emploi du temps aux résultats officiels, gardez un œil sur leur progression.',
      features: ['Bulletins de notes trimestriels', 'Cahier de textes & Devoirs à rendre', 'Graphiques d\'évolution des moyennes']
    },
    { 
      id: 'finances', 
      label: 'Facturation & Frais', 
      icon: CreditCard, 
      title: 'Suivi Financier Simplifié',
      desc: 'Un tableau de bord financier clair et transparent pour gérer les frais de scolarité sans stress.',
      features: ['Historique de facturation', 'Téléchargement de reçus', 'Rappels automatiques d\'échéance']
    },
    { 
      id: 'communication', 
      label: 'Messagerie & Alertes', 
      icon: Bell, 
      title: 'Restons en Contact',
      desc: 'Recevez instantanément les avis de l\'école, les notifications d\'absence et les convocations aux réunions.',
      features: ['Messagerie sécurisée avec les enseignants', 'Notifications push (SMS / Appli)', 'Justification d\'absence en un clic']
    },
    { 
      id: 'logistique', 
      label: 'Cantine & Transport', 
      icon: Bus, 
      title: 'Services Additionnels',
      desc: 'Gérez facilement la logistique quotidienne de vos enfants : de l\'abonnement au bus au menu de la semaine.',
      features: ['Menu de la cantine (hebdomadaire)', 'Trajet du bus scolaire', 'Inscriptions aux clubs de l\'école']
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-neutral-800 font-sans overflow-x-hidden">
      
      {/* 🛑 HEADER STICKY */}
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
                <div className="w-10 h-10 bg-gradient-to-br from-bleu-600 to-vert-500 rounded-xl p-1 shadow-lg">
                  <img src="/logo_eief.jpeg" alt="EIEF Logo" className="w-full h-full object-contain rounded-lg bg-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <h1 className={`text-sm font-[900]  leading-none ${scrolled ? 'text-neutral-900' : 'text-white'}`}>Portail Parent</h1>
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

      {/* 🌟 HERO SECTION PARENT */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#091A33] via-bleu-700 via-50% to-vert-500 to-100%">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute top-40 -left-20 w-72 h-72 bg-vert-500/20 rounded-full blur-[80px]" />
          
          <svg className="absolute bottom-0 left-0 w-full h-24 text-[#F0F4F8] fill-current" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
            <ShieldCheck className="text-vert-300" size={16} />
            <span className="text-sm font-semibold text-white tracking-wide ">Sécurité et Transparence</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-[900] text-white leading-tight mb-6">
            Votre espace privilégié<br/>
            pour le <span className="text-vert-300">suivi scolaire</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
            Parce que la réussite de vos enfants demande une étroite collaboration, 
            la plateforme EIEF vous offre tous les outils pour les accompagner pas à pas.
          </p>

          <button 
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-bleu-800 rounded-2xl font-black text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
          >
            Accéder à l'Espace Parent
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* 🛡️ CARACTÉRISTIQUES (FEATURES) */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-[900] text-neutral-900  mb-4">
              Restez impliqué, <span className="text-transparent bg-clip-text bg-gradient-to-r from-bleu-600 to-vert-500">où que vous soyez</span>
            </h2>
            <p className="text-neutral-500 font-medium max-w-2xl mx-auto">
              Une interface intuitive conçue pour répondre à l'ensemble des besoins administratifs et pédagogiques des familles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <div key={i} className={`bg-white rounded-3xl p-8 border ${feat.border} hover:border-vert-400 shadow-sm hover:shadow-2xl hover:shadow-vert-500/20 transition-all duration-300 hover:-translate-y-2 group`}>
                <div className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={28} />
                </div>
                <h3 className="text-xl font-[800] text-neutral-900 mb-3">{feat.title}</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛠️ ONGLETS INTERACTIFS (FONCTIONNALITÉS) */}
      <section className="py-20 px-6 bg-white border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-vert-50 rounded-full mb-6">
              <Star className="text-vert-600" size={16} />
              <span className="text-xs font-semibold text-vert-700  ">Un portail complet</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-[900] text-neutral-900  mb-4">
              L'école à portée <span className="text-transparent bg-clip-text bg-gradient-to-r from-bleu-600 to-vert-500">de main</span>
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
                      ? 'bg-bleu-50 border-2 border-vert-400 shadow-md' 
                      : 'bg-[#F0F4F8] hover:bg-neutral-100 border-2 border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activeTab === tab.id ? 'bg-gradient-to-br from-bleu-600 to-vert-500 text-white' : 'bg-white text-neutral-400'
                  }`}>
                    <tab.icon size={24} />
                  </div>
                  <span className={`font-semibold text-lg ${activeTab === tab.id ? 'text-bleu-800' : ''}`}>
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
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-vert-600 mb-8 shadow-sm">
                    <tab.icon size={32} />
                  </div>
                  <h3 className="text-3xl font-[900] text-neutral-900 mb-4">{tab.title}</h3>
                  <p className="text-lg text-neutral-600 mb-8 leading-relaxed max-w-2xl">
                    {tab.desc}
                  </p>
                  
                  <div className="space-y-4">
                    {tab.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="text-bleu-500 flex-shrink-0" size={24} />
                        <span className="text-neutral-700 font-semibold">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10">
                    <button 
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-2 font-semibold text-bleu-600 hover:text-vert-600 transition-colors"
                    >
                      Configurer ce service <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 LOGIN CTA BOTTOM */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-neutral-900 rounded-[3rem] p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-bleu-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-vert-500/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-[900] text-white mb-4">
                Une scolarité sans surprise
              </h2>
              <p className="text-neutral-400 font-medium md:text-lg">
                Connectez-vous à la plateforme EIEF pour commencer à gérer et suivre l'évolution scolaire de vos enfants.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <button 
                onClick={() => navigate('/login')}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-bleu-600 to-vert-500 rounded-2xl text-white font-semibold shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Users size={24} />
                <span className="text-lg text-white">Créer / Mon Compte</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ParentLanding;
