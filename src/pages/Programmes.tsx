import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, GraduationCap, Globe, Zap, Brain, Palette,
  Atom, Languages, Heart, ArrowRightCircle, Award, Trophy, Wallet,
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

// ─── Données réelles EIEF ──────────────────────────────────────────────────
const formatGNF = (n: number) => `${new Intl.NumberFormat('fr-GN').format(n)} GNF`;

interface Cycle {
  id: string;
  title: string;
  subtitle: string;
  niveauLabel: string;
  desc: string;
  image: string;
  features: string[];
  highlights: { label: string; value: string }[];
  totalNouvelle: number;
  totalReinscription: number;
  gradient: string;
  accentText: string;
  accentBg: string;
  icon: any;
  classes: string[];
}

const CYCLES: Cycle[] = [
  {
    id: 'maternelle',
    title: 'Cycle Maternelle',
    subtitle: 'Éveil & Découverte (0-6 ans)',
    niveauLabel: 'Crèche · PS · MS · GS',
    desc: "Un environnement ludique et sécurisé pour favoriser l'épanouissement, l'autonomie et les premières découvertes linguistiques en français et anglais.",
    image: '/Maternelle.jpeg',
    features: ['Bilinguisme précoce', 'Motricité globale', 'Éveil artistique', 'Jardin pédagogique'],
    highlights: [
      { label: 'Effectif max', value: '18 / classe' },
      { label: 'Langues', value: 'FR + EN' },
      { label: 'Niveaux', value: 'Crèche à GS' },
    ],
    totalNouvelle: 5800000,
    totalReinscription: 5600000,
    gradient: 'from-rouge-500 to-rose-600',
    accentText: 'text-rouge-500 dark:text-rouge-300',
    accentBg: 'bg-rouge-500/10',
    icon: Heart,
    classes: ['Crèche', 'Petite Section', 'Moyenne Section', 'Grande Section'],
  },
  {
    id: 'primaire',
    title: 'Cycle Primaire',
    subtitle: 'Fondamentaux & Bilinguisme (6-11 ans)',
    niveauLabel: 'CP1 → CM1',
    desc: 'Acquisition des savoirs fondamentaux (lecture, écriture, calcul) avec une immersion linguistique quotidienne pour un bilinguisme naturel.',
    image: '/Img3.jpeg',
    features: ['Programme bilingue', 'Méthodes actives', 'Informatique dès le CP', 'Sorties éducatives'],
    highlights: [
      { label: 'Effectif max', value: '24 / classe' },
      { label: 'Langues', value: 'FR + EN' },
      { label: 'Niveaux', value: 'CP1 → CM1' },
    ],
    totalNouvelle: 6300000,
    totalReinscription: 6100000,
    gradient: 'from-bleu-600 to-indigo-600',
    accentText: 'text-bleu-600 dark:text-bleu-300',
    accentBg: 'bg-bleu-500/10',
    icon: Globe,
    classes: ['CP1', 'CP2', 'CE1', 'CE2', 'CM1'],
  },
  {
    id: 'examen-primaire',
    title: 'Examen Primaire (CM2)',
    subtitle: 'Classe de Fin d\'Études Primaires',
    niveauLabel: '6ème Année (CEE)',
    desc: 'Préparation intensive au Certificat de Fin d\'Études Élémentaires (CEE). Encadrement renforcé et examens blancs réguliers.',
    image: '/Img3.jpeg',
    features: ['Préparation CEE', 'Cours de soutien inclus', 'Méthodologie d\'examen', 'Suivi personnalisé'],
    highlights: [
      { label: 'Effectif max', value: '25 / classe' },
      { label: 'Examen', value: 'CEE' },
      { label: 'Réussite', value: '100% en 2025' },
    ],
    totalNouvelle: 8300000,
    totalReinscription: 7100000,
    gradient: 'from-bleu-700 to-cyan-600',
    accentText: 'text-bleu-700 dark:text-cyan-400',
    accentBg: 'bg-bleu-500/10',
    icon: Trophy,
    classes: ['CM2 (6ème Année)'],
  },
  {
    id: 'college',
    title: 'Cycle Collège',
    subtitle: 'Approfondissement (12-15 ans)',
    niveauLabel: '7ème → 9ème',
    desc: "Structuration de la pensée critique, maîtrise des disciplines scientifiques et littéraires, et initiation aux parcours d'orientation.",
    image: '/Img7.jpeg',
    features: ['Option STEM', 'Laboratoire de langues', 'Arts & Culture', 'Préparation au BEPC'],
    highlights: [
      { label: 'Effectif max', value: '28 / classe' },
      { label: 'Niveaux', value: '7ème → 9ème' },
      { label: 'Options', value: 'STEM, Arts' },
    ],
    totalNouvelle: 7800000,
    totalReinscription: 7600000,
    gradient: 'from-or-500 to-amber-600',
    accentText: 'text-or-600 dark:text-or-300',
    accentBg: 'bg-or-500/10',
    icon: Brain,
    classes: ['7ème', '8ème', '9ème'],
  },
  {
    id: 'examen-college',
    title: 'Examen Collège (10ème)',
    subtitle: 'Brevet d\'Études du Premier Cycle',
    niveauLabel: '10ème Année (BEPC)',
    desc: 'Année charnière préparant au BEPC. Orientation vers les filières du lycée et approfondissement des acquis.',
    image: '/Img7.jpeg',
    features: ['Préparation BEPC', 'Cours de soutien inclus', 'Orientation lycée', 'Examens blancs'],
    highlights: [
      { label: 'Effectif max', value: '25 / classe' },
      { label: 'Examen', value: 'BEPC' },
      { label: 'Réussite', value: '100% en 2025' },
    ],
    totalNouvelle: 9800000,
    totalReinscription: 8600000,
    gradient: 'from-or-600 to-amber-700',
    accentText: 'text-or-700 dark:text-amber-400',
    accentBg: 'bg-or-500/10',
    icon: Award,
    classes: ['10ème Année'],
  },
  {
    id: 'lycee',
    title: 'Cycle Lycée',
    subtitle: 'Excellence & Spécialisation (16-18 ans)',
    niveauLabel: '11ème → 12ème',
    desc: 'Préparation intensive au baccalauréat national, avec un accompagnement personnalisé vers les études supérieures.',
    image: '/Lycee.jpeg',
    features: ['Spécialités variées', 'Coaching post-bac', 'Projets de recherche', '100% de réussite'],
    highlights: [
      { label: 'Effectif max', value: '30 / classe' },
      { label: 'Niveaux', value: '11ème & 12ème' },
      { label: 'Réussite', value: '100% au BAC' },
    ],
    totalNouvelle: 8300000,
    totalReinscription: 8100000,
    gradient: 'from-vert-500 to-emerald-600',
    accentText: 'text-vert-600 dark:text-vert-300',
    accentBg: 'bg-vert-500/10',
    icon: Zap,
    classes: ['11ème Année', '12ème Année'],
  },
  {
    id: 'examen-lycee',
    title: 'Examen Lycée (Terminale)',
    subtitle: 'Baccalauréat Unique',
    niveauLabel: 'Terminale (BAC)',
    desc: 'Préparation intensive au baccalauréat national. Accompagnement vers les études supérieures et les concours.',
    image: '/Lycee.jpeg',
    features: ['Préparation BAC', 'Coaching post-bac', 'Cours de soutien inclus', '100% de réussite'],
    highlights: [
      { label: 'Effectif max', value: '25 / classe' },
      { label: 'Examen', value: 'BAC' },
      { label: 'Réussite', value: '100% en 2025' },
    ],
    totalNouvelle: 10300000,
    totalReinscription: 9100000,
    gradient: 'from-vert-600 to-emerald-700',
    accentText: 'text-vert-700 dark:text-emerald-400',
    accentBg: 'bg-vert-500/10',
    icon: GraduationCap,
    classes: ['Terminale'],
  },
];

