// src/pages/manager/Scolarite.tsx
// Orchestrateur du module Scolarité (manager).
// Compose les sous-composants, hooks et utilitaires depuis ./scolarite/.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  IdCard,
  LucideIcon,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Input } from '../../components/ui';
import { cn } from '../../utils/cn';

// Sous-composants
import ScolariteHeader     from './scolarite/components/ScolariteHeader';
import StatsCards          from './scolarite/components/StatsCards';
import NotificationToast   from './scolarite/components/NotificationToast';
import EmploisTab          from './scolarite/tabs/EmploisTab';
import NotesTab            from './scolarite/tabs/NotesTab';
import PointageTab         from './scolarite/tabs/PointageTab';
import StudentCardsTab     from './scolarite/tabs/StudentCardsTab';
import TeacherCardsTab     from '../../components/shared/TeacherCardsTab';
import ClassRollCallTab    from '../../components/shared/ClassRollCallTab';
import ScheduleModal       from './scolarite/components/modals/ScheduleModal';
import ClassModal          from './scolarite/components/modals/ClassModal';
import SubjectModal        from './scolarite/components/modals/SubjectModal';
import AcademicYearModal   from './scolarite/components/modals/AcademicYearModal';
import ClassDetailModal    from './scolarite/components/modals/ClassDetailModal';
import GradesModal         from './scolarite/components/modals/GradesModal';
import DeleteConfirmModal  from './scolarite/components/modals/DeleteConfirmModal';
import TeacherHistoryModal from './scolarite/components/modals/TeacherHistoryModal';
import StudentHistoryModal from './scolarite/components/modals/StudentHistoryModal';

// Hooks
import { useNotif }            from './scolarite/hooks/useNotif';
import { useScolariteData }    from './scolarite/hooks/useScolariteData';
import { useGradeEntry }       from './scolarite/hooks/useGradeEntry';
import { useStudentGrades }    from './scolarite/hooks/useStudentGrades';
import { useClassSchedules }   from './scolarite/hooks/useClassSchedules';
import { useAttendance }       from './scolarite/hooks/useAttendance';
import { useTeacherHistory }   from './scolarite/hooks/useTeacherHistory';
import { useStudentAttendanceHistory } from './scolarite/hooks/useStudentAttendanceHistory';
import { useStudentBulletin } from './scolarite/hooks/useStudentBulletin';

// API + utils
import { apiFetch }              from './scolarite/api';
import { printSchedule }         from './scolarite/utils/printSchedule';
import { printTeacherReport }    from './scolarite/utils/printTeacherReport';
import { printBulletinPeriode, printBulletinAnnuel } from './scolarite/utils/printBulletin';

// Types & constantes
import { empty } from './scolarite/constants';
import {
  AcademicYearForm,
  AcademicYearResponse,
  ClassForm,
  ClassResponse,
  DeleteTarget,
  PointageTab as PointageTabId,
  ScheduleForm,
  ScheduleResponse,
  StudentResponse,
  SubjectForm,
  TabId,
  TeacherResponse,
} from './scolarite/types';

interface ManagerScolariteProps {
  allowCatalogManagement?: boolean;
  allowSubjectCreation?: boolean;
  allowStudentCards?: boolean;
}

