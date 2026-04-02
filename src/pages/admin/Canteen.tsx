import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Calendar, 
  Users, 
  TrendingUp, 
  Plus, 
  Clock, 
  ChevronRight, 
  Coffee, 
  Drumstick,
  History,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar } from '../../components/ui';

// Importation des données élèves pour la gestion des inscrits
import elevesData from '../../data/eleves.json';

const AdminCanteen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'inscrits'>('menu');

  // Simulation d'élèves inscrits à la cantine (50%)
  const elevesInscrits = elevesData.filter((_, i) => i % 2 === 0);

  const menuSemaine = [
    { jour: 'Lundi', plat: 'Riz au Gras & Poulet', dessert: 'Fruits de saison', icon: Drumstick },
    { jour: 'Mardi', plat: 'Mafé (Sauce arachide)', dessert: 'Yaourt nature', icon: Coffee },
    { jour: 'Mercredi', plat: 'Spaghetti Bolognaise', dessert: 'Crème Vanille', icon: Drumstick },
    { jour: 'Jeudi', plat: 'Yassa au Poisson', dessert: 'Gâteau Maison', icon: Drumstick },
    { jour: 'Vendredi', plat: 'Couscous Royal', dessert: 'Fruit Frais', icon: Drumstick },
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
            <Utensils className="text-or-600 dark:text-or-400" size={28} />
            <h1 className="text-2xl font-black gradient-bleu-or-text uppercase tracking-tighter">Restauration Scolaire</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gestion des menus, nutrition et facturation cantine</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex gap-2 dark:border-white/10 dark:text-white text-[10px] font-black uppercase tracking-widest px-5 h-11">
            <FileSpreadsheet size={18} /> Relevés
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-or-600 to-or-400 shadow-gold border-none font-black uppercase tracking-widest text-[10px] h-11 px-6">
            <Plus size={18} /> Nouveau Menu
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Repas du jour"
          value={elevesInscrits.length.toString()}
          subtitle="Effectif prévu"
          icon={<CheckCircle2 />}
          color="or"
          trend={{ value: "42% de l'effectif", direction: "up" }}
        />
        <StatCard
          title="Recettes Cantine"
          value="1,240,000 FGN"
          subtitle="Encaissements ce mois"
          icon={<TrendingUp />}
          color="vert"
        />
        <StatCard
          title="Planning Nutrition"
          value="100%"
          subtitle="Menus validés sem. 14"
          icon={<Calendar />}
          color="bleu"
        />
      </div>

      {/* TABS */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
        {[
          { id: 'menu', label: 'Menu de la Semaine', icon: Utensils },
          { id: 'inscrits', label: 'Gestion des Inscrits', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
              ${activeTab === tab.id 
                ? 'bg-or-600 dark:bg-or-500 text-white shadow-lg' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
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
        {activeTab === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* PLAT DU JOUR HIGHLIGHT */}
            <Card className="p-10 border-none bg-gradient-to-br from-or-500 to-or-600 dark:from-or-600 dark:to-rouge-600 text-white relative overflow-hidden flex flex-col justify-between h-full shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-10">
                  <Badge variant="default" className="bg-white/20 text-white border-white/30 text-[10px] font-black tracking-[0.2em] uppercase px-4 py-2 backdrop-blur-md">Plat du Jour • Mercredi</Badge>
                  <Clock size={28} className="text-white/60" />
                </div>
                <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-shadow-lg">Spaghetti Bolognaise</h2>
                  <p className="text-white/90 font-bold text-xl mb-8 max-w-md italic">Sauce tomate artisanale, bœuf haché frais et herbes de Provence.</p>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/10 rounded-2xl text-white backdrop-blur-md border border-white/10">
                      <Drumstick size={28} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.1em]">Option végétarienne disponible</div>
                  </div>
                </div>
                <div className="mt-auto pt-10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-white/70 mb-1 tracking-widest">Prix unitaire</p>
                    <p className="text-3xl font-black">25,000 <span className="text-sm font-normal">FGN</span></p>
                  </div>
                  <Button className="bg-white text-or-700 hover:bg-white/90 border-none px-6 font-black uppercase tracking-widest text-[10px] h-12">
                    Modifier
                  </Button>
                </div>
              </div>
            </Card>

            {/* SEMAINE LIST */}
            <Card className="p-0 border-none shadow-soft overflow-hidden h-full flex flex-col dark:bg-gray-900/50 dark:backdrop-blur-md">
              <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-transparent">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Calendrier Hebdomadaire</h3>
                <History className="text-gray-300 dark:text-gray-600" size={20} />
              </div>
              <div className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-transparent flex-1">
                {menuSemaine.map((m, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-or-100 dark:group-hover:bg-or-500/20 group-hover:text-or-600 dark:group-hover:text-or-400 transition-all shadow-sm">
                        <m.icon size={24} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-or-600 dark:text-or-400 mb-0.5">{m.jour}</p>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-or-600 dark:group-hover:text-or-400 transition-colors uppercase tracking-tight text-sm">{m.plat}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-200 dark:text-gray-700 group-hover:text-gray-900 dark:group-hover:text-white translate-x-0 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="inscrits"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {elevesInscrits.map((e, i) => (
              <Card key={i} className="p-4 border-none shadow-soft flex items-center justify-between hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                  <Avatar name={`${e.firstName} ${e.lastName}`} size="md" />
                  <div>
                    <p className="font-bold text-gray-900">{e.firstName} {e.lastName}</p>
                    <p className="text-xs text-gray-500 font-medium">{e.classe}</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[9px] uppercase font-black">Forfait OK</Badge>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminCanteen;
