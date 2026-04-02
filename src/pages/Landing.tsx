import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  Users,
  BookOpen,
  Bus,
  Utensils,
  ShieldCheck,
  QrCode,
  Globe,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Zap,
  Star,
  UserCircle,
  Trophy,
  LayoutDashboard,
  Download,
  Monitor,
  Sparkles,
  Award,
  Heart,
  Activity,
  CheckCircle
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Counter animation hook
  const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
      if (!started) return;
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [started, end, duration]);

    return { count, setStarted };
  };

  const stats = [
    { icon: Users, value: 983, label: "Élèves inscrits", suffix: "", color: "text-bleu-500", bg: "bg-bleu-50" },
    { icon: Award, value: 6, label: "Années d'excellence", suffix: "", color: "text-or-600", bg: "bg-or-50" },
    { icon: Star, value: 98, label: "Taux de réussite", suffix: "%", color: "text-rouge-500", bg: "bg-rouge-50" },
    { icon: BookOpen, value: 49, label: "Enseignants qualifiés", suffix: "", color: "text-vert-500", bg: "bg-vert-50" },
  ];

  const features = [
    {
      icon: Trophy,
      title: "Excellence Académique",
      desc: "Un programme rigoureux de la Crèche au Lycée, avec un suivi personnalisé de chaque élève.",
      gradient: "from-bleu-500 to-bleu-600"
    },
    {
      icon: ShieldCheck,
      title: "Environnement Sécurisé",
      desc: "Un campus surveillé et sécurisé pour le bien-être et la tranquillité de vos enfants.",
      gradient: "from-or-500 to-or-600"
    },
    {
      icon: Utensils,
      title: "Cantine Scolaire",
      desc: "Des repas équilibrés et variés préparés quotidiennement par notre équipe de cuisine.",
      gradient: "from-rouge-500 to-rouge-600"
    },
    {
      icon: Bus,
      title: "Transport Scolaire",
      desc: "Un service de ramassage couvrant les principaux quartiers de la ville.",
      gradient: "from-vert-500 to-vert-600"
    },
    {
      icon: Activity,
      title: "Activités Parascolaires",
      desc: "Karaté, sport, art et culture pour l'épanouissement complet de chaque enfant.",
      gradient: "from-bleu-500 to-or-500"
    },
    {
      icon: Monitor,
      title: "Suivi Numérique",
      desc: "Accès en ligne aux notes, bulletins et informations scolaires via la plateforme EIEF.",
      gradient: "from-rouge-500 to-vert-500"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-neutral-800 font-sans overflow-x-hidden">

      {/* ═══════════════════════════════════════════ */}
      {/* 🔷 HEADER / NAVIGATION STICKY              */}
      {/* ═══════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
        ? 'bg-white/95 backdrop-blur-2xl shadow-lg border-b border-neutral-200/50'
        : 'bg-white/80 backdrop-blur-xl'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-bleu-or rounded-xl p-1.5 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
                <img src="/logo_eief.jpeg" alt="EIEF Logo" className="w-full h-full object-contain rounded-lg bg-white" />
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="text-lg font-[900] tracking-tight gradient-bleu-or-text leading-none">EIEF</h1>
                <span className="text-[8px] font-bold tracking-[2px] text-neutral-400 uppercase">International School</span>
              </div>
            </div>

            {/* Portal Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/eleve/landing')}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-neutral-300 bg-transparent hover:border-bleu-500 hover:bg-bleu-500 hover:shadow-md transition-all"
              >
                <GraduationCap size={16} className="text-bleu-500 group-hover:text-white transition-colors" />
                <span className="bg-gradient-to-r from-bleu-500 to-bleu-700 bg-clip-text text-transparent group-hover:bg-none group-hover:text-white transition-all">Espace Élève</span>
              </button>
              <button
                onClick={() => navigate('/parent/landing')}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-neutral-300 bg-transparent hover:border-rouge-500 hover:bg-rouge-500 hover:shadow-md transition-all"
              >
                <Users size={16} className="text-rouge-500 group-hover:text-white transition-colors" />
                <span className="bg-gradient-to-r from-rouge-500 to-rouge-700 bg-clip-text text-transparent group-hover:bg-none group-hover:text-white transition-all">Espace Parent</span>
              </button>
              <button
                onClick={() => navigate('/employe/landing')}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-neutral-300 bg-transparent hover:border-vert-500 hover:bg-vert-500 hover:shadow-md transition-all"
              >
                <LayoutDashboard size={16} className="text-vert-500 group-hover:text-white transition-colors" />
                <span className="bg-gradient-to-r from-vert-500 to-vert-700 bg-clip-text text-transparent group-hover:bg-none group-hover:text-white transition-all">Portail Employé</span>
              </button>
              <button
                onClick={() => navigate('/admin/landing')}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-neutral-300 bg-transparent hover:border-or-500 hover:bg-or-500 hover:shadow-md transition-all"
              >
                <ShieldCheck size={16} className="text-or-500 group-hover:text-white transition-colors" />
                <span className="bg-gradient-to-r from-or-500 to-or-700 bg-clip-text text-transparent group-hover:bg-none group-hover:text-white transition-all">Espace Admin</span>
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs sm:text-sm font-bold hover:bg-neutral-800 shadow-lg hover:shadow-xl transition-all"
            >
              <UserCircle size={18} />
              Se Connecter
            </button>
          </div>
        </div>
      </nav>

      {/* 🔴 LOGIN MODAL 🔴 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-[#1E1A26]/40 backdrop-blur-md transition-opacity"
            onClick={() => setShowLoginModal(false)}
          />
          <div className="relative bg-[#F4F2F7] rounded-[2rem] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up border-[6px] border-white/40">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-bleu-50 text-bleu-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCircle size={32} />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Accédez à votre compte</h2>
              <p className="text-sm text-neutral-500 mt-2">Veuillez sélectionner votre profil de connexion</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carte Élève */}
              <button onClick={() => { setShowLoginModal(false); navigate('/login'); }} className="relative overflow-hidden group flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-neutral-100 bg-white hover:border-bleu-500 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-bleu-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-bleu-50 flex items-center justify-center text-bleu-600 group-hover:bg-bleu-600 group-hover:text-white transition-colors relative z-10 mb-3 shadow-sm">
                  <GraduationCap size={24} />
                </div>
                <span className="font-[800] text-[15px] sm:text-base text-neutral-800 relative z-10 mb-1">Élève</span>
                <span className="text-[11px] text-neutral-400 font-medium text-center relative z-10 leading-tight">Plateforme de cours et notes</span>
              </button>

              {/* Carte Parent */}
              <button onClick={() => { setShowLoginModal(false); navigate('/login'); }} className="relative overflow-hidden group flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-neutral-100 bg-white hover:border-rouge-500 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-rouge-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-rouge-50 flex items-center justify-center text-rouge-600 group-hover:bg-rouge-600 group-hover:text-white transition-colors relative z-10 mb-3 shadow-sm">
                  <Users size={24} />
                </div>
                <span className="font-[800] text-[15px] sm:text-base text-neutral-800 relative z-10 mb-1">Parent / Tuteur</span>
                <span className="text-[11px] text-neutral-400 font-medium text-center relative z-10 leading-tight">Suivi scolaire et scolarité</span>
              </button>

              {/* Carte Employé */}
              <button onClick={() => { setShowLoginModal(false); navigate('/login'); }} className="relative overflow-hidden group flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-neutral-100 bg-white hover:border-vert-500 hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-vert-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-vert-50 flex items-center justify-center text-vert-600 group-hover:bg-vert-600 group-hover:text-white transition-colors relative z-10 mb-3 shadow-sm">
                  <LayoutDashboard size={24} />
                </div>
                <span className="font-[800] text-[15px] sm:text-base text-neutral-800 relative z-10 mb-1">Employé / Prof</span>
                <span className="text-[11px] text-neutral-400 font-medium text-center relative z-10 leading-tight">Ressources humaines</span>
              </button>

              {/* Carte Administration */}
              <button onClick={() => { setShowLoginModal(false); navigate('/login'); }} className="relative overflow-hidden group flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-neutral-100 bg-white hover:border-or-500 hover:shadow-[0_8px_30px_rgba(255,184,0,0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-or-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-or-50 flex items-center justify-center text-or-600 group-hover:bg-or-600 group-hover:text-white transition-colors relative z-10 mb-3 shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <span className="font-[800] text-[15px] sm:text-base text-neutral-800 relative z-10 mb-1">Administration</span>
                <span className="text-[11px] text-neutral-400 font-medium text-center relative z-10 leading-tight">Pilotage système centralisé</span>
              </button>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-8 w-full py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════ */}
      {/* 🌟 HERO SECTION — Full Image Background     */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/logo_eief.jpeg"
            alt="École EIEF"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#091A33]/80 via-[#091A33]/85 to-[#091A33]/95" />
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-bleu-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-or-500/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rouge-500/10 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* School Name with multi-color */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-[900] leading-[0.9] tracking-tighter">
              <span className="text-rouge-400">ECOLE INTERNATIONALE</span>
              <br />
              <span className="text-white">LES ENFANTS </span>
              <span className="text-or-400">DU FUTUR</span>
            </h1>
          </div>

          {/* Slogan */}
          <p className="text-2xl sm:text-3xl md:text-4xl font-[800] italic text-or-400 mb-10 animate-fade-in-up delay-100">
            Faisons plus!
          </p>

          {/* Badge inscriptions */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-or-500/20 border border-or-400/30 rounded-full mb-10 animate-fade-in-up delay-200">
            <Star className="text-or-400" size={18} />
            <span className="text-sm font-bold text-or-300 tracking-wide">Inscriptions 2025-2026 ouvertes</span>
          </div>

          {/* Main Tagline */}
          <div className="mb-8 animate-fade-in-up delay-200">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[900] text-white leading-tight">
              Investir maintenant
              <br />
              <span className="text-or-400">pour Sourire </span>
              <span className="text-white">demain !</span>
            </h2>
          </div>

          <p className="text-lg text-neutral-300 font-medium max-w-2xl mx-auto mb-12 animate-fade-in-up delay-300 leading-relaxed">
            L'École Internationale Enfant du Futur offre un enseignement d'excellence dans un environnement
            sécurisé et stimulant, de la crèche au lycée.
          </p>

          {/* Action Buttons Grid */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up delay-400">
            <button
              onClick={() => navigate('/eleve/landing')}
              className="group flex items-center gap-3 px-8 py-4 gradient-bleu-or rounded-2xl text-white font-bold text-sm shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <GraduationCap size={22} />
              Espace Élève
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/parent/landing')}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-bleu-600 to-vert-500 rounded-2xl text-white font-bold text-sm shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <Users size={22} />
              Espace Parent
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/employe/landing')}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-vert-500 to-vert-700 rounded-2xl text-white font-bold text-sm shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <LayoutDashboard size={22} />
              Portail Employé
            </button>
            <button
              onClick={() => navigate('/login')}
              className="group flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold text-sm hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              <Download size={22} />
              Télécharger l'Appli
            </button>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,100 1080,0 1440,60 L1440,100 L0,100 Z" fill="#F0F4F8" />
          </svg>
        </div>
      </section>


      {/* ═══════════════════════════════════════════ */}
      {/* 🖼️ GALERIE — Notre école en images           */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#F0F4F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bleu-50/80 rounded-full mb-6 mt-4">
              <Star className="text-bleu-600" size={16} />
              <span className="text-xs font-bold text-bleu-600 uppercase tracking-wider">Immersion EIEF</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-[900] text-neutral-900 tracking-tight mb-4">
              Façonner les leaders <span className="gradient-bleu-or-text">de demain</span>
            </h2>
            <p className="text-neutral-500 font-medium max-w-2xl mx-auto text-sm md:text-base">
              Explorez l'environnement stimulant où l'excellence académique rencontre l'innovation technologique quotidienne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Image Card 1 */}
            <div className="group relative rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 aspect-[4/3]">
              <img src="/graduation.png" alt="Cérémonie de Graduation EIEF" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#091A33]/90 via-[#091A33]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <GraduationCap size={32} className="mb-4 text-or-400" />
                  <h3 className="text-2xl font-bold mb-2">Cérémonie de Graduation</h3>
                  <p className="text-sm text-neutral-200">La fierté de nos élèves diplômés et de leurs familles.</p>
                </div>
              </div>
            </div>

            {/* Image Card 2 */}
            <div className="group relative rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 aspect-[4/3]">
              <img src="/smartboard.jpg" alt="Anglais & Informatique" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-vert-900/90 via-vert-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <Monitor size={32} className="mb-4 text-vert-400" />
                  <h3 className="text-2xl font-bold mb-2">Anglais & Informatique</h3>
                  <p className="text-sm text-neutral-200">Enseignés dès le plus jeune âge grâce à nos écrans interactifs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════ */}
      {/* 📊 STATISTIQUES — Stats en chiffres          */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-8 px-6 bg-[#F0F4F8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card group">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-[900] text-neutral-900 tracking-tight">
                    {stat.value}{stat.suffix}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════ */}
      {/* 🧩 NOS SERVICES — Feature Cards Grid         */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bleu-50 rounded-full mb-6">
              <Sparkles className="text-bleu-500" size={16} />
              <span className="text-xs font-bold text-bleu-600 uppercase tracking-wider">Nos Piliers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-[900] text-neutral-900 tracking-tight mb-4">
              Pourquoi choisir <span className="gradient-rouge-vert-text">l'EIEF ?</span>
            </h2>
            <p className="text-neutral-500 font-medium max-w-2xl mx-auto text-lg">
              Découvrez les piliers qui font de notre institution un lieu d'excellence pour vos enfants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-elevated group p-8 lg:p-10 cursor-pointer"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  <feature.icon size={28} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-[800] text-neutral-900 mb-3 tracking-tight">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                  {feature.desc}
                </p>

                {/* Hover accent line */}
                <div className={`mt-6 h-1 w-0 group-hover:w-16 bg-gradient-to-r ${feature.gradient} rounded-full transition-all duration-500`} />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════ */}
      {/* 📢 CTA SECTION — Appel à l'action            */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 gradient-bleu-or relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-[900] text-white tracking-tight mb-4">
              Rejoignez notre communauté
            </h2>
            <p className="text-lg text-white/80 font-medium max-w-2xl mx-auto">
              Accédez à tous nos services numériques et suivez la scolarité de vos enfants en temps réel.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/eleve/landing')}
              className="group flex items-center gap-3 px-8 py-4 bg-white rounded-2xl text-bleu-600 font-bold text-sm shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <GraduationCap size={20} />
              Espace Élève
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/parent/landing')}
              className="group flex items-center gap-3 px-8 py-4 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl text-white font-bold text-sm hover:bg-white/25 hover:scale-105 transition-all duration-300"
            >
              <Users size={20} />
              Espace Parent
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/employe/landing')}
              className="group flex items-center gap-3 px-8 py-4 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl text-white font-bold text-sm hover:bg-white/25 hover:scale-105 transition-all duration-300"
            >
              <LayoutDashboard size={20} />
              Portail Employé
            </button>
            <button
              onClick={() => navigate('/admin/landing')}
              className="group flex items-center gap-3 px-8 py-4 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl text-white font-bold text-sm hover:bg-white/25 hover:scale-105 transition-all duration-300"
            >
              <ShieldCheck size={20} />
              Espace Admin
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════ */}
      {/* 📍 FOOTER — Pied de page institutionnel      */}
      {/* ═══════════════════════════════════════════ */}
      <footer className="bg-[#091A33] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 mb-16">

            {/* Col 1: Logo & Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-bleu-or rounded-xl p-1.5 shadow-lg">
                  <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain rounded-lg bg-white" />
                </div>
                <div>
                  <h3 className="text-xl font-[900] tracking-tight">EIEF</h3>
                  <span className="text-[9px] font-bold tracking-[2px] text-neutral-500 uppercase">International School</span>
                </div>
              </div>
              <p className="text-sm text-neutral-400 font-medium leading-relaxed max-w-sm">
                École Internationale Les Enfants du Futur — <span className="text-or-400 font-bold italic">"Faisons Plus !"</span>
                <br />
                Un enseignement d'excellence pour préparer les leaders de demain.
              </p>
              <div className="flex gap-4">
                {[Globe, Globe, Globe].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-neutral-500 hover:text-or-400 hover:bg-white/10 transition-all cursor-pointer">
                    <Icon size={18} />
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Liens Rapides */}
            <div className="space-y-6">
              <h4 className="text-sm font-[800] uppercase tracking-wider text-neutral-300">Liens Rapides</h4>
              <ul className="space-y-3">
                {[
                  { label: "Espace Admin", icon: ShieldCheck },
                  { label: "Portail Employé", icon: LayoutDashboard },
                  { label: "Espace Parent", icon: Users },
                  { label: "Espace Élève", icon: GraduationCap },
                  { label: "Télécharger l'Appli", icon: Download },
                ].map((link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (link.label === "Espace Élève") {
                          navigate('/eleve/landing');
                        } else if (link.label === "Espace Parent") {
                          navigate('/parent/landing');
                        } else if (link.label === "Portail Employé") {
                          navigate('/employe/landing');
                        } else if (link.label === "Espace Admin") {
                          navigate('/admin/landing');
                        } else {
                          navigate('/login');
                        }
                      }}
                      className="flex items-center gap-3 text-sm text-neutral-400 hover:text-or-400 transition-colors font-medium group"
                    >
                      <link.icon size={16} className="group-hover:scale-110 transition-transform" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div className="space-y-6">
              <h4 className="text-sm font-[800] uppercase tracking-wider text-neutral-300">Contact</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-bleu-500/10 rounded-xl flex items-center justify-center text-bleu-400 flex-shrink-0 mt-0.5">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Téléphone</p>
                    <p className="text-sm text-white font-semibold">+224 000 000 000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-or-500/10 rounded-xl flex items-center justify-center text-or-400 flex-shrink-0 mt-0.5">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm text-white font-semibold">direction@eief.edu.gn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-rouge-500/10 rounded-xl flex items-center justify-center text-rouge-400 flex-shrink-0 mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Adresse</p>
                    <p className="text-sm text-white font-semibold">Sanoyah Rail — Commune de Coyah</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 gradient-bleu-or rounded-full" />
              <div className="w-6 h-1 gradient-rouge-vert rounded-full" />
            </div>
            <span className="text-xs text-neutral-500 font-semibold tracking-wider uppercase">
              République de Guinée • Ministère de l'Éducation
            </span>
            <span className="text-xs text-neutral-600 font-medium">
              © {new Date().getFullYear()} EIEF — Tous droits réservés
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