const ManagerScolarite: React.FC<ManagerScolariteProps> = ({
  allowCatalogManagement = true,
  allowSubjectCreation = allowCatalogManagement,
  allowStudentCards = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Données initiales ─────────────────────────────────────────────────────
  const {
    classes,
    subjects,
    schedules,
    students,
    teachers,
    years,
    loading,
    error,
    failedEndpoints,
    refetch: fetchAll,
  } = useScolariteData();

  // ── Notification ──────────────────────────────────────────────────────────
  const { notif, showNotif, closeNotif } = useNotif();
  const onError   = (m: string) => showNotif('error', m);
  const onSuccess = (m: string) => showNotif('success', m);

  // ── État UI principal (Synchronisé avec URL) ──────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('emplois');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') as TabId | null;
    const allowedTabs: TabId[] = allowStudentCards
      ? ['emplois', 'notes', 'pointage', 'cartes', 'cartes-profs', 'appels']
      : ['emplois', 'notes', 'pointage', 'cartes-profs', 'appels'];

    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
      return;
    }

    if (tab === 'cartes' && !allowStudentCards) {  // 'cartes-profs' is always allowed
      const nextParams = new URLSearchParams(location.search);
      nextParams.set('tab', 'emplois');
      navigate(
        {
          pathname: location.pathname,
          search: `?${nextParams.toString()}`,
        },
        { replace: true },
      );
      return;
    }

    setActiveTab('emplois');
  }, [allowStudentCards, location.pathname, location.search, navigate]);

  const [searchQuery,      setSearchQuery]      = useState('');
  const [openMenuId,       setOpenMenuId]       = useState<string | null>(null);

  // ── Modales ───────────────────────────────────────────────────────────────
  const [isScheduleModalOpen,     setIsScheduleModalOpen]     = useState(false);
  const [isClassModalOpen,        setIsClassModalOpen]        = useState(false);
  const [editingClassId,          setEditingClassId]          = useState<string | null>(null);
  const [isSubjectModalOpen,      setIsSubjectModalOpen]      = useState(false);
  const [isAcademicYearModalOpen, setIsAcademicYearModalOpen] = useState(false);
  const [isDetailModalOpen,       setIsDetailModalOpen]       = useState(false);
  const [isGradesModalOpen,       setIsGradesModalOpen]       = useState(false);

  // ── Forms ─────────────────────────────────────────────────────────────────
  const [scheduleForm,     setScheduleForm]     = useState<ScheduleForm>(empty.schedule());
  const [classForm,        setClassForm]        = useState<ClassForm>(empty.class());
  const [subjectForm,      setSubjectForm]      = useState<SubjectForm>(empty.subject());
  const [academicYearForm, setAcademicYearForm] = useState<AcademicYearForm>(empty.academicYear());

  const [submitting, setSubmitting] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // ── Sélections ────────────────────────────────────────────────────────────
  const [selectedClass,   setSelectedClass]   = useState<ClassResponse | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  // ── Modale historique de pointage prof ────────────────────────────────────
  const [historyTeacher, setHistoryTeacher] = useState<TeacherResponse | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const teacherHistory = useTeacherHistory();

  // ── Modale historique de présence élève ───────────────────────────────────
  const [historyStudent, setHistoryStudent] = useState<StudentResponse | null>(null);
  const [isStudentHistoryOpen, setIsStudentHistoryOpen] = useState(false);
  const studentAttendanceHistory = useStudentAttendanceHistory();

  // ── Bulletin scolaire ─────────────────────────────────────────────────────
  const studentBulletin = useStudentBulletin();

  const handlePrintBulletinPeriode = async (period: number) => {
    if (!selectedStudent) return;
    const data = await studentBulletin.fetchBulletin({
      student: selectedStudent,
      classes,
      students,
      subjects,
      schedules,
      period,
    });
    if (data) printBulletinPeriode(data, period);
    else onError('Impossible de generer le bulletin.');
  };

  const handlePrintBulletinAnnuel = async () => {
    if (!selectedStudent) return;
    const data = await studentBulletin.fetchBulletin({
      student: selectedStudent,
      classes,
      students,
      subjects,
      schedules,
      period: null,
    });
    if (data) printBulletinAnnuel(data);
    else onError('Impossible de generer le bulletin.');
  };

  // ── Hooks dédiés ──────────────────────────────────────────────────────────
  const { classSchedules, classSchLoading, fetchClassSchedules } = useClassSchedules();
  const studentGradesHook = useStudentGrades();

  const gradeEntry = useGradeEntry({
    classes,
    students,
    subjects,
    schedules,
    isActive: activeTab === 'notes',
    onError,
    onSuccess,
  });

  // ── Pointage ──────────────────────────────────────────────────────────────
  const [activePointageTab, setActivePointageTab] = useState<PointageTabId>('eleves');
  const [pointageDate, setPointageDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [pointageScheduleId, setPointageScheduleId] = useState<string>('');

  const attendance = useAttendance({
    isActive: activeTab === 'pointage',
    activePointageTab,
    pointageDate,
    pointageScheduleId,
    onError,
    onSuccess,
  });

  // ── Filtres recherche ─────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();
  const filteredClasses = classes.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      (c.level ?? '').toLowerCase().includes(q),
  );
  const filteredStudents = students.filter(
    s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q) ||
      (s.className ?? '').toLowerCase().includes(q),
  );

  const tabItems: Array<{
    id: TabId;
    label: string;
    description: string;
    metric: string;
    icon: LucideIcon;
  }> = [
    {
      id: 'emplois',
      label: 'Emplois du temps',
      description: 'Classes, matières et créneaux regroupés dans une vue plus claire.',
      metric: `${schedules.length} créneau${schedules.length > 1 ? 'x' : ''}`,
      icon: CalendarDays,
    },
    {
      id: 'notes',
      label: 'Notes',
      description: 'Saisie centralisée, relevés individuels et suivi par période.',
      metric: `${students.length} élève${students.length > 1 ? 's' : ''}`,
      icon: FileText,
    },
    {
      id: 'pointage',
      label: 'Pointage',
      description: 'Présences des élèves et professeurs avec accès rapide aux historiques.',
      metric: `${teachers.length} prof.${teachers.length > 1 ? 's' : ''}`,
      icon: UserCheck,
    },
  ];

  if (allowStudentCards) {
    tabItems.push({
      id: 'cartes',
      label: 'Cartes scolaires',
      description: 'QR codes, impression et vérification des cartes élèves.',
      metric: `${students.length} carte${students.length > 1 ? 's' : ''}`,
      icon: IdCard,
    });
  }

  tabItems.push({
    id: 'cartes-profs',
    label: 'Cartes professeurs',
    description: 'Génération des cartes QR des enseignants pour le pointage automatique.',
    metric: `${teachers.length} prof.${teachers.length > 1 ? 's' : ''}`,
    icon: ShieldCheck,
  });

  tabItems.push({
    id: 'appels',
    label: 'Appels de classe',
    description: 'Suivez en temps réel les appels soumis par les professeurs et contactez les parents.',
    metric: `${classes.length} classe${classes.length > 1 ? 's' : ''}`,
    icon: ClipboardList,
  });


  const activeYearLabel =
    years.find(y => y.isActive)?.name ||
    years.sort((a, b) => b.name.localeCompare(a.name))[0]?.name ||
    '2026-2027';
  const currentTab = tabItems.find(tab => tab.id === activeTab) ?? tabItems[0];
  const searchEnabled = activeTab !== 'pointage';
  const searchPlaceholder =
    activeTab === 'emplois'
      ? 'Rechercher une classe, un niveau ou un enseignant principal'
      : activeTab === 'notes'
        ? 'Rechercher un élève, un matricule ou une classe'
        : 'Rechercher un élève pour sa carte scolaire';
  const searchHelper =
    activeTab === 'emplois'
      ? 'Le filtre agit sur les cartes de classes.'
      : activeTab === 'notes'
        ? 'Le filtre agit sur la liste des élèves et les relevés.'
        : 'Le filtre agit sur la galerie des cartes scolaires.';
  const searchResultCount = activeTab === 'emplois' ? filteredClasses.length : filteredStudents.length;
  const capabilityBadges = [
    allowCatalogManagement ? 'Catalogue complet' : 'Catalogue restreint',
    allowSubjectCreation ? 'Création de matières active' : 'Création de matières désactivée',
    allowStudentCards ? 'Cartes scolaires disponibles' : 'Cartes scolaires masquées',
    'Cartes professeurs disponibles',
  ];

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  };

  // ── Handlers : Schedules ──────────────────────────────────────────────────
  const openClassDetail = (cls: ClassResponse) => {
    setSelectedClass(cls);
    fetchClassSchedules(cls.id);
    setIsDetailModalOpen(true);
  };

  const openAddSchedule = (cls?: ClassResponse) => {
    setEditingScheduleId(null);
    setScheduleForm({
      ...empty.schedule(),
      classId: cls?.id || '',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
    });
    if (cls) setSelectedClass(cls);
    setIsScheduleModalOpen(true);
  };

  const openEditSchedule = (s: ScheduleResponse) => {
    setEditingScheduleId(s.id);
    setScheduleForm({
      classId: s.classId,
      subjectId: s.subjectId,
      teacherId: s.teacherId || '',
      dayOfWeek: String(s.dayOfWeek),
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room ?? '',
    });
    setIsScheduleModalOpen(true);
  };

  const handleSubmitSchedule = async () => {
    if (!scheduleForm.classId || !scheduleForm.subjectId) {
      onError('Veuillez sélectionner une classe et une matière.');
      return;
    }
    if (!scheduleForm.startTime || !scheduleForm.endTime) {
      onError('Heures de début et fin requises.');
      return;
    }
    if (scheduleForm.endTime <= scheduleForm.startTime) {
      onError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    setSubmitting(true);
    try {
      const body = JSON.stringify({
        classId: scheduleForm.classId,
        subjectId: scheduleForm.subjectId,
        teacherId: scheduleForm.teacherId || null,
        dayOfWeek: Number(scheduleForm.dayOfWeek),
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        room: scheduleForm.room || undefined,
      });
      if (editingScheduleId) {
        await apiFetch(`/schedules/${editingScheduleId}`, { method: 'PUT', body });
        onSuccess('Horaire mis à jour.');
      } else {
        await apiFetch('/schedules', { method: 'POST', body });
        onSuccess('Horaire créé.');
      }
      setIsScheduleModalOpen(false);
      setEditingScheduleId(null);
      setScheduleForm(empty.schedule());
      await fetchAll();
      if (selectedClass) fetchClassSchedules(selectedClass.id);
    } catch (e: any) {
      onError(e?.message ?? 'Erreur.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/schedules/${deleteTarget.id}`, { method: 'DELETE' });
      onSuccess('Horaire supprimé.');
      setDeleteTarget(null);
      await fetchAll();
      if (selectedClass) fetchClassSchedules(selectedClass.id);
    } catch (e: any) {
      onError(e?.message ?? 'Erreur suppression.');
    }
  };

  // ── Handlers : Class / Subject / Year ─────────────────────────────────────
  const handleSubmitAcademicYear = async () => {
    if (!academicYearForm.name || !academicYearForm.startDate || !academicYearForm.endDate) {
      onError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<AcademicYearResponse>('/courses/academic-years', {
        method: 'POST',
        body: JSON.stringify(academicYearForm),
      });
      onSuccess('Année académique créée.');
      setIsAcademicYearModalOpen(false);
      setAcademicYearForm(empty.academicYear());
      await fetchAll();
      setClassForm(f => ({ ...f, academicYearId: res.id }));
    } catch (e: any) {
      onError(e?.message ?? 'Erreur création année.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClass = async () => {
    if (!classForm.name || !classForm.academicYearId) {
      onError('Nom et Année Académique requis.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingClassId) {
        await apiFetch(`/courses/classes/${editingClassId}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...classForm,
            mainTeacherId: classForm.mainTeacherId || null,
          }),
        });
        onSuccess('Classe modifiée avec succès.');
      } else {
        await apiFetch('/courses/classes', {
          method: 'POST',
          body: JSON.stringify({
            ...classForm,
            mainTeacherId: classForm.mainTeacherId || null,
          }),
        });
        onSuccess('Classe créée avec succès.');
      }
      setIsClassModalOpen(false);
      setEditingClassId(null);
      setClassForm(empty.class());
      await fetchAll();
    } catch (e: any) {
      onError(e?.message ?? (editingClassId ? 'Erreur modification classe.' : 'Erreur création classe.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditClass = (cls: ClassResponse) => {
    setEditingClassId(cls.id);
    setClassForm({
      name: cls.name,
      level: cls.level || '',
      academicYearId: cls.academicYearId || '',
      mainTeacherId: cls.mainTeacherId || '',
      maxStudents: cls.maxStudents,
    });
    setIsClassModalOpen(true);
  };

  const handleSubmitSubject = async () => {
    if (!subjectForm.name || !subjectForm.code) {
      onError('Nom et Code requis.');
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/courses/subjects', {
        method: 'POST',
        body: JSON.stringify(subjectForm),
      });
      onSuccess('Matière créée avec succès.');
      setIsSubjectModalOpen(false);
      setSubjectForm(empty.subject());
      await fetchAll();
    } catch (e: any) {
      onError(e?.message ?? 'Erreur création matière.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Handlers : Grades modal ───────────────────────────────────────────────
  const openGrades = (student: StudentResponse) => {
    setSelectedStudent(student);
    setSelectedSemester('');
    studentGradesHook.fetchGrades(student.id);
    setIsGradesModalOpen(true);
  };

  const onSelectSemester = (sem: string) => {
    setSelectedSemester(sem);
    if (selectedStudent) studentGradesHook.fetchGrades(selectedStudent.id, sem || undefined);
  };

  const closeGradesModal = () => {
    setIsGradesModalOpen(false);
    setSelectedStudent(null);
    studentGradesHook.reset();
  };

  // ── Handlers : Print emploi du temps ──────────────────────────────────────
  const handlePrintClass = async (cls: ClassResponse) => {
    try {
      const slots = await apiFetch<ScheduleResponse[]>(`/schedules/class/${cls.id}`);
      printSchedule(cls, slots, onError);
    } catch {
      const slots = schedules.filter(s => s.classId === cls.id);
      printSchedule(cls, slots, onError);
    }
  };

  // ── Top-level header actions ──────────────────────────────────────────────
  const onAddSubjectClick = () => {
    setSubjectForm(empty.subject());
    setIsSubjectModalOpen(true);
  };

  const onAddClassClick = () => {
    const currentYear = years.find(y => y.isActive)?.id || years[0]?.id || '';
    setClassForm({ ...empty.class(), academicYearId: currentYear });
    setIsClassModalOpen(true);
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-8"
      onClick={() => setOpenMenuId(null)}
    >
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-950 via-bleu-700 to-or-500 p-6 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.85)] sm:p-8 dark:border-none dark:bg-gradient-to-br dark:from-slate-950 dark:via-bleu-700 dark:to-or-500">
        <div className="absolute inset-0">
          <div className="absolute -left-12 top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-or-200/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-bleu-200/20 blur-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="relative space-y-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-50/95 backdrop-blur-sm">
                <Sparkles size={14} />
                {allowCatalogManagement ? 'Console manager' : 'Console coordinateur'}
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Gestion de la scolarité
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-100/85 sm:text-base">
                  {allowCatalogManagement
                    ? 'Organisez les classes, la saisie des notes, les présences et les cartes élèves depuis une interface plus lisible et plus structurée.'
                    : 'Accédez rapidement aux emplois du temps, notes, présences et cartes scolaires avec une vue allégée pour la coordination.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {capabilityBadges.map(label => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-50/90 backdrop-blur-sm"
                  >
                    <ShieldCheck size={14} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[420px] xl:grid-cols-2">
              {[
                { label: 'Classes', value: classes.length, icon: BookOpen },
                { label: 'Élèves', value: students.length, icon: Users },
                { label: 'Matières', value: subjects.length, icon: FileText },
                { label: 'Créneaux', value: schedules.length, icon: CalendarDays },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-white/15 bg-slate-950/20 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">
                      {label}
                    </span>
                    <Icon size={16} className="text-slate-50/85" />
                  </div>
                  <p className="mt-3 text-3xl font-black leading-none text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
              {tabItems.map(({ id, label, description, metric, icon: Icon }) => {
                const isActive = activeTab === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTabChange(id)}
                    className={cn(
                      'rounded-[1.6rem] border p-4 text-left transition-all duration-300',
                      isActive
                        ? 'border-white/35 bg-white text-slate-950 shadow-[0_20px_50px_-32px_rgba(255,255,255,0.85)]'
                        : 'border-white/12 bg-slate-950/25 text-white hover:border-white/25 hover:bg-white/10',
                    )}
                  >
                    <div className="flex h-full flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors',
                            isActive
                              ? 'border-slate-200 bg-slate-100 text-bleu-700'
                              : 'border-white/15 bg-white/10 text-white',
                          )}
                        >
                          <Icon size={20} />
                        </div>
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]',
                            isActive
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-white/10 text-slate-100/80',
                          )}
                        >
                          {metric}
                        </span>
                      </div>

                      <div>
                        <p className="text-base font-black tracking-tight">{label}</p>
                        <p
                          className={cn(
                            'mt-2 text-sm leading-5',
                            isActive ? 'text-slate-600' : 'text-slate-100/78',
                          )}
                        >
                          {description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.75rem] border border-white/12 bg-slate-950/25 p-4 backdrop-blur-sm">
              {searchEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">
                        Recherche rapide
                      </p>
                      <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                        {currentTab.label}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-100/78">{searchHelper}</p>
                    </div>

                    <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-2 text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">
                        Année active
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">{activeYearLabel}</div>
                    </div>
                  </div>

                  <Input
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    icon={Search}
                    className="border-white/15 bg-white/95 text-slate-950 placeholder:text-slate-400 focus:border-white focus:ring-white/15 dark:border-white/15 dark:bg-white/95 dark:text-slate-950"
                  />

                  <div className="flex items-center justify-between gap-3 text-xs text-slate-100/78">
                    <span>
                      {searchQuery
                        ? `${searchResultCount} résultat${searchResultCount > 1 ? 's' : ''}`
                        : currentTab.metric}
                    </span>
                    <span className="font-semibold">Module actif : {currentTab.label}</span>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200/75">
                      Vue opérationnelle
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                      Pointage du jour
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-100/78">
                      Préparez le suivi des présences avec un accès direct aux historiques des élèves et professeurs.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">
                        Date
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">{pointageDate}</div>
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/70">
                        Enseignants
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">{teachers.length}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {activeTab === 'emplois' && (
        <Card className="relative overflow-hidden border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-bleu-400/70 to-transparent" />
          <div className="relative space-y-6">
            <ScolariteHeader
              classCount={classes.length}
              studentCount={students.length}
              scheduleCount={schedules.length}
              onAddSubject={allowSubjectCreation ? onAddSubjectClick : undefined}
              onAddClass={onAddClassClick}
              onAddSchedule={() => openAddSchedule()}
            />

            <StatsCards
              classCount={classes.length}
              studentCount={students.length}
              subjectCount={subjects.length}
              scheduleCount={schedules.length}
            />
          </div>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-[1.75rem] border border-red-200 bg-red-50/95 p-4 text-sm font-semibold text-red-700 shadow-[0_18px_40px_-28px_rgba(239,68,68,0.65)] dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle size={18} /> {error}
          <button onClick={fetchAll} className="ml-auto text-[11px] underline underline-offset-4">
            Réessayer
          </button>
        </div>
      )}

      {!error && failedEndpoints.length > 0 && (
        <div className="flex items-start gap-3 rounded-[1.75rem] border border-amber-200 bg-amber-50/95 p-4 text-sm text-amber-700 shadow-[0_18px_40px_-28px_rgba(245,158,11,0.65)] dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Chargement partiel</p>
            <p className="text-xs leading-relaxed">
              Certaines données n'ont pas pu être chargées : {failedEndpoints.map(f => f.split(' (')[0]).join(', ')}.
              Le reste de la page reste utilisable.
            </p>
          </div>
          <button onClick={fetchAll} className="text-[11px] font-semibold underline underline-offset-4">
            Réessayer
          </button>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-x-10 top-4 h-24 rounded-full bg-gradient-to-r from-bleu-100/70 via-transparent to-or-100/70 blur-3xl dark:from-bleu-900/15 dark:to-or-900/15" />

        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'emplois' && (
              <EmploisTab
                loading={loading}
                filteredClasses={filteredClasses}
                schedules={schedules}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onOpenClassDetail={openClassDetail}
                onEditClass={openEditClass}
                onAddSchedule={openAddSchedule}
                onPrintClass={handlePrintClass}
                onEditSchedule={openEditSchedule}
                onRequestDelete={(id, label) => setDeleteTarget({ id, label })}
              />
            )}

            {activeTab === 'notes' && (
              <NotesTab
                loading={loading}
                classes={classes}
                students={students}
                searchQuery={searchQuery}
                gradeClassId={gradeEntry.gradeClassId}
                setGradeClassId={gradeEntry.setGradeClassId}
                gradeSubjectId={gradeEntry.gradeSubjectId}
                setGradeSubjectId={gradeEntry.setGradeSubjectId}
                gradeSemester={gradeEntry.gradeSemester}
                setGradeSemester={gradeEntry.setGradeSemester}
                gradeRows={gradeEntry.gradeRows}
                gradeEntryLoading={gradeEntry.loading}
                gradeSaving={gradeEntry.saving}
                gradeClass={gradeEntry.gradeClass}
                gradeClassStudents={gradeEntry.gradeClassStudents}
                gradeSubjectOptions={gradeEntry.gradeSubjectOptions}
                gradeAverage={gradeEntry.gradeAverage}
                filledGradesCount={gradeEntry.filledCount}
                onUpdateRow={gradeEntry.updateRow}
                onSaveGrades={gradeEntry.save}
                filteredStudents={filteredStudents}
                onOpenGrades={openGrades}
              />
            )}

            {activeTab === 'pointage' && (
              <PointageTab
                activePointageTab={activePointageTab}
                setActivePointageTab={setActivePointageTab}
                classes={classes}
                schedules={schedules}
                teachers={teachers}
                classStudents={gradeEntry.gradeClassStudents}
                selectedClassId={gradeEntry.gradeClassId}
                setSelectedClassId={gradeEntry.setGradeClassId}
                pointageScheduleId={pointageScheduleId}
                setPointageScheduleId={setPointageScheduleId}
                pointageDate={pointageDate}
                setPointageDate={setPointageDate}
                studentAttendances={attendance.studentAttendances}
                setStudentAttendances={attendance.setStudentAttendances}
                teacherAttendances={attendance.teacherAttendances}
                setTeacherAttendances={attendance.setTeacherAttendances}
                submitting={attendance.submitting}
                onSaveStudentAttendance={attendance.saveStudentAttendance}
                onSaveSingleStudentAttendance={attendance.saveSingleStudentAttendance}
                onShowStudentHistory={(student) => {
                  setHistoryStudent(student);
                  studentAttendanceHistory.fetchHistory(student.id);
                  setIsStudentHistoryOpen(true);
                }}
                onSaveTeacherAttendance={attendance.saveTeacherAttendance}
                onSaveSingleTeacherAttendance={attendance.saveSingleTeacherAttendance}
                onShowTeacherHistory={(teacher) => {
                  setHistoryTeacher(teacher);
                  teacherHistory.fetchHistory(teacher.id);
                  setIsHistoryModalOpen(true);
                }}
                onPrintTeacherReport={() =>
                  printTeacherReport(teachers, attendance.teacherAttendances, pointageDate)
                }
              />
            )}

            {activeTab === 'cartes' && allowStudentCards && (
              <StudentCardsTab
                loading={loading}
                filteredStudents={filteredStudents}
                classes={classes}
                onSuccess={onSuccess}
                onError={onError}
              />
            )}

            {activeTab === 'cartes-profs' && (
              <TeacherCardsTab
                teachers={teachers}
                loading={loading}
                onSuccess={onSuccess}
                onError={onError}
              />
            )}

            {activeTab === 'appels' && (
              <ClassRollCallTab
                classes={classes}
                schedules={schedules}
              />
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ─── Modales ─────────────────────────────────────────────────────── */}
      <ClassDetailModal
        isOpen={isDetailModalOpen}
        selectedClass={selectedClass}
        classSchedules={classSchedules}
        loading={classSchLoading}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClass(null);
        }}
        onAddSchedule={() => {
          setIsDetailModalOpen(false);
          if (selectedClass) openAddSchedule(selectedClass);
        }}
        onDeleteSlot={(id, label) => setDeleteTarget({ id, label })}
        onPrint={() => {
          if (selectedClass) printSchedule(selectedClass, classSchedules, onError);
        }}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        form={scheduleForm}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        submitting={submitting}
        isEditing={!!editingScheduleId}
        onChange={setScheduleForm}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingScheduleId(null);
        }}
        onSubmit={handleSubmitSchedule}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        form={classForm}
        years={years}
        teachers={teachers}
        submitting={submitting}
        isEditing={!!editingClassId}
        onChange={setClassForm}
        onClose={() => { setIsClassModalOpen(false); setEditingClassId(null); setClassForm(empty.class()); }}
        onSubmit={handleSubmitClass}
        onOpenYearModal={allowCatalogManagement ? () => setIsAcademicYearModalOpen(true) : undefined}
      />

      {allowSubjectCreation && (
        <SubjectModal
          isOpen={isSubjectModalOpen}
          form={subjectForm}
          submitting={submitting}
          onChange={setSubjectForm}
          onClose={() => setIsSubjectModalOpen(false)}
          onSubmit={handleSubmitSubject}
        />
      )}

      {allowCatalogManagement && (
        <AcademicYearModal
          isOpen={isAcademicYearModalOpen}
          form={academicYearForm}
          submitting={submitting}
          onChange={setAcademicYearForm}
          onClose={() => setIsAcademicYearModalOpen(false)}
          onSubmit={handleSubmitAcademicYear}
        />
      )}

      <GradesModal
        isOpen={isGradesModalOpen}
        student={selectedStudent}
        grades={studentGradesHook.grades}
        subjects={subjects}
        loading={studentGradesHook.loading}
        selectedSemester={selectedSemester}
        onSelectSemester={onSelectSemester}
        onClose={closeGradesModal}
        onPrintBulletinPeriode={handlePrintBulletinPeriode}
        onPrintBulletinAnnuel={handlePrintBulletinAnnuel}
        bulletinLoading={studentBulletin.loading}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSchedule}
      />

      <TeacherHistoryModal
        isOpen={isHistoryModalOpen}
        teacher={historyTeacher}
        history={teacherHistory.history}
        loading={teacherHistory.loading}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryTeacher(null);
          teacherHistory.reset();
        }}
      />

      <StudentHistoryModal
        isOpen={isStudentHistoryOpen}
        student={historyStudent}
        history={studentAttendanceHistory.history}
        loading={studentAttendanceHistory.loading}
        onClose={() => {
          setIsStudentHistoryOpen(false);
          setHistoryStudent(null);
          studentAttendanceHistory.reset();
        }}
      />

      <NotificationToast notif={notif} onClose={closeNotif} />
    </motion.div>
  );
};

export default ManagerScolarite;
