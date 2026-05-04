import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Globe,
  Zap,
  Brain,
  Palette,
  Atom,
  Languages,
  Heart,
  ArrowRightCircle,
  Award,
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

const Programmes: React.FC = () => {
  const navigate = useNavigate();

  const cycles = [
    {
      id: 'maternelle',
      title: 'Cycle Maternelle',
      subtitle: 'Éveil & Découverte (Petite, Moyenne et Grande Section)',
      desc: "Un environnement ludique et sécurisé pour favoriser l'épanouissement, l'autonomie et les premières découvertes linguistiques.",
      image: '/Maternelle.jpeg',
      features: ['Bilinguisme précoce', 'Motricité globale', 'Éveil artistique', 'Jardin pédagogique'],
      gradient: 'from-rouge-500 to-rose-600',
      accentText: 'text-rouge-500',
      icon: Heart,
    },
    {
      id: 'primaire',
      title: 'Cycle Primaire',
      subtitle: 'Fondamentaux & Bilinguisme (CP au CM2)',
      desc: 'Acquisition des savoirs fondamentaux (lecture, écriture, calcul) avec une immersion linguistique quotidienne pour un bilinguisme naturel.',
      image: '/Img3.jpeg',
      features: ['Programme bilingue', 'Méthodes actives', 'Informatique dès le CP', 'Sorties éducatives'],
      gradient: 'from-bleu-600 to-indigo-600',
      accentText: 'text-bleu-600',
      icon: Globe,
    },
    {
      id: 'college',
      title: 'Cycle Collège',
      subtitle: 'Approfondissement & Orientation (6ème à la 3ème)',
      desc: "Structuration de la pensée critique, maîtrise des disciplines scientifiques et littéraires, et initiation aux parcours d'orientation.",
      image: '/Img7.jpeg',
      features: ['Option STEM', 'Laboratoire de langues', 'Arts & Culture', 'Préparation au Brevet'],
      gradient: 'from-or-500 to-amber-600',
      accentText: 'text-or-600',
      icon: Brain,
    },
    {
      id: 'lycee',
      title: 'Cycle Lycée',
      subtitle: 'Excellence & Spécialisation (Seconde à la Terminale)',
      desc: 'Préparation intensive aux baccalauréats nationaux et internationaux, avec un accompagnement personnalisé vers les études supérieures.',
      image: '/Lycee.jpeg',
      features: ['Spécialités variées', 'Coaching post-bac', 'Projets de recherche', '100% de réussite'],
      gradient: 'from-vert-500 to-emerald-600',
      accentText: 'text-vert-600',
      icon: Zap,
    },
  ];

  const tools = [
    { title: 'Bilinguisme', desc: 'Français & Anglais maîtrisés.', icon: Languages, col: 'text-bleu-500', bg: 'bg-bleu-500/10' },
    { title: 'Sciences & Tech', desc: 'Laboratoires & Informatique.', icon: Atom, col: 'text-rouge-500', bg: 'bg-rouge-500/10' },
    { title: 'Arts & Culture', desc: 'Théâtre, Musique, Dessin.', icon: Palette, col: 'text-or-500', bg: 'bg-or-500/10' },
    { title: 'E-Learning', desc: 'Contenus en ligne 24/7.', icon: GraduationCap, col: 'text-vert-600', bg: 'bg-vert-500/10' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">
      <PublicNav active="Programmes" />

      <PageHero
        imageSrc="/Img7.jpeg"
        imageFallback="/Img3.jpeg"
        badge="Cursus Académique"
        title={
          <>
            Un parcours vers{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-400 to-or-500">
              l'excellence
            </span>
            .
          </>
        }
        subtitle="Découvrez nos programmes d'enseignement innovants, conçus pour former les leaders de demain — de la crèche à la Terminale."
        tagline="De la Maternelle au Lycée"
        actions={[
          { label: 'Voir nos cycles', onClick: () => { document.getElementById('cycles')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'primary' },
          { label: "S'inscrire", onClick: () => navigate('/admission'), variant: 'secondary' },
        ]}
      />

      {/* CYCLES — sections alternées */}
      <section id="cycles" className="py-20 md:py-28 relative z-10 bg-white dark:bg-gray-950">
        <div className="max-w-[1400px] mx-auto px-6 space-y-24 md:space-y-32">
          {cycles.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
              >
                <div className={cn('relative group', i % 2 !== 0 ? 'lg:order-2' : '')}>
                  <div className="relative h-[380px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10">
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br', c.gradient)}>
                      <Icon size={24} />
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <p className={cn('text-[10px] font-black uppercase tracking-[0.3em] mb-3', c.accentText)}>
                    Cycle {i + 1} sur {cycles.length}
                  </p>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">
                    {c.title}
                  </h3>
                  <p className={cn('text-sm font-black uppercase tracking-widest mb-6', c.accentText)}>{c.subtitle}</p>
                  <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                    {c.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {c.features.map((f) => (
                      <div key={f} className="flex gap-2 items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                        <CheckCircle2 size={18} className="text-vert-500 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => navigate('/admission')}
                    className="h-12 px-8 bg-gradient-to-r from-vert-600 to-vert-700 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:from-vert-500 hover:to-vert-600 transition-all flex items-center gap-2 shadow-lg"
                  >
                    Découvrir le cursus <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* OUTILS & MÉTHODES */}
      <section className="py-20 md:py-24 bg-[#fafafa] dark:bg-gray-900/50 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Outils & Méthodes
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Une pédagogie complète
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-2xl rounded-3xl transition-all hover:-translate-y-1 text-left">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg', f.bg, f.col)}>
                    <f.icon size={26} />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">{f.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-bleu-800 via-vert-700 to-vert-800">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
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
            <Button
              onClick={() => navigate('/admission')}
              className="h-14 px-10 bg-or-500 hover:bg-or-400 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-gold transition-all hover:scale-105 flex items-center gap-2"
            >
              S'inscrire <ArrowRightCircle size={18} />
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              className="h-14 px-10 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-white/30 hover:bg-white/20 transition-all"
            >
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
