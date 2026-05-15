import React, { useState } from 'react';
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
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  CalendarClock,
  Sparkles,
} from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

// ─── Données EIEF (synchronisées avec l'accueil) ───────────────────────────
const EIEF_PHONES = ['+224 625 549 579', '+224 628 848 437'];
const EIEF_EMAIL = 'eiefinfos@enfantsdufutur.com';
const EIEF_ADDRESS = 'C/Sanoyah — Sanoyah Rails, Guinée';
const EIEF_FACEBOOK = 'https://www.facebook.com/share/18hUbQ4hgm/';
const WHATSAPP_NUMBER = '+224625549579'; // sans espaces pour le lien wa.me
// Coordonnées de Sanoyah, Guinée (approximation)
const MAP_QUERY = encodeURIComponent('Sanoyah Rails, Conakry, Guinée');
const MAP_EMBED_URL = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  // ─── Cartes coordonnées (cliquables) ─────────────────────────────────────
  const contactInfos = [
    {
      key: 'address',
      title: 'Adresse',
      value: EIEF_ADDRESS,
      sub: 'Ouvert du Lundi au Vendredi',
      icon: MapPin,
      color: 'text-bleu-600 dark:text-bleu-300',
      bg: 'bg-bleu-500/10',
      borderHover: 'hover:border-bleu-400',
      action: () => window.open(MAP_LINK, '_blank'),
      actionLabel: 'Voir sur la carte',
    },
    {
      key: 'phone',
      title: 'Téléphone',
      value: EIEF_PHONES.join(' / '),
      sub: 'Appelez-nous directement',
      icon: PhoneCall,
      color: 'text-or-600 dark:text-or-300',
      bg: 'bg-or-500/10',
      borderHover: 'hover:border-or-400',
      action: () => (window.location.href = `tel:${EIEF_PHONES[0].replace(/\s/g, '')}`),
      actionLabel: 'Appeler',
    },
    {
      key: 'email',
      title: 'E-mail',
      value: EIEF_EMAIL,
      sub: 'Réponse sous 24 h ouvrées',
      icon: Mail,
      color: 'text-rouge-500 dark:text-rouge-300',
      bg: 'bg-rouge-500/10',
      borderHover: 'hover:border-rouge-400',
      action: () => (window.location.href = `mailto:${EIEF_EMAIL}`),
      actionLabel: 'Écrire',
    },
    {
      key: 'whatsapp',
      title: 'WhatsApp',
      value: EIEF_PHONES[0],
      sub: 'Discutons en temps réel',
      icon: MessageCircle,
      color: 'text-vert-600 dark:text-vert-300',
      bg: 'bg-vert-500/10',
      borderHover: 'hover:border-vert-400',
      action: () => window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`, '_blank'),
      actionLabel: 'Ouvrir WhatsApp',
    },
  ];

  // ─── Horaires détaillés ──────────────────────────────────────────────────
  const horaires = [
    { jour: 'Lundi — Vendredi', heures: '08h00 — 17h00', open: true },
    { jour: 'Samedi', heures: '09h00 — 12h00', open: true, note: 'Administration uniquement' },
    { jour: 'Dimanche', heures: 'Fermé', open: false },
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
          { label: 'Nous appeler', onClick: () => { window.location.href = `tel:${EIEF_PHONES[0].replace(/\s/g, '')}`; }, variant: 'secondary' },
        ]}
      />

      {/* ── COORDONNÉES (4 cartes cliquables) ────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Coordonnées
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Quatre façons de nous{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-or-500">joindre</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              Cliquez sur la carte qui vous convient — on revient vers vous au plus vite.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactInfos.map((c, i) => (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={c.action}
                className={cn(
                  'group relative p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 rounded-2xl border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all cursor-pointer overflow-hidden',
                  c.borderHover
                )}
              >
                {/* Halo décoratif */}
                <div className={cn('absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity', c.bg)} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shadow-md', c.bg, c.color)}>
                      <c.icon size={22} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(c.value, c.key);
                      }}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all"
                      title="Copier"
                    >
                      {copied === c.key ? <Check size={14} className="text-vert-500" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">{c.title}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 break-words leading-snug">{c.value}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{c.sub}</p>

                  <div className={cn('mt-5 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors', c.color)}>
                    {c.actionLabel}
                    <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HORAIRES + MAP ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#fafafa] dark:bg-gray-900/50 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Horaires */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 bg-gradient-to-br from-bleu-50 to-white dark:from-bleu-900/20 dark:to-gray-900/40 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-bleu-500/15 text-bleu-600 dark:text-bleu-300 flex items-center justify-center">
                <CalendarClock size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-bleu-600 dark:text-bleu-400 tracking-widest">Horaires</p>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Ouverture</h3>
              </div>
            </div>

            <ul className="space-y-4">
              {horaires.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      h.open ? 'bg-vert-500 animate-pulse-soft' : 'bg-rouge-400'
                    )} />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-white">{h.jour}</p>
                      {h.note && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{h.note}</p>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs font-black px-3 py-1 rounded-full whitespace-nowrap',
                    h.open
                      ? 'bg-vert-500/10 text-vert-700 dark:text-vert-300'
                      : 'bg-rouge-500/10 text-rouge-600 dark:text-rouge-300'
                  )}>
                    {h.heures}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 p-4 bg-or-500/10 border border-or-500/20 rounded-2xl">
              <p className="flex items-start gap-2 text-xs font-bold text-or-700 dark:text-or-300">
                <Sparkles size={14} className="shrink-0 mt-0.5" />
                <span>Sur rendez-vous pour les visites guidées du campus — appelez-nous au préalable.</span>
              </p>
            </div>
          </motion.div>

          {/* Carte Google Maps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 relative h-[420px] lg:h-auto min-h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 group"
          >
            <iframe
              src={MAP_EMBED_URL}
              title="Localisation EIEF"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
            />
            <div className="absolute top-6 left-6 bg-white dark:bg-gray-900 px-4 py-3 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-bleu-500/15 text-bleu-600 dark:text-bleu-300 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campus EIEF</p>
                <p className="text-sm font-black text-gray-900 dark:text-white truncate">Sanoyah Rails</p>
              </div>
            </div>
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 right-6 inline-flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-or-50 dark:hover:bg-or-900/30 px-4 py-3 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white hover:text-or-700 dark:hover:text-or-300 transition-all"
            >
              <Globe size={14} /> Itinéraire
              <ArrowRightCircle size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FORMULAIRE ──────────────────────────────────────────────────── */}
      <section id="formulaire" className="py-20 md:py-24 bg-white dark:bg-gray-950 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Side : intro + réseaux */}
          <div className="lg:col-span-5 space-y-8 text-left lg:sticky lg:top-24">
            <div>
              <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
                Message direct
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                Une question ?{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-700 dark:from-vert-400 dark:to-bleu-400">
                  Écrivez-nous
                </span>
              </h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Remplissez le formulaire ci-contre et nous reviendrons vers vous sous 24 h ouvrées. Pour les urgences, privilégiez le téléphone ou WhatsApp.
              </p>
            </div>

            {/* Carte campus */}
            <div className="relative h-56 rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-white/10 group">
              <img
                src="/Img4.jpeg"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.endsWith('/Img1.jpeg')) img.src = '/Img1.jpeg';
                }}
                alt="Campus EIEF"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-vert-900/80 via-vert-900/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-or-300 mb-1">Notre campus</p>
                <p className="text-lg font-black tracking-tight">Un cadre d'apprentissage moderne</p>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Suivez-nous</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { Icon: Facebook, href: EIEF_FACEBOOK, col: 'hover:text-white hover:bg-blue-600', label: 'Facebook' },
                  { Icon: Instagram, href: '#', col: 'hover:text-white hover:bg-pink-500', label: 'Instagram' },
                  { Icon: Twitter, href: '#', col: 'hover:text-white hover:bg-sky-500', label: 'Twitter' },
                  { Icon: Linkedin, href: '#', col: 'hover:text-white hover:bg-blue-700', label: 'LinkedIn' },
                ].map(({ Icon, href, col, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: brancher vers l'API quand l'endpoint sera prêt
              alert('Message envoyé. (Démo — à brancher au backend.)');
            }}
            className="lg:col-span-7 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5"
          >
            <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Formulaire
            </Badge>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Envoyez-nous un{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-700 dark:from-vert-400 dark:to-bleu-400">message</span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">
              Tous les champs marqués <span className="text-rouge-500">*</span> sont obligatoires.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Prénom & Nom <span className="text-rouge-500">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full h-14 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Email <span className="text-rouge-500">*</span>
                </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full h-14 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Téléphone</label>
                <div className="relative group">
                  <PhoneCall className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <input
                    type="tel"
                    className="w-full h-14 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="+224 ..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Sujet</label>
                <div className="relative group">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <select
                    className="w-full h-14 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all appearance-none"
                  >
                    <option>Demande d'inscription</option>
                    <option>Renseignements pédagogiques</option>
                    <option>Tarifs & frais de scolarité</option>
                    <option>Visite du campus</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Message <span className="text-rouge-500">*</span>
                </label>
                <div className="relative group">
                  <MessageSquare className="absolute left-5 top-6 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <textarea
                    required
                    className="w-full h-40 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/5 focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 pt-5 outline-none font-bold text-sm transition-all resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 font-medium mb-5 leading-relaxed">
              En envoyant ce message, vous acceptez que vos coordonnées soient utilisées pour vous recontacter dans le cadre de votre demande.
            </p>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:from-or-400 hover:to-or-500 transition-all shadow-gold flex items-center justify-center gap-2"
            >
              Envoyer le message <Send size={16} />
            </Button>
          </form>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Contact" />
    </div>
  );
};

export default Contact;
