import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  Users, 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Globe, 
  Clock, 
  BookOpen,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
  Heart,
  Target,
  Zap,
  ChevronDown,
  Quote,
  Send,
  ArrowRightCircle,
  Sun,
  Moon
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
    
    // Initial check for theme
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
    { title: 'Excellence', desc: 'Nous visons les standards les plus élevés pour assurer la réussite de chaque élève.', icon: Target, color: 'text-or-400', bg: 'bg-or-950/20' },
    { title: 'Innovation', desc: 'L\'utilisation des technologies modernes au service d\'un apprentissage interactif.', icon: Zap, color: 'text-bleu-400', bg: 'bg-bleu-950/20' },
    { title: 'Bienveillance', desc: 'Un environnement sécurisé et stimulant où chaque enfant s\'épanouit pleinement.', icon: Heart, color: 'text-rouge-400', bg: 'bg-rouge-950/20' },
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
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-bleu-500/30 overflow-x-hidden transition-colors duration-500">
      
      {/* 🚀 NAVBAR MODERNE AMÉLIORÉE */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 sm:px-10",
        scrolled ? "py-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-2xl border-b border-gray-100 dark:border-white/5" : "py-6 bg-transparent"
      )}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-10 h-10 bg-white rounded-lg p-1.5 shadow-xl transition-transform group-hover:scale-110">
                <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
             </div>
             <div className="flex flex-col text-left">
                <span className="text-lg font-black tracking-tighter leading-none text-gray-900 dark:text-white">EIEF</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-bleu-600 dark:text-or-400">Éducation d'Excellence</span>
             </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {['Accueil', 'Programmes', 'Admission', 'Contact'].map(link => (
                <button 
                  key={link} 
                  onClick={() => navigate(link === 'Accueil' ? '/' : `/${link.toLowerCase()}`)}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-bleu-600 dark:hover:text-white transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={toggleTheme}
                 className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-transparent dark:border-white/5"
               >
                 {isDarkMode ? <Sun size={18} className="text-or-400" /> : <Moon size={18} />}
               </button>

               <Button 
                 onClick={() => navigate('/login')}
                 className="bg-bleu-700 dark:bg-or-600 text-white dark:text-gray-950 font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-lg shadow-lg hover:bg-bleu-800 dark:hover:bg-or-500 transition-all flex items-center gap-2"
               >
                 Connexion
               </Button>
            </div>
          </div>

          <button className="lg:hidden p-2 text-gray-900 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* 🌟 HERO SECTION - SPLIT THEMED */}
      <section className="relative pt-32 lg:pt-48 pb-12 overflow-hidden bg-white dark:bg-gray-950 shadow-2xl z-10 border-b border-gray-100 dark:border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-bleu-600/10 dark:bg-bleu-600/20 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-1/2 left-0 w-64 h-64 bg-or-600/5 dark:bg-or-600/10 rounded-full blur-[80px] -ml-32 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <Badge className="mb-6 bg-bleu-600/10 dark:bg-white/5 text-bleu-600 dark:text-or-400 border border-bleu-600/20 dark:border-white/10 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
               Faisons Plus !
            </Badge>
            <h1 className="text-5xl lg:text-[84px] font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter mb-8 italic text-left">
              Investir <span className="text-bleu-600 dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-bleu-400 dark:to-indigo-400">Maintenant</span>,<br />
              Sourire <span className="text-or-600 dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-or-400 dark:to-amber-600">Demain.</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg mb-10 text-left">
              L'École Internationale les Enfants du Futur offre un enseignement d'excellence dans un environnement sécurisé et stimulant, de la crèche au lycée.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/login')} className="h-14 px-10 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-bleu-600 dark:hover:bg-or-500 transition-all flex items-center gap-2">
                Nos Portails <ArrowRight size={18} />
              </Button>
              <button 
                onClick={() => navigate('/admission')}
                className="h-14 px-10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-gray-200 dark:border-white/10 hover:border-or-500 dark:hover:border-white/20 transition-all font-sans"
              >
                Admission
              </button>
            </div>
            
            <div className="mt-12 flex gap-10 border-t border-gray-100 dark:border-white/5 pt-8">
               <div><p className="text-2xl font-black text-gray-900 dark:text-white">2.5k+</p><p className="text-[10px] uppercase font-bold text-gray-400">Élèves</p></div>
               <div><p className="text-2xl font-black text-gray-900 dark:text-white">150+</p><p className="text-[10px] uppercase font-bold text-gray-400">Experts</p></div>
               <div><p className="text-2xl font-black text-gray-900 dark:text-white">98%</p><p className="text-[10px] uppercase font-bold text-gray-400">Succès</p></div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
             <div className="grid grid-cols-12 gap-4 h-[350px] md:h-[500px]">
                <div className="col-span-8 h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white dark:border-white/10">
                   <img src="/Img4.jpeg" alt="School" className="w-full h-full object-cover dark:grayscale-[0.2] dark:hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="col-span-4 grid grid-rows-2 gap-4">
                   <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-white/10">
                      <img src="/Img5.jpeg" alt="Student" className="w-full h-full object-cover" />
                   </div>
                   <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-white/10">
                      <img src="/Img6.jpeg" alt="Children" className="w-full h-full object-cover" />
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ✨ NOS VALEURS - THEMED */}
      <section className="py-12 bg-white dark:bg-gray-950 relative z-20 shadow-xl border-b border-gray-100 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
           {values.map((v, i) => (
             <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all text-left">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg", v.bg, v.color)}>
                  <v.icon size={24} />
                </div>
                <div>
                   <h4 className="text-lg font-black text-gray-900 dark:text-white">{v.title}</h4>
                   <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{v.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* 🧩 PORTALS SECTION - THEMED */}
      <section className="py-16 bg-[#fafafa] dark:bg-gray-900/50 relative z-10 shadow-2xl">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
           <div className="lg:col-span-4 text-left self-center">
              <Badge className="mb-4 bg-or-600/10 text-or-600 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">DIGITAL</Badge>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">Accédez à votre <br />espace personnel.</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                 Une plateforme centralisée pour une gestion éducative innovante et performante, pour toute la communauté.
              </p>
              <Button onClick={() => navigate('/login')} className="h-12 px-8 bg-bleu-600 dark:bg-or-600 text-white dark:text-gray-950 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl hover:bg-bleu-700 dark:hover:bg-or-500 transition-all">Se Connecter</Button>
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
                   <ArrowRightCircle size={24} className="text-gray-200 dark:text-gray-600 group-hover:text-bleu-600 dark:group-hover:text-or-400 transition-colors" />
                </Card>
              ))}
           </div>
        </div>
      </section>

      {/* 🎓 PROGRAMMES SECTION - LONG DESC RESTORED */}
      <section className="py-16 bg-white dark:bg-gray-950 relative z-20 shadow-xl">
        <div className="max-w-[1400px] mx-auto px-6 text-left">
           <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-12">De la Maternelle au Lycée</h2>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              {[
                { title: 'Primaire', desc: 'S\'éveiller, explorer et acquérir les bases fondamentales dans un environnement ludique.', icon: Globe, img: '/Img1.jpeg', col: 'text-bleu-600 dark:text-bleu-400' },
                { title: 'Collège', desc: 'Structurer la pensée critique et approfondir les connaissances académiques essentielles.', icon: Clock, img: '/smartboard.jpg', col: 'text-or-600 dark:text-or-400' },
                { title: 'Lycée', desc: 'Préparer l\'excellence pour les concours nationaux et les prestigieuses universités.', icon: Sparkles, img: '/Img3.jpeg', col: 'text-vert-600 dark:text-vert-400' },
              ].map((prog, i) => (
                <div key={i} className="group overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900/40 hover:shadow-2xl transition-all">
                   <div className="h-48 overflow-hidden dark:grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700">
                      <img src={prog.img} alt={prog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   <div className="p-8">
                      <h4 className="text-xl font-black text-gray-900 dark:text-white mb-3">{prog.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed min-h-[40px] text-left">{prog.desc}</p>
                      <button 
                        onClick={() => navigate('/programmes')}
                        className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", prog.col)}
                      >
                         En savoir plus <ArrowRight size={14} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 💬 TÉMOIGNAGES & FAQ - THEMED */}
      <section className="py-16 bg-[#fafafa] dark:bg-gray-900/30 relative z-10 shadow-2xl">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 text-left">
           <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 text-left">Témoignages</h2>
              <div className="space-y-4">
                 {testimonials.map((t, i) => (
                   <div key={i} className="bg-white dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex gap-4 text-left">
                      <div className="w-10 h-10 bg-bleu-50 dark:bg-or-600/10 rounded-full flex items-center justify-center font-bold text-bleu-600 dark:text-or-400 shrink-0">{t.avatar}</div>
                      <div>
                         <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2 italic leading-relaxed text-left">"{t.content}"</p>
                         <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">{t.name} • {t.role}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 text-left">FAQ</h2>
              <div className="space-y-3 font-sans">
                 {faqs.map((f, i) => (
                   <div key={i} className="bg-white dark:bg-gray-800/40 rounded-xl p-5 cursor-pointer border border-gray-100 dark:border-white/5 hover:shadow-md dark:hover:border-white/10 transition-all font-sans" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                      <div className="flex items-center justify-between">
                         <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 text-left">{f.q}</h4>
                         <ChevronDown size={16} className={cn("transition-transform text-gray-400", activeFaq === i ? "rotate-180 text-bleu-600 dark:text-or-400" : "")} />
                      </div>
                      {activeFaq === i && <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium border-t border-gray-100 dark:border-white/5 pt-4 leading-relaxed text-left">{f.a}</p>}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 🎯 FOOTER - THEMED MINIMALIST */}
      <footer className="py-12 bg-white dark:bg-gray-950 text-gray-900 dark:text-white border-t border-gray-100 dark:border-white/5 text-left">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-white p-1 rounded-md shadow-sm border border-gray-100">
                     <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">EIEF</span>
               </div>
               <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-xs mb-8 text-left">Plus qu'une école, une communauté engagée pour l'avenir de vos enfants.</p>
               <div className="flex gap-4">
                  {['FB', 'TW', 'LI', 'IG'].map(s => <button key={s} className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black hover:bg-bleu-600 dark:hover:bg-or-600 hover:text-white dark:hover:text-gray-900 transition-all font-sans">{s}</button>)}
               </div>
            </div>
            <div className="text-left">
               <h5 className="font-black uppercase tracking-widest text-[10px] mb-6 text-gray-400 dark:text-or-400 italic">Liens</h5>
               <ul className="space-y-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                  <li className="hover:text-bleu-600 dark:hover:text-white cursor-pointer transition-colors">Programmes</li>
                  <li className="hover:text-bleu-600 dark:hover:text-white cursor-pointer transition-colors">Admission</li>
                  <li className="hover:text-bleu-600 dark:hover:text-white cursor-pointer transition-colors">Contact</li>
               </ul>
            </div>
            <div className="text-left">
               <h5 className="font-black uppercase tracking-widest text-[10px] mb-6 text-gray-400 dark:text-or-400 italic">Infos</h5>
               <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                  <li className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400"><MapPin size={14} className="text-bleu-600 dark:text-or-400" /> Conakry, Guinée</li>
                  <li className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400"><PhoneCall size={14} className="text-bleu-600 dark:text-or-400" /> +224 611 00 00</li>
               </ul>
            </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex justify-between items-center opacity-30">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">© 2026 EIEF EDUCATION</p>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Faisons Plus !</p>
        </div>
      </footer>

    </div>
  );
};

export default Accueil;
