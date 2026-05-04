import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  LayoutDashboard,
  Users,
  CalendarDays,
  FileBarChart,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

const EmployeLanding: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    { icon: FileBarChart, title: 'Gestion Pédagogique', desc: 'Interface unifiée de saisie des notes, suivi des absences et édition rapide des bulletins trimestriels.', features: ['Saisie centralisée', 'Génération de rapports', 'Outils statistiques'], color: 'text-vert-600', bg: 'bg-vert-500/10' },
    { icon: Users, title: 'Ressources Humaines', desc: 'Accédez à votre dossier professionnel, demandez vos congés et téléchargez vos fiches de paie.', features: ['Fiches de paie sécurisées', 'Planification des congés', 'Évaluations annuelles'], color: 'text-or-600', bg: 'bg-or-500/10' },
    { icon: CalendarDays, title: 'Planification & Salles', desc: "Visualisez en temps réel l'emploi du temps global et la disponibilité des salles.", features: ['Réservation en un clic', 'Vues par enseignant', 'Notifications de changements'], color: 'text-bleu-600', bg: 'bg-bleu-500/10' },
    { icon: MessageCircle, title: 'Communication', desc: 'Canal direct avec la direction pour les circulaires officielles et la messagerie instantanée.', features: ['Circulaires prioritaires', 'Messagerie cryptée', 'Groupes de travail'], color: 'text-rouge-500', bg: 'bg-rouge-500/10' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">
      <PublicNav />

      <PageHero
        imageSrc="/Img7.jpeg"
        imageFallback="/smartboard.jpg"
        badge="Réseau Interne"
        title={
          <>
            Le moteur de notre{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-300 via-vert-400 to-vert-500">
              excellence
            </span>
            .
          </>
        }
        subtitle="Une interface nouvelle génération conçue pour le corps enseignant et l'administration de l'EIEF. Efficacité, rapidité et clarté."
        tagline="Faisons Plus !"
        actions={[
          { label: 'Accéder au portail', onClick: () => navigate('/login'), variant: 'primary', icon: <LayoutDashboard size={18} /> },
          { label: "Guide d'intégration", onClick: () => { document.getElementById('outils')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'secondary', icon: <Layers size={18} /> },
        ]}
      />

      {/* OUTILS */}
      <section id="outils" className="py-20 md:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Outils Métier
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Vos outils du quotidien
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-3 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer vos classes, documents et communication, dans un seul tableau de bord.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {tools.map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 rounded-3xl p-10 border border-gray-100 dark:border-white/5 hover:border-vert-300 dark:hover:border-vert-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform', tool.bg, tool.color)}>
                  <tool.icon size={30} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{tool.title}</h3>
                <p className="text-base text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed">{tool.desc}</p>
                <div className="space-y-3">
                  {tool.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="text-vert-500 flex-shrink-0" size={18} />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PERFORMANCE */}
      <section className="py-20 md:py-24 bg-[#fafafa] dark:bg-gray-900/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
                <Sparkles size={12} className="mr-1.5 inline" /> Performances
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
                Zéro perte de temps. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-700">100% focus enseignement.</span>
              </h2>
              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                Notre architecture est pensée pour éliminer la charge administrative redondante. Validation de congé, réservation de salle, notification d'un devoir — tout est rapide.
              </p>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-vert-50 dark:bg-vert-950/30 flex items-center justify-center flex-shrink-0 text-vert-600 dark:text-vert-400 shadow-md">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-black text-base">Single Sign-On (SSO)</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Une seule connexion pour tous vos services internes EIEF.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-or-50 dark:bg-or-950/30 flex items-center justify-center flex-shrink-0 text-or-600 dark:text-or-400 shadow-md">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-black text-base">Hautement sécurisé</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Toutes les données RH et pédagogiques sont chiffrées de bout en bout.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-vert-700 via-vert-800 to-bleu-800 rounded-3xl p-1 shadow-2xl">
              <div className="bg-gray-950 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-or-500/20 rounded-full blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-vert-500/20 rounded-full blur-[60px]" />
                <div className="relative z-10 space-y-8">
                  {[
                    { label: 'Temps moyen de saisie', value: '60%', extra: 'rapide', color: 'text-vert-400' },
                    { label: 'Satisfaction globale', value: '4.9', extra: '/ 5', color: 'text-or-400' },
                    { label: 'Disponibilité système', value: '99.9%', extra: 'uptime', color: 'text-vert-400' },
                  ].map((s, i) => (
                    <div key={i} className={cn('pb-6', i < 2 ? 'border-b border-white/10' : '')}>
                      <p className="text-gray-500 font-black mb-2 uppercase tracking-widest text-[10px]">{s.label}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl md:text-5xl font-black text-white">{s.value}</span>
                        <span className={cn('font-bold mb-1.5 text-sm', s.color)}>{s.extra}</span>
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
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-bleu-800 via-vert-700 to-vert-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 30% 30%, white 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-8 italic">
            Votre espace <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 to-or-500">vous attend</span>.
          </h2>
          <Button
            onClick={() => navigate('/login')}
            className="h-14 px-10 bg-or-500 hover:bg-or-400 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-gold transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            Se connecter <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Collaborateur" />
    </div>
  );
};

export default EmployeLanding;
