import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../utils/cn';

export interface PageHeroAction {
  label: string;
  onClick: () => void;
  /** Variante visuelle. 'primary' = bouton or, 'secondary' = bouton glass blanc, 'accent' = dégradé violet */
  variant?: 'primary' | 'secondary' | 'accent';
  icon?: React.ReactNode;
}

interface PageHeroProps {
  /** Image de fond — chemin sous /public (ex: '/Img1.jpeg'). Fallback si l'image principale 404. */
  imageSrc: string;
  imageFallback?: string;
  /** Petit badge au-dessus du titre */
  badge?: string;
  /** Titre principal (peut contenir du JSX pour les span colorés) */
  title: React.ReactNode;
  /** Sous-titre court sous le titre */
  subtitle?: string;
  /** Slogan/tagline en italique sous le sous-titre (ex: "Never Give Up") */
  tagline?: string;
  /** Boutons CTAs */
  actions?: PageHeroAction[];
  /** Composant supplémentaire injecté en bas du hero (stats, features…) */
  bottomSlot?: React.ReactNode;
  /** Hauteur min — par défaut 'screen'. 'compact' = 70vh */
  size?: 'screen' | 'compact';
  /** Affiche l'indicateur de scroll en bas */
  showScrollIndicator?: boolean;
  /** Position horizontale du contenu */
  align?: 'center' | 'left';
}

/**
 * Hero plein écran réutilisable — image de fond, overlay sombre dégradé,
 * halos vert/or, titre, sous-titre, CTAs. Inspiré de la home page disaade.com.
 */
const PageHero: React.FC<PageHeroProps> = ({
  imageSrc,
  imageFallback = '/Img1.jpeg',
  badge,
  title,
  subtitle,
  tagline,
  actions = [],
  bottomSlot,
  size = 'screen',
  showScrollIndicator = true,
  align = 'center',
}) => {
  const heightClass = size === 'screen' ? 'min-h-screen' : 'min-h-[70vh]';
  const alignClasses = align === 'center' ? 'text-center items-center justify-center' : 'text-left items-start';

  return (
    <section className={cn('relative flex overflow-hidden', heightClass, align === 'center' ? 'items-center justify-center' : 'items-end')}>
      {/* IMAGE DE FOND avec fallback */}
      <img
        src={imageSrc}
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith(imageFallback)) img.src = imageFallback;
        }}
        alt="EIEF"
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-tr from-vert-900/60 via-transparent to-bleu-900/40" />

      {/* HALOS DÉCORATIFS */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-or-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-vert-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />

      {/* GRAIN TEXTURE */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* CONTENU */}
      <div className={cn('relative z-10 max-w-[1400px] mx-auto px-6 py-32 w-full flex flex-col', alignClasses)}>
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg self-center"
          >
            <span className="w-2 h-2 rounded-full bg-or-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{badge}</span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className={cn(
            'font-black text-white leading-[0.95] tracking-tighter mb-8 italic drop-shadow-2xl',
            align === 'center' ? 'text-5xl md:text-7xl lg:text-[88px]' : 'text-4xl md:text-6xl lg:text-[72px]'
          )}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className={cn(
              'text-base md:text-xl text-white/85 font-medium leading-relaxed mb-4',
              align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'
            )}
          >
            {subtitle}
          </motion.p>
        )}

        {tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xs uppercase tracking-[0.4em] font-black text-or-300 mb-12"
          >
            {tagline}
          </motion.p>
        )}

        {actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className={cn('flex flex-wrap gap-4', align === 'center' ? 'justify-center' : '')}
          >
            {actions.map((a, i) => {
              if (a.variant === 'secondary') {
                return (
                  <button
                    key={i}
                    onClick={a.onClick}
                    className="h-14 px-10 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all flex items-center gap-2"
                  >
                    {a.label} {a.icon}
                  </button>
                );
              }
              if (a.variant === 'accent') {
                return (
                  <button
                    key={i}
                    onClick={a.onClick}
                    className="h-14 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
                  >
                    {a.icon} {a.label}
                  </button>
                );
              }
              // primary
              return (
                <Button
                  key={i}
                  onClick={a.onClick}
                  className="h-14 px-10 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest hover:from-or-400 hover:to-or-500 transition-all flex items-center gap-2 shadow-gold hover:shadow-2xl hover:scale-105"
                >
                  {a.label} {a.icon ?? <ArrowRight size={18} />}
                </Button>
              );
            })}
          </motion.div>
        )}

        {bottomSlot && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="mt-16 w-full"
          >
            {bottomSlot}
          </motion.div>
        )}
      </div>

      {showScrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Découvrir</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
        </motion.div>
      )}
    </section>
  );
};

export default PageHero;
