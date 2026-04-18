import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  FolderPlus, 
  FileBox, 
  Beaker, 
  BookOpen, 
  ClipboardCheck,
  Search,
  MoreVertical,
  Download,
  Edit,
  FileEdit
} from 'lucide-react';
import { Card, Input, Button, Badge, Select, Modal } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useLibrary } from '../../hooks/useLibrary';
import { getApiBaseUrl } from '../../services/api';

const EnseignantRessources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tous' | 'exercices' | 'tp' | 'evaluations'>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [creationMode, setCreationMode] = useState<'upload' | 'write'>('upload');
   const [title, setTitle] = useState('');
   const [resourceType, setResourceType] = useState('Exercice');
   const [classId, setClassId] = useState('');
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [submitError, setSubmitError] = useState<string | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const user = useAuthStore((state) => state.user);
   const {
      resources,
      loading,
      error,
      fetchResourcesByTeacher,
      createResourceWithFile,
   } = useLibrary();

   useEffect(() => {
      if (user?.id) {
         fetchResourcesByTeacher(user.id);
      }
   }, [fetchResourcesByTeacher, user?.id]);

   const filteredRessources = useMemo(() => resources.filter((r) => {
      const className = r.className ?? '';
      const matchesSearch =
         r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'tous' || 
                      (activeTab === 'exercices' && r.type === 'Exercice') ||
                      (activeTab === 'tp' && r.type === 'TP') ||
                      (activeTab === 'evaluations' && r.type === 'Évaluation');
    return matchesSearch && matchesTab;
   }), [activeTab, resources, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Exercice': return <BookOpen size={20} className="text-bleu-500" />;
      case 'TP': return <Beaker size={20} className="text-vert-500" />;
      case 'Évaluation': return <ClipboardCheck size={20} className="text-rouge-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         setSelectedFile(e.dataTransfer.files[0]);
      }
  };

   const resetForm = () => {
      setTitle('');
      setResourceType('Exercice');
      setClassId('');
      setSelectedFile(null);
      setCreationMode('upload');
      setSubmitError(null);
   };

   const handleSubmit = async () => {
      if (!user?.id) {
         setSubmitError('Utilisateur non authentifie');
         return;
      }

      if (!title.trim()) {
         setSubmitError('Le titre est requis');
         return;
      }

      if (creationMode === 'upload' && !selectedFile) {
         setSubmitError('Veuillez choisir un fichier a televerser');
         return;
      }

      if (creationMode !== 'upload') {
         setSubmitError('Le mode redaction en ligne sera active prochainement');
         return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
         await createResourceWithFile(
            {
               title: title.trim(),
               type: resourceType,
               classId: classId || undefined,
               file: selectedFile as File,
            },
            user.id
         );
         setIsAddModalOpen(false);
         resetForm();
      } catch (e) {
         setSubmitError(e instanceof Error ? e.message : 'Erreur lors du televersement');
      } finally {
         setIsSubmitting(false);
      }
   };

   const getFileFormat = (fileUrl: string | null): string => {
      if (!fileUrl) {
         return 'N/A';
      }
      const parts = fileUrl.split('.');
      if (parts.length < 2) {
         return 'N/A';
      }
      return parts[parts.length - 1].toUpperCase();
   };

   const formatDate = (value: string): string => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
         return value;
      }
      return new Intl.DateTimeFormat('fr-FR', {
         day: '2-digit',
         month: 'long',
         year: 'numeric',
      }).format(date);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-or-100 dark:bg-or-900/30 rounded-2xl shadow-inner text-or-600">
            <FileBox size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black gradient-bleu-or-text tracking-tight">Ressources Pédagogiques</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Gérez vos exercices, TP, sujets d'évaluation et compositions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             onClick={() => setIsAddModalOpen(true)}
             className="bg-bleu-600 text-white shadow-lg shadow-bleu-500/20 text-[12px] font-bold px-6 h-12 rounded-2xl hover:scale-[1.02] flex items-center gap-2 border-none"
           >
              <FolderPlus size={18} /> Ajouter une ressource
           </Button>
        </div>
      </div>

      {/* STATS & TABS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          onClick={() => setActiveTab('tous')}
          className={`p-4 cursor-pointer transition-all border-none ${activeTab === 'tous' ? 'bg-gradient-to-br from-bleu-900 to-indigo-900 text-white shadow-lg shadow-bleu-900/20' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl ${activeTab === 'tous' ? 'bg-white/10' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
              <FileBox size={20} className={activeTab === 'tous' ? 'text-or-400' : 'text-bleu-500'} />
            </div>
            <span className="text-2xl font-black">{resources.length}</span>
          </div>
          <h3 className="mt-3 font-bold text-sm">Tous les fichiers</h3>
        </Card>

        <Card 
          onClick={() => setActiveTab('exercices')}
          className={`p-4 cursor-pointer transition-all border-none ${activeTab === 'exercices' ? 'bg-bleu-100 dark:bg-bleu-900/40 text-bleu-700 dark:text-bleu-300 ring-2 ring-bleu-400' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl ${activeTab === 'exercices' ? 'bg-white dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
              <BookOpen size={20} className="text-bleu-500" />
            </div>
            <span className="text-2xl font-black">{resources.filter(r => r.type === 'Exercice').length}</span>
          </div>
          <h3 className="mt-3 font-bold text-sm">Exercices</h3>
        </Card>

        <Card 
          onClick={() => setActiveTab('tp')}
          className={`p-4 cursor-pointer transition-all border-none ${activeTab === 'tp' ? 'bg-vert-100 dark:bg-vert-900/40 text-vert-700 dark:text-vert-300 ring-2 ring-vert-400' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl ${activeTab === 'tp' ? 'bg-white dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
              <Beaker size={20} className="text-vert-500" />
            </div>
            <span className="text-2xl font-black">{resources.filter(r => r.type === 'TP').length}</span>
          </div>
          <h3 className="mt-3 font-bold text-sm">Travaux Pratiques</h3>
        </Card>

        <Card 
          onClick={() => setActiveTab('evaluations')}
          className={`p-4 cursor-pointer transition-all border-none ${activeTab === 'evaluations' ? 'bg-rouge-100 dark:bg-rouge-900/40 text-rouge-700 dark:text-rouge-300 ring-2 ring-rouge-400' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl ${activeTab === 'evaluations' ? 'bg-white dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
              <ClipboardCheck size={20} className="text-rouge-500" />
            </div>
            <span className="text-2xl font-black">{resources.filter(r => r.type === 'Évaluation').length}</span>
          </div>
          <h3 className="mt-3 font-bold text-sm">Évaluations & Sujets</h3>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
         <h2 className="text-lg font-bold text-gray-900 dark:text-white">Liste des documents</h2>
         <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (titre ou classe)..." 
              className="w-full pl-10 bg-white dark:bg-gray-900/50 border-gray-100 dark:border-white/5 font-semibold text-[12px] h-10 rounded-xl"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredRessources.map((doc) => (
            <Card key={doc.id} className="p-5 border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-lg transition-all dark:bg-gray-900/50 group flex flex-col justify-between">
               <div>
                  <div className="flex items-start justify-between mb-4">
                     <div className={`p-3 rounded-xl ${
                        doc.type === 'Exercice' ? 'bg-bleu-50 text-bleu-500 dark:bg-bleu-900/20' : 
                        doc.type === 'TP' ? 'bg-vert-50 text-vert-500 dark:bg-vert-900/20' : 
                        'bg-rouge-50 text-rouge-500 dark:bg-rouge-900/20'
                     }`}>
                        {getTypeIcon(doc.type)}
                     </div>
                     <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1">
                        <MoreVertical size={16} />
                     </button>
                  </div>
                  
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 leading-tight">{doc.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                     <Badge className="bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 font-bold border-none text-[9px]">{doc.className || 'Classe non precisee'}</Badge>
                     <Badge className="bg-gray-50 text-gray-500 border border-gray-200 dark:bg-transparent dark:border-white/10 font-bold text-[9px]">{formatDate(doc.createdAt)}</Badge>
                  </div>
               </div>

               <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400">
                     {getFileFormat(doc.fileUrl)}
                  </span>
                  <div className="flex gap-2">
                     <button className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-bleu-600 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 rounded-lg transition-colors">
                        <Edit size={14} />
                     </button>
                     <button
                        onClick={() => {
                                       const downloadUrl = resolveDownloadUrl(doc.fileUrl);
                                       if (downloadUrl) {
                                          window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        disabled={!doc.fileUrl}
                        className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-bleu-600 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 rounded-lg transition-colors disabled:opacity-50"
                     >
                        <Download size={14} />
                     </button>
                  </div>
               </div>
            </Card>
         ))}
      </div>

      {(loading || error) && (
         <div className="mt-2 text-xs font-semibold">
            {loading && <p className="text-gray-500">Chargement des ressources...</p>}
            {error && <p className="text-rouge-600">{error}</p>}
         </div>
      )}

      {filteredRessources.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
               <Search size={32} className="text-gray-300 dark:text-white/20" />
            </div>
            <p className="text-sm font-bold text-gray-500">Aucune ressource trouvée correspondante.</p>
         </div>
      )}

      {/* MODAL AJOUT */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        size="xl"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl text-bleu-600 shadow-inner">
              <FolderPlus size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Ajouter une ressource</h2>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold">Téléversez un document pour vos classes</p>
            </div>
          </div>
        }
      >
         <div className="space-y-6 pt-2 pb-2">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1 ml-1">Titre du document</label>
                           <Input
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="Ex: Devoir de thermodynamique"
                              className="w-full h-11 font-semibold text-sm rounded-xl"
                           />
               </div>
               <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1 ml-1">Type de ressource</label>
                  <Select 
                              value={resourceType}
                              onChange={(e) => setResourceType(e.target.value)}
                    className="w-full h-11 bg-white font-semibold text-sm rounded-xl"
                    options={[
                                 { value: 'Exercice', label: 'Série d\'exercices' },
                                 { value: 'TP', label: 'Travaux Pratiques (TP)' },
                                 { value: 'Évaluation', label: 'Sujet d\'évaluation / Devoir' },
                                 { value: 'Composition', label: 'Composition' },
                                 { value: 'Cours', label: 'Support de cours' }
                    ]}
                  />
               </div>
            </div>

            <div>
               <label className="text-[11px] font-bold text-gray-500 block mb-1 ml-1">Classe / Groupe cible</label>
               <Select 
                         value={classId}
                         onChange={(e) => setClassId(e.target.value)}
                 className="w-full h-11 bg-white font-semibold text-sm rounded-xl"
                 options={[
                            { value: '', label: 'Toutes mes classes' }
                 ]}
               />
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mt-4 max-w-sm">
               <button 
                  onClick={() => setCreationMode('upload')}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${creationMode === 'upload' ? 'bg-white dark:bg-gray-700 text-bleu-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
               >
                  <Upload size={14} /> Importer un fichier
               </button>
               <button 
                  onClick={() => setCreationMode('write')}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${creationMode === 'write' ? 'bg-white dark:bg-gray-700 text-bleu-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
               >
                  <FileEdit size={14} /> Rédiger en ligne
               </button>
            </div>

            {creationMode === 'upload' ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Fichier à téléverser (PDF, Word, Excel, etc.)</label>
                 <div 
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-4
                       ${dragActive ? 'border-bleu-400 bg-bleu-50 dark:border-bleu-500 dark:bg-bleu-900/20' : 'border-gray-200 dark:border-white/10 hover:border-bleu-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/5'}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                 >
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm text-bleu-500 mb-2">
                       <Upload size={24} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Glissez-déposez votre fichier ici</p>
                       <p className="text-[11px] font-semibold text-gray-400 mt-1">ou cliquez pour parcourir vos dossiers</p>
                    </div>
                              <label className="inline-flex">
                                 <input
                                    type="file"
                                    onChange={(e) => {
                                       const file = e.target.files?.[0] ?? null;
                                       setSelectedFile(file);
                                    }}
                                    className="hidden"
                                 />
                                 <span className="border border-gray-200 bg-white font-bold text-[11px] h-9 px-6 mt-2 rounded-lg inline-flex items-center cursor-pointer">
                                    Parcourir
                                 </span>
                              </label>
                              {selectedFile && (
                                 <p className="text-[11px] font-semibold text-bleu-700 dark:text-bleu-300">
                                    Fichier selectionne: {selectedFile.name}
                                 </p>
                              )}
                 </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <label className="text-[11px] font-bold text-gray-500 block mb-2 ml-1">Contenu de la ressource</label>
                 <textarea 
                    placeholder="Saisissez vos exercices, questions, ou le contenu du TP ici..." 
                    className="w-full h-[250px] p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-sm font-semibold focus:border-bleu-500 focus:ring-1 focus:ring-bleu-500 outline-none resize-none leading-relaxed"
                 ></textarea>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/10 mt-4">
               <Button 
                  variant="outline" 
                     onClick={() => {
                       setIsAddModalOpen(false);
                       resetForm();
                     }}
                  className="flex-1 h-11 text-[12px] font-bold rounded-xl border-gray-200"
               >
                  Annuler
               </Button>
               <Button 
                     onClick={handleSubmit}
                     disabled={isSubmitting}
                  className="flex-1 h-11 bg-bleu-600 text-white shadow-lg shadow-bleu-500/20 text-[12px] font-bold rounded-xl border-none hover:scale-[1.02]"
               >
                     {isSubmitting ? 'Envoi...' : 'Enregistrer'}
               </Button>
            </div>
               {submitError && <p className="text-xs text-rouge-600 font-semibold">{submitError}</p>}
         </div>
      </Modal>

    </motion.div>
  );
};

export default EnseignantRessources;
