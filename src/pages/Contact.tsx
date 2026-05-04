import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
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
  ArrowRightCircle,
} from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

const Contact: React.FC = () => {
  const navigate = useNavigate();

  const contactInfos = [
    { title: 'Localisation', value: 'Conakry, Quartier Minière', icon: MapPin, color: 'text-bleu-600', bg: 'bg-bleu-500/10' },
    { title: 'Téléphone', value: '+224 611 00 00', icon: PhoneCall, color: 'text-or-600', bg: 'bg-or-500/10' },
    { title: 'E-mail', value: 'contact@eief.edu.gn', icon: Mail, color: 'text-rouge-500', bg: 'bg-rouge-500/10' },
    { title: 'Horaires', value: 'Lun — Ven : 08h00 — 17h00', icon: Clock, color: 'text-vert-600', bg: 'bg-vert-500/10' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">
      <PublicNav active="Contact" />

      <PageHero
        imageSrc="/Img1.jpeg"
        imageFallback="/Img2.jpeg"
        badge="Support & Contact"
        title={
          <>
            Parlons du futur{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-300 via-vert-400 to-vert-500">
              de vos enfants
            </span>
            .
          </>
        }
        subtitle="Notre équipe est à votre entière disposition pour répondre à toutes vos questions pédagogiques et administratives."
        tagline="À votre écoute"
        actions={[
          { label: 'Nous écrire', onClick: () => { document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'primary' },
          { label: 'Nous appeler', onClick: () => { window.location.href = 'tel:+22461100000'; }, variant: 'secondary' },
        ]}
      />

      {/* CONTACT INFOS + FORM */}
      <section id="formulaire" className="py-20 md:py-24 bg-white dark:bg-gray-950 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Infos & carte */}
          <div className="lg:col-span-5 space-y-10 text-left">
            <div>
              <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
                Coordonnées
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                Trouvez-nous facilement
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Notre équipe vous accueille sur le campus du lundi au vendredi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfos.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-or-300 dark:hover:border-or-500/30 hover:shadow-lg transition-all"
                >
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-md', c.bg, c.color)}>
                    <c.icon size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{c.title}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{c.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Carte stylisée */}
            <div className="relative h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 group cursor-pointer">
              <img
                src="/Img4.jpeg"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.endsWith('/Img1.jpeg')) img.src = '/Img1.jpeg';
                }}
                alt="Campus EIEF"
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-vert-900/80 via-vert-900/30 to-transparent group-hover:from-vert-900/60 transition-colors duration-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                <MapPin size={40} className="text-or-300 mb-4 drop-shadow-xl" />
                <p className="text-lg font-black tracking-tight drop-shadow-lg">Visitez notre campus</p>
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-or-300 mt-1">Conakry, Guinée</p>
              </div>
              <button className="absolute bottom-6 right-6 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 border border-gray-100 dark:border-white/10">
                <ArrowRightCircle size={22} className="text-vert-600 dark:text-or-400" />
              </button>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Suivez-nous</p>
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, href: 'https://www.facebook.com/share/18hUbQ4hgm/', col: 'hover:text-blue-500' },
                  { Icon: Instagram, href: '#', col: 'hover:text-pink-500' },
                  { Icon: Twitter, href: '#', col: 'hover:text-sky-500' },
                  { Icon: Linkedin, href: '#', col: 'hover:text-blue-700' },
                ].map(({ Icon, href, col }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 transition-all shadow-sm hover:shadow-lg hover:scale-105',
                      col
                    )}
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-7 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5">
            <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Message
            </Badge>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Envoyez-nous un{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-700 dark:from-vert-400 dark:to-bleu-400">message</span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">
              Nous vous répondons sous 24 h ouvrées.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Prénom & Nom</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <input
                    type="text"
                    className="w-full h-14 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <input
                    type="email"
                    className="w-full h-14 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Objet</label>
                <div className="relative group">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <input
                    type="text"
                    className="w-full h-14 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="Quel est l'objet de votre message ?"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Message</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-5 top-7 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <textarea
                    className="w-full h-40 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 pt-6 outline-none font-bold text-sm transition-all resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>
              </div>
            </div>

            <Button className="w-full h-14 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:from-or-400 hover:to-or-500 transition-all shadow-gold flex items-center justify-center gap-2">
              Envoyer le message <Send size={16} />
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Contact" />
    </div>
  );
};

export default Contact;
