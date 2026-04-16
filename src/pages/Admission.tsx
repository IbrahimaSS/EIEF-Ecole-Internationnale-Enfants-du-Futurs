import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  Sun,
  Moon,
  ChevronRight,
  FileText,
  Calendar,
  Users,
  Award,
  Send,
  CloudUpload,
  User,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui';
import { cn } from '../utils/cn';

const Admission: React.FC = () => {
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

  const steps = [
    { title: 'Information', desc: 'Prenez rendez-vous pour visiter le campus et rencontrer l\'équipe pédagogique.', icon: Users, color: 'text-bleu-500', bg: 'bg-bleu-500/10' },
    { title: 'Dossier', desc: 'Complétez le dossier d\'inscription en ligne ou sur place muni des justificatifs.', icon: FileText, color: 'text-rouge-500', bg: 'bg-rouge-500/10' },
    { title: 'Évaluation', desc: 'Passage d\'un test de niveau pour définir l\'orientation optimale de l\'élève.', icon: Award, color: 'text-or-500', bg: 'bg-or-500/10' },
    { title: 'Validation', desc: 'Après étude du dossier, une réponse d\'admission est transmise sous 48h.', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
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
             <div className="w-10 h-10 bg-white rounded-lg p-1.5 shadow-xl">
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
                  className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", link === 'Admission' ? 'text-bleu-600 dark:text-or-400' : 'text-gray-500 dark:text-gray-400 hover:text-bleu-600 dark:hover:text-white')}
                >
                  {link}
                </button>
              ))}
            </div>
            <button onClick={toggleTheme} className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-transparent dark:border-white/5">
              {isDarkMode ? <Sun size={18} className="text-or-400" /> : <Moon size={18} />}
            </button>
          </div>
          <button className="lg:hidden p-2 text-gray-900 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* HERO ADMISSION */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-xl z-20">
        <div className="max-w-[1400px] mx-auto px-6 text-left relative z-10">
           <div className="max-w-3xl">
              <Badge className="mb-6 bg-or-600 text-gray-950 border-none font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">Session 2026-2027</Badge>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[0.95] tracking-tighter mb-8 italic">
                Rejoignez la <br /><span className="text-bleu-600 dark:text-or-400 italic">famille EIEF.</span>
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl italic">
                Nous sommes ravis d'étudier votre demande d'admission. Suivez les étapes simples pour inscrire votre enfant.
              </p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-[800px] h-full bg-gradient-to-l from-bleu-600/5 to-transparent pointer-events-none" />
      </section>

      {/* STEPS SECTIONS */}
      <section className="py-20 bg-white dark:bg-gray-950">
         <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-16 tracking-tight text-left">Processus en 4 étapes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {steps.map((s, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="group p-10 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-transparent hover:border-gray-100 dark:hover:border-white/5 hover:shadow-2xl transition-all relative text-left"
                 >
                    <div className="absolute top-6 right-8 text-4xl font-black text-gray-200 dark:text-white/5">0{i+1}</div>
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110", s.bg, s.color)}>
                       <s.icon size={26} />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-4 italic">{s.title}</h4>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed italic">{s.desc}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ADMISSION FORM */}
      <section className="py-20 bg-[#fafafa] dark:bg-gray-900 shadow-2xl relative z-10 border-y border-gray-100 dark:border-white/5">
         <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start text-left">
            <div className="lg:col-span-5">
               <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter italic">Formulaire <br />de pré-inscription.</h2>
               <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-12">Remplissez ces informations préliminaires et nous vous recontacterons sous 24h.</p>
               
               <div className="space-y-8">
                  <div className="flex gap-4 items-center">
                     <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center text-bleu-600 dark:text-or-400"><Calendar size={22} /></div>
                     <div><p className="text-[10px] font-black uppercase text-gray-400">Période d'évaluation</p><p className="text-sm font-bold text-gray-900 dark:text-white">Janvier - Septembre 2026</p></div>
                  </div>
                  <div className="flex gap-4 items-center">
                     <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center text-rouge-600 dark:text-rouge-400"><Send size={22} /></div>
                     <div><p className="text-[10px] font-black uppercase text-gray-400">Support Inscription</p><p className="text-sm font-bold text-gray-900 dark:text-white">admission@eief.edu.gn</p></div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-gray-950 p-8 md:p-12 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-white/5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nom de l'enfant</label>
                     <div className="relative group">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bleu-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                        <input type="text" className="w-full h-14 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-bleu-600 dark:focus:border-or-400 rounded-2xl pl-16 pr-6 outline-none font-bold text-sm transition-all" placeholder="Nom Complet" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Cycle Souhaité</label>
                     <div className="relative group">
                        <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={18} />
                        <select className="w-full h-14 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-bleu-600 dark:focus:border-or-400 rounded-2xl pl-16 pr-6 outline-none font-bold text-sm transition-all appearance-none cursor-pointer">
                           <option>Primaire</option>
                           <option>Collège</option>
                           <option>Lycée</option>
                        </select>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email du Parent</label>
                     <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bleu-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                        <input type="email" className="w-full h-14 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-bleu-600 dark:focus:border-or-400 rounded-2xl pl-16 pr-6 outline-none font-bold text-sm transition-all" placeholder="email@exemple.com" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Téléphone</label>
                     <div className="relative group">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={18} />
                        <input type="tel" className="w-full h-14 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-bleu-600 dark:focus:border-or-400 rounded-2xl pl-16 pr-6 outline-none font-bold text-sm transition-all" placeholder="+224 ..." />
                     </div>
                  </div>
               </div>
               
               <div className="p-8 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl text-center mb-8 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                  <CloudUpload size={32} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 italic">Joindre le bulletin précédent (PDF, JPEG)</p>
               </div>

               <Button className="w-full h-16 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-bleu-600 dark:hover:bg-or-500 transition-all shadow-xl">Envoyer ma demande</Button>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-white dark:bg-gray-950 text-gray-950 dark:text-white border-t border-gray-100 dark:border-white/5 text-left italic">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-30">
           <p className="text-[10px] font-black uppercase tracking-widest">© 2026 EIEF EDUCATION - Admission</p>
           <p className="text-[10px] font-black uppercase tracking-widest flex gap-8">
              <span className="cursor-pointer" onClick={() => navigate('/')}>Accueil</span>
              <span className="cursor-pointer" onClick={() => navigate('/programmes')}>Programmes</span>
              <span className="cursor-pointer" onClick={() => navigate('/contact')}>Contact</span>
           </p>
        </div>
      </footer>
      
    </div>
  );
};

export default Admission;
