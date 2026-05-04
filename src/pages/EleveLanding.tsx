import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  Activity,
  Trophy,
  Laptop,
  Library,
  Calendar,
  FileText,
  Award,
  CheckCircle,
} from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

const EleveLanding: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ressources');

  const activities = [
    { icon: BookOpen, title: "Apprentissage d'Excellence", desc: "Des cours approfondis et des ressources pédagogiques adaptées pour viser l'excellence dans toutes les matières.", color: 'text-bleu-600', bg: 'bg-bleu-500/10' },
    { icon: Laptop, title: 'Outils Numériques', desc: 'Accédez à tout moment à vos cours, exercices interactifs, et à la plateforme en ligne.', color: 'text-or-600', bg: 'bg-or-500/10' },
    { icon: Activity, title: 'Vie Associative & Clubs', desc: "Clubs d'anglais, d'informatique, de lecture et activités sportives pour développer vos talents.", color: 'text-vert-600', bg: 'bg-vert-500/10' },
    { icon: Trophy, title: 'Compétitions & Défis', desc: 'Participez aux olympiades, hackathons scolaires et compétitions sportives inter-classes.', color: 'text-rouge-500', bg: 'bg-rouge-500/10' },
  ];

  const toolsTabs = [
    { id: 'ressources', label: 'Cahier & Devoirs', icon: FileText, title: 'Mon cahier de textes numérique', desc: "Suivez vos leçons abordées en classe et vos devoirs à faire à la maison. Plus aucune excuse pour oublier un exercice !", features: ['Emploi du temps intégré', 'Remise de devoirs en ligne', 'Notification de nouveaux exercices'] },
    { id: 'notes', label: 'Notes & Résultats', icon: Award, title: 'Suivi de mes évaluations', desc: "Consultez vos notes dès qu'elles sont publiées. Un accès direct et privé pour vous et vos parents.", features: ['Historique par semestre', 'Calcul de moyenne automatique', 'Graphe de progression'] },
    { id: 'planning', label: 'Emploi du temps', icon: Calendar, title: 'Planning & absences', desc: 'Visualisez vos cours de la semaine, les changements de salle ou les absences de professeurs.', features: ['Synchronisation instantanée', "Justification d'absence", 'Rappels de cours'] },
    { id: 'biblio', label: 'Bibliothèque', icon: Library, title: 'Médiathèque virtuelle', desc: "Une immense collection d'ouvrages, de vidéos pédagogiques et d'anciennes épreuves pour vos révisions.", features: ['Accès 24/7', 'Modules de révision par matière', 'Corrections et corrigés-types'] },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">
      <PublicNav />

      <PageHero
        imageSrc="/Img3.jpeg"
        imageFallback="/Maternelle.jpeg"
        badge="Espace Élève"
        title={
          <>
            Découvrez{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-400 to-or-500">
              l'expérience élève
            </span>
            <br />à l'EIEF.
          </>
        }
        subtitle="Un environnement conçu pour stimuler votre curiosité, développer vos talents et vous préparer aux défis de demain."
        tagline="L'avenir vous appartient"
        actions={[
          { label: 'Mon espace', onClick: () => navigate('/login'), variant: 'primary', icon: <GraduationCap size={18} /> },
          { label: 'Découvrir', onClick: () => { document.getElementById('quotidien')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'secondary' },
        ]}
      />

      {/* QUOTIDIEN */}
      <section id="quotidien" className="py-20 md:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Quotidien
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Votre journée à <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-700">l'EIEF</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-3 max-w-2xl mx-auto">
              Bien plus qu'une simple école, l'EIEF est un lieu de vie, de découverte et d'épanouissement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 rounded-3xl p-8 border border-gray-100 dark:border-white/5 hover:border-or-300 dark:hover:border-or-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform', a.bg, a.color)}>
                  <a.icon size={26} />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3">{a.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTILS - TABS */}
      <section className="py-20 md:py-24 bg-[#fafafa] dark:bg-gray-900/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Plateforme
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Les outils pour ta <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-500 to-vert-600">réussite</span>
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-1/3 flex flex-col gap-3">
              {toolsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 border-2',
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-900 border-or-400 shadow-lg'
                      : 'bg-white/40 dark:bg-gray-900/40 border-transparent hover:bg-white dark:hover:bg-gray-900 text-gray-500 hover:text-gray-700'
                  )}
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', activeTab === tab.id ? 'bg-gradient-to-br from-or-500 to-or-600 text-gray-950' : 'bg-gray-100 dark:bg-gray-800 text-gray-400')}>
                    <tab.icon size={22} />
                  </div>
                  <span className={cn('font-black text-sm', activeTab === tab.id ? 'text-gray-900 dark:text-white' : '')}>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="w-full lg:w-2/3">
              {toolsTabs.map((tab) => (
                <div key={tab.id} className={cn('bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-white/5 shadow-xl', activeTab === tab.id ? 'block' : 'hidden')}>
                  <div className="w-16 h-16 bg-or-50 dark:bg-or-950/30 rounded-2xl flex items-center justify-center text-or-600 dark:text-or-400 mb-6 shadow-md">
                    <tab.icon size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{tab.title}</h3>
                  <p className="text-base text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">{tab.desc}</p>
                  <div className="space-y-3 mb-8">
                    {tab.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="text-vert-500 flex-shrink-0" size={20} />
                        <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-or-600 dark:text-or-400 hover:gap-3 transition-all"
                  >
                    Découvrir ce module <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-bleu-800 via-vert-700 to-vert-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 30% 30%, white 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Trophy size={48} className="mx-auto text-or-300 mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 italic">
            Prêt à consulter <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 to-or-500">tes résultats ?</span>
          </h2>
          <p className="text-white/80 text-base md:text-lg font-medium max-w-xl mx-auto mb-10">
            Connectez-vous à la plateforme EIEF pour accéder à vos notes, devoirs, emploi du temps et bien plus.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="h-14 px-10 bg-or-500 hover:bg-or-400 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-gold transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            Se connecter <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Élève" />
    </div>
  );
};

export default EleveLanding;
