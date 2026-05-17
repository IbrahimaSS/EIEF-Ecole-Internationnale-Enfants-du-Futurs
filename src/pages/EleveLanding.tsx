import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket, LogIn, BookOpen, Calendar, MessageSquare, Gamepad2,
  ArrowRight, CheckCircle2, Star, Sparkles, Trophy, Zap,
} from 'lucide-react';
import { Button } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PublicFooter from '../components/shared/PublicFooter';

const EleveLanding: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: BookOpen,      title: 'Mes notes & devoirs', desc: 'Consulte tes résultats, tes appréciations et tes devoirs à rendre.', color: 'from-bleu-500 to-bleu-700' },
    { icon: Calendar,      title: 'Emploi du temps',     desc: 'Ton planning de la semaine, salles et matières à portée de clic.',  color: 'from-or-500 to-or-700' },
    { icon: Gamepad2,      title: 'Jeux éducatifs',      desc: 'Apprends en t\'amusant : quiz, math adventure, color master.',     color: 'from-rouge-500 to-rouge-700' },
    { icon: MessageSquare, title: 'Communication',       desc: 'Discute avec tes camarades et pose des questions aux profs.',       color: 'from-vert-500 to-vert-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden">
      <PublicNav />

      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img src="/Img5.jpeg" alt="" className="w-full h-full object-cover opacity-30" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Img1.jpeg'; }} />
          <div className="absolute inset-0 bg-gradient-to-br from-bleu-900/90 via-purple-900/80 to-gray-950/95" />
        </div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-or-400/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-vert-400/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-rouge-500/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full py-20">
          <div className="lg:col-span-7 text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-or-500/20 to-vert-500/20 border border-white/20 text-or-200 mb-6">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.25em]">Espace Élève</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
              Apprends,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-vert-300 to-rouge-300">joue</span>,{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-bleu-300 to-or-300">progresse !</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-base md:text-lg text-white/70 font-medium max-w-2xl leading-relaxed mb-10">
              Bienvenue dans ton espace personnel EIEF ! Notes, emploi du temps, jeux éducatifs et communication avec tes profs &mdash; tout est là pour t'aider à réussir.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/login')} className="h-14 px-8 bg-gradient-to-r from-or-500 via-rouge-500 to-vert-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-or-500/30 flex items-center gap-2">
                <Rocket size={18} /> Lancer mon espace
              </Button>
              <Button onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="h-14 px-8 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/20 hover:bg-white/15 transition-all flex items-center gap-2">
                Voir les fun stuff <ArrowRight size={18} />
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap gap-2 mt-10">
              {[
                { icon: Trophy, label: 'Tableau de bord', color: 'bg-or-500/20 text-or-200 border-or-400/40' },
                { icon: Zap, label: 'Jeux éducatifs', color: 'bg-rouge-500/20 text-rouge-200 border-rouge-400/40' },
                { icon: Star, label: 'Mes notes', color: 'bg-bleu-500/20 text-bleu-200 border-bleu-400/40' },
              ].map((p, i) => (
                <span key={i} className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest', p.color)}>
                  <p.icon size={12} /> {p.label}
                </span>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-or-400/30 via-rouge-500/20 to-vert-500/30 rounded-3xl blur-3xl" />
              <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-or-400 via-rouge-500 to-vert-500 flex items-center justify-center text-white mb-6 shadow-xl">
                  <Rocket size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-or-300 mb-2">Ton espace cool</p>
                <h3 className="text-2xl font-black mb-3 tracking-tight">Apprendre devient un jeu</h3>
                <p className="text-sm text-white/70 font-medium leading-relaxed mb-6">
                  Décroche des badges, monte ton score et compare avec tes camarades. L'école n'a jamais été aussi fun.
                </p>
                <ul className="space-y-3">
                  {['Quiz et mini-jeux par matière', 'Système de récompenses', 'Suivi de ta progression'].map((t, i) => (
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

      <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-gray-950 via-purple-950/30 to-bleu-950 relative">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-or-500/10 border border-or-400/20 text-or-200 mb-5">
              <Sparkles size={12} />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Tes super-pouvoirs</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
              Tout pour <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-vert-300 to-rouge-300">briller</span>
            </h2>
            <p className="text-sm md:text-base text-white/60 font-medium">Apprendre n'a jamais été aussi engageant. Et fun.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group p-7 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-or-400/40 hover:bg-white/10 transition-all">
                <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all', f.color)}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-black mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/60 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-br from-bleu-900 via-purple-900 to-rouge-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Trophy size={48} className="mx-auto text-or-300 mb-6 animate-pulse-soft" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Prêt pour l'aventure ?</h2>
          <p className="text-sm md:text-base text-white/70 font-medium mb-10 max-w-xl mx-auto">
            Connecte-toi et plonge dans ton espace EIEF. Ton futur commence ici.
          </p>
          <Button onClick={() => navigate('/login')} className="h-14 px-10 bg-gradient-to-r from-or-500 via-rouge-500 to-vert-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-or-500/30 hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
            <Rocket size={18} /> C'est parti !
          </Button>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Portail Élève" />
    </div>
  );
};

export default EleveLanding;
