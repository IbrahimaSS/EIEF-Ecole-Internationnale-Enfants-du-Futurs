import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  GraduationCap, 
  BookOpen,
  Globe, 
  Clock, 
  Sparkles,
  Sun,
  Moon,
  ChevronRight,
  Zap,
  Target,
  Brain,
  Palette,
  Atom,
  Languages,
  Heart,
  ArrowRightCircle
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui';
import { cn } from '../utils/cn';

const Programmes: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);
    else setIsDarkMode(false);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const cycles = [
    {
      id: 'maternelle',
      title: 'Cycle Maternelle',
      subtitle: 'Éveil & Découverte (Petite, Moyenne et Grande Section)',
      desc: 'Un environnement ludique et sécurisé pour favoriser l\'épanouissement, l\'autonomie et les premières découvertes linguistiques.',
      image: '/Maternelle.jpeg',
      features: ['Bilinguisme précoce', 'Motricité globale', 'Éveil artistique', 'Jardin pédagogique'],
      color: 'from-rouge-500 to-rose-600',
    },
    {
      id: 'primaire',
      title: 'Cycle Primaire',
      subtitle: 'Fondamentaux & Bilinguisme (CP au CM2)',
      desc: 'Acquisition des savoirs fondamentaux (lecture, écriture, calcul) avec une immersion linguistique quotidienne pour un bilinguisme naturel.',
      image: '/Img3.jpeg',
      features: ['Programme bilingue', 'Méthodes actives', 'Informatique dès le CP', 'Sorties éducatives'],
      color: 'from-bleu-600 to-indigo-600',
    },
    {
      id: 'college',
      title: 'Cycle Collège',
      subtitle: 'Approfondissement & Orientation (6ème à la 3ème)',
      desc: 'Structuration de la pensée critique, maîtrise des disciplines scientifiques et littéraires, et initiation aux parcours d\'orientation.',
      image: '/Img7.jpeg',
      features: ['Option STEM', 'Laboratoire de langues', 'Arts & Culture', 'Préparation au Brevet'],
      color: 'from-or-500 to-amber-600',
    },
    {
      id: 'lycee',
      title: 'Cycle Lycée',
      subtitle: 'Excellence & Spécialisation (Seconde à la Terminale)',
      desc: 'Préparation intensive aux baccalauréats nationaux et internationaux, avec un accompagnement personnalisé vers les études supérieures.',
      image: '/Lycee.jpeg',
      features: ['Spécialités variées', 'Coaching post-bac', 'Projets de recherche', '100% de réussite'],
      color: 'from-emerald-500 to-teal-600',
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans transition-colors duration-500">
      
      {/* NAVBAR */}
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
                  className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", link === 'Programmes' ? 'text-bleu-600 dark:text-or-400' : 'text-gray-500 dark:text-gray-400 hover:text-bleu-600 dark:hover:text-white')}
                >
                  {link}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
               <button onClick={toggleTheme} className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-transparent dark:border-white/5">
                 {isDarkMode ? <Sun size={18} className="text-or-400" /> : <Moon size={18} />}
               </button>
               <Button onClick={() => navigate('/login')} className="bg-bleu-700 dark:bg-or-600 text-white dark:text-gray-950 font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-lg shadow-lg hover:bg-bleu-800 dark:hover:bg-or-500 transition-all">Connexion</Button>
            </div>
          </div>
          <button className="lg:hidden p-2 text-gray-900 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* HERO SECTION - PROGRAMMES */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-xl z-20">
        <div className="max-w-[1400px] mx-auto px-6 text-left">
           <div className="max-w-3xl">
              <Badge className="mb-6 bg-bleu-600 text-white dark:bg-or-600 dark:text-gray-950 border-none font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">Cursus Académique</Badge>
              <h1 className="text-5xl lg:text-[72px] font-black text-gray-900 dark:text-white leading-[0.95] tracking-tighter mb-8 italic">
                Un parcours vers <br /><span className="text-bleu-600 dark:text-or-400 underline decoration-or-400/30">l'excellence.</span>
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10 italic">
                Découvrez nos programmes d'enseignement innovants, conçus pour former les leaders de demain.
              </p>
           </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-bleu-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-or-600/5 rounded-full blur-[80px] pointer-events-none" />
      </section>

      {/* CONTENT SECTIONS - ONE BY ONE */}
      <section className="py-20 relative z-10">
         <div className="max-w-[1400px] mx-auto px-6 space-y-32">
            {cycles.map((c, i) => (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn("grid grid-cols-1 lg:grid-cols-2 gap-16 items-center", i % 2 !== 0 ? 'lg:flex-row-reverse' : '')}
              >
                 <div className={cn("relative group", i % 2 !== 0 ? 'lg:order-2' : '')}>
                    <div className="relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10">
                       <img src={c.image} alt={c.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />
                    </div>
                    {/* Floating badge */}
                    <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 animate-bounce-slow">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br", c.color)}>
                          {i === 0 ? <Heart size={24} /> : i === 1 ? <Globe size={24} /> : i === 2 ? <Brain size={24} /> : <Zap size={24} />}
                       </div>
                    </div>
                 </div>

                 <div className="text-left">
                    <h3 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">{c.title}</h3>
                    <p className={cn("text-sm font-black uppercase tracking-widest mb-6", i === 0 ? 'text-rouge-500' : i === 1 ? 'text-bleu-600' : i === 2 ? 'text-or-600' : 'text-emerald-500')}>
                       {c.subtitle}
                    </p>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10 italic">
                       {c.desc}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-10">
                       {c.features.map(f => (
                         <div key={f} className="flex gap-2 items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> {f}
                         </div>
                       ))}
                    </div>

                    <Button className="h-14 px-10 bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-bleu-600 dark:hover:bg-or-500 transition-all flex items-center gap-2">
                       Découvrir le cursus <ArrowRight size={18} />
                    </Button>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* ADDITIONAL FEATURES GRID */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50 shadow-inner">
         <div className="max-w-[1400px] mx-auto px-6 text-left">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-16 tracking-tight">Outils & Méthodes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { title: 'Bilinguisme', desc: 'Français & Anglais maîtrisés.', icon: Languages, col: 'text-bleu-500', bg: 'bg-bleu-500/10' },
                 { title: 'Sciences & Tech', desc: 'Laboratoires & Informatique.', icon: Atom, col: 'text-rouge-500', bg: 'bg-rouge-500/10' },
                 { title: 'Arts & Culture', desc: 'Théâtre, Musique, Dessin.', icon: Palette, col: 'text-or-500', bg: 'bg-or-500/10' },
                 { title: 'E-Learning', desc: 'Contenus en ligne 24/7.', icon: GraduationCap, col: 'text-emerald-500', bg: 'bg-emerald-500/10' },
               ].map((f, i) => (
                 <Card key={i} className="p-8 bg-white dark:bg-gray-800/40 border-none shadow-xl rounded-[2.5rem] hover:scale-105 transition-all text-left">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", f.bg, f.col)}>
                       <f.icon size={26} />
                    </div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">{f.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{f.desc}</p>
                 </Card>
               ))}
            </div>
         </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-white dark:bg-gray-950">
         <div className="max-w-[1400px] mx-auto px-6">
            <div className="bg-gray-900 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-bleu-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
               <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight relative z-10 italic">Prêt à offrir le meilleur <br /><span className="text-or-400">à vos enfants ?</span></h2>
               <p className="text-gray-400 text-lg mb-12 relative z-10 italic">Commencez les démarches dès aujourd'hui pour l'année 2026-2027.</p>
               <div className="flex flex-wrap justify-center gap-4 relative z-10">
                  <Button onClick={() => navigate('/admission')} className="h-14 px-10 bg-white text-gray-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-or-500 transition-all flex items-center gap-2">
                     S'inscrire <ArrowRightCircle size={18} />
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER - MINIMALIST */}
      <footer className="py-12 bg-white dark:bg-gray-950 text-gray-900 dark:text-white border-t border-gray-100 dark:border-white/5 text-left italic">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-30">
           <p className="text-[10px] font-black uppercase tracking-widest">© 2026 EIEF EDUCATION - Programmes</p>
           <p className="text-[10px] font-black uppercase tracking-widest flex gap-8">
              <span className="cursor-pointer" onClick={() => navigate('/')}>Accueil</span>
              <span className="cursor-pointer" onClick={() => navigate('/admission')}>Admission</span>
              <span className="cursor-pointer" onClick={() => navigate('/contact')}>Contact</span>
           </p>
        </div>
      </footer>
      
    </div>
  );
};

export default Programmes;
