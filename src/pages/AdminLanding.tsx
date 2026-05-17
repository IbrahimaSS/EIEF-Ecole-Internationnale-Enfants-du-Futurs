import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, LogIn, Globe, Lock, Database, Cpu, Activity,
  ArrowRight, CheckCircle2, Crown, Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PublicFooter from '../components/shared/PublicFooter';

const AdminLanding: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Globe,    title: 'Contrôle global',       desc: 'Vue panoramique sur tous les modules et toutes les données.', color: 'from-bleu-500 to-bleu-700' },
    { icon: Lock,     title: 'Sécurité avancée',      desc: 'Gestion fine des rôles et permissions, audit logs.',         color: 'from-rouge-500 to-rouge-700' },
    { icon: Database, title: 'Données & sauvegardes', desc: 'Bases de données chiffrées et sauvegardes planifiées.',     color: 'from-or-500 to-or-700' },
    { icon: Cpu,      title: 'Monitoring technique',  desc: 'État des serveurs, logs, intégrations en temps réel.',       color: 'from-vert-500 to-vert-700' },
  ];

  const stats = [
    { value: '100%',    label: 'Contrôle' },
    { value: '24/7',    label: 'Disponibilité' },
    { value: 'AES-256', label: 'Chiffrement' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden">
      <PublicNav />

      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img src="/Img1.jpeg" alt="" className="w-full h-full object-cover opacity-30" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Img2.jpeg'; }} />
          <div className="absolute inset-0 bg-gradient-to-br from-bleu-900/95 via-bleu-950/90 to-gray-950/95" />
        </div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-or-500/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-bleu-500/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full py-20">
          <div className="lg:col-span-7 text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-or-500/10 border border-or-500/30 text-or-300 mb-6">
              <Crown size={14} />
              <span className="text-xs font-black uppercase tracking-[0.25em]">Espace Administration</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
              Pilotez tout EIEF<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-400 to-or-500">en un seul endroit.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-base md:text-lg text-white/70 font-medium max-w-2xl leading-relaxed mb-10">
              Le portail d'administration centralise la gestion des élèves, des finances, des enseignants et des services. Sécurité maximale, accès complet à toutes les fonctionnalités de l'établissement.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/login')} className="h-14 px-8 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-gold flex items-center gap-2">
                <LogIn size={18} /> Accéder à mon espace
              </Button>
              <Button onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="h-14 px-8 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/20 hover:bg-white/15 transition-all flex items-center gap-2">
                Découvrir <ArrowRight size={18} />
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-3 gap-6 mt-14 max-w-md">
              {stats.map((s, i) => (
                <div key={i} className="border-l-2 border-or-400/40 pl-4">
                  <p className="text-2xl md:text-3xl font-black text-or-300">{s.value}</p>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-or-400/30 to-bleu-500/30 rounded-3xl blur-3xl" />
              <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-or-400 to-or-600 flex items-center justify-center text-gray-950 mb-6 shadow-gold">
                  <ShieldCheck size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-or-300 mb-2">Accès Administrateur</p>
                <h3 className="text-2xl font-black mb-3 tracking-tight">Tableau de bord complet</h3>
                <p className="text-sm text-white/70 font-medium leading-relaxed mb-6">
                  Statistiques, finances, scolarité, communication, services. Toutes les briques de l'établissement à portée de main.
                </p>
                <ul className="space-y-3">
                  {['Multi-rôles & permissions', 'Tableaux de bord temps réel', 'Audit & traçabilité complète'].map((t, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <CheckCircle2 size={16} className="text-vert-400 shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-gray-950 to-bleu-950 relative">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-or-500/10 border border-or-500/20 text-or-300 mb-5">
              <Sparkles size={12} />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Capacités</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
              Une plateforme <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 to-or-500">forteresse</span>
            </h2>
            <p className="text-sm md:text-base text-white/60 font-medium">
              Chaque module est conçu pour donner aux administrateurs le contrôle total tout en gardant les données sécurisées.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group p-7 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-or-500/40 hover:bg-white/10 transition-all">
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

      <section className="relative py-24 bg-bleu-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Activity size={48} className="mx-auto text-or-400 mb-6" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Prêt à prendre les commandes ?</h2>
          <p className="text-sm md:text-base text-white/70 font-medium mb-10 max-w-xl mx-auto">
            Connectez-vous pour accéder à votre tableau de bord et piloter EIEF en temps réel.
          </p>
          <Button onClick={() => navigate('/login')} className="h-14 px-10 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-gold hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
            <LogIn size={18} /> Se connecter
          </Button>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Portail Administration" />
    </div>
  );
};

export default AdminLanding;
