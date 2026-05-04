import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../utils/cn';

interface PublicNavProps {
  /** Page courante pour highlight du lien actif */
  active?: 'Accueil' | 'Programmes' | 'Admission' | 'Contact' | 'Jeux';
  /** Forcer le style "scrolled" même en haut (utile sur les pages sans hero plein écran) */
  forceSolid?: boolean;
}

/**
 * Navbar public partagée — transparente sur les heros plein écran,
 * passe en glass blanc/or au scroll. Utilisée sur Accueil, Programmes, Admission, Contact, Jeux.
 */
const PublicNav: React.FC<PublicNavProps> = ({ active = 'Accueil', forceSolid = false }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isSolid = scrolled || forceSolid;
  const links: Array<typeof active> = ['Accueil', 'Programmes', 'Admission', 'Contact', 'Jeux'];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 sm:px-10',
          isSolid
            ? 'py-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-2xl border-b border-gray-100 dark:border-white/5'
            : 'py-5 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm'
        )}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 bg-white rounded-xl p-1.5 shadow-xl ring-2 ring-or-400/40 transition-transform group-hover:scale-110">
              <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span
                className={cn(
                  'text-lg font-black tracking-tighter leading-none transition-colors',
                  isSolid ? 'text-gray-900 dark:text-white' : 'text-white'
                )}
              >
                EIEF
              </span>
              <span
                className={cn(
                  'text-[8px] font-bold uppercase tracking-widest transition-colors',
                  isSolid ? 'text-vert-600 dark:text-or-400' : 'text-or-300'
                )}
              >
                Éducation d'Excellence
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {links.map((link) => {
                const isActive = link === active;
                return (
                  <button
                    key={link}
                    onClick={() => navigate(link === 'Accueil' ? '/' : `/${link.toLowerCase()}`)}
                    className={cn(
                      'text-[10px] font-black uppercase tracking-widest transition-colors',
                      isActive
                        ? isSolid
                          ? 'text-vert-700 dark:text-or-400'
                          : 'text-or-300'
                        : isSolid
                        ? 'text-gray-500 dark:text-gray-400 hover:text-vert-600 dark:hover:text-white'
                        : 'text-white/80 hover:text-or-300'
                    )}
                  >
                    {link}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={cn(
                  'p-2.5 rounded-xl transition-all border',
                  isSolid
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border-transparent dark:border-white/5'
                    : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-white/20'
                )}
              >
                {isDarkMode ? <Sun size={18} className="text-or-400" /> : <Moon size={18} />}
              </button>

              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-or-500 to-or-600 text-gray-950 font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-lg shadow-gold hover:shadow-2xl hover:from-or-400 hover:to-or-500 transition-all flex items-center gap-2"
              >
                Connexion <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          <button
            className={cn('lg:hidden p-2', isSolid ? 'text-gray-900 dark:text-white' : 'text-white')}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/5 shadow-2xl animate-in fade-in slide-in-from-top">
          <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
            {links.map((link) => (
              <button
                key={link}
                onClick={() => {
                  navigate(link === 'Accueil' ? '/' : `/${link.toLowerCase()}`);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-900 dark:text-white font-bold text-sm rounded-lg hover:bg-vert-600 dark:hover:bg-or-600 hover:text-white transition-all"
              >
                {link}
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-lg font-bold text-sm flex items-center justify-between hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                {isDarkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
              </button>
              <Button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-or-500 to-or-600 text-gray-950 font-bold text-sm py-3 rounded-lg"
              >
                Connexion
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicNav;
