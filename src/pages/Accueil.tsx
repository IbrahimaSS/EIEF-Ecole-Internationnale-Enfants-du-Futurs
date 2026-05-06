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
  Briefcase,
  BookOpen,
  Sparkles,
  PhoneCall,
  MapPin,
  ShieldAlert,
  Bus,
  Utensils,
  Clock,
  Users,
  Award,
  Star,
  Sun,
  Moon,
  Facebook,
  Youtube,
  Mail,
  Download,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  GraduationCap as GraduationCapIcon,
  RefreshCcw,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../components/ui';
import { cn } from '../utils/cn';

const FACEBOOK_PAGE = 'https://www.facebook.com/share/18hUbQ4hgm/';

// ✅ REMPLACE ICI les IDs YouTube après avoir uploadé tes vidéos
// Format : prends l'URL https://www.youtube.com/watch?v=XXXXXXXXXXX
// et copie uniquement la partie après "v=" ici
const YT_VIDEOS = [
  { id: 'gWJi5Vx50zI', title: 'Vidéo EIEF 1' },
  { id: 'KrkrAY1l0TI', title: 'Vidéo EIEF 2' },
  { id: '5hN4gw8WloM', title: 'Vidéo EIEF 3' },
];

const NIVEAUX = [
  { value: 'creche', label: '🍼 Crèche', frais: { inscription: 1500000, scolarite: 4500000 } },
  { value: 'garderie', label: '🧸 Garderie', frais: { inscription: 1500000, scolarite: 4500000 } },
  { value: 'maternelle', label: '🌱 Maternelle (PS / MS / GS)', frais: { inscription: 1800000, scolarite: 5500000 } },
  { value: 'primaire', label: '📚 Primaire (CP au CM2)', frais: { inscription: 2000000, scolarite: 6500000 } },
  { value: 'college', label: '🎒 Collège (6ème à 3ème)', frais: { inscription: 2200000, scolarite: 7500000 } },
  { value: 'lycee', label: '🎓 Lycée (Seconde à Terminale)', frais: { inscription: 2500000, scolarite: 8500000 } },
];

const formatGNF = (n: number) => `${new Intl.NumberFormat('fr-GN').format(n)} GNF`;

