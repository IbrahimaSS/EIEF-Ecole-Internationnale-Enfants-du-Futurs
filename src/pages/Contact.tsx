import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Menu, 
  X, 
  Sun,
  Moon,
  ChevronRight,
  Send,
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  User,
  MessageSquare,
  ArrowRightCircle
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui';
import { cn } from '../utils/cn';

const Contact: React.FC = () => {
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

  const contactInfos = [
    { title: 'Localisation', value: 'Conakry, Quartier Minière', icon: MapPin, color: 'text-bleu-500', bg: 'bg-bleu-500/10' },
    { title: 'Téléphone', value: '+224 620 00 00 00', icon: PhoneCall, color: 'text-or-500', bg: 'bg-or-500/10' },
    { title: 'E-mail', value: 'contact@eief.edu.gn', icon: Mail, color: 'text-rouge-500', bg: 'bg-rouge-500/10' },
    { title: 'Horaires', value: 'Lun - Ven : 08h00 - 17h00', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden">
      
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
                  className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", link === 'Contact' ? 'text-bleu-600 dark:text-or-400' : 'text-gray-500 dark:text-gray-400 hover:text-bleu-600 dark:hover:text-white')}
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

      {/* HERO CONTACT */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-xl z-20 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 text-left relative z-10">
           <div className="max-w-3xl">
              <Badge className="mb-6 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">Support & Contact</Badge>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[0.95] tracking-tighter mb-8 italic">
                Parlons du futur <br /><span className="text-bleu-600 dark:text-or-400 italic">de vos enfants.</span>
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl italic">
                Notre équipe est à votre entière disposition pour répondre à toutes vos questions pédagogiques et administratives.
              </p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-or-600/5 to-transparent pointer-events-none" />
      </section>

      {/* CONTACT CONTENT */}
      <section className="py-20 bg-white dark:bg-gray-950 relative z-10 overflow-hidden">
         <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            
            {/* Left: Contact Info & Map */}
            <div className="lg:col-span-5 space-y-12 text-left">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {contactInfos.map((c, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all text-left"
                    >
                       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-xl", c.bg, c.color)}>
                          <c.icon size={22} />
                       </div>
                       <p className="text-[10px] font-black uppercase text-gray-400 mb-2">{c.title}</p>
                       <p className="text-sm font-bold text-gray-900 dark:text-white italic">{c.value}</p>
                    </motion.div>
                  ))}
               </div>

               {/* Stylized Map Placeholder */}
               <div className="relative h-80 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 group cursor-pointer">
                  <img src="/Img4.jpeg" alt="Campus Location" className="w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-bleu-900/40 group-hover:bg-transparent transition-colors duration-1000" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                     <MapPin size={48} className="text-or-400 mb-6 drop-shadow-xl animate-bounce-slow" />
                     <p className="text-lg font-black uppercase tracking-tighter shadow-black drop-shadow-lg">Visitez notre campus <br />à Conakry</p>
                  </div>
                  <button className="absolute bottom-6 right-8 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 border border-gray-100 dark:border-white/10">
                     <ArrowRightCircle size={24} className="text-bleu-600 dark:text-or-400" />
                  </button>
               </div>

               {/* Socials */}
               <div className="flex gap-4">
                  {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                    <button key={i} className="w-14 h-14 bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-bleu-600 dark:hover:text-or-400 transition-all shadow-lg">
                       <Icon size={24} strokeWidth={1.5} />
                    </button>
                  ))}
               </div>
            </div>

            {/* Right: Message Form */}
            <div className="lg:col-span-7 bg-[#fafafa] dark:bg-gray-900 p-8 md:p-14 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-white/5 text-left">
               <div className="max-w-2xl">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter italic text-left underline decoration-or-400/20">Envoyez-nous un message.</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Prénom & Nom</label>
                        <div className="relative group">
                           <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bleu-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                           <input type="text" className="w-full h-14 bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/5 focus:border-bleu-600 dark:focus:border-or-400 rounded-2xl pl-16 pr-6 outline-none font-bold text-sm transition-all" placeholder="Votre nom complet" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email</label>
                        <div className="relative group">
                           <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bleu-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                           <input type="email" className="w-full h-14 bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/5 focus:border-bleu-600 dark:focus:border-or-400 rounded-2xl pl-16 pr-6 outline-none font-bold text-sm transition-all" placeholder="votre@email.com" />
                        </div>
                     </div>
                     <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Objet de la demande</label>
                        <div className="relative group">
                           <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bleu-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                           <input type="text" className="w-full h-14 bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/5 focus:border-bleu-600 dark:focus:border-or-400 rounded-2xl pl-16 pr-6 outline-none font-bold text-sm transition-all" placeholder="Quel est le but de votre message ?" />
                        </div>
                     </div>
                     <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Message</label>
                        <div className="relative group">
                           <MessageSquare className="absolute left-6 top-8 text-gray-400 group-focus-within:text-bleu-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                           <textarea className="w-full h-40 bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/5 focus:border-bleu-600 dark:focus:border-or-400 rounded-[2rem] pl-16 pr-6 pt-7 outline-none font-bold text-sm transition-all resize-none" placeholder="Décrivez votre demande en détail..." />
                        </div>
                     </div>
                  </div>
                  
                  <Button className="w-full h-16 bg-gray-900 dark:bg-white text-white dark:text-gray-950 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-bleu-600 dark:hover:bg-or-500 transition-all shadow-2xl flex items-center justify-center gap-3">
                     Envoyer le message <Send size={18} />
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-white dark:bg-gray-950 text-gray-950 dark:text-white border-t border-gray-100 dark:border-white/5 text-left italic">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-30 text-left">
           <p className="text-[10px] font-black uppercase tracking-widest">© 2026 EIEF EDUCATION - Contact</p>
           <p className="text-[10px] font-black uppercase tracking-widest flex gap-8">
              <span className="cursor-pointer" onClick={() => navigate('/')}>Accueil</span>
              <span className="cursor-pointer" onClick={() => navigate('/programmes')}>Programmes</span>
              <span className="cursor-pointer" onClick={() => navigate('/admission')}>Admission</span>
           </p>
        </div>
      </footer>
      
    </div>
  );
};

export default Contact;
