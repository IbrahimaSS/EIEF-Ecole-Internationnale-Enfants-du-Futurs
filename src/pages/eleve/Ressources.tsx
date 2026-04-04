import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  FileText, 
  FileCode, 
  Video, 
  Download, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List
} from 'lucide-react';
import { Card, Badge, Button, Input } from '../../components/ui';
import { cn } from '../../utils/cn';

type ResourceType = 'pdf' | 'video' | 'link' | 'exercise';

interface Resource {
  id: number;
  title: string;
  subject: string;
  type: ResourceType;
  teacher: string;
  date: string;
  size?: string;
  downloads: number;
  isNew?: boolean;
}

const EleveRessources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock resources data
  const resources: Resource[] = [
    { id: 1, title: 'Cours: Équations Linéaires', subject: 'Mathématiques', type: 'pdf', teacher: 'Pr. Diallo', date: 'il y a 2h', size: '2.4 MB', downloads: 24, isNew: true },
    { id: 2, title: 'TP: Synthèse de l\'aspirine', subject: 'Physique-Chimie', type: 'pdf', teacher: 'Dr. Condé', date: 'Hier', size: '1.2 MB', downloads: 12 },
    { id: 3, title: 'Vidéo: La conjugaison au présent', subject: 'Français', type: 'video', teacher: 'Mme Camara', date: '02 Avr', size: '15:20', downloads: 54 },
    { id: 4, title: 'Série d\'exercices N°4', subject: 'Mathématiques', type: 'exercise', teacher: 'Pr. Diallo', date: '01 Avr', size: '0.8 MB', downloads: 89, isNew: true },
    { id: 5, title: 'Résumé: Seconde Guerre Mondiale', subject: 'Histoire-Géo', type: 'pdf', teacher: 'M. Sylla', date: '30 Mars', size: '5.1 MB', downloads: 35 },
    { id: 6, title: 'Dictionnaire Anglais-Français Online', subject: 'Anglais', type: 'link', teacher: 'Mme Smith', date: '28 Mars', downloads: 120 },
  ];

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'pdf': return <FileText size={20} className="text-rouge-500" />;
      case 'video': return <Video size={20} className="text-bleu-500" />;
      case 'link': return <ExternalLink size={20} className="text-indigo-500" />;
      case 'exercise': return <FileCode size={20} className="text-vert-500" />;
      default: return <BookOpen size={20} className="text-gray-500" />;
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <BookOpen size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Ressources & Cours</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Accède à tes supports pédagogiques n'importe où</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-1">
             <button
               onClick={() => setViewMode('grid')}
               className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-white dark:bg-gray-800 text-bleu-600 shadow-sm" : "text-gray-400")}
             >
                <LayoutGrid size={16} />
             </button>
             <button
               onClick={() => setViewMode('list')}
               className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-white dark:bg-gray-800 text-bleu-600 shadow-sm" : "text-gray-400")}
             >
                <List size={16} />
             </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* SIDEBAR: SUBJECTS FILTER */}
         <div className="w-full lg:w-64 space-y-6">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-none rounded-2xl text-xs font-bold shadow-soft outline-none focus:ring-2 focus:ring-bleu-500/20 transition-all"
              />
            </div>

            <Card className="p-6 border-none shadow-soft bg-white dark:bg-gray-900/50">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                 <Filter size={14} /> Filtrer par matière
               </h3>
               <div className="space-y-2">
                  {['Toutes', 'Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'Histoire-Géo', 'SVT'].map((sub, i) => (
                    <button key={i} className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${i === 0 ? 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}>
                       <span>{sub}</span>
                       <Badge className="bg-gray-100 dark:bg-white/5 text-gray-500 border-none text-[8px] h-4">{Math.floor(Math.random() * 5) + 1}</Badge>
                    </button>
                  ))}
               </div>
            </Card>
         </div>

         {/* MAIN: RESOURCES GRID/LIST */}
         <div className="flex-1 space-y-6">
            <div className="flex gap-4 border-b border-gray-100 dark:border-white/5 pb-2">
               {(['all', 'recent', 'favorites'] as const).map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={cn(
                     "pb-2 px-1 text-xs font-black transition-all relative capitalize",
                     activeTab === tab ? "text-bleu-600 dark:text-or-400" : "text-gray-400 hover:text-gray-600"
                   )}
                 >
                   {tab === 'all' ? 'Toutes les ressources' : tab === 'recent' ? 'Consultés récemment' : 'Favoris'}
                   {activeTab === tab && <motion.div layoutId="res-tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-current rounded-full" />}
                 </button>
               ))}
            </div>

            <AnimatePresence mode="wait">
               <motion.div 
                 key={viewMode}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className={cn(
                   viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"
                 )}
               >
                  {filteredResources.map((res) => (
                    viewMode === 'grid' ? (
                      <Card key={res.id} className="p-6 border-none shadow-soft group hover:scale-[1.02] transition-transform bg-white dark:bg-gray-900/50 flex flex-col justify-between">
                         <div>
                            <div className="flex items-center justify-between mb-4">
                               <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl group-hover:bg-bleu-50 dark:group-hover:bg-bleu-900/20 transition-colors">
                                  {getTypeIcon(res.type)}
                               </div>
                               {res.isNew && <Badge className="bg-or-500 text-white border-none font-black text-[8px] h-5 animate-pulse">NOUVEAU</Badge>}
                            </div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-relaxed mb-1">{res.title}</h4>
                            <p className="text-[10px] font-bold text-gray-400 mb-4">{res.subject} • {res.teacher}</p>
                         </div>
                         <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Clock size={10} /> {res.date}</span>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-bleu-50 dark:hover:bg-bleu-900/20 text-bleu-600">
                               <Download size={16} />
                            </Button>
                         </div>
                      </Card>
                    ) : (
                      <Card key={res.id} className="p-4 border-none shadow-soft hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors bg-white dark:bg-gray-900/50 flex items-center gap-6">
                         <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            {getTypeIcon(res.type)}
                         </div>
                         <div className="flex-1 text-left">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white">{res.title}</h4>
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{res.subject} • {res.teacher} • {res.size || 'Lien externe'}</p>
                         </div>
                         <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1 justify-end"><Clock size={10} /> {res.date}</p>
                            <span className="text-[10px] font-bold text-vert-500 flex items-center gap-1 justify-end"><CheckCircle2 size={10} /> {res.downloads} téléchargements</span>
                         </div>
                         <Button variant="ghost" className="h-10 px-4 rounded-xl hover:bg-bleu-50 dark:hover:bg-bleu-900/20 text-bleu-600 group">
                            <span className="text-xs font-black mr-2">Télécharger</span>
                            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                         </Button>
                      </Card>
                    )
                  ))}
               </motion.div>
            </AnimatePresence>
         </div>
      </div>
    </motion.div>
  );
};

export default EleveRessources;
