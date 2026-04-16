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
  CheckCircle2,
  Salad,
  Apple,
  Info,
  X,
  FileText,
  Pizza,
  Fish,
  Soup,
  Beef,
  Star,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar, Modal, Input, Select, Popover } from '../../components/ui';
import { cn } from '../../utils/cn';

// Importation des données élèves pour la gestion des inscrits
import elevesData from '../../data/eleves.json';

const AdminCanteen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'inscrits'>('menu');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulation d'élèves inscrits à la cantine (50%)
  const elevesInscrits = elevesData.filter((_, i) => i % 2 === 0);

  const menuSemaine = [
    { jour: 'Lundi', plat: 'Riz au Gras & Poulet', dessert: 'Fruits de saison', icon: Drumstick, calories: '450kcal', nutriscore: 'A', tag: 'Protéines', color: 'text-bleu-600 bg-bleu-50 dark:bg-bleu-900/30 border-bleu-100' },
    { jour: 'Mardi', plat: 'Mafé (Sauce arachide)', dessert: 'Yaourt nature', icon: Soup, calories: '520kcal', nutriscore: 'B', tag: 'Énergie', color: 'text-or-600 bg-or-50 dark:bg-or-900/30 border-or-100' },
    { jour: 'Mercredi', plat: 'Spaghetti Bolognaise', dessert: 'Crème Vanille', icon: Beef, calories: '480kcal', nutriscore: 'B', tag: 'Complet', color: 'text-vert-600 bg-vert-50 dark:bg-vert-900/30 border-vert-100' },
    { jour: 'Jeudi', plat: 'Yassa au Poisson', dessert: 'Gâteau Maison', icon: Fish, calories: '430kcal', nutriscore: 'A', tag: 'Oméga 3', color: 'text-rouge-600 bg-rouge-50 dark:bg-rouge-900/30 border-rouge-100' },
    { jour: 'Vendredi', plat: 'Pizza Artisanale', dessert: 'Fruit Frais', icon: Pizza, calories: '550kcal', nutriscore: 'B', tag: 'Plaisir', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100' },
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
            <Utensils className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-bold gradient-bleu-or-text tracking-tight">Restauration Scolaire</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Gestion des menus, nutrition et facturation globale</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsReportModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[10px] uppercase tracking-widest font-bold px-5 h-11"
          >
            <FileSpreadsheet size={18} /> Relevés mensuels
          </Button>
          <Button 
            onClick={() => setIsMenuModalOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-bold text-[10px] uppercase tracking-widest h-11 px-6 shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Nouveau Menu
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <StatCard
          title="Consommation / Jour"
          value={elevesInscrits.length.toString()}
          subtitle="Plats servis ce midi"
          icon={<Salad />}
          color="vert"
          trend={{ value: "Engagement +5%", direction: "up" }}
        />
        <StatCard
          title="Recettes Mensuelles"
          value="1,240,000 FGN"
          subtitle="Paiements confirmés"
          icon={<TrendingUp />}
          color="bleu"
          trend={{ value: "+12.5%", direction: "up" }}
        />
        <StatCard
          title="Index Nutritionnel"
          value="A+"
          subtitle="Qualité des ingrédients"
          icon={<Apple />}
          color="or"
        />
      </div>

      {/* TABS */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-2">
        {[
          { id: 'menu', label: 'Menu de la Semaine', icon: Utensils },
          { id: 'inscrits', label: 'Gestion des Inscrits', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-t-2xl text-[10px] font-bold uppercase tracking-widest transition-all relative
              ${activeTab === tab.id 
                ? 'text-bleu-600 dark:text-or-400' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }
            `}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabCanteen" 
                className="absolute bottom-0 left-0 right-0 h-1 bg-bleu-600 dark:bg-or-500 rounded-t-full" 
              />
            )}
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
            <Card className="p-8 border-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden flex flex-col justify-between h-full shadow-2xl group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-bleu-600/10 rounded-full blur-[100px] -mr-40 -mt-40" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="default" className="bg-or-500 text-gray-900 border-none text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 shadow-xl shadow-or-500/20 flex items-center gap-2">
                    <Star size={14} fill="currentColor" />
                    Plat du Jour • Mercredi
                  </Badge>
                  <div className="flex items-center gap-2 text-gray-400 dark:text-white/40">
                    <Clock size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Servi à 12:30</span>
                  </div>
                </div>
                
                <div className="mb-6 flex-1 flex flex-col">
                  <h2 className="text-4xl font-bold mb-3 tracking-tight leading-tight text-gray-900 dark:text-white">Spaghetti <br /> <span className="gradient-bleu-or-text">Bolognoise</span></h2>
                  <p className="text-gray-400 font-medium text-base mb-6 max-w-sm leading-relaxed">Sauce tomate mijotée, bœuf haché frais et herbes de Provence.</p>
                  
                  {/* APPETIZING IMAGE BOX */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 mb-6 group-hover:scale-[1.02] transition-transform duration-500 mt-auto">
                    <img 
                      src="/spaghetti.png" 
                      alt="Spaghetti Bolognaise" 
                      className="w-full h-48 object-cover object-center" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                      <Salad size={16} className="text-vert-400" />
                      <span className="text-[10px] font-bold text-gray-300">Équilibré</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                      <Apple size={16} className="text-or-400" />
                      <span className="text-[10px] font-bold text-gray-300">Bio</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Coût par Repas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">25 000 <span className="text-xs font-normal text-gray-400 uppercase tracking-widest ml-1">FGN</span></p>
                  </div>
                  <Button className="bg-bleu-600 text-white hover:bg-bleu-700 border-none px-8 font-bold text-[10px] uppercase tracking-widest h-12 shadow-xl">
                    Modifier
                  </Button>
                </div>
              </div>
            </Card>

            {/* SEMAINE LIST */}
            <Card className="p-6 border-none shadow-soft overflow-hidden h-full flex flex-col dark:bg-gray-900/50 dark:backdrop-blur-md text-left">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs mb-1">Calendrier Nutritionnel</h3>
                   <p className="text-[10px] text-gray-400 font-medium">Semaine Active • Septembre 2024</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <History className="text-gray-400" size={18} />
                </div>
              </div>
              
              <div className="relative space-y-6 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-white/5 flex-1 pr-2">
                {menuSemaine.map((m, i) => (
                  <div key={i} className="relative pl-14 group cursor-pointer">
                    {/* Timeline Dot & Icon */}
                    <div className={cn(
                      "absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-lg border",
                      m.color
                    )}>
                      <m.icon size={22} />
                    </div>
                    
                    {/* Content Card */}
                    <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 group-hover:border-bleu-500/30 transition-all shadow-sm group-hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{m.jour}</span>
                          <Badge variant="default" className="text-[8px] px-2 font-bold h-4 border-none bg-bleu-50 text-bleu-600 dark:bg-bleu-900/30 dark:text-bleu-400">{m.tag}</Badge>
                        </div>
                        <Badge variant={m.nutriscore === 'A' ? 'success' : 'warning'} className="text-[8px] h-4 px-1.5 font-bold uppercase">Nutri {m.nutriscore}</Badge>
                      </div>
                      
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm group-hover:text-bleu-600 transition-colors">{m.plat}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Info size={12} className="text-gray-300" /> {m.calories}</span>
                        <span className="flex items-center gap-1"><Utensils size={12} className="text-gray-300" /> {m.dessert}</span>
                      </div>
                    </div>
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
              <Card key={i} className="p-4 border-none shadow-soft flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <Avatar name={`${e.firstName} ${e.lastName}`} size="md" />
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white leading-none mb-1 group-hover:text-bleu-600 transition-colors">{e.firstName} {e.lastName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{e.classe}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <Badge variant="success" className="text-[8px] font-bold uppercase tracking-widest px-2">Forfait OK</Badge>
                   <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">Dernier repas: Hier</span>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALE: NOUVEAU MENU */}
      <Modal 
        isOpen={isMenuModalOpen} 
        onClose={() => setIsMenuModalOpen(false)}
        title={
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 shadow-inner">
              <Utensils size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">Planifier un nouveau Menu</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-8 text-left py-2 font-bold uppercase tracking-widest">
           <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-bleu-500 rounded-full" /> Plat Principal
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nom du plat" placeholder="ex: Thieboudienne" />
              <Select 
                label="Jour de service" 
                options={[
                  { value: 'Lundi', label: 'Lundi' },
                  { value: 'Mardi', label: 'Mardi' },
                  { value: 'Mercredi', label: 'Mercredi' },
                  { value: 'Jeudi', label: 'Jeudi' },
                  { value: 'Vendredi', label: 'Vendredi' },
                ]} 
              />
            </div>
            <div className="mt-4">
              <Input label="Description / Ingrédients" placeholder="Détaillez les ingrédients majeurs..." />
            </div>
            {/* IMAGE UPLOAD ZONE */}
            <div className="mt-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Image du Plat (Recommandé)</p>
              <div className="border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-white/5 hover:bg-bleu-50 dark:hover:bg-bleu-900/10 hover:border-bleu-500/50 transition-all cursor-pointer group group/upload">
                <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover/upload:scale-110 group-hover/upload:text-bleu-600 transition-all mb-3">
                   <ImageIcon size={24} />
                </div>
                <div className="text-center font-bold   uppercase tracking-widest">
                  <p className="text-[10px] text-gray-900 dark:text-white mb-1 uppercase tracking-widest font-bold">Cliquez pour ajouter une photo</p>
                  <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest uppercase tracking-widest">PNG, JPG jusqu'à 5Mo</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-or-500 rounded-full" /> Valeur Nutritionnelle
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Calories (kcal)" placeholder="450" type="number" />
              <Select 
                label="Nutriscore" 
                options={['A', 'B', 'C', 'D'].map(v => ({ value: v, label: `Classe ${v}` }))} 
              />
              <Input label="Tag (ex: Bio)" placeholder="Bio, Énergie..." />
            </div>
          </div>

          <div className="flex gap-5 pt-8 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsMenuModalOpen(false)} className="flex-1 h-12 text-[10px] tracking-wider font-bold uppercase">Annuler</Button>
            <Button 
              onClick={() => { setIsMenuModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }} 
              className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold text-[10px] tracking-wider uppercase"
            >
              Publier le Menu
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODALE: RELEVÉS */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        title={
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600 shadow-inner">
              <FileSpreadsheet size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">Rapports de Restauration</span>
          </div>
        }
        size="md"
      >
        <div className="space-y-6 text-left py-2 font-bold uppercase tracking-widest">
           <div className="space-y-3">
              {[
                { name: 'Journal des Repas', desc: 'Listing quotidien des consommations', type: 'PDF' },
                { name: 'Bilan Financier Cantine', desc: 'Rapport mensuel des forfaits', type: 'EXCEL' },
              ].map((rep, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl group hover:border-bleu-500/50 transition-all uppercase tracking-widest font-bold">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-bleu-600 transition-colors shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div className="text-left uppercase tracking-widest font-bold">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-widest font-bold">{rep.name}</p>
                      <p className="text-[9px] text-gray-400 font-medium leading-none uppercase tracking-widest">{rep.desc}</p>
                    </div>
                  </div>
                  <Badge variant={rep.type === 'PDF' ? 'error' : 'success'} className="text-[8px] px-2">{rep.type}</Badge>
                </button>
              ))}
           </div>
           <Button variant="outline" onClick={() => setIsReportModalOpen(false)} className="w-full h-12 font-bold uppercase text-[10px] tracking-wider">Fermer</Button>
        </div>
      </Modal>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-[100] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 border border-green-100 dark:border-green-900/30 flex items-center gap-4 min-w-[300px]"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-green-200/50">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-left flex-1 font-bold uppercase tracking-widest">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-widest">Opération réussie</p>
              <p className="text-[10px] text-gray-500 font-semibold leading-none uppercase tracking-widest">Le menu a été mis à jour pour tous.</p>
            </div>
            <button onClick={() => setIsSuccess(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminCanteen;
