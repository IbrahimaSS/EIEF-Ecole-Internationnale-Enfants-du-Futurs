import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldAlert,
  Lock,
  Globe,
  Database,
  Activity,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

const AdminLanding: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    { title: 'Contrôle Global', desc: 'Vue panoramique sur tous les campus, les flux financiers et les statistiques démographiques en temps réel.', icon: Globe, color: 'text-bleu-600', bg: 'bg-bleu-500/10' },
    { title: 'Sécurité Maximale', desc: 'Gestion granulaire des rôles et permissions. Audit logs intégrés pour tracer la moindre modification.', icon: Lock, color: 'text-rouge-500', bg: 'bg-rouge-500/10' },
    { title: 'Architecture Données', desc: 'Gérez les bases de données, les sauvegardes planifiées et la conformité des données personnelles.', icon: Database, color: 'text-or-600', bg: 'bg-or-500/10' },
    { title: 'Monitoring Technique', desc: "État des serveurs, logs d'erreurs, gestion des intégrations. Anticipation des congestions réseau.", icon: Cpu, color: 'text-vert-600', bg: 'bg-vert-500/10' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">
      <PublicNav />

      <PageHero
        imageSrc="/smartboard.jpg"
        imageFallback="/Img7.jpeg"
        badge="Réseau Administration"
        title={
          <>
            Système de pilotage{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-400 to-or-500">
              centralisé
            </span>
            .
          </>
        }
        subtitle="Interface de supervision stratégique. Gérez l'infrastructure, attribuez les privilèges et supervisez l'activité réseau en temps réel."
        tagline="Contrôle. Sécurité. Performance."
        actions={[
          { label: 'Authentification', onClick: () => navigate('/login'), variant: 'primary', icon: <ShieldAlert size={18} /> },
          { label: 'Architecture', onClick: () => { document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'secondary' },
        ]}
      />

      {/* MODULES */}
      <section id="modules" className="py-20 md:py-24 bg-white dark:bg-gray-950 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-14 gap-8">
            <div className="text-left">
              <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
                Architecture
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Modules de pilotage
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-3 max-w-xl">
                Supervision intégrale des modules de gestion de l'infrastructure scolaire.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-vert-700 dark:text-vert-400 bg-vert-50 dark:bg-vert-950/30 px-5 py-2.5 rounded-full border border-vert-200 dark:border-vert-500/20">
              <Activity className="text-vert-500 animate-pulse" size={16} />
              Système opérationnel
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 rounded-3xl p-8 shadow-soft hover:shadow-2xl hover:-translate-y-1 border border-gray-100 dark:border-white/5 hover:border-or-300 dark:hover:border-or-500/30 transition-all duration-500"
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform', m.bg, m.color)}>
                  <m.icon size={26} />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{m.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{m.desc}</p>
                <div className="mt-6 flex justify-end opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="text-or-500" size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIT LOG */}
      <section className="py-20 md:py-24 bg-[#fafafa] dark:bg-gray-900/50 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="bg-gradient-to-br from-bleu-800 via-vert-700 to-vert-800 rounded-[2.5rem] p-10 md:p-16 lg:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-or-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-vert-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-left">
                <Badge className="mb-4 bg-white/10 backdrop-blur-md text-or-300 border border-white/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
                  Sécurité
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 italic tracking-tight">
                  Audit Log & <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 to-or-500">Traçabilité</span>
                </h2>
                <p className="text-base md:text-lg text-white/80 font-medium mb-8 leading-relaxed max-w-xl">
                  Chaque connexion, modification de note ou paiement est horodaté et sécurisé.
                </p>
                <ul className="space-y-3">
                  {['Rapports financiers croisés automatiquement', "Blocage dynamique des tentatives d'intrusion", 'Sauvegardes chiffrées quotidiennes'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white font-medium">
                      <CheckCircle2 className="text-or-300 flex-shrink-0" size={20} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full lg:w-[400px] flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-or-300 animate-pulse" />
                    <span className="font-black text-[10px] uppercase tracking-widest text-or-300">Monitoring actif</span>
                  </div>
                  {[
                    { label: 'Charge serveur', value: '12%', bar: 'w-[12%]', color: 'bg-vert-400' },
                    { label: 'Taux de requêtes', value: '450 req/s', bar: 'w-[30%]', color: 'bg-or-400' },
                    { label: 'Intégrité DB', value: 'Stable', bar: 'w-full', color: 'bg-vert-400' },
                  ].map((s, i) => (
                    <div key={i} className="mb-5 last:mb-0">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/70 font-semibold">{s.label}</span>
                        <span className="text-white font-black">{s.value}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', s.bar, s.color)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              L'excellence requiert le contrôle
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
              Authentification stricte requise pour accéder aux modules d'administration.
            </p>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="h-14 px-10 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest hover:from-or-400 hover:to-or-500 transition-all flex items-center gap-2 shadow-gold hover:scale-105"
          >
            Se connecter <Lock size={16} />
          </Button>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Admin" />
    </div>
  );
};

export default AdminLanding;
