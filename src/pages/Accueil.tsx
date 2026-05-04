import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Globe,
  Clock,
  BookOpen,
  Sparkles,
  PhoneCall,
  MapPin,
  Heart,
  Target,
  Zap,
  ChevronDown,
  ArrowRightCircle,
  Sun,
  Moon,
  Gamepad2,
  Youtube,
  Facebook,
  Mail,
  Quote,
  Star,
  Award,
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui';
import { cn } from '../utils/cn';

const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const portals = [
    { name: 'Élève', icon: GraduationCap, path: '/eleve/dashboard', color: 'text-bleu-400', bg: 'bg-bleu-500/10', border: 'border-bleu-500/20', hover: 'hover:bg-bleu-600 hover:text-white', desc: 'Accédez à vos notes, devoirs et ressources numériques en un clic.' },
    { name: 'Parent', icon: UserCheck, path: '/parent/dashboard', color: 'text-rouge-400', bg: 'bg-rouge-500/10', border: 'border-rouge-500/20', hover: 'hover:bg-rouge-600 hover:text-white', desc: 'Suivez la scolarité de vos enfants et gérez vos paiements en toute sécurité.' },
    { name: 'Employé', icon: BookOpen, path: '/login', color: 'text-vert-400', bg: 'bg-vert-500/10', border: 'border-vert-500/20', hover: 'hover:bg-vert-600 hover:text-white', desc: 'Gérez vos classes, émargements et outils pédagogiques au quotidien.' },
    { name: 'Admin', icon: ShieldCheck, path: '/admin/dashboard', color: 'text-or-400', bg: 'bg-or-500/10', border: 'border-or-500/20', hover: 'hover:bg-or-600 hover:text-white', desc: 'Pilotez l\'établissement avec des outils de gestion administrative complets.' },
  ];

  const values = [
    { title: 'Excellence', desc: 'Nous visons les standards les plus élevés pour assurer la réussite de chaque élève.', icon: Target, color: 'text-or-500', bg: 'bg-or-50 dark:bg-or-950/30' },
    { title: 'Innovation', desc: 'L\'utilisation des technologies modernes au service d\'un apprentissage interactif.', icon: Zap, color: 'text-vert-600', bg: 'bg-vert-50 dark:bg-vert-950/30' },
    { title: 'Bienveillance', desc: 'Un environnement sécurisé et stimulant où chaque enfant s\'épanouit pleinement.', icon: Heart, color: 'text-rouge-500', bg: 'bg-rouge-50 dark:bg-rouge-950/30' },
  ];

  const testimonials = [
    { name: 'Mme Camara', role: 'Parente d\'élève', content: 'L\'encadrement à l\'EIEF est exceptionnel. Mon fils a fait des progrès remarquables en un an.', avatar: 'C' },
    { name: 'Dr. Sylla', role: 'Parent d\'élève', content: 'Le portail numérique facilite énormément le suivi des notes et des absences. C\'est un vrai plus.', avatar: 'S' },
    { name: 'Mariam K.', role: 'Élève Terminale', content: 'Les professeurs sont à notre écoute et les ressources en ligne nous aident énormément.', avatar: 'M' },
  ];

  const faqs = [
    { q: 'Comment s\'inscrire pour l\'année 2026-2027 ?', a: 'Les inscriptions sont ouvertes ! Vous pouvez remplir le formulaire en ligne ou vous rendre directement au campus muni du dossier.' },
    { q: 'Quels sont les cycles proposés par l\'EIEF ?', a: 'De la crèche à la Terminale, nous proposons un programme bilingue complet validé par les standards internationaux.' },
    { q: 'L\'école propose-t-elle un service de transport ?', a: 'Oui, nous disposons d\'une flotte de bus modernes et sécurisés couvrant la majorité des quartiers de Conakry.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">

      {/* 🚀 NAVBAR - GLASS PREMIUM (transparente sur le hero, solide après scroll) */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 sm:px-10",
        scrolled
          ? "py-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-2xl border-b border-gray-100 dark:border-white/5"
          : "py-5 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm"
      )}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 bg-white rounded-xl p-1.5 shadow-xl ring-2 ring-or-400/40 transition-transform group-hover:scale-110">
              <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span className={cn(
                "text-lg font-black tracking-tighter leading-none transition-colors",
                scrolled ? "text-gray-900 dark:text-white" : "text-white"
              )}>EIEF</span>
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-widest transition-colors",
                scrolled ? "text-vert-600 dark:text-or-400" : "text-or-300"
              )}>Éducation d'Excellence</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {['Accueil', 'Programmes', 'Admission', 'Contact', 'Jeux'].map(link => (
                <button
                  key={link}
                  onClick={() => navigate(link === 'Accueil' ? '/' : `/${link.toLowerCase()}`)}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    scrolled
                      ? "text-gray-500 dark:text-gray-400 hover:text-vert-600 dark:hover:text-white"
                      : "text-white/80 hover:text-or-300"
                  )}
                >
                  {link}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={cn(
                  "p-2.5 rounded-xl transition-all border",
                  scrolled
                    ? "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border-transparent dark:border-white/5"
                    : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-white/20"
                )}
              >
                {isDarkMode ? <Sun size={18} className="text-or-400" /> : <Moon size={18} />}
              </button>

              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-or-500 to-or-600 text-gray-950 font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-lg shadow-gold hover:shadow-2xl hover:from-or-400 hover:to-or-500 transition-all flex items-center gap-2"
              >
                Connexion <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          <button
            className={cn("lg:hidden p-2", scrolled ? "text-gray-900 dark:text-white" : "text-white")}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* 📱 MENU MOBILE */}
      {isMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/5 shadow-2xl animate-in fade-in slide-in-from-top">
          <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
            {['Accueil', 'Programmes', 'Admission', 'Contact', 'Jeux'].map(link => (
              <button
                key={link}
                onClick={() => {
                  navigate(link === 'Accueil' ? '/' : `/${link.toLowerCase()}`);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-900 dark:text-white font-bold text-sm rounded-lg hover:bg-vert-600 dark:hover:bg-or-600 hover:text-white transition-all"
              >
                {link}
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-lg font-bold text-sm flex items-center justify-between hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                {isDarkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
              </button>
              <Button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-or-500 to-or-600 text-gray-950 font-bold text-sm py-3 rounded-lg"
              >
                Connexion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 HERO IMMERSIF — IMAGE PLEIN ÉCRAN (style disaade.com) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* IMAGE DE FOND — utilise /school-front.jpeg ; fallback sur Img1.jpeg si absente */}
        <img
          src="/school-front.jpeg"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.src.endsWith('/Img1.jpeg')) img.src = '/Img1.jpeg';
          }}
          alt="EIEF — campus"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />

        {/* OVERLAY DÉGRADÉ — fond sombre + teinte verte (couleur du bâtiment) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-tr from-vert-900/60 via-transparent to-bleu-900/40" />

        {/* HALOS DÉCORATIFS */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-or-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />
        <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-vert-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />

        {/* GRAIN / NOISE TEXTURE (subtil) */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* CONTENU HERO */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-or-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Inscriptions 2026 — 2027 ouvertes
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[96px] font-black text-white leading-[0.95] tracking-tighter mb-8 italic drop-shadow-2xl"
          >
            Investir{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-400 to-or-500">
              Maintenant
            </span>
            ,
            <br />
            pour Sourire{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-300 via-vert-400 to-vert-500">
              Demain.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="text-base md:text-xl text-white/85 font-medium leading-relaxed max-w-2xl mx-auto mb-4"
          >
            L'École Internationale Les Enfants du Futur offre un enseignement d'excellence dans
            un environnement sécurisé et stimulant — de la crèche au lycée.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xs uppercase tracking-[0.4em] font-black text-or-300 mb-12"
          >
            Never Give Up
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Button
              onClick={() => navigate('/admission')}
              className="h-14 px-10 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest hover:from-or-400 hover:to-or-500 transition-all flex items-center gap-2 shadow-gold hover:shadow-2xl hover:scale-105"
            >
              S'inscrire <ArrowRight size={18} />
            </Button>
            <button
              onClick={() => navigate('/login')}
              className="h-14 px-10 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all"
            >
              Nos Portails
            </button>
            <button
              onClick={() => navigate('/jeux')}
              className="h-14 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
              <Gamepad2 size={18} /> Espace Jeux
            </button>
          </motion.div>

          {/* STATS BAR — flottante en bas du hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="grid grid-cols-3 gap-3 md:gap-8 max-w-3xl mx-auto p-4 md:p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <p className="text-3xl md:text-5xl font-black text-white tracking-tighter">939</p>
              <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-or-300 mt-1">Élèves</p>
            </div>
            <div className="flex flex-col items-center text-center border-x border-white/15">
              <p className="text-3xl md:text-5xl font-black text-white tracking-tighter">6</p>
              <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-or-300 mt-1">Années</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-3xl md:text-5xl font-black text-white tracking-tighter">98%</p>
              <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-or-300 mt-1">Succès</p>
            </div>
          </motion.div>
        </div>

        {/* SCROLL INDICATOR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Découvrir</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* 🎯 CITATION INSPIRANTE (motto de l'école) */}
      <section className="relative py-20 bg-gradient-to-br from-vert-600 via-vert-700 to-bleu-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Quote size={48} className="mx-auto text-or-300 mb-6 opacity-80" />
          <p className="text-2xl md:text-4xl font-black text-white leading-tight italic mb-6 tracking-tight">
            « Une bonne éducation est le plus grand héritage
            <br className="hidden md:block" />
            que vous puissiez laisser à vos enfants. »
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[2px] w-12 bg-or-400" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-or-300">EIEF — Faisons Plus !</span>
            <span className="h-[2px] w-12 bg-or-400" />
          </div>
        </div>
      </section>

      {/* ✨ NOS VALEURS */}
      <section className="py-20 bg-white dark:bg-gray-950 relative z-20 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Nos Valeurs
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Trois piliers, un seul engagement
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 border border-gray-100 dark:border-white/5 hover:border-or-300 dark:hover:border-or-500/30 hover:shadow-2xl transition-all duration-500"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform", v.bg, v.color)}>
                  <v.icon size={28} />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">{v.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🧩 PORTAILS */}
      <section className="py-20 bg-[#fafafa] dark:bg-gray-900/50 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 text-left self-center">
            <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">DIGITAL</Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              Accédez à votre <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-700 dark:from-vert-400 dark:to-bleu-400">espace personnel.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
              Une plateforme centralisée pour une gestion éducative innovante et performante, pour toute la communauté.
            </p>
            <Button onClick={() => navigate('/login')} className="h-12 px-8 bg-gradient-to-r from-vert-600 to-vert-700 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-xl hover:from-vert-500 hover:to-vert-600 transition-all">
              Se Connecter
            </Button>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {portals.map((portal, i) => (
              <Card key={i} onClick={() => navigate(portal.path)} className="group p-8 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-2xl dark:hover:bg-gray-800/60 rounded-2xl cursor-pointer transition-all flex gap-6 items-center text-left">
                <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-110", portal.bg, portal.color)}>
                  <portal.icon size={30} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 dark:text-white text-lg">{portal.name}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold leading-relaxed">{portal.desc}</p>
                </div>
                <ArrowRightCircle size={24} className="text-gray-200 dark:text-gray-600 group-hover:text-vert-600 dark:group-hover:text-or-400 transition-colors" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🎓 PROGRAMMES */}
      <section className="py-20 bg-white dark:bg-gray-950 relative z-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <div className="text-left">
              <Badge className="mb-4 bg-bleu-600/10 text-bleu-700 dark:text-bleu-400 border border-bleu-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
                Cursus
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                De la Maternelle au Lycée
              </h2>
            </div>
            <button
              onClick={() => navigate('/programmes')}
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-vert-700 dark:text-or-400 hover:gap-3 transition-all"
            >
              Voir tous les cycles <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { title: 'Primaire', desc: 'S\'éveiller, explorer et acquérir les bases fondamentales dans un environnement ludique.', icon: Globe, img: '/Img3.jpeg', col: 'text-bleu-600 dark:text-bleu-400', accent: 'from-bleu-500/20 to-transparent' },
              { title: 'Collège', desc: 'Structurer la pensée critique et approfondir les connaissances académiques essentielles.', icon: Clock, img: '/Img7.jpeg', col: 'text-or-600 dark:text-or-400', accent: 'from-or-500/20 to-transparent' },
              { title: 'Lycée', desc: 'Préparer l\'excellence pour les concours nationaux et les prestigieuses universités.', icon: Sparkles, img: '/Img4.jpeg', col: 'text-vert-600 dark:text-vert-400', accent: 'from-vert-500/20 to-transparent' },
            ].map((prog, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group overflow-hidden rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="h-56 overflow-hidden relative">
                  <img src={prog.img} alt={prog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className={cn("absolute inset-0 bg-gradient-to-t opacity-60", prog.accent)} />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <prog.icon size={18} className={prog.col} />
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{prog.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed min-h-[40px]">{prog.desc}</p>
                  <button
                    onClick={() => navigate('/programmes')}
                    className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all", prog.col)}
                  >
                    En savoir plus <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 💬 TÉMOIGNAGES & FAQ */}
      <section className="py-20 bg-[#fafafa] dark:bg-gray-900/30 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <Badge className="mb-4 bg-rouge-600/10 text-rouge-700 dark:text-rouge-400 border border-rouge-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Communauté
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">
              Ce qu'ils en disent
            </h2>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex gap-4 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-vert-500 to-bleu-700 rounded-full flex items-center justify-center font-black text-white shrink-0 shadow-lg">{t.avatar}</div>
                  <div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={12} className="fill-or-400 text-or-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2 italic leading-relaxed">"{t.content}"</p>
                    <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">{t.name} • {t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">
              Questions fréquentes
            </h2>
            <div className="space-y-3 font-sans">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className={cn(
                    "bg-white dark:bg-gray-800/40 rounded-2xl p-5 cursor-pointer border transition-all font-sans",
                    activeFaq === i
                      ? "border-or-400 dark:border-or-500/50 shadow-lg"
                      : "border-gray-100 dark:border-white/5 hover:shadow-md"
                  )}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 text-left">{f.q}</h4>
                    <ChevronDown size={18} className={cn("transition-transform shrink-0", activeFaq === i ? "rotate-180 text-or-500" : "text-gray-400")} />
                  </div>
                  {activeFaq === i && (
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium border-t border-gray-100 dark:border-white/5 pt-4 leading-relaxed">{f.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 CTA FINAL */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-bleu-800 via-vert-700 to-vert-800">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 30% 30%, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Award size={48} className="mx-auto text-or-300 mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 italic">
            Prêt à rejoindre l'EIEF&nbsp;?
          </h2>
          <p className="text-white/80 text-base md:text-lg font-medium max-w-xl mx-auto mb-10">
            Inscriptions ouvertes pour l'année scolaire 2026 — 2027. Notre équipe vous accompagne à chaque étape.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => navigate('/admission')}
              className="h-14 px-10 bg-or-500 hover:bg-or-400 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-gold transition-all hover:scale-105 flex items-center gap-2"
            >
              S'inscrire maintenant <ArrowRight size={18} />
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              className="h-14 px-10 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-white/30 hover:bg-white/20 transition-all"
            >
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

      {/* 🎯 FOOTER */}
      <footer className="py-12 bg-gray-950 text-white border-t border-white/5 text-left">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white p-1.5 rounded-lg shadow-sm">
                <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tighter text-white block leading-none">EIEF</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-or-400">Éducation d'Excellence</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium max-w-xs mb-8">
              Plus qu'une école, une communauté engagée pour l'avenir de vos enfants.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/share/18hUbQ4hgm/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all"
                title="YouTube"
              >
                <Youtube size={18} />
              </a>
              <a
                href="mailto:contact@eief.edu.gn"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-or-400 hover:bg-or-600 hover:text-gray-950 transition-all"
                title="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-black uppercase tracking-widest text-[10px] mb-6 text-or-400 italic">Liens</h5>
            <ul className="space-y-3 text-sm font-bold text-gray-300">
              <li className="hover:text-or-400 cursor-pointer transition-colors" onClick={() => navigate('/programmes')}>Programmes</li>
              <li className="hover:text-or-400 cursor-pointer transition-colors" onClick={() => navigate('/admission')}>Admission</li>
              <li className="hover:text-or-400 cursor-pointer transition-colors" onClick={() => navigate('/contact')}>Contact</li>
              <li className="hover:text-purple-400 cursor-pointer transition-colors flex items-center gap-2" onClick={() => navigate('/jeux')}>
                <Gamepad2 size={14} /> Espace Jeux
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-black uppercase tracking-widest text-[10px] mb-6 text-or-400 italic">Infos</h5>
            <ul className="space-y-4 text-sm font-bold text-gray-300">
              <li className="flex gap-2 items-center text-xs text-gray-400"><MapPin size={14} className="text-or-400" /> Conakry, Guinée</li>
              <li className="flex gap-2 items-center text-xs text-gray-400"><PhoneCall size={14} className="text-or-400" /> +224 611 00 00</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">© 2026 EIEF EDUCATION</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-or-400 italic">Faisons Plus !</p>
        </div>
      </footer>

    </div>
  );
};

export default Accueil;
