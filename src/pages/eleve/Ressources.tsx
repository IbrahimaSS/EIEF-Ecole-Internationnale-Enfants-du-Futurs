import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  FileText,
  FileCode,
  Video,
  Download,
  ExternalLink,
  Filter,
  Clock,
  LayoutGrid,
  List,
  Star,
} from 'lucide-react';
import { Card, Badge, Button, Input } from '../../components/ui';
import { cn } from '../../utils/cn';
import { Resource } from '../../types/library';
import { useAuthStore } from '../../store/authStore';
import { getApiBaseUrl } from '../../services/api';
import { studentService } from '../../services/studentService';

const FAVORITES_KEY = 'student-favorite-resources';

const EleveRessources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedClass, setSelectedClass] = useState('Toutes');
  const [resources, setResources] = useState<Resource[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!user?.id) {
      setResources([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    studentService.getResources(user.id)
      .then((data) => setResources(data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des ressources');
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const classes = useMemo(() => {
    const unique = new Set(resources.map((r) => r.className).filter(Boolean) as string[]);
    return ['Toutes', ...Array.from(unique).sort((a, b) => a.localeCompare(b, 'fr'))];
  }, [resources]);

  const getResourceKind = (type: string): 'video' | 'link' | 'exercise' | 'document' => {
    const normalized = type.toLowerCase();

    if (normalized.includes('video')) {
      return 'video';
    }
    if (normalized.includes('lien') || normalized.includes('link')) {
      return 'link';
    }
    if (normalized.includes('exercice') || normalized.includes('tp') || normalized.includes('evaluation') || normalized.includes('composition')) {
      return 'exercise';
    }
    return 'document';
  };

  const getTypeIcon = (type: string) => {
    switch (getResourceKind(type)) {
      case 'video':
        return <Video size={20} className="text-bleu-500" />;
      case 'link':
        return <ExternalLink size={20} className="text-indigo-500" />;
      case 'exercise':
        return <FileCode size={20} className="text-vert-500" />;
      default:
        return <FileText size={20} className="text-rouge-500" />;
    }
  };

  const resolveDownloadUrl = (fileUrl: string | null): string | null => {
    if (!fileUrl) {
      return null;
    }

    if (/^https?:\/\//i.test(fileUrl)) {
      return fileUrl;
    }

    const apiBase = getApiBaseUrl().replace(/\/$/, '');
    const normalizedPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${apiBase}${normalizedPath}`;
  };

  const formatDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const isRecent = (value: string): boolean => {
    const date = new Date(value).getTime();
    if (Number.isNaN(date)) {
      return false;
    }
    const diff = Date.now() - date;
    return diff <= 7 * 24 * 60 * 60 * 1000;
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.className ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClass === 'Toutes' || r.className === selectedClass;

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'recent' && isRecent(r.createdAt)) ||
        (activeTab === 'favorites' && favorites.includes(r.id));

      return matchesSearch && matchesClass && matchesTab;
    });
  }, [activeTab, favorites, resources, searchTerm, selectedClass]);

  const toggleFavorite = (resourceId: string) => {
    setFavorites((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId],
    );
  };

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
              <Input
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
                  {classes.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedClass(sub)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${selectedClass === sub ? 'bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                       <span>{sub}</span>
                       <Badge className="bg-gray-100 dark:bg-white/5 text-gray-500 border-none text-[8px] h-4">
                         {sub === 'Toutes' ? resources.length : resources.filter((r) => r.className === sub).length}
                       </Badge>
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
                  {filteredResources.map((res) => {
                    const isFavorite = favorites.includes(res.id);
                    const downloadUrl = resolveDownloadUrl(res.fileUrl);

                    return (
                    viewMode === 'grid' ? (
                      <Card key={res.id} className="p-6 border-none shadow-soft group hover:scale-[1.02] transition-transform bg-white dark:bg-gray-900/50 flex flex-col justify-between">
                         <div>
                            <div className="flex items-center justify-between mb-4">
                               <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl group-hover:bg-bleu-50 dark:group-hover:bg-bleu-900/20 transition-colors">
                                  {getTypeIcon(res.type)}
                               </div>
                               <div className="flex items-center gap-2">
                                 {isRecent(res.createdAt) && <Badge className="bg-or-500 text-white border-none font-black text-[8px] h-5 animate-pulse">NOUVEAU</Badge>}
                                 <button
                                   onClick={() => toggleFavorite(res.id)}
                                   className={cn(
                                     'p-1.5 rounded-lg transition-colors',
                                     isFavorite ? 'text-or-500 bg-or-50 dark:bg-or-900/20' : 'text-gray-400 hover:text-or-500',
                                   )}
                                 >
                                   <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                                 </button>
                               </div>
                            </div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-relaxed mb-1">{res.title}</h4>
                            <p className="text-[10px] font-bold text-gray-400 mb-4">{res.className || 'Classe non precisee'} • {res.uploadedByName}</p>
                         </div>
                         <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Clock size={10} /> {formatDate(res.createdAt)}</span>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                if (downloadUrl) {
                                  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              disabled={!downloadUrl}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-bleu-50 dark:hover:bg-bleu-900/20 text-bleu-600 disabled:opacity-50"
                            >
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
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{res.type} • {res.className || 'Classe non precisee'} • {res.uploadedByName}</p>
                         </div>
                         <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1 justify-end"><Clock size={10} /> {formatDate(res.createdAt)}</p>
                            {isRecent(res.createdAt) && <span className="text-[10px] font-bold text-vert-500">Nouveau</span>}
                         </div>
                         <Button
                           variant="ghost"
                           onClick={() => {
                             if (downloadUrl) {
                               window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                             }
                           }}
                           disabled={!downloadUrl}
                           className="h-10 px-4 rounded-xl hover:bg-bleu-50 dark:hover:bg-bleu-900/20 text-bleu-600 group disabled:opacity-50"
                         >
                            <span className="text-xs font-black mr-2">Télécharger</span>
                            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                         </Button>
                      </Card>
                    )
                    );
                  })}
               </motion.div>
            </AnimatePresence>

            {(loading || error) && (
              <div className="mt-2 text-xs font-semibold">
                {loading && <p className="text-gray-500">Chargement des ressources...</p>}
                {error && <p className="text-rouge-600">{error}</p>}
              </div>
            )}

            {!loading && !error && filteredResources.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 opacity-70">
                <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-full mb-3">
                  <BookOpen size={26} className="text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-500">Aucune ressource trouvée avec ces filtres.</p>
              </div>
            )}
         </div>
      </div>
    </motion.div>
  );
};

export default EleveRessources;