const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tarifsTab, setTarifsTab] = useState<'inscription' | 'reinscription'>('inscription');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('');
  const [fichesOpen, setFichesOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);
    else setIsDarkMode(false);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const stats = [
    { value: '990', label: 'Élèves inscrits', icon: Users, color: 'text-vert-600', accent: 'border-vert-500', bg: 'bg-vert-50 dark:bg-vert-900/20' },
    { value: '+6', label: "Années d'excellence", icon: Award, color: 'text-or-600', accent: 'border-or-500', bg: 'bg-or-50 dark:bg-or-900/20' },
    { value: '100%', label: 'Taux de réussite', icon: Star, color: 'text-rouge-500', accent: 'border-rouge-500', bg: 'bg-rouge-50 dark:bg-rouge-900/20' },
    { value: '49', label: 'Enseignants qualifiés', icon: BookOpen, color: 'text-vert-600', accent: 'border-vert-500', bg: 'bg-vert-50 dark:bg-vert-900/20' },
  ];

  const services = [
    { title: 'Excellence Académique', desc: 'Un programme rigoureux de la Crèche au Lycée, avec un suivi personnalisé de chaque élève.', icon: BookOpen, color: 'text-vert-600', bg: 'bg-vert-50 dark:bg-vert-900/20' },
    { title: 'Environnement Sécurisé', desc: 'Un campus surveillé et sécurisé pour le bien-être et la tranquillité de vos enfants.', icon: ShieldCheck, color: 'text-rouge-500', bg: 'bg-rouge-50 dark:bg-rouge-900/20' },
    { title: 'Cantine Scolaire', desc: 'Des repas équilibrés et variés préparés quotidiennement par notre équipe de cuisine.', icon: Utensils, color: 'text-or-600', bg: 'bg-or-50 dark:bg-or-900/20' },
    { title: 'Transport Scolaire', desc: 'Un service de ramassage couvrant les principaux quartiers de la ville.', icon: Bus, color: 'text-vert-600', bg: 'bg-vert-50 dark:bg-vert-900/20' },
    { title: 'Activités Parascolaires', desc: "Karaté, sport, art et culture pour l'épanouissement complet de chaque enfant.", icon: Clock, color: 'text-rouge-500', bg: 'bg-rouge-50 dark:bg-rouge-900/20' },
    { title: 'Suivi Numérique', desc: 'Accès en ligne aux notes, bulletins et informations scolaires via EduGestion Pro.', icon: GraduationCapIcon, color: 'text-or-600', bg: 'bg-or-50 dark:bg-or-900/20' },
  ];

  // ✅ AJOUTE autant d'images que tu veux ici
  const galerie = [
    { src: '/Img1.jpeg', caption: 'Cérémonie de rentrée' },
    { src: '/Lycee.jpeg', caption: 'Remise des diplômes' },
    { src: '/principal.jpeg', caption: 'La Direction' },
    { src: '/Img3.jpeg', caption: 'Cours en primaire' },
    { src: '/Img4.jpeg', caption: 'Activités sportives' },
    { src: '/Img7.jpeg', caption: 'Vie au collège' },
  ];

  const portals = [
    { name: 'Espace Élève', subtitle: 'Notes & Cours', icon: GraduationCap, path: '/eleve/dashboard', bg: 'bg-purple-500', shadow: 'shadow-purple-500/40' },
    { name: 'Espace Parent', subtitle: 'Suivi scolaire', icon: UserCheck, path: '/parent/dashboard', bg: 'bg-or-500', shadow: 'shadow-or-500/40' },
    { name: 'Employé', subtitle: 'Espace RH', icon: Briefcase, path: '/login', bg: 'bg-vert-600', shadow: 'shadow-vert-500/40' },
    { name: 'Admin', subtitle: 'Gestion', icon: ShieldCheck, path: '/admin/dashboard', bg: 'bg-bleu-600', shadow: 'shadow-bleu-500/40' },
  ];

  const niveau = NIVEAUX.find((n) => n.value === selectedNiveau) || null;
  const fraisAffiches = niveau
    ? tarifsTab === 'inscription'
      ? niveau.frais.inscription
      : Math.round(niveau.frais.inscription * 0.6)
    : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">

      {/* 🚀 NAVBAR */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 sm:px-10',
          scrolled
            ? 'py-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-2xl border-b border-gray-100 dark:border-white/5'
            : 'py-5 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm',
        )}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 bg-white rounded-xl p-1.5 shadow-xl ring-2 ring-or-400/40 transition-transform group-hover:scale-110">
              <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span className={cn('text-lg font-black tracking-tighter leading-none transition-colors', scrolled ? 'text-gray-900 dark:text-white' : 'text-white')}>EIEF</span>
              <span className={cn('text-[8px] font-bold uppercase tracking-widest transition-colors', scrolled ? 'text-vert-600 dark:text-or-400' : 'text-or-300')}>Éducation d'Excellence</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {['Accueil', 'Programmes', 'Admission', 'Contact', 'Jeux'].map((link) => (
                <button
                  key={link}
                  onClick={() => navigate(link === 'Accueil' ? '/' : `/${link.toLowerCase()}`)}
                  className={cn('text-[10px] font-black uppercase tracking-widest transition-colors', scrolled ? 'text-gray-500 dark:text-gray-400 hover:text-vert-600 dark:hover:text-white' : 'text-white/80 hover:text-or-300')}
                >
                  {link}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className={cn('p-2.5 rounded-xl transition-all border', scrolled ? 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border-transparent dark:border-white/5' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-white/20')}>
                {isDarkMode ? <Sun size={18} className="text-or-400" /> : <Moon size={18} />}
              </button>
              <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-or-500 to-or-600 text-gray-950 font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-lg shadow-gold hover:shadow-2xl hover:from-or-400 hover:to-or-500 transition-all flex items-center gap-2">
                Connexion <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          <button className={cn('lg:hidden p-2', scrolled ? 'text-gray-900 dark:text-white' : 'text-white')} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/5 shadow-2xl">
          <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
            {['Accueil', 'Programmes', 'Admission', 'Contact', 'Jeux'].map((link) => (
              <button key={link} onClick={() => { navigate(link === 'Accueil' ? '/' : `/${link.toLowerCase()}`); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-gray-900 dark:text-white font-bold text-sm rounded-lg hover:bg-vert-600 dark:hover:bg-or-600 hover:text-white transition-all">
                {link}
              </button>
            ))}
            <Button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="w-full bg-gradient-to-r from-or-500 to-or-600 text-gray-950 font-bold text-sm py-3 rounded-lg">Connexion</Button>
          </div>
        </div>
      )}

      {/* 🌟 HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <img
          src="/principal.jpeg"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.src.endsWith('/Img1.jpeg')) img.src = '/Img1.jpeg';
          }}
          alt="EIEF — Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, rgba(220,38,38,0.55) 0%, rgba(220,38,38,0) 35%),
              linear-gradient(90deg, rgba(34,139,79,0.7) 0%, rgba(34,139,79,0.25) 35%, rgba(0,0,0,0.15) 60%, rgba(220,38,38,0.4) 100%),
              linear-gradient(135deg, rgba(245,158,11,0.4) 0%, transparent 50%, rgba(245,158,11,0.4) 100%)
            `,
          }}
        />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-32 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/30 shadow-lg">
            <Sparkles size={12} className="text-or-300" />
            <span className="text-xs font-black tracking-wide text-white">Inscriptions 2026-2027 ouvertes</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }} className="font-black uppercase tracking-tight leading-[1] mb-2 max-w-4xl">
            <span className="block text-2xl md:text-4xl text-rouge-500 drop-shadow-lg" style={{ letterSpacing: '0.15em' }}>ECOLE INTERNATIONALE</span>
            <span className="block text-4xl md:text-6xl lg:text-7xl mt-1 drop-shadow-lg">
              <span className="text-or-400">LES ENFANTS</span>{' '}
              <span className="text-vert-400">DU FUTUR</span>
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.3 }} className="text-lg md:text-2xl text-white italic font-bold mb-8 drop-shadow-lg">
            Faisons plus !
          </motion.p>

          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }} className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-3xl drop-shadow-2xl">
            Investir maintenant<br />
            <span className="text-or-400 italic">pour Sourire</span> demain !
          </motion.h2>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.5 }} className="text-base md:text-lg text-white/95 font-medium leading-relaxed max-w-2xl mb-10 drop-shadow-md">
            L'École Internationale Enfant du Futur offre un enseignement d'excellence dans un environnement moderne et bienveillant, de la Crèche au Lycée.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }} className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('/admission')} className="h-14 px-8 bg-vert-600 hover:bg-vert-700 text-white rounded-2xl font-black text-sm shadow-2xl shadow-vert-500/40 hover:scale-105 transition-all flex items-center gap-2">
              <GraduationCap size={20} /> Pré-inscrire mon enfant
            </Button>
            <button
              onClick={() => document.getElementById('decouvrir')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-14 px-8 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-sm border border-white/30 hover:bg-white/20 transition-all flex items-center gap-2"
            >
              Découvrir l'école <ChevronRightIcon size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 📊 STATS */}
      <section id="decouvrir" className="relative -mt-16 z-20 px-4">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className={cn('bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-2xl border-b-4', s.accent)}>
              <div className="flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', s.bg, s.color)}>
                  <s.icon size={22} />
                </div>
                <div>
                  <p className={cn('text-2xl md:text-3xl font-black', s.color)}>{s.value}</p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📸 GALERIE — défilement automatique droite → gauche */}
      <section className="py-20 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mb-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-vert-50 dark:bg-vert-900/20 text-vert-700 dark:text-vert-400">
              <ImageIcon size={14} />
              <span className="text-xs font-black uppercase tracking-widest">Galerie</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Notre école en images
            </h2>
          </div>
        </div>

        <div className="relative">
          {/* Fondu sur les bords */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white dark:from-gray-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white dark:from-gray-950 to-transparent pointer-events-none" />

          {/* Piste de défilement — dupliquée pour l'effet boucle infinie */}
          <div
            className="flex gap-5 w-max"
            style={{ animation: 'scrollLeft 24s ease-in-out infinite' }}
          >
            {[...galerie, ...galerie].map((img, i) => (
              <div
                key={i}
                className="relative w-80 h-56 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-white dark:border-white/10 group"
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-black drop-shadow">
                  {img.caption}
                </p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          /* 6 images uniques → 6 paliers. Chaque palier : ~1s de glissement + ~3s de pause */
          @keyframes scrollLeft {
            0%        { transform: translateX(0); }
            4.167%    { transform: translateX(-8.333%); }
            16.667%   { transform: translateX(-8.333%); }
            20.833%   { transform: translateX(-16.667%); }
            33.333%   { transform: translateX(-16.667%); }
            37.5%     { transform: translateX(-25%); }
            50%       { transform: translateX(-25%); }
            54.167%   { transform: translateX(-33.333%); }
            66.667%   { transform: translateX(-33.333%); }
            70.833%   { transform: translateX(-41.667%); }
            83.333%   { transform: translateX(-41.667%); }
            87.5%     { transform: translateX(-50%); }
            100%      { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* 🎯 POURQUOI CHOISIR NOTRE ÉCOLE */}
      <section className="py-20 bg-[#f8fafc] dark:bg-gray-900/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-rouge-50 dark:bg-rouge-900/20 text-rouge-600 dark:text-rouge-400">
              <Star size={14} />
              <span className="text-xs font-black uppercase tracking-widest">Nos services</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Pourquoi choisir notre école ?
            </h2>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium mt-4 max-w-2xl mx-auto">
              Un cadre exceptionnel et des méthodes pédagogiques modernes pour accompagner chaque enfant vers la réussite.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }} className="group p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-md hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-white/5">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform', s.bg, s.color)}>
                  <s.icon size={26} />
                </div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white mb-3">{s.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎬 NOTRE ÉCOLE EN VIDÉO — YouTube embed */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-or-50 dark:bg-or-900/20 text-or-600 dark:text-or-400">
              <Sparkles size={14} />
              <span className="text-xs font-black uppercase tracking-widest">Vidéos</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Notre école en vidéo
            </h2>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium mt-4 max-w-2xl mx-auto">
              Découvrez l'ambiance et les activités de l'École Internationale Les Enfants du Futur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {YT_VIDEOS.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl border border-gray-100 dark:border-white/5 transition-all hover:-translate-y-1"
                style={{ aspectRatio: '16/9' }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.title}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href={FACEBOOK_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-105"
            >
              <Facebook size={16} /> Voir toutes nos vidéos sur Facebook
            </a>
          </div>
        </div>
      </section>

      {/* 💰 TARIFS & FRAIS SCOLAIRES */}
      <section className="py-20 bg-[#f8fafc] dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-or-50 dark:bg-or-900/20 text-or-700 dark:text-or-400">
              <Sparkles size={14} />
              <span className="text-xs font-black uppercase tracking-widest">Transparence totale</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Tarifs & Frais Scolaires
            </h2>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium mt-4">
              Consultez les frais détaillés pour chaque niveau. Sélectionnez un niveau pour afficher la fiche complète.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white dark:bg-gray-900 rounded-2xl p-1.5 shadow-md border border-gray-100 dark:border-white/5">
              <button
                onClick={() => setTarifsTab('inscription')}
                className={cn('px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2', tarifsTab === 'inscription' ? 'bg-vert-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400')}
              >
                <span className="bg-bleu-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">NEW</span>
                Nouvelle inscription
              </button>
              <button
                onClick={() => setTarifsTab('reinscription')}
                className={cn('px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2', tarifsTab === 'reinscription' ? 'bg-bleu-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400')}
              >
                <RefreshCcw size={14} /> Réinscription
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-2 shadow-md border-2 border-bleu-500 mb-8">
            <div className="relative">
              <select
                value={selectedNiveau}
                onChange={(e) => setSelectedNiveau(e.target.value)}
                className="w-full px-6 py-4 pr-12 rounded-2xl bg-transparent text-base font-bold text-gray-900 dark:text-white outline-none appearance-none cursor-pointer"
              >
                <option value="">🎓 Choisir un niveau scolaire...</option>
                {NIVEAUX.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {niveau ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{niveau.label}</h3>
                <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', tarifsTab === 'inscription' ? 'bg-vert-100 text-vert-700' : 'bg-bleu-100 text-bleu-700')}>
                  {tarifsTab === 'inscription' ? 'Nouvelle inscription' : 'Réinscription'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-vert-50 dark:bg-vert-900/20 p-5 border border-vert-100 dark:border-vert-900/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-vert-700 dark:text-vert-400 mb-1">
                    Frais de {tarifsTab === 'inscription' ? 'inscription' : 'réinscription'}
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{formatGNF(fraisAffiches)}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Payable à l'inscription</p>
                </div>
                <div className="rounded-2xl bg-or-50 dark:bg-or-900/20 p-5 border border-or-100 dark:border-or-900/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-or-700 dark:text-or-400 mb-1">Scolarité annuelle</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{formatGNF(niveau.frais.scolarite)}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Payable en plusieurs versements</p>
                </div>
              </div>
              <Button onClick={() => navigate('/admission')} className="w-full h-12 bg-vert-600 hover:bg-vert-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2">
                <GraduationCap size={18} /> Pré-inscrire à ce niveau
              </Button>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-400">
                <GraduationCapIcon size={28} />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                Sélectionnez un niveau scolaire pour afficher les tarifs détaillés.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 🧩 ACCÉDEZ À VOTRE ESPACE */}
      <section className="relative py-20 bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#0a1628] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-or-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-vert-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Accédez à votre espace</h2>
            <p className="text-base md:text-lg text-white/70 font-medium mt-4 max-w-2xl mx-auto">
              Connectez-vous à votre portail pour accéder à vos informations scolaires.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {portals.map((p, i) => (
              <motion.button key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} onClick={() => navigate(p.path)} className="group flex flex-col items-center text-center">
                <div className={cn('w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-4 group-hover:scale-110 transition-transform', p.bg, p.shadow)}>
                  <p.icon size={32} />
                </div>
                <p className="text-base md:text-lg font-black text-white">{p.name}</p>
                <p className="text-xs font-medium text-white/50 mt-1">{p.subtitle}</p>
              </motion.button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate('/admission')} className="h-14 px-8 bg-or-500 hover:bg-or-400 text-gray-950 rounded-2xl font-black text-sm shadow-2xl shadow-or-500/40 hover:scale-105 transition-all flex items-center gap-2">
              <GraduationCap size={20} /> Pré-inscrire mon enfant <ArrowRight size={18} />
            </Button>
            <button className="h-14 px-8 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-sm border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2">
              <Download size={18} /> Installer l'Appli
            </button>
          </div>
        </div>
      </section>

      {/* 🎯 FOOTER */}
      <footer className="bg-[#0a1628] text-white border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white p-1.5 rounded-2xl shadow-lg ring-2 ring-or-400/30">
                <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-base font-black text-white leading-tight">École Internationale</p>
                <p className="text-sm font-bold text-vert-400 leading-tight">Les Enfants du Futur</p>
              </div>
            </div>
            <p className="text-sm text-white/60 font-medium leading-relaxed mb-6 max-w-xs">
              Un établissement d'excellence dédié à l'épanouissement et à la réussite de chaque enfant.
            </p>
            <div className="flex gap-3">
              <a href={FACEBOOK_PAGE} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all">
                <Youtube size={18} />
              </a>
              <a href="mailto:eiefinfos@enfantsdufutur.com" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-or-400 hover:bg-or-600 hover:text-gray-950 transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-base font-black text-white mb-6">Liens rapides</h5>
            <ul className="space-y-4 text-sm font-medium text-white/70">
              <li className="hover:text-or-400 cursor-pointer transition-colors flex items-center gap-2" onClick={() => navigate('/admin/dashboard')}><ChevronRightIcon size={14} /> Espace Admin</li>
              <li className="hover:text-or-400 cursor-pointer transition-colors flex items-center gap-2" onClick={() => navigate('/login')}><ChevronRightIcon size={14} /> Portail Employé</li>
              <li className="hover:text-or-400 cursor-pointer transition-colors flex items-center gap-2"><ChevronRightIcon size={14} /> Télécharger l'Appli</li>
              <li>
                <button
                  type="button"
                  onClick={() => setFichesOpen((v) => !v)}
                  aria-expanded={fichesOpen}
                  className="w-full text-left hover:text-or-400 transition-colors flex items-center gap-2 font-medium"
                >
                  <ChevronRightIcon
                    size={14}
                    className={cn('transition-transform', fichesOpen && 'rotate-90')}
                  />
                  Fiches de renseignements
                </button>

                {fichesOpen && (
                  <ul className="mt-3 ml-6 space-y-2 border-l border-white/10 pl-3 animate-in fade-in slide-in-from-top-1">
                    <li>
                      <a
                        href="/fichederenseignements.pdf"
                        download="FICHE DE RENSEIGNEMENT 2026-2027.pdf"
                        className="hover:text-or-400 transition-colors flex items-center gap-2 text-xs"
                      >
                        <Download size={12} className="text-or-400" /> Fiche 2026 — 2027
                      </a>
                    </li>
                    <li>
                      <a
                        href="/2026-2027EXAMEN.pdf"
                        download="FICHE DE RENSEIGNEMENT 2026-2027 - EXAMEN.pdf"
                        className="hover:text-or-400 transition-colors flex items-center gap-2 text-xs"
                      >
                        <Download size={12} className="text-or-400" /> Fiche Classes d'Examen
                      </a>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-base font-black text-white mb-6">Contact</h5>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-vert-500/15 flex items-center justify-center text-vert-400 shrink-0"><PhoneCall size={16} /></div>
                <span className="text-white/80 font-medium">+224 625 549 579 / 628 848 437</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rouge-500/15 flex items-center justify-center text-rouge-400 shrink-0"><Mail size={16} /></div>
                <span className="text-white/80 font-medium break-all">eiefinfos@enfantsdufutur.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-or-500/15 flex items-center justify-center text-or-400 shrink-0"><MapPin size={16} /></div>
                <span className="text-white/80 font-medium">C/Sanoyah - Sanoyah Rails, Guinée</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="max-w-[1400px] mx-auto px-6 py-6 text-center">
            <p className="text-xs font-medium text-white/40">© 2026 Edugestion Pro v1.0 — Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Accueil;

export const _RefShieldAlert = ShieldAlert;
