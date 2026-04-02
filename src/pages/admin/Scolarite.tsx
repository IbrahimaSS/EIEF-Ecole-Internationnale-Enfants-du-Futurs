import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Users, 
  BookOpen, 
  Calendar as CalendarIcon,
  Layers,
  ChevronRight,
  UserCheck,
  Building2,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  MoreVertical,
  FileText,
  ListTodo,
  ShieldCheck,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Modal, Input, Select, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';

// Importation des données
import elevesData from '../../data/eleves.json';
import enseignantsData from '../../data/enseignants.json';

const AdminScolarite: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'classes' | 'matieres'>('classes');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [filterSalle, setFilterSalle] = useState<string>('Toutes');
  const [filterAnnee, setFilterAnnee] = useState<string>('2024-2025');
  const [isSuccess, setIsSuccess] = useState(false);

  // Analyse des classes à partir des élèves
  const classesMap = elevesData.reduce((acc: any, el) => {
    if (!acc[el.classe]) {
      acc[el.classe] = { nombreEleves: 0, niveau: el.classe.split(' ')[0] };
    }
    acc[el.classe].nombreEleves += 1;
    return acc;
  }, {});

  const classesList = Object.keys(classesMap).map((className, index) => ({
    id: index,
    name: className,
    ...classesMap[className],
    profPrincipal: enseignantsData.find(p => p.classes.includes(className))?.lastName || "Non assigné"
  }));

  // Matières (simulées à partir des enseignants)
  const matieresList = Array.from(new Set(enseignantsData.map(p => p.matiere))).map(m => ({
    nom: m,
    coefficient: m === 'Mathématiques' || m === 'Français' ? 5 : 3,
    enseignants: enseignantsData.filter(p => p.matiere === m).length
  }));

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
            <Building2 className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-semibold gradient-bleu-or-text text-left">Gestion de la Scolarité</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm text-left">Organisation pédagogique, structures et enseignements de l'EIEF</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white"
          >
            <CalendarIcon size={18} /> Calendrier
          </Button>
          <Button 
            onClick={() => setIsCreateClassModalOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-semibold text-[10px] h-11 px-6 shadow-lg shadow-bleu-600/20"
          >
            <Plus size={18} /> Créer une Classe
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Classes"
          value={classesList.length.toString()}
          subtitle="Groupes pédagogiques"
          icon={<Layers />}
          color="bleu"
        />
        <StatCard
          title="Moyenne / Classe"
          value={Math.round(elevesData.length / classesList.length).toString()}
          subtitle="Élèves par groupe"
          icon={<Users />}
          color="bleu"
        />
        <StatCard
          title="Matières Actives"
          value={matieresList.length.toString()}
          subtitle="Cursus EIEF"
          icon={<BookOpen />}
          color="or"
        />
        <StatCard
          title="Inscriptions"
          value="100%"
          subtitle="Taux de remplissage"
          icon={<UserCheck />}
          color="vert"
        />
      </div>

      {/* SEGMENTED CONTROL */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
        {[
          { id: 'classes', label: 'Structure des Classes', icon: Building2 },
          { id: 'matieres', label: 'Matières & Coefficients', icon: BookOpen },
        ].map((seg) => (
          <button
            key={seg.id}
            onClick={() => setActiveSegment(seg.id as any)}
            className={`
              flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-semibold transition-all
              ${activeSegment === seg.id 
                ? 'bg-bleu-600 dark:bg-or-500 text-white shadow-lg' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }
            `}
          >
            <seg.icon size={16} />
            {seg.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        {activeSegment === 'classes' ? (
          <motion.div
            key="classes"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {classesList.map((c, i) => (
              <Card 
                key={i} 
                onClick={() => setSelectedClass(c)}
                className="p-0 border-none shadow-soft overflow-hidden group cursor-pointer hover:scale-[1.03] transition-all duration-300 dark:bg-gray-900/50 dark:backdrop-blur-md"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 p-6 border-b border-gray-100 dark:border-white/5 group-hover:from-bleu-50 dark:group-hover:from-bleu-900/20 group-hover:to-bleu-100 dark:group-hover:to-bleu-900/10 transition-colors text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-bleu-600 dark:text-bleu-400 shadow-sm group-hover:scale-110 transition-transform">
                      <GraduationCap size={24} />
                    </div>
                    <Badge variant="info" className="text-[10px] font-semibold px-2">{c.niveau}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 leading-tight">{c.name}</h3>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">Resp: {c.profPrincipal}</p>
                </div>
                <div className="p-6 bg-white dark:bg-transparent flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.nombreEleves} Élèves</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-bleu-600 dark:group-hover:bg-or-500 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="matieres"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {matieresList.map((m, i) => (
              <Card 
                key={i} 
                onClick={() => setSelectedSubject({
                  ...m,
                  chapters: Math.floor(Math.random() * 8) + 5,
                  lessons: Math.floor(Math.random() * 20) + 15,
                  evaluations: 4,
                  exercises: 45
                })}
                className="p-6 border-none shadow-soft flex flex-col justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-300 dark:bg-gray-900/50 dark:backdrop-blur-md group text-left cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-bleu-50 dark:bg-bleu-900/30 text-bleu-600 dark:text-bleu-400 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                      <BookOpen size={24} />
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Coef</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{m.coefficient}</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{m.nom}</h4>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Layers size={12} /> {Math.floor(Math.random() * 8) + 5} Chap.</span>
                    <span className="flex items-center gap-1.5"><FileText size={12} /> {Math.floor(Math.random() * 20) + 10} Leçons</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-vert-500 animate-pulse" />
                    {m.enseignants} Profs actifs
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-bleu-600 dark:text-or-400 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                    Détails <ChevronRight size={14} />
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALE: DÉTAILS D'UNE MATIÈRE */}
      <Modal
        isOpen={selectedSubject !== null}
        onClose={() => setSelectedSubject(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 shadow-inner">
              <BookOpen size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text font-bold text-xl">Détails : {selectedSubject?.nom}</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-8 text-left py-2">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Chapitres', value: selectedSubject?.chapters, icon: Layers, color: 'text-bleu-600 bg-bleu-50' },
              { label: 'Leçons', value: selectedSubject?.lessons, icon: FileText, color: 'text-or-600 bg-or-50' },
              { label: 'Exercices', value: selectedSubject?.exercises, icon: ListTodo, color: 'text-vert-600 bg-vert-50' },
              { label: 'Évals', value: selectedSubject?.evaluations, icon: ShieldCheck, color: 'text-red-600 bg-red-50' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col items-center">
                <div className={cn("p-2 rounded-lg mb-3", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{stat.value}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Teachers List */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-bleu-500 rounded-full" /> Corps Enseignant
              </p>
              <div className="space-y-3">
                {enseignantsData.filter(p => p.matiere === selectedSubject?.nom).map((prof, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl group hover:border-bleu-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${prof.firstName} ${prof.lastName}`} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{prof.firstName} {prof.lastName}</p>
                        <p className="text-[9px] text-gray-400 font-medium whitespace-nowrap">Expertise: {selectedSubject?.nom}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="h-7 px-2 text-[8px] font-bold opacity-0 group-hover:opacity-100">PROFIL</Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources / Activities */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-or-500 rounded-full" /> Ressources Clés
                </p>
                <div className="space-y-2">
                  {[
                    { title: "Syllabus Annuel 2024", type: "PDF" },
                    { title: "Banque d'exercices corrigés", type: "DOCX" },
                  ].map((res, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-not-allowed grayscale">
                      <FileCheck className="text-gray-400" size={18} />
                      <span className="text-xs font-semibold text-gray-400">{res.title}</span>
                      <Badge variant="info" className="ml-auto text-[8px]">{res.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-bleu-600 to-bleu-800 rounded-2xl text-white shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <HelpCircle size={20} className="text-white/60" />
                  <Badge variant="success" className="bg-white/20 text-white border-none">Actif</Badge>
                </div>
                <p className="text-xs font-bold mb-1">Mise à jour du Cursus</p>
                <p className="text-[10px] text-white/70 mb-4 leading-relaxed">Les nouveaux sujets d'évaluation pour le trimestre 1 sont maintenant disponibles.</p>
                <Button className="w-full bg-white text-bleu-600 hover:bg-white/90 border-none font-bold text-[9px] h-8 tracking-widest">DÉPLOYER</Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => setSelectedSubject(null)} className="flex-1 h-12 font-bold uppercase text-[10px] tracking-wider">Fermer les détails</Button>
            <Button className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold uppercase text-[10px] tracking-wider">Modifier le Syllabus</Button>
          </div>
        </div>
      </Modal>

      {/* MODALE: DÉTAILS D'UNE CLASSE */}
      <Modal 
        isOpen={selectedClass !== null} 
        onClose={() => setSelectedClass(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 shadow-inner">
              <GraduationCap size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text font-bold text-xl">Détails de la Salle : {selectedClass?.name}</span>
          </div>
        }
        size="xl"
      >
        <div className="space-y-8 text-left py-2">
          {/* Bannière Image */}
          <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
            <img 
              src={selectedClass?.id % 2 === 0 ? "/Img1.jpeg" : "/Img2.jpeg"}
              alt="Salle de classe EIEF"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div className="flex items-center gap-4">
                <Avatar name={selectedClass?.profPrincipal} size="md" />
                <div>
                  <p className="text-white font-bold text-lg leading-none mb-1">{selectedClass?.profPrincipal}</p>
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest leading-none">Professeur Principal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section: Effectif & Structure */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-bleu-500 rounded-full" /> Aperçu du Groupe
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-gray-50 dark:bg-white/5 border-none">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">{selectedClass?.nombreEleves}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Élèves Inscrits</p>
                  </Card>
                  <Card className="p-4 bg-gray-50 dark:bg-white/5 border-none text-left">
                    <p className="text-2xl font-bold text-or-600 leading-none mb-1">30</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Capacité Totale</p>
                  </Card>
                </div>
              </div>

              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-or-500 rounded-full" /> 3 Premiers de Classe
                </p>
                <div className="space-y-2">
                  {['Mamadou Bah', 'Aïssatou Sow', 'Fatoumata Camara'].map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-or-100 text-or-600 text-[10px] flex items-center justify-center font-bold">{i+1}</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{name}</span>
                      </div>
                      <Badge variant="success" className="text-[9px]">18.5/20</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Emploi du Temps Express */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-vert-500 rounded-full" /> Planning du Jour
              </p>
              <div className="space-y-3">
                {[
                  { time: '08:00 - 10:00', subj: 'Mathématiques', color: 'bg-bleu-100 text-bleu-600' },
                  { time: '10:15 - 12:15', subj: 'Français', color: 'bg-or-100 text-or-600' },
                  { time: '14:00 - 16:00', subj: 'Anglais', color: 'bg-vert-100 text-vert-600' },
                ].map((slot, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl group hover:border-bleu-500/50 transition-all">
                    <div className={cn("px-2 py-1 rounded-lg font-bold text-[9px]", slot.color)}>{slot.time}</div>
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{slot.subj}</span>
                       <span className="text-[9px] text-gray-400">Salle Multi-média 1</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold uppercase text-[10px] tracking-wider">Générer le Bulletin de Classe</Button>
            <Button variant="outline" onClick={() => setSelectedClass(null)} className="flex-1 h-12 font-bold uppercase text-[10px] tracking-wider">Fermer la vue</Button>
          </div>
        </div>
      </Modal>

      {/* MODALE: CRÉER UNE CLASSE */}
      <Modal 
        isOpen={isCreateClassModalOpen} 
        onClose={() => setIsCreateClassModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 dark:text-or-400 shadow-inner">
              <Plus size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text font-bold text-xl">Créer une Classe</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-8 text-left py-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-bleu-500 rounded-full" /> Configuration Structurelle
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nom de la classe" placeholder="ex: 3ème A" />
              <Select 
                label="Niveau d'enseignement" 
                options={[
                  { value: 'primaire', label: 'Primaire' },
                  { value: 'college', label: 'Collège' },
                  { value: 'lycee', label: 'Lycée' },
                ]} 
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-or-500 rounded-full" /> Encadrement & Capacité
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Professeur Principal" 
                options={enseignantsData.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.matiere})` }))} 
              />
              <Input type="number" label="Capacité maximale" placeholder="30" />
            </div>
          </div>

          <div className="flex gap-5 pt-8 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsCreateClassModalOpen(false)} className="flex-1 h-12 uppercase text-[10px] tracking-wider font-bold">Annuler</Button>
            <Button 
              onClick={() => { setIsCreateClassModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }} 
              className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold uppercase text-[10px] tracking-wider"
            >
              Finaliser la création
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODALE: CALENDRIER / EMPLOI DU TEMPS */}
      <Modal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600 shadow-inner">
              <CalendarIcon size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text font-bold text-xl">Planning Académique</span>
          </div>
        }
        size="xl"
      >
        <div className="py-4 space-y-6 text-left">
          {/* FILTERS BAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-gray-100 dark:border-white/5">
            <Select 
              label="Filtrer par Salle / Classe" 
              options={[{ value: 'Toutes', label: 'Toutes les Salles' }, ...classesList.map(c => ({ value: c.name, label: c.name }))]} 
              value={filterSalle}
              onChange={(e) => setFilterSalle(e.target.value)}
            />
            <Select 
              label="Année Académique" 
              options={[
                { value: '2023-2024', label: '2023 - 2024' },
                { value: '2024-2025', label: '2024 - 2025' },
              ]} 
              value={filterAnnee}
              onChange={(e) => setFilterAnnee(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Semaine Active</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Lundi 02 - Samedi 07 Sept. 2024</span>
              </div>
              <div className="h-10 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />
              <Badge variant="success" className="hidden sm:block">Période : Trimestre 1</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 px-4 text-[10px] font-bold">PRÉCÉDENT</Button>
              <Button variant="outline" className="h-9 px-4 text-[10px] font-bold">SUIVANT</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day, dIdx) => (
              <div key={day} className="space-y-4">
                <div className="text-center py-2 bg-bleu-600 dark:bg-bleu-900/40 rounded-xl shadow-md">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{day}</span>
                </div>
                <div className="space-y-3 min-h-[300px] lg:border-r lg:border-dashed lg:border-gray-100 lg:dark:border-white/5 lg:pr-4 last:border-r-0">
                  <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border-l-[3px] border-bleu-500 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <p className="text-[10px] font-bold text-bleu-600 mb-1">08:00 - 10:00</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 group-hover:text-bleu-500 transition-colors">Mathématiques</p>
                    <p className="text-[9px] text-gray-500 flex items-center gap-1"><MapPin size={10} /> Salle B204</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border-l-[3px] border-or-500 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <p className="text-[10px] font-bold text-or-600 mb-1">10:15 - 12:15</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 group-hover:text-or-500 transition-colors">Physique-Chimie</p>
                    <p className="text-[9px] text-gray-500 flex items-center gap-1"><MapPin size={10} /> Labo A1</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Opération réussie</p>
              <p className="text-xs text-gray-500">La structure a été mise à jour.</p>
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

export default AdminScolarite;
