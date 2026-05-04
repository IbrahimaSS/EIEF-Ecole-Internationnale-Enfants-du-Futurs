import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  FileText,
  Calendar,
  Users,
  Award,
  Send,
  CloudUpload,
  User,
  Mail,
  Phone,
  BookOpen,
} from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

const Admission: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    { title: 'Information', desc: "Prenez rendez-vous pour visiter le campus et rencontrer l'équipe pédagogique.", icon: Users, color: 'text-bleu-600', bg: 'bg-bleu-500/10' },
    { title: 'Dossier', desc: "Complétez le dossier d'inscription en ligne ou sur place muni des justificatifs.", icon: FileText, color: 'text-rouge-500', bg: 'bg-rouge-500/10' },
    { title: 'Évaluation', desc: "Passage d'un test de niveau pour définir l'orientation optimale de l'élève.", icon: Award, color: 'text-or-600', bg: 'bg-or-500/10' },
    { title: 'Validation', desc: "Après étude du dossier, une réponse d'admission est transmise sous 48h.", icon: CheckCircle2, color: 'text-vert-600', bg: 'bg-vert-500/10' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">
      <PublicNav active="Admission" />

      <PageHero
        imageSrc="/Img4.jpeg"
        imageFallback="/Img1.jpeg"
        badge="Session 2026 — 2027"
        title={
          <>
            Rejoignez la{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 via-or-400 to-or-500">
              famille EIEF
            </span>
            .
          </>
        }
        subtitle="Nous sommes ravis d'étudier votre demande d'admission. Suivez les étapes simples pour inscrire votre enfant dans l'école d'excellence."
        tagline="Faisons Plus !"
        actions={[
          { label: 'Pré-inscription', onClick: () => { document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'primary' },
          { label: 'Voir les étapes', onClick: () => { document.getElementById('etapes')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'secondary' },
        ]}
      />

      {/* PROCESSUS EN 4 ÉTAPES */}
      <section id="etapes" className="py-20 md:py-24 bg-white dark:bg-gray-950 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Processus
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              4 étapes simples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-or-300 dark:hover:border-or-500/30 hover:shadow-2xl transition-all text-left"
              >
                <div className="absolute top-4 right-6 text-5xl font-black text-gray-100 dark:text-white/[0.04] tracking-tighter">
                  0{i + 1}
                </div>
                <div className={cn('relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform', s.bg, s.color)}>
                  <s.icon size={26} />
                </div>
                <h4 className="relative text-xl font-black text-gray-900 dark:text-white mb-3">{s.title}</h4>
                <p className="relative text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULAIRE DE PRÉ-INSCRIPTION */}
      <section id="formulaire" className="py-20 md:py-24 bg-[#fafafa] dark:bg-gray-900/50 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 text-left">
            <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Formulaire
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
              Pré-inscription <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-700 dark:from-vert-400 dark:to-bleu-400">en ligne.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-base md:text-lg mb-12 leading-relaxed">
              Remplissez ces informations préliminaires et nous vous recontacterons sous 24h.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center text-vert-600 dark:text-or-400">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Période d'évaluation</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Janvier — Septembre 2026</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center text-rouge-600 dark:text-rouge-400">
                  <Send size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Support inscription</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">admission@eief.edu.gn</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center text-or-600 dark:text-or-400">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Téléphone</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">+224 611 00 00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-gray-950 p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nom de l'enfant</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <input
                    type="text"
                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="Nom complet"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Cycle souhaité</label>
                <div className="relative group">
                  <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select className="w-full h-14 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all appearance-none cursor-pointer">
                    <option>Maternelle</option>
                    <option>Primaire</option>
                    <option>Collège</option>
                    <option>Lycée</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email du parent</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vert-600 dark:group-focus-within:text-or-400 transition-colors" size={18} />
                  <input
                    type="email"
                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Téléphone</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-vert-500 dark:focus:border-or-400 rounded-2xl pl-14 pr-6 outline-none font-bold text-sm transition-all"
                    placeholder="+224 ..."
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-center mb-6 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-or-400 transition-all cursor-pointer">
              <CloudUpload size={32} className="mx-auto mb-3 text-or-500" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Joindre le bulletin précédent</p>
              <p className="text-xs text-gray-400 font-medium">PDF, JPEG — max 5 Mo</p>
            </div>

            <Button className="w-full h-14 bg-gradient-to-r from-or-500 to-or-600 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:from-or-400 hover:to-or-500 transition-all shadow-gold flex items-center justify-center gap-2">
              Envoyer ma demande <Send size={16} />
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Admission" />
    </div>
  );
};

export default Admission;
