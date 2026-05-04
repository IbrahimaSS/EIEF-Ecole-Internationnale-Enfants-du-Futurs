import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  Bus,
  Award,
  ShieldCheck,
  CheckCircle,
  Bell,
} from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PageHero from '../components/shared/PageHero';
import PublicFooter from '../components/shared/PublicFooter';

const ParentLanding: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scolarite');

  const features = [
    { icon: Award, title: 'Suivi Académique', desc: 'Accédez en temps réel aux notes, bulletins et appréciations des professeurs de vos enfants.', color: 'text-bleu-600', bg: 'bg-bleu-500/10' },
    { icon: MessageSquare, title: 'Communication', desc: "Échangez directement avec l'administration ou les enseignants pour un accompagnement optimal.", color: 'text-vert-600', bg: 'bg-vert-500/10' },
    { icon: CreditCard, title: 'Gestion Financière', desc: "Consultez l'état de vos paiements, téléchargez vos reçus et soyez alertés des échéances.", color: 'text-or-600', bg: 'bg-or-500/10' },
    { icon: Bus, title: 'Services Rapides', desc: 'Inscrivez vos enfants à la cantine, au transport ou aux activités périscolaires.', color: 'text-rouge-500', bg: 'bg-rouge-500/10' },
  ];

  const toolsTabs = [
    { id: 'scolarite', label: 'Dossier scolaire', icon: FileText, title: 'Vue globale sur la scolarité', desc: "Supervisez tous les aspects pédagogiques de l'année. De l'emploi du temps aux résultats officiels, gardez un œil sur leur progression.", features: ['Bulletins de notes trimestriels', 'Cahier de textes & devoirs à rendre', "Graphiques d'évolution"] },
    { id: 'finances', label: 'Facturation', icon: CreditCard, title: 'Suivi financier simplifié', desc: 'Un tableau de bord financier clair et transparent pour gérer les frais de scolarité sans stress.', features: ['Historique de facturation', 'Téléchargement de reçus', "Rappels automatiques d'échéance"] },
    { id: 'communication', label: 'Messagerie', icon: Bell, title: 'Restons en contact', desc: "Recevez instantanément les avis de l'école, les notifications d'absence et les convocations.", features: ['Messagerie sécurisée avec les enseignants', 'Notifications push', "Justification d'absence en un clic"] },
    { id: 'logistique', label: 'Cantine & Transport', icon: Bus, title: 'Services additionnels', desc: 'Gérez la logistique quotidienne : abonnement bus, menu de la cantine, clubs.', features: ['Menu hebdomadaire', 'Trajet du bus scolaire', "Inscription aux clubs"] },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 overflow-x-hidden transition-colors duration-500">
      <PublicNav />

      <PageHero
        imageSrc="/Img2.jpeg"
        imageFallback="/Img4.jpeg"
        badge="Espace Parent"
        title={
          <>
            Votre espace privilégié pour le{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-300 via-vert-400 to-vert-500">
              suivi scolaire
            </span>
            .
          </>
        }
        subtitle="Parce que la réussite de vos enfants demande une étroite collaboration, EIEF vous offre tous les outils pour les accompagner pas à pas."
        tagline="Sécurité & Transparence"
        actions={[
          { label: 'Mon espace parent', onClick: () => navigate('/login'), variant: 'primary', icon: <Users size={18} /> },
          { label: 'Voir les services', onClick: () => { document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }, variant: 'secondary' },
        ]}
      />

      {/* CARACTÉRISTIQUES */}
      <section id="services" className="py-20 md:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-vert-600/10 text-vert-700 dark:text-vert-400 border border-vert-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Services
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Restez impliqué, <span className="bg-clip-text text-transparent bg-gradient-to-r from-bleu-600 to-vert-600">où que vous soyez</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-3 max-w-2xl mx-auto">
              Une interface intuitive pour répondre à tous les besoins administratifs et pédagogiques des familles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-900/30 rounded-3xl p-8 border border-gray-100 dark:border-white/5 hover:border-vert-300 dark:hover:border-vert-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform', f.bg, f.color)}>
                  <f.icon size={26} />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="py-20 md:py-24 bg-[#fafafa] dark:bg-gray-900/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-or-600/10 text-or-700 dark:text-or-400 border border-or-600/20 font-black text-[9px] uppercase tracking-[0.3em] px-4 h-8 rounded-full">
              Portail complet
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              L'école à <span className="bg-clip-text text-transparent bg-gradient-to-r from-vert-600 to-bleu-700">portée de main</span>
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
                      ? 'bg-white dark:bg-gray-900 border-vert-400 shadow-lg'
                      : 'bg-white/40 dark:bg-gray-900/40 border-transparent hover:bg-white dark:hover:bg-gray-900 text-gray-500 hover:text-gray-700'
                  )}
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', activeTab === tab.id ? 'bg-gradient-to-br from-vert-500 to-bleu-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400')}>
                    <tab.icon size={22} />
                  </div>
                  <span className={cn('font-black text-sm', activeTab === tab.id ? 'text-gray-900 dark:text-white' : '')}>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="w-full lg:w-2/3">
              {toolsTabs.map((tab) => (
                <div key={tab.id} className={cn('bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-white/5 shadow-xl', activeTab === tab.id ? 'block' : 'hidden')}>
                  <div className="w-16 h-16 bg-vert-50 dark:bg-vert-950/30 rounded-2xl flex items-center justify-center text-vert-600 dark:text-vert-400 mb-6 shadow-md">
                    <tab.icon size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{tab.title}</h3>
                  <p className="text-base text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">{tab.desc}</p>
                  <div className="space-y-3 mb-8">
                    {tab.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="text-or-500 flex-shrink-0" size={20} />
                        <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-vert-600 dark:text-vert-400 hover:gap-3 transition-all"
                  >
                    Configurer ce service <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-vert-700 via-bleu-700 to-bleu-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 30% 30%, white 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <ShieldCheck size={48} className="mx-auto text-or-300 mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 italic">
            Une scolarité <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-or-300 to-or-500">sans surprise</span>
          </h2>
          <p className="text-white/80 text-base md:text-lg font-medium max-w-xl mx-auto mb-10">
            Connectez-vous pour commencer à gérer et suivre l'évolution scolaire de vos enfants.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="h-14 px-10 bg-or-500 hover:bg-or-400 text-gray-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-gold transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            Mon compte parent <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      <PublicFooter variant="compact" pageName="Parent" />
    </div>
  );
};

export default ParentLanding;
