import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, LogIn, GraduationCap, Wallet, MessageSquare, Calendar,
  ArrowRight, CheckCircle2, Users, Sparkles, BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PublicFooter from '../components/shared/PublicFooter';

const ParentLanding: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: GraduationCap, title: 'Suivi scolaire',     desc: 'Notes, absences et bulletins de vos enfants en temps réel.',          color: 'from-or-500 to-or-700' },
    { icon: Wallet,        title: 'Paiements simples',  desc: 'Frais de scolarité, cantine, transport — historique et reçus.',       color: 'from-vert-500 to-vert-700' },
    { icon: Calendar,      title: 'Agenda partagé',     desc: 'Emploi du temps, événements, sorties scolaires et rendez-vous.',     color: 'from-bleu-500 to-bleu-700' },
    { icon: MessageSquare, title: 'Communication',      desc: 'Échangez directement avec les enseignants et l\'administration.',     color: 'from-rouge-500 to-rouge-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden">
      <PublicNav />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img src="/Img4.jpeg" alt="" className="w-full h-full object-cover opacity-30" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Img1.jpeg'; }} />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-bleu-950/90 to-gray-950/95" />
        </div>

        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-or-400/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rouge-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full py-20">
          <div className="lg:col-span-7 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-or-500/15 border border-or-500/30 text-or-300 mb-6"
            >
              <Heart size={14} className="fill-or-300" />
              <span className="text-xs font-black uppercase tracking-[0.25em]">Espace Parent</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-6"
            >
              Restez proche de
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-amber-300 to-or-500">
                la scolarité
              </span>{' '}
              de vos enfants.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-white/70 font-medium max-w-2xl leading-relaxed mb-10"
            >
              Suivez les progrès de vos enfants au jour le jour, communiquez avec leurs
              enseignants et gérez tous les aspects de leur scolarité en toute simplicité.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                onClick={() => navigate('/login')}
                className="h-14 px-8 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-gold flex items-center gap-2"
              >
                <LogIn size={18} /> Accéder à mon espace
              </Button>
              <Button
                onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="h-14 px-8 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/20 hover:bg-white/15 transition-all flex items-center gap-2"
              >
                Voir les services <ArrowRight size={18} />
              </Button>
            </motion.div>
          </div>

          {/* Card visuelle */}
          <div className="lg:col-span-5 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-or-400/30 to-amber-500/30 rounded-3xl blur-3xl" />
              <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-or-500/20 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-or-400 to-or-600 flex items-center justify-center text-gray-950 mb-6 shadow-gold">
                  <Heart size={32} className="fill-gray-950" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-or-300 mb-2">Vos enfants, votre priorité</p>
                <h3 className="text-2xl font-black mb-3 tracking-tight">Un tableau de bord chaleureux</h3>
                <p className="text-sm text-white/70 font-medium leading-relaxed mb-6">
                  Toute la scolarité de vos enfants réunie en un seul endroit, simple et rassurant.
                </p>
                <ul className="space-y-3">
                  {['Notifications en temps réel', 'Paiement sécurisé en ligne', 'Bulletins téléchargeables'].map((t, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <CheckCircle2 size={16} className="text-or-300 shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-gray-950 to-amber-950/40 relative">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-or-500/10 border border-or-500/20 text-or-300 mb-5">
              <Sparkles size={12} />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Vos services</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
              Tout pour <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 to-amber-300">accompagner</span> vos enfants
            </h2>
            <p className="text-sm md:text-base text-white/60 font-medium">
              Suivez, payez, communiquez — sans jamais quitter l'application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-7 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-or-500/40 hover:bg-white/10 transition-all"
              >
                <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform', f.color)}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-black mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/60 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────── */}
      <section className="relative py-24 bg-gradient-to-br from-amber-900 to-bleu-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Users size={48} className="mx-auto text-or-300 mb-6" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
            Toujours connecté avec leur école
          </h2>
          <p className="text-sm md:text-base text-white/70 font-medium mb-10 max-w-xl mx-auto">
            Connectez-vous pour suivre la scolarité de vos enfants.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="h-14 px-10 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-gold hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
          >
            <LogIn size={18} /> Se connecter
          </Button>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Portail Parent" />
    </div>
  );
};

export default ParentLanding;
