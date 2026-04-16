import React, { useCallback, useMemo, useState } from 'react';
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
import { toast } from 'sonner';

// ============================================
// IMPORTS DES HOOKS BACKEND (nouveaux imports)
// ============================================
import { useSchedules, useClassSchedules, useScheduleMutations } from '../../hooks/useSchedule';
import { useTeacherDashboard, useTeacherClasses, useClassStudents } from '../../hooks/useTeacher';
import { useAttendance, useScheduleAttendance } from '../../hooks/useAttendance';
import { useAuthStore } from '../../store/authStore';

const Scolarite: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'classes' | 'matieres'>('classes');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [filterSalle, setFilterSalle] = useState<string>('Toutes');
  const [filterAnnee, setFilterAnnee] = useState<string>('2024-2025');
  const [isSuccess, setIsSuccess] = useState(false);
  const [courseForm, setCourseForm] = useState({
    classSubjectId: '',
    dayOfWeek: '1',
    startTime: '',
    endTime: '',
    room: '',
  });

  // ============================================
  // RÉCUPÉRATION DES DONNÉES RÉELLES DU BACKEND
  // ============================================
  
  // Récupérer l'utilisateur connecté (adapt selon ton auth)
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  // Dashboard du professeur (stats réelles)
  const { data: teacherDashboard, isLoading: isLoadingDashboard } = useTeacherDashboard(userId || '');
  
  // Classes du professeur (données réelles du backend)
  const { data: teacherClasses, isLoading: isLoadingClasses } = useTeacherClasses(userId || '');
  
  // Tous les emplois du temps
  const { data: allSchedules, isLoading: isLoadingSchedules } = useSchedules();
  
  // Emploi du temps filtré par classe si sélectionnée
  const { data: classSchedules } = useClassSchedules(selectedClass?.classId || '');

  // ============================================
  // TRANSFORMATION DES DONNÉES BACKEND
  // ============================================

  // Transformer les classes du backend pour l'affichage
  const classesList = useMemo(() => {
    if (teacherClasses && teacherClasses.length > 0) {
      return teacherClasses.map((cls: any, index: number) => {
        const matchingSchedule = allSchedules?.find(
          (schedule: any) =>
            schedule.className === cls.className &&
            schedule.subjectName === cls.subjectName
        );

        const resolvedClassSubjectId =
          cls.classSubjectId ||
          cls.subjectId ||
          matchingSchedule?.classSubjectId ||
          cls.classId;

        return {
          id: index,
          classId: cls.classId,
          classSubjectId: resolvedClassSubjectId,
          subjectId: cls.subjectId || matchingSchedule?.classSubjectId || cls.classId,
          name: cls.className,
          niveau: cls.level || "Non défini",
          nombreEleves: cls.studentCount,
          profPrincipal: "Vous",
          subjectName: cls.subjectName,
          classAverage: cls.classAverage ?? 0,
          room: cls.room,
        };
      });
    }

    const uniqueScheduleClasses = new Map();

    allSchedules?.forEach((schedule: any, index: number) => {
      const key = `${schedule.className}-${schedule.subjectName}-${schedule.classSubjectId || index}`;

      if (!uniqueScheduleClasses.has(key)) {
        uniqueScheduleClasses.set(key, {
          id: index,
          classId: schedule.classId || schedule.classSubjectId || `schedule-class-${index}`,
          classSubjectId: schedule.classSubjectId || schedule.classId || '',
          subjectId: schedule.classSubjectId || schedule.classId || '',
          name: schedule.className || 'Classe',
          niveau: schedule.level || "Non défini",
          nombreEleves: schedule.studentCount || 0,
          profPrincipal: schedule.teacherName || "Non défini",
          subjectName: schedule.subjectName || '',
          classAverage: schedule.classAverage ?? 0,
          room: schedule.room,
        });
      }
    });

    return Array.from(uniqueScheduleClasses.values());
  }, [teacherClasses, allSchedules]);

  // Matières uniques à partir des classes du professeur
  const matieresList = Array.from(
    new Map(teacherClasses?.map((c: any) => [c.subjectName, {
      nom: c.subjectName,
      coefficient: 3, // Tu peux ajuster ou récupérer du backend si dispo
      enseignants: 1,
      classId: c.classId,
      subjectName: c.subjectName
    }]) || []).values()
  );

  // Emploi du temps à afficher (tous ou filtré par classe)
  const schedulesToShow = selectedClass ? classSchedules : allSchedules;

  // ============================================
  // GESTION DE LA PRÉSENCE (nouvelle fonctionnalité)
  // ============================================
  
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedScheduleForAttendance, setSelectedScheduleForAttendance] = useState<any>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const { data: classStudents } = useClassStudents(
    selectedClass?.classId || '', 
    selectedClass?.subjectId || selectedClass?.classSubjectId || ''
  );
  
  const { data: existingAttendance } = useScheduleAttendance(
    selectedScheduleForAttendance?.id || '',
    attendanceDate
  );
  
  const { bulkCreate, isBulkCreating } = useAttendance();
  const { create, isCreating } = useScheduleMutations();

  const classOptions = classesList.length > 0
    ? classesList.map((c: any) => ({
        value: c.classSubjectId || c.classId,
        label: c.subjectName ? `${c.name} - ${c.subjectName}` : c.name,
      }))
    : [{ value: '', label: 'Aucune classe disponible' }];

  const handleOpenAttendance = (schedule: any) => {
    setSelectedScheduleForAttendance(schedule);
    setIsAttendanceModalOpen(true);
  };

  const handleCloseSelectedClass = useCallback(() => {
    setSelectedClass(null);
  }, []);

  const handleCloseCalendarModal = useCallback(() => {
    setIsCalendarModalOpen(false);
  }, []);

  const handleCloseAttendanceModal = useCallback(() => {
    setIsAttendanceModalOpen(false);
  }, []);

  const handleCloseCreateCourseModal = useCallback(() => {
    setIsCreateClassModalOpen(false);
  }, []);

  const handleOpenCreateCourseModal = () => {
    setCourseForm({
      classSubjectId: classesList[0]?.classSubjectId || '',
      dayOfWeek: '1',
      startTime: '',
      endTime: '',
      room: '',
    });
    setIsCreateClassModalOpen(true);
  };

  const handleCreateCourse = () => {
    if (!courseForm.classSubjectId) {
      toast.error("Aucune classe disponible pour planifier un cours.");
      return;
    }

    if (!courseForm.startTime || !courseForm.endTime) {
      toast.error("Veuillez renseigner l'heure de début et l'heure de fin.");
      return;
    }

    if (courseForm.endTime <= courseForm.startTime) {
      toast.error("L'heure de fin doit être après l'heure de début.");
      return;
    }

    create(
      {
        classSubjectId: courseForm.classSubjectId,
        dayOfWeek: Number(courseForm.dayOfWeek),
        startTime: courseForm.startTime,
        endTime: courseForm.endTime,
        room: courseForm.room.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleCloseCreateCourseModal();
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
          setCourseForm({
            classSubjectId: classesList[0]?.classSubjectId || '',
            dayOfWeek: '1',
            startTime: '',
            endTime: '',
            room: '',
          });
        },
      }
    );
  };

  const handleSaveAttendance = (entries: any[]) => {
    if (selectedScheduleForAttendance) {
      bulkCreate({
        scheduleId: selectedScheduleForAttendance.id,
        date: attendanceDate,
        entries
      }, {
        onSuccess: () => {
          handleCloseAttendanceModal();
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
        }
      });
    }
  };

  // ============================================
  // RENDU
  // ============================================

  const isLoading = isLoadingDashboard || isLoadingClasses || isLoadingSchedules;

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
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm text-left">
            {teacherDashboard ? `${teacherDashboard.classCount} classes • ${teacherDashboard.totalStudents} étudiants` : 'Chargement...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white"
          >
            <CalendarIcon size={18} /> Emploi du Temps
          </Button>
          <Button 
            onClick={handleOpenCreateCourseModal}
            className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-semibold text-[10px] h-11 px-6 shadow-lg shadow-bleu-600/20"
          >
            <Plus size={18} /> Nouveau Cours
          </Button>
        </div>
      </div>

      {/* KPI GRID - DONNÉES RÉELLES DU BACKEND */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Mes Classes"
          value={teacherDashboard?.classCount?.toString() || "0"}
          subtitle="Groupes pédagogiques"
          icon={<Layers />}
          color="bleu"
        />
        <StatCard
          title="Total Étudiants"
          value={teacherDashboard?.totalStudents?.toString() || "0"}
          subtitle="Élèves inscrits"
          icon={<Users />}
          color="bleu"
        />
        <StatCard
          title="Moyenne Générale"
          value={teacherDashboard?.averageGrade ? `${teacherDashboard.averageGrade.toFixed(1)}/20` : "0/20"}
          subtitle="Moyenne des classes"
          icon={<BookOpen />}
          color="or"
        />
        <StatCard
          title="Heures Cette Semaine"
          value={`${teacherDashboard?.hoursThisWeek?.toString() || "0"}h`}
          subtitle="Volume horaire"
          icon={<Clock />}
          color="vert"
        />
      </div>

      {/* SEGMENTED CONTROL */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
        {[
          { id: 'classes', label: 'Mes Classes', icon: Building2 },
          { id: 'matieres', label: 'Matières Enseignées', icon: BookOpen },
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
            {isLoadingClasses ? (
              <div className="col-span-full text-center py-12">Chargement des classes...</div>
            ) : classesList.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Aucune classe assignée. Contactez l'administration.
              </div>
            ) : (
              classesList.map((c: any) => (
                <Card 
                  key={c.classId} 
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
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                      {c.subjectName}
                    </p>
                  </div>
                  <div className="p-6 bg-white dark:bg-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.nombreEleves} Élèves</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-bleu-600 dark:group-hover:bg-or-500 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>Moy: {c.classAverage.toFixed(1)}/20</span>
                      {c.room && <span>• Salle: {c.room}</span>}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="matieres"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {matieresList.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Aucune matière enseignée actuellement.
              </div>
            ) : (
              matieresList.map((m: any, i) => (
                <Card 
                  key={i} 
                  onClick={() => setSelectedSubject({
                    ...(m as Record<string, any>),
                    chapters: Math.floor(Math.random() * 8) + 5, // Gardé mock si pas dispo backend
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
                      <span className="flex items-center gap-1.5"><Layers size={12} /> {m.chapters} Chap.</span>
                      <span className="flex items-center gap-1.5"><FileText size={12} /> {m.lessons} Leçons</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                      <div className="w-2 h-2 rounded-full bg-vert-500 animate-pulse" />
                      {teacherClasses?.filter((c: any) => c.subjectName === m.nom).length || 0} Classes
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-bleu-600 dark:text-or-400 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                      Détails <ChevronRight size={14} />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALE: DÉTAILS D'UNE CLASSE - AVEC DONNÉES RÉELLES */}
      <Modal 
        isOpen={selectedClass !== null} 
        onClose={handleCloseSelectedClass}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 shadow-inner">
              <GraduationCap size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text font-bold text-xl">
              {selectedClass?.name}
            </span>
          </div>
        }
        size="xl"
      >
        <div className="space-y-8 text-left py-2">
          {/* Stats réelles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-bleu-500 rounded-full" /> Informations Classe
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-gray-50 dark:bg-white/5 border-none">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                      {selectedClass?.nombreEleves || 0}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Élèves Inscrits</p>
                  </Card>
                  <Card className="p-4 bg-gray-50 dark:bg-white/5 border-none text-left">
                    <p className="text-2xl font-bold text-or-600 leading-none mb-1">
                      {selectedClass?.classAverage?.toFixed(1) || "0"}/20
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Moyenne Classe</p>
                  </Card>
                </div>
              </div>

              {/* Emploi du temps de cette classe */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-vert-500 rounded-full" /> Emploi du Temps
                </p>
                <div className="space-y-3">
                  {classSchedules && classSchedules.length > 0 ? (
                    classSchedules.map((schedule: any) => (
                      <div 
                        key={schedule.id} 
                        className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl group hover:border-bleu-500/50 transition-all"
                      >
                        <div className="px-2 py-1 rounded-lg font-bold text-[9px] bg-bleu-100 text-bleu-600">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {schedule.subjectName}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            {schedule.room || "Salle non définie"}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenAttendance(schedule)}
                          className="text-[9px]"
                        >
                          <UserCheck size={14} className="mr-1" /> Présence
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucun cours programmé pour cette classe.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Liste des étudiants (si on a les données) */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-or-500 rounded-full" /> Étudiants
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {classStudents && classStudents.length > 0 ? (
                  classStudents.map((student: any, i: number) => (
                    <div 
                      key={student.studentId} 
                      className="flex items-center justify-between p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{student.name}</p>
                          <p className="text-[9px] text-gray-400">Moy: {student.average}/20 • Abs: {student.absenceCount}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={student.absenceCount > 3 ? "error" : "success"} 
                        className="text-[8px]"
                      >
                        {student.absenceCount > 3 ? "À risque" : "Bon"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Sélectionnez une matière pour voir les étudiants.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold uppercase text-[10px] tracking-wider">
              Voir le Bulletin de Classe
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCloseSelectedClass} 
              className="flex-1 h-12 font-bold uppercase text-[10px] tracking-wider"
            >
              Fermer
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODALE: CALENDRIER / EMPLOI DU TEMPS - DONNÉES RÉELLES */}
      <Modal 
        isOpen={isCalendarModalOpen} 
        onClose={handleCloseCalendarModal}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600 shadow-inner">
              <CalendarIcon size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text font-bold text-xl">Mon Emploi du Temps</span>
          </div>
        }
        size="xl"
      >
        <div className="py-4 space-y-6 text-left">
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-gray-100 dark:border-white/5">
            <Select 
              label="Filtrer par Classe" 
              options={[
                { value: 'Toutes', label: 'Toutes mes classes' }, 
                ...classesList.map((c: any) => ({ value: c.classId, label: c.name }))
              ]} 
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

          {/* Planning hebdomadaire avec vraies données */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day, dIdx) => {
              // Filtrer les cours pour ce jour (dayOfWeek: 1-7)
              const daySchedules = schedulesToShow?.filter((s: any) => s.dayOfWeek === dIdx + 1) || [];
              
              return (
                <div key={day} className="space-y-4">
                  <div className="text-center py-2 bg-bleu-600 dark:bg-bleu-900/40 rounded-xl shadow-md">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{day}</span>
                  </div>
                  <div className="space-y-3 min-h-[300px]">
                    {daySchedules.length > 0 ? (
                      daySchedules.map((schedule: any) => (
                        <div 
                          key={schedule.id} 
                          className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border-l-[3px] border-bleu-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => handleOpenAttendance(schedule)}
                        >
                          <p className="text-[10px] font-bold text-bleu-600 mb-1">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 group-hover:text-bleu-500 transition-colors">
                            {schedule.subjectName}
                          </p>
                          <p className="text-[9px] text-gray-500 flex items-center gap-1">
                            <MapPin size={10} /> {schedule.room || "Salle ?"}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-1">{schedule.className}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[10px] text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl">
                        Aucun cours
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* MODALE: PRISE DE PRÉSENCE */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={handleCloseAttendanceModal}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-vert-100 dark:bg-vert-900/30 rounded-xl text-vert-600 shadow-inner">
              <UserCheck size={22} />
            </div>
            <div>
              <span className="tracking-tight gradient-bleu-or-text font-bold text-xl">
                Prise de Présence
              </span>
              <p className="text-[10px] text-gray-500">
                {selectedScheduleForAttendance?.subjectName} • {selectedScheduleForAttendance?.className}
              </p>
            </div>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6 text-left py-2">
          <div className="flex items-center gap-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Date:</label>
            <input 
              type="date" 
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {existingAttendance && existingAttendance.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-[10px] text-yellow-700">
              <AlertCircle size={14} className="inline mr-2" />
              Des présences existent déjà pour cette date. Elles seront mises à jour.
            </div>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {classStudents?.map((student: any) => {
              const existing = existingAttendance?.find((a: any) => a.studentId === student.studentId);
              
              return (
                <div key={student.studentId} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 border rounded-xl">
                  <div className="flex items-center gap-3">
                    <Avatar name={student.name} size="sm" />
                    <div>
                      <p className="text-xs font-bold">{student.name}</p>
                      <p className="text-[9px] text-gray-400">Moy: {student.average}/20</p>
                    </div>
                  </div>
                  <select 
                    defaultValue={existing?.status || "PRESENT"}
                    className="text-xs border rounded-lg px-2 py-1"
                  >
                    <option value="PRESENT">Présent</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Retard</option>
                    <option value="EXCUSED">Excusé</option>
                  </select>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCloseAttendanceModal}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={() => {
                // Collecter les valeurs des selects et sauvegarder
                const entries = classStudents?.map((s: any) => ({
                  studentId: s.studentId,
                  status: "PRESENT", // À récupérer du select
                  note: ""
                })) || [];
                handleSaveAttendance(entries);
              }}
              disabled={isBulkCreating}
              className="flex-1"
            >
              {isBulkCreating ? "Enregistrement..." : "Enregistrer les présences"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODALE: CRÉER UN COURS (remplace "Créer une Classe") */}
      <Modal 
        isOpen={isCreateClassModalOpen} 
        onClose={handleCloseCreateCourseModal}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 dark:text-or-400 shadow-inner">
              <Plus size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text font-bold text-xl">Planifier un Cours</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-8 text-left py-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-bleu-500 rounded-full" /> Configuration du Cours
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Classe" 
                options={classOptions}
                value={courseForm.classSubjectId}
                onChange={(e) => setCourseForm((current) => ({
                  ...current,
                  classSubjectId: e.target.value,
                }))}
                disabled={classOptions.length === 1 && !classOptions[0].value}
              />
              <Select 
                label="Jour de la semaine" 
                options={[
                  { value: '1', label: 'Lundi' },
                  { value: '2', label: 'Mardi' },
                  { value: '3', label: 'Mercredi' },
                  { value: '4', label: 'Jeudi' },
                  { value: '5', label: 'Vendredi' },
                  { value: '6', label: 'Samedi' },
                ]}
                value={courseForm.dayOfWeek}
                onChange={(e) => setCourseForm((current) => ({
                  ...current,
                  dayOfWeek: e.target.value,
                }))}
              />
              <Input
                type="time"
                label="Heure de début"
                value={courseForm.startTime}
                onChange={(e) => setCourseForm((current) => ({
                  ...current,
                  startTime: e.target.value,
                }))}
              />
              <Input
                type="time"
                label="Heure de fin"
                value={courseForm.endTime}
                onChange={(e) => setCourseForm((current) => ({
                  ...current,
                  endTime: e.target.value,
                }))}
              />
              <Input
                label="Salle"
                placeholder="Ex: Salle B204"
                value={courseForm.room}
                onChange={(e) => setCourseForm((current) => ({
                  ...current,
                  room: e.target.value,
                }))}
              />
            </div>
          </div>

          <div className="flex gap-5 pt-8 border-t border-gray-100 dark:border-white/5">
            <Button 
              variant="outline" 
              onClick={handleCloseCreateCourseModal} 
              className="flex-1 h-12 uppercase text-[10px] tracking-wider font-bold"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateCourse}
              disabled={isCreating || (classOptions.length === 1 && !classOptions[0].value)}
              loading={isCreating}
              className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold uppercase text-[10px] tracking-wider"
            >
              Créer le cours
            </Button>
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
              <p className="text-xs text-gray-500">Les données ont été synchronisées.</p>
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

export default Scolarite;
