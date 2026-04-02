import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  MapPin, 
  Users, 
  Plus, 
  ChevronRight, 
  Map, 
  Navigation, 
  ShieldCheck, 
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar } from '../../components/ui';

// Importation des données élèves
import elevesData from '../../data/eleves.json';

const AdminTransport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lignes' | 'eleves'>('lignes');

  // Simulation d'élèves utilisant le transport (40%)
  const elevesTransport = elevesData.filter((_, i) => i % 3 === 0);

  const lignesTransport = [
    { id: 'L1', nom: 'Ligne Nord - Ratoma/Nongo', bus: 'AG-1029-EIEF', chauffeur: 'Mamadou Touré', capacite: 32, inscrits: 28, statut: 'En route' },
    { id: 'L2', nom: 'Ligne Sud - Dixinn/Kaloum', bus: 'AG-2034-EIEF', chauffeur: 'Mohamed Kéita', capacite: 28, inscrits: 22, statut: 'Arrêt' },
    { id: 'L3', nom: 'Ligne Est - Matoto/Enta', bus: 'AG-4022-EIEF', chauffeur: 'Ibrahima Bangoura', capacite: 45, inscrits: 38, statut: 'Maintenance' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Bus className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-semibold gradient-bleu-or-text">Transport Scolaire</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gestion de la flotte, des itinéraires et du ramassage</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex gap-2 text-[10px] font-semibold   px-5 h-11 dark:border-white/10 dark:text-white">
            <Map size={18} /> Voir la carte
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-semibold   text-[10px] h-11 px-6">
            <Plus size={18} /> Nouvelle Ligne
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Véhicules"
          value="08"
          subtitle="Flotte active"
          icon={<ShieldCheck />}
          color="bleu"
        />
        <StatCard
          title="Élèves Transportés"
          value={elevesTransport.length.toString()}
          subtitle="Abonnés annuels"
          icon={<Users />}
          color="bleu"
        />
        <StatCard
          title="Recettes Transport"
          value="850,000 FGN"
          subtitle="Ce mois-ci"
          icon={<TrendingUp />}
          color="vert"
        />
        <StatCard
          title="État Flotte"
          value="92%"
          subtitle="Disponibilité"
          icon={<AlertCircle />}
          color="or"
        />
      </div>

      {/* TABS CONTROL */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
        {[
          { id: 'lignes', label: 'Lignes & Itinéraires', icon: Navigation },
          { id: 'eleves', label: 'Passagers par Bus', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-semibold   transition-all
              ${activeTab === tab.id 
                ? 'bg-bleu-600 dark:bg-or-500 text-white shadow-lg' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
              }
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        {activeTab === 'lignes' ? (
          <motion.div
            key="lignes"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {lignesTransport.map((l, i) => (
              <Card key={i} className="p-0 border-none shadow-soft overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer dark:bg-gray-900/50 dark:backdrop-blur-md">
                <div className={`p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between ${
                  l.statut === 'En route' ? 'bg-vert-50 dark:bg-vert-900/10' : l.statut === 'Maintenance' ? 'bg-rouge-50 dark:bg-rouge-900/10' : 'bg-gray-50 dark:bg-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${
                      l.statut === 'En route' ? 'text-vert-600 dark:text-vert-400' : l.statut === 'Maintenance' ? 'text-rouge-600 dark:text-rouge-400' : 'text-gray-400'
                    }`}>
                      <Bus size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{l.nom}</h3>
                      <p className="text-[10px] font-semibold   text-gray-500 dark:text-gray-400 italic">{l.bus}</p>
                    </div>
                  </div>
                  <Badge variant={l.statut === 'En route' ? 'success' : l.statut === 'Maintenance' ? 'error' : 'default'} className="text-[9px] font-semibold px-2 ">
                    {l.statut}
                  </Badge>
                </div>
                <div className="p-6 bg-white dark:bg-transparent space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-semibold  text-[10px] ">
                      <MapPin size={14} className="text-or-500" />
                      Itinéraire principal
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{l.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-semibold  text-gray-400 ">Chauffeur</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{l.chauffeur}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-semibold  text-gray-400 ">Taux d'occupation</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{Math.round((l.inscrits / l.capacite) * 100)}%</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-bleu-600 dark:bg-or-500 rounded-full transition-all duration-1000" style={{ width: `${(l.inscrits / l.capacite) * 100}%` }} />
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 flex items-center justify-between text-xs font-semibold   text-gray-400 group-hover:text-bleu-600 group-hover:bg-bleu-50 transition-all">
                  <span>Détails historiques</span>
                  <ChevronRight size={16} />
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="eleves"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {elevesTransport.map((e, i) => (
              <Card key={i} className="p-4 border-none shadow-soft flex items-center justify-between hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <Avatar name={`${e.firstName} ${e.lastName}`} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900">{e.firstName} {e.lastName}</p>
                    <p className="text-xs text-gray-500 font-medium">Ligne: {lignesTransport[i % 3].nom.split('-')[1].trim()}</p>
                  </div>
                </div>
                <div className="text-right">
                   <Badge variant="info" className="text-[9px]  font-semibold">{e.classe}</Badge>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminTransport;
