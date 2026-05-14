import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  ShieldAlert,
  Bus,
  Utensils,
  Users,
  Award,
  Star,
  Sun,
  Moon,
  Gamepad2,
  Rocket,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Mail,
  Zap,
  Heart,
  ChevronDown,
  Download,
  Youtube,
  RefreshCcw,
  Briefcase
} from 'lucide-react';
import { Button } from '../components/ui';
import { Card } from '../components/ui'; // Assuming Card is available based on context
import { cn } from '../utils/cn';

// --- DATA FROM UPSTREAM ---
const FACEBOOK_PAGE = 'https://www.facebook.com/share/18hUbQ4hgm/';

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

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", className)}>
    {children}
  </div>
);

const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tarifsTab, setTarifsTab] = useState<'inscription' | 'reinscription'>('inscription');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('');
  const [fichesOpen, setFichesOpen] = useState<boolean>(false);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

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
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const stats = [
    { value: '990', label: 'Élèves inscrits', icon: Users, color: 'text-blue-500' },
    { value: '+6', label: "Années d'excellence", icon: Award, color: 'text-amber-500' },
    { value: '100%', label: 'Taux de réussite', icon: Star, color: 'text-purple-500' },
    { value: '49', label: 'Enseignants qualifiés', icon: BookOpen, color: 'text-emerald-500' },
  ];

  const portals = [
    { name: 'Élève', icon: GraduationCap, path: '/eleve/dashboard', color: 'text-blue-500', glow: 'glow-blue', bg: 'bg-blue-500/10', desc: 'Notes, devoirs et ressources numériques.' },
    { name: 'Parent', icon: UserCheck, path: '/parent/dashboard', color: 'text-red-500', glow: 'glow-red', bg: 'bg-red-500/10', desc: 'Suivi scolaire et gestion des paiements.' },
    { name: 'Employé', icon: Briefcase, path: '/login', color: 'text-emerald-500', glow: 'glow-emerald', bg: 'bg-emerald-500/10', desc: 'Gestion pédagogique et outils quotidiens.' },
    { name: 'Admin', icon: ShieldCheck, path: '/admin/dashboard', color: 'text-amber-500', glow: 'glow-orange', bg: 'bg-amber-500/10', desc: 'Pilotage complet de l\'établissement.' },
  ];

  const niveau = NIVEAUX.find((n) => n.value === selectedNiveau) || null;
  const fraisAffiches = niveau
    ? tarifsTab === 'inscription'
      ? niveau.frais.inscription
      : Math.round(niveau.frais.inscription * 0.6)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-purple-500/30 overflow-x-hidden transition-colors duration-700 mesh-gradient-bg">
      
      {/* 🚀 NAV FLOATING GLASS - LEVEL 7 */}
      <nav className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 w-[95%] max-w-[1200px] rounded-[2rem] border border-white/20 dark:border-white/5 backdrop-blur-2xl px-6 py-3 flex items-center justify-between",
        scrolled ? "bg-white/70 dark:bg-gray-950/70 shadow-2xl translate-y-0" : "bg-white/40 dark:bg-gray-900/20 translate-y-2"
      )}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
           <div className="w-10 h-10 bg-white rounded-xl p-1.5 shadow-xl transition-all group-hover:rotate-12 group-hover:scale-110">
              <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
           </div>
           <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tighter leading-none text-gray-900 dark:text-white">EIEF</span>
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Futures Leaders</span>
           </div>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {[
              { label: 'Accueil', path: '/' },
              { label: 'Programmes', path: '/programmes' },
              { label: 'Pré-inscription', path: '/preinscription' },
              { label: 'Contact', path: '/contact' }
            ].map(link => (
              <button 
                key={link.label} 
                onClick={() => navigate(link.path)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-all relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full" />
              </button>
            ))}
            <button 
              onClick={() => navigate('/jeux')}
              className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Gamepad2 size={14} /> Jeux
            </button>
          </div>
          
          <div className="flex items-center gap-3 border-l border-gray-200 dark:border-white/10 pl-6">
             <button 
               onClick={toggleTheme}
               className="p-2.5 bg-white/50 dark:bg-white/5 rounded-xl hover:scale-110 transition-all text-gray-600 dark:text-gray-400"
             >
               {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
             </button>

             <Button 
               onClick={() => navigate('/login')}
               className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-[10px] uppercase tracking-widest px-8 h-11 rounded-xl shadow-xl hover:shadow-purple-500/20 transition-all"
             >
               Accès Portail
             </Button>
          </div>
        </div>

        <button className="lg:hidden p-2 text-gray-900 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-24 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-2xl p-6 space-y-4"
          >
            {[
              { label: 'Accueil', path: '/' },
              { label: 'Programmes', path: '/programmes' },
              { label: 'Pré-inscription', path: '/preinscription' },
              { label: 'Contact', path: '/contact' },
              { label: 'Jeux', path: '/jeux' },
            ].map((link) => (
              <button key={link.label} onClick={() => { navigate(link.path); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-gray-900 dark:text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-purple-600 hover:text-white transition-all">
                {link.label}
              </button>
            ))}
            <Button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="w-full bg-purple-600 text-white font-black text-xs uppercase py-4 rounded-xl">Accès Portail</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 HERO IMMERSIF - LEVEL 7 */}
      <section className="relative min-h-screen flex items-center pt-20 z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div style={{ opacity }} className="relative z-10 text-left">
            <Badge className="mb-8 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-black text-[10px] uppercase tracking-[0.4em] px-6 h-10 rounded-2xl flex items-center w-fit">
               <Sparkles size={14} className="mr-2" /> SESSION 2026-2027
            </Badge>
            
            <h1 className="text-4xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter mb-10">
              L'ÉCOLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 animate-shimmer">INTERNATIONALE</span> <br />
              DES ENFANTS DU FUTUR.
            </h1>
            
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg mb-12">
              Investir maintenant <span className="text-purple-600 italic">pour Sourire</span> demain ! Un enseignement d'excellence de la Crèche au Lycée.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <Button onClick={() => navigate('/preinscription')} className="h-16 px-10 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 hover:glow-purple transition-all flex items-center gap-3">
                Pré-inscrire mon enfant <Rocket size={20} />
              </Button>
              <button 
                onClick={() => document.getElementById('decouvrir')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-16 px-10 glass-card-premium border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all"
              >
                Découvrir l'école
              </button>
            </div>
            
            {/* Stats Minimalistes */}
            <div className="mt-20 flex gap-12">
               {stats.map((s, i) => (
                 <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <s.icon size={16} className={s.color} />
                       <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{s.value}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</span>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Compo visuelle Hero */}
          <div className="relative h-[600px] hidden lg:block">
             <motion.div 
               style={{ y: y1 }}
               className="absolute top-0 right-0 w-[80%] h-[80%] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 z-20"
             >
                <img src="/principal.jpeg" alt="EIEF" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" />
             </motion.div>
             <motion.div 
               style={{ y: y2 }}
               className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 z-30"
             >
                <img src="/Img1.jpeg" alt="EIEF" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent" />
             </motion.div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-700" />
          </div>
        </div>
      </section>

      {/* 🔮 PORTAILS - ACCES KEYS LEVEL 7 */}
      <section id="decouvrir" className="py-32 relative z-20 bg-slate-100/30 dark:bg-gray-950/30 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter">
              VOTRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 animate-shimmer">PASSERELLE</span> DIGITALE.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium italic">Choisissez votre profil pour entrer dans l'écosystème EIEF.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {portals.map((portal, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -15 }}
                onClick={() => navigate(portal.path)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 rounded-[2.5rem] -m-1 blur-sm group-hover:blur-md transition-all" />
                <div className="relative h-full p-10 glass-card-premium border-white/50 dark:border-white/5 flex flex-col items-center text-center group-hover:glow-purple duration-500 overflow-hidden">
                  <div className={`w-20 h-20 rounded-3xl ${portal.bg} ${portal.color} flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                    <portal.icon size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{portal.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 flex-1">{portal.desc}</p>
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <ArrowRight size={20} />
                  </div>
                  <span className="absolute -bottom-4 -left-4 text-8xl font-black text-gray-100 dark:text-white/5 pointer-events-none group-hover:opacity-20 transition-opacity">0{i+1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎓 PROGRAMMES - ASYMMETRIC GRID */}
      <section className="py-32 bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden relative z-30 shadow-2xl">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 text-left">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <Badge className="bg-purple-600/10 text-purple-600 border-purple-500/20 mb-6">CURRICULUM</Badge>
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-6">
                L'EXCELLENCE À <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 animate-shimmer">CHAQUE ÉTAPE.</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg italic">De la Maternelle au Lycée, nous préparons les leaders de demain.</p>
            </div>
            <Button onClick={() => navigate('/preinscription')} className="h-16 px-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl">Pré-inscrire maintenant</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { title: 'Primaire', desc: 'Éveil, exploration et bases fondamentales.', icon: Globe, img: '/Img3.jpeg' },
              { title: 'Collège', desc: 'Pensée critique et rigueur académique.', icon: Clock, img: '/Img7.jpeg' },
              { title: 'Lycée', desc: 'Préparation aux grandes universités mondiales.', icon: Sparkles, img: '/Img4.jpeg' },
            ].map((prog, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="group relative overflow-hidden rounded-[3rem] aspect-[4/5] shadow-2xl border border-gray-100 dark:border-white/5"
              >
                <img src={prog.img} alt={prog.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-950 via-white/40 dark:via-gray-950/20 to-transparent p-12 flex flex-col justify-end">
                   <div className="w-12 h-12 rounded-xl bg-purple-600/10 dark:bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 text-purple-600 dark:text-white">
                      <prog.icon size={24} />
                   </div>
                   <h3 className="text-3xl font-black mb-4 text-gray-900 dark:text-white">{prog.title}</h3>
                   <p className="text-gray-600 dark:text-gray-300 font-medium mb-8 leading-relaxed">{prog.desc}</p>
                   <button onClick={() => navigate('/programmes')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 group-hover:text-purple-900 dark:group-hover:text-white transition-colors">
                      Découvrir le cursus <ArrowRight size={14} />
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏅 POURQUOI NOUS ? */}
      <section className="py-24 bg-slate-50 dark:bg-gray-950 relative overflow-hidden z-40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="text-left">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-6">SERVICES D'EXCELLENCE</Badge>
                <h2 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none mb-8">
                  UNE ÉDUCATION <br /> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 animate-shimmer">SANS FRONTIÈRES.</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { t: 'Cantine Scolaire', d: 'Repas équilibrés préparés quotidiennement.', i: Utensils },
                     { t: 'Transport Sécurisé', d: 'Service de ramassage couvrant toute la ville.', i: Bus },
                     { t: 'Innovation Tech', d: 'Codage et robotique dès le primaire.', i: Rocket },
                     { t: 'Suivi Numérique', d: 'Notes et bulletins en temps réel sur EduGestion.', i: Zap }
                   ].map((item, i) => (
                     <div key={i} className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-purple-500/30 transition-all group">
                        <item.i size={24} className="text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-black text-sm mb-2">{item.t}</h4>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.d}</p>
                     </div>
                   ))}
                </div>
             </div>
             <div className="relative">
                <div className="aspect-square rounded-[4rem] overflow-hidden shadow-3xl border-8 border-white dark:border-white/5 relative z-10">
                   <img src="/Img7.jpeg" alt="Excellence" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -right-8 bottom-20 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-2xl z-20 border border-gray-100 dark:border-white/10 animate-float">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                         <Award size={28} />
                      </div>
                      <div className="text-left">
                         <p className="text-2xl font-black tracking-tighter">100%</p>
                         <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Réussite aux Examens</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🎬 VIDÉOS - UPSTREAM CONTENT */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/10 text-amber-600 mb-4">IMMERSION</Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Notre école en vidéo</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {YT_VIDEOS.map((v, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-white/5 aspect-video bg-gray-100 dark:bg-gray-900">
                <iframe src={`https://www.youtube.com/embed/${v.id}`} title={v.title} width="100%" height="100%" frameBorder="0" allowFullScreen />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href={FACEBOOK_PAGE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 h-12 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
              <Facebook size={16} /> Suivre notre actualité sur Facebook
            </a>
          </div>
        </div>
      </section>

      {/* 💰 TARIFS - UPSTREAM CONTENT */}
      <section className="py-32 bg-slate-100/50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-purple-600/10 text-purple-600 mb-4">TRANSPARENCE</Badge>
            <h2 className="text-4xl font-black tracking-tighter">Tarifs & Scolarité</h2>
          </div>

          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-xl">
              <button onClick={() => setTarifsTab('inscription')} className={cn('px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', tarifsTab === 'inscription' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500')}>Inscription</button>
              <button onClick={() => setTarifsTab('reinscription')} className={cn('px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', tarifsTab === 'reinscription' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500')}>Réinscription</button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-4 shadow-2xl border-2 border-purple-500/20 mb-10">
            <div className="relative">
              <select value={selectedNiveau} onChange={(e) => setSelectedNiveau(e.target.value)} className="w-full px-8 py-5 rounded-2xl bg-transparent text-sm font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                <option value="">🎓 Choisir un niveau scolaire...</option>
                {NIVEAUX.map((n) => <option key={n.value} value={n.value} className="bg-white dark:bg-gray-900">{n.label}</option>)}
              </select>
              <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {niveau && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card-premium p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black">{niveau.label}</h3>
                  <Badge className={tarifsTab === 'inscription' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}>
                    {tarifsTab === 'inscription' ? 'Nouvelle inscription' : 'Réinscription'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Frais Fixes</p>
                    <p className="text-3xl font-black text-purple-600">{formatGNF(fraisAffiches)}</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Scolarité Annuelle</p>
                    <p className="text-3xl font-black text-blue-600">{formatGNF(niveau.frais.scolarite)}</p>
                  </div>
                </div>
                <Button onClick={() => navigate('/preinscription')} className="w-full h-16 bg-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl">Lancer la Pré-inscription</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 🎯 FOOTER ULTRA-PREMIUM */}
      <footer className="pt-32 pb-12 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white relative overflow-hidden border-t border-gray-100 dark:border-white/5 z-50">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 pb-24 border-b border-gray-200 dark:border-white/5">
            <div className="md:col-span-5 text-left">
              <div className="flex items-center gap-4 mb-10 group">
                 <div className="w-14 h-14 bg-white rounded-2xl p-2.5 shadow-2xl transition-transform group-hover:rotate-6">
                    <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
                 </div>
                 <div>
                    <h4 className="text-4xl font-black tracking-tighter leading-none">EIEF</h4>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-500">Education Group</span>
                 </div>
              </div>
              <p className="text-xl font-medium text-gray-500 dark:text-gray-400 italic mb-10 max-w-md">
                "Faisons plus ! Investir maintenant pour <span className="text-gray-900 dark:text-white font-black not-italic text-2xl">Sourire</span> demain."
              </p>
              <div className="flex gap-4">
                 {[
                   { icon: Facebook, href: FACEBOOK_PAGE },
                   { icon: Instagram, href: '#' },
                   { icon: Linkedin, href: '#' },
                   { icon: Youtube, href: '#' }
                 ].map((social, i) => (
                   <a key={i} href={social.href} className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-transparent flex items-center justify-center transition-all hover:bg-purple-600 hover:text-white hover:-translate-y-2 text-gray-600 dark:text-gray-400">
                     <social.icon size={18} />
                   </a>
                 ))}
              </div>
            </div>
            <div className="md:col-span-2 text-left">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mb-10">Explorer</h5>
              <ul className="space-y-6 text-sm font-bold text-gray-500 dark:text-gray-400">
                {['Accueil', 'Programmes', 'Admission', 'Jeux'].map(item => (
                  <li key={item} onClick={() => navigate(item === 'Accueil' ? '/' : `/${item.toLowerCase()}`)} className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer flex items-center group">
                    <span className="w-0 h-0.5 bg-purple-600 mr-0 transition-all group-hover:w-4 group-hover:mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2 text-left">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mb-10">Documents</h5>
              <ul className="space-y-6 text-sm font-bold text-gray-500 dark:text-gray-400">
                 <li>
                   <a href="/fichederenseignements.pdf" download className="hover:text-purple-600 transition-colors flex items-center gap-2">
                     <Download size={14} /> Fiche 2026-2027
                   </a>
                 </li>
                 <li>
                   <a href="/2026-2027EXAMEN.pdf" download className="hover:text-purple-600 transition-colors flex items-center gap-2">
                     <Download size={14} /> Fiche Examen
                   </a>
                 </li>
              </ul>
            </div>
            <div className="md:col-span-3 text-left">
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mb-10">Contact</h5>
              <div className="space-y-8">
                 <div className="flex gap-4 items-start">
                    <MapPin size={18} className="text-purple-500 shrink-0" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sanoyah Rails, Guinée</p>
                 </div>
                 <div className="flex gap-4 items-start">
                    <Mail size={18} className="text-purple-500 shrink-0" />
                    <p className="text-sm font-black">+224 625 549 579</p>
                 </div>
              </div>
            </div>
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.6em]">© 2026 EIEF EDUCATION GROUP • EDUGESTION PRO</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Accueil;
