import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Youtube, Mail, MapPin, PhoneCall, Gamepad2 } from 'lucide-react';

interface PublicFooterProps {
  /** Variante 'full' = footer complet (Accueil), 'compact' = mini-footer une ligne (autres pages) */
  variant?: 'full' | 'compact';
  /** Nom de la page courante affiché dans le copyright (variant compact) */
  pageName?: string;
}

/**
 * Footer partagé EIEF — palette sombre, accents or/vert.
 */
const PublicFooter: React.FC<PublicFooterProps> = ({ variant = 'full', pageName }) => {
  const navigate = useNavigate();

  if (variant === 'compact') {
    return (
      <footer className="py-10 bg-gray-950 text-white border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white p-1 rounded-md shadow-sm">
              <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              © 2026 EIEF EDUCATION{pageName ? ` — ${pageName}` : ''}
            </p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest flex gap-6 text-gray-400">
            <span className="cursor-pointer hover:text-or-400 transition-colors" onClick={() => navigate('/')}>Accueil</span>
            <span className="cursor-pointer hover:text-or-400 transition-colors" onClick={() => navigate('/programmes')}>Programmes</span>
            <span className="cursor-pointer hover:text-or-400 transition-colors" onClick={() => navigate('/admission')}>Admission</span>
            <span className="cursor-pointer hover:text-or-400 transition-colors" onClick={() => navigate('/contact')}>Contact</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-or-400 italic">Faisons Plus !</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="py-12 bg-gray-950 text-white border-t border-white/5 text-left">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white p-1.5 rounded-lg shadow-sm">
              <img src="/logo_eief.jpeg" alt="EIEF" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter text-white block leading-none">EIEF</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-or-400">Éducation d'Excellence</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium max-w-xs mb-8">
            Plus qu'une école, une communauté engagée pour l'avenir de vos enfants.
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/share/18hUbQ4hgm/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
              title="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all"
              title="YouTube"
            >
              <Youtube size={18} />
            </a>
            <a
              href="mailto:contact@eief.edu.gn"
              className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-or-400 hover:bg-or-600 hover:text-gray-950 transition-all"
              title="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
        <div>
          <h5 className="font-black uppercase tracking-widest text-[10px] mb-6 text-or-400 italic">Liens</h5>
          <ul className="space-y-3 text-sm font-bold text-gray-300">
            <li className="hover:text-or-400 cursor-pointer transition-colors" onClick={() => navigate('/programmes')}>Programmes</li>
            <li className="hover:text-or-400 cursor-pointer transition-colors" onClick={() => navigate('/admission')}>Admission</li>
            <li className="hover:text-or-400 cursor-pointer transition-colors" onClick={() => navigate('/contact')}>Contact</li>
            <li
              className="hover:text-purple-400 cursor-pointer transition-colors flex items-center gap-2"
              onClick={() => navigate('/jeux')}
            >
              <Gamepad2 size={14} /> Espace Jeux
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-black uppercase tracking-widest text-[10px] mb-6 text-or-400 italic">Infos</h5>
          <ul className="space-y-4 text-sm font-bold text-gray-300">
            <li className="flex gap-2 items-center text-xs text-gray-400">
              <MapPin size={14} className="text-or-400" /> Conakry, Guinée
            </li>
            <li className="flex gap-2 items-center text-xs text-gray-400">
              <PhoneCall size={14} className="text-or-400" /> +224 611 00 00
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">© 2026 EIEF EDUCATION</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-or-400 italic">Faisons Plus !</p>
      </div>
    </footer>
  );
};

export default PublicFooter;