const TOOLS = [
  { title: 'Bilinguisme', desc: 'Français & Anglais maîtrisés dès la maternelle.', icon: Languages, col: 'text-bleu-500', bg: 'bg-bleu-500/10' },
  { title: 'Sciences & Tech', desc: 'Laboratoires équipés & cours d\'informatique.', icon: Atom, col: 'text-rouge-500', bg: 'bg-rouge-500/10' },
  { title: 'Arts & Culture', desc: 'Théâtre, musique, dessin, expression corporelle.', icon: Palette, col: 'text-or-500', bg: 'bg-or-500/10' },
  { title: 'E-Learning', desc: 'Plateforme & contenus en ligne 24h/24.', icon: GraduationCap, col: 'text-vert-600', bg: 'bg-vert-500/10' },
];

const Programmes: React.FC = () => {
  const navigate = useNavigate();
  const [activeCycleId, setActiveCycleId] = useState<string>('primaire');
  const activeCycle = CYCLES.find(c => c.id === activeCycleId) ?? CYCLES[2];
  const ActiveIcon = activeCycle.icon;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">
      <PublicNav active="Programmes" />

      <PageHero
        imageSrc="/Img7.jpeg"
        imageFallback="/Img3.jpeg"
        badge="Cursus Académique 2026 — 2027"
        title={<>Un parcours vers <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-400 to-or-500">l'excellence</span>.</>}
        subtitle="Découvrez nos programmes d'enseignement innovants, conçus pour former les leaders de demain — de la crèche à la Terminale."
        tagline="De la crèche au Bac"
        actions={[
          { label: 'Voir nos cycles', onClick: () => { document.getElementById('cycles')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'primary' },
          { label: "S'inscrire", onClick: () => navigate('/preinscription'), variant: 'secondary' },
        ]}
      />

      {/* PARCOURS VISUEL — Selecteur de cycle (timeline) */}
      <section className="py-16 md:py-20 bg-[#fafafa] dark:bg-gray-900/50 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-bleu-600/10 text-bleu-700 dark:text-bleu-400 border border-bleu-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">Parcours complet</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              5 cycles, <span className="bg-clip-text text-transparent bg-gradient-to-r from-bleu-600 to-or-500">18 années</span> d'accompagnement
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              Sélectionnez un cycle pour voir le détail des classes, des effectifs et des frais associés.
            </p>
          </div>

          {/* Timeline de cycles cliquable */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-10">
            {CYCLES.map((c) => {
              const Icon = c.icon;
              const isActive = activeCycleId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCycleId(c.id)}
                  className={cn(
                    'relative p-4 md:p-5 rounded-2xl border-2 text-left transition-all overflow-hidden group',
                    isActive
                      ? 'border-transparent bg-gradient-to-br shadow-2xl scale-[1.02] ' + c.gradient + ' text-white'
                      : 'border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all', isActive ? 'bg-white/20' : c.accentBg + ' ' + c.accentText)}>
                    <Icon size={18} />
                  </div>
                  <p className={cn('text-[9px] font-black uppercase tracking-widest mb-1', isActive ? 'text-white/80' : 'text-gray-400')}>
                    {c.niveauLabel}
                  </p>
                  <p className={cn('text-sm font-black leading-tight', isActive ? 'text-white' : 'text-gray-900 dark:text-white')}>
                    {c.title.replace('Cycle ', '')}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Détail du cycle actif */}
          <motion.div
            key={activeCycle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900/40 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden grid grid-cols-1 lg:grid-cols-2"
          >
            {/* Image */}
            <div className="relative h-64 lg:h-auto min-h-[320px]">
              <img src={activeCycle.image} alt={activeCycle.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className={cn('absolute inset-0 bg-gradient-to-t opacity-60', activeCycle.gradient)} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl bg-gradient-to-br', activeCycle.gradient)}>
                  <ActiveIcon size={24} />
                </div>
                <Badge className="bg-white/90 text-gray-900 font-black text-[9px] uppercase tracking-widest border-none">
                  Année 2026-2027
                </Badge>
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-or-300 mb-2">{activeCycle.niveauLabel}</p>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">{activeCycle.title}</h3>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-8 md:p-10">
              <p className={cn('text-[10px] font-black uppercase tracking-[0.3em] mb-3', activeCycle.accentText)}>
                {activeCycle.subtitle}
              </p>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-6">
                {activeCycle.desc}
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {activeCycle.highlights.map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{h.label}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{h.value}</p>
                  </div>
                ))}
              </div>

              {/* Classes */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Classes concernées</p>
                <div className="flex flex-wrap gap-2">
                  {activeCycle.classes.map((cl) => (
                    <span key={cl} className={cn('px-3 py-1.5 rounded-full text-[11px] font-black border', activeCycle.accentBg, activeCycle.accentText, 'border-current/20')}>
                      {cl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">
                {activeCycle.features.map((f) => (
                  <div key={f} className="flex gap-2 items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={16} className="text-vert-500 shrink-0" /> {f}
                  </div>
                ))}
              </div>

              {/* Tarifs */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-bleu-50 to-white dark:from-bleu-900/20 dark:to-gray-900/40 border border-bleu-100 dark:border-bleu-900/20">
                  <p className="text-[9px] font-black uppercase tracking-widest text-bleu-600 dark:text-bleu-400 mb-1">Nouvelle Inscription</p>
                  <p className="text-base md:text-lg font-black text-gray-900 dark:text-white">{formatGNF(activeCycle.totalNouvelle)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-or-50 to-white dark:from-or-900/20 dark:to-gray-900/40 border border-or-100 dark:border-or-900/20">
                  <p className="text-[9px] font-black uppercase tracking-widest text-or-600 dark:text-or-400 mb-1">Réinscription</p>
                  <p className="text-base md:text-lg font-black text-gray-900 dark:text-white">{formatGNF(activeCycle.totalReinscription)}</p>
                </div>
              </div>

              <Button
                onClick={() => navigate('/preinscription')}
                className={cn('h-12 px-7 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl bg-gradient-to-r', activeCycle.gradient)}
              >
                Inscrire mon enfant <ArrowRight size={16} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TABLEAU TARIFS COMPLET */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Tarification transparente
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Nos frais de scolarité <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-500 to-vert-600">2026 — 2027</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              Frais d'inscription unique + scolarité annuelle. Possibilité de paiement échelonné.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900/40">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-bleu-800 via-bleu-700 to-vert-700 text-white">
                <tr>
                  <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest">Cycle</th>
                  <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest hidden md:table-cell">Classes</th>
                  <th className="text-right p-5 text-[10px] font-black uppercase tracking-widest">Nouvelle Inscription</th>
                  <th className="text-right p-5 text-[10px] font-black uppercase tracking-widest">Réinscription</th>
                </tr>
              </thead>
              <tbody>
                {CYCLES.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <tr key={c.id} className={cn('border-t border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5', i % 2 === 0 ? 'bg-white dark:bg-gray-900/30' : 'bg-gray-50/50 dark:bg-gray-900/50')}>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.accentBg, c.accentText)}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{c.title.replace('Cycle ', '')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.classes.slice(0, 3).map(cl => (
                            <span key={cl} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[9px] font-bold text-gray-500">{cl}</span>
                          ))}
                          {c.classes.length > 3 && <span className="text-[9px] font-bold text-gray-400">+{c.classes.length - 3}</span>}
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatGNF(c.totalNouvelle)}</p>
                      </td>
                      <td className="p-5 text-right">
                        <p className={cn('text-sm font-black', c.accentText)}>{formatGNF(c.totalReinscription)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-5 bg-gradient-to-r from-or-50 to-vert-50 dark:from-or-900/10 dark:to-vert-900/10 rounded-2xl border border-or-200 dark:border-or-900/30 flex items-start gap-3">
            <Wallet size={18} className="text-or-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-black text-gray-900 dark:text-white mb-1">Modalités de paiement flexibles</p>
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Paiement annuel, trimestriel ou mensuel. Réductions appliquées pour les fratries (à partir du 2ème enfant). Frais hors cantine, transport et tenues — disponibles en option à l'inscription.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OUTILS & MÉTHODES */}
      <section className="py-16 md:py-20 bg-[#fafafa] dark:bg-gray-900/50 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Outils & Méthodes
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Une pédagogie <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-600">complète</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOOLS.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="p-8 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-2xl rounded-3xl transition-all hover:-translate-y-1 text-left h-full">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg', f.bg, f.col)}>
                    <f.icon size={26} />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">{f.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-bleu-800 via-vert-700 to-vert-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 30% 30%, white 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Award size={48} className="mx-auto text-or-300 mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 italic">
            Prêt à offrir le meilleur
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 to-or-500">à vos enfants ?</span>
          </h2>
          <p className="text-white/80 text-base md:text-lg font-medium max-w-xl mx-auto mb-10">
            Commencez les démarches dès aujourd'hui pour l'année scolaire 2026 — 2027.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate('/preinscription')} className="h-14 px-10 bg-or-500 hover:bg-or-400 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-gold transition-all hover:scale-105 flex items-center gap-2">
              S'inscrire <ArrowRightCircle size={18} />
            </Button>
            <Button onClick={() => navigate('/contact')} className="h-14 px-10 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-white/30 hover:bg-white/20 transition-all">
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Programmes" />
    </div>
  );
};

export default Programmes;
