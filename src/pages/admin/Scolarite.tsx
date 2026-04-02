import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Users, 
  BookOpen, 
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  Building2,
  Clock
} from 'lucide-react';
import { Card, Badge, StatCard, Button } from '../../components/ui';

// Importation des données
import elevesData from '../../data/eleves.json';
import enseignantsData from '../../data/enseignants.json';

const AdminScolarite: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'classes' | 'matieres'>('classes');

  // Analyse des classes à partir des élèves
  const classesMap = elevesData.reduce((acc: any, el) => {
    if (!acc[el.classe]) {
      acc[el.classe] = { nombreEleves: 0, niveau: el.classe.split(' ')[0] };
    }
    acc[el.classe].nombreEleves += 1;
    return acc;
  }, {});

  const classesList = Object.keys(classesMap).map(className => ({
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
            <h1 className="text-2xl font-black gradient-bleu-or-text uppercase tracking-tighter">Gestion de la Scolarité</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Organisation pédagogique, structures et enseignements de l'EIEF</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex gap-2 dark:border-white/10 dark:text-white">
            <Calendar size={18} /> Calendrier
          </Button>
          <Button className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-black uppercase tracking-widest text-[10px] h-11 px-6">
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
              flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
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
              <Card key={i} className="p-0 border-none shadow-soft overflow-hidden group cursor-pointer hover:scale-[1.03] transition-all duration-300 dark:bg-gray-900/50 dark:backdrop-blur-md">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 p-6 border-b border-gray-100 dark:border-white/5 group-hover:from-bleu-50 dark:group-hover:from-bleu-900/20 group-hover:to-bleu-100 dark:group-hover:to-bleu-900/10 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-bleu-600 dark:text-bleu-400 shadow-sm group-hover:scale-110 transition-transform">
                      <GraduationCap size={24} />
                    </div>
                    <Badge variant="info" className="text-[10px] font-black uppercase px-2">{c.niveau}</Badge>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{c.name}</h3>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Resp: {c.profPrincipal}</p>
                </div>
                <div className="p-6 bg-white dark:bg-transparent flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase">{c.nombreEleves} Élèves</span>
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
              <Card key={i} className="p-6 border-none shadow-soft flex flex-col justify-between hover:shadow-lg transition-all dark:bg-gray-900/50 dark:backdrop-blur-md group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-or-100 dark:bg-or-900/30 text-or-600 dark:text-or-400 rounded-2xl group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Coef.</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{m.coefficient}</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{m.nom}</h4>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">
                    <UserCheck size={14} className="text-vert-500" />
                    {m.enseignants} Profs
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase text-bleu-600 dark:text-or-400 group-hover:translate-x-1 transition-transform">
                    <Clock size={12} />
                    Détails
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminScolarite;
