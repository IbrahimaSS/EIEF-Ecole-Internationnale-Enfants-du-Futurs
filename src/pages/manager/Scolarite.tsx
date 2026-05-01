// src/pages/manager/Scolarite.tsx
// Orchestrateur du module Scolarité (manager).
// Compose les sous-composants, hooks et utilitaires depuis ./scolarite/.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

// Sous-composants
import ScolariteHeader     from './scolarite/components/ScolariteHeader';
import StatsCards          from './scolarite/components/StatsCards';
import TabsNav             from './scolarite/components/TabsNav';
import NotificationToast   from './scolarite/components/NotificationToast';
import EmploisTab          from './scolarite/tabs/EmploisTab';
import NotesTab            from './scolarite/tabs/NotesTab';
import PointageTab         from './scolarite/tabs/PointageTab';
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

const ManagerScolarite: React.FC = () => {
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

  // ── État UI principal ─────────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState<TabId>('emplois');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [openMenuId,       setOpenMenuId]       = useState<string | null>(null);

  // ── Modales ───────────────────────────────────────────────────────────────
  const [isScheduleModalOpen,     setIsScheduleModalOpen]     = useState(false);
  const [isClassModalOpen,        setIsClassModalOpen]        = useState(false);
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
      s.className.toLowerCase().includes(q),
  );

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
      await apiFetch('/courses/classes', {
        method: 'POST',
        body: JSON.stringify({
          ...classForm,
          mainTeacherId: classForm.mainTeacherId || null,
        }),
      });
      onSuccess('Classe créée avec succès.');
      setIsClassModalOpen(false);
      setClassForm(empty.class());
      await fetchAll();
    } catch (e: any) {
      onError(e?.message ?? 'Erreur création classe.');
    } finally {
      setSubmitting(false);
    }
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
      className="space-y-8"
      onClick={() => setOpenMenuId(null)}
    >
      <ScolariteHeader
        classCount={classes.length}
        studentCount={students.length}
        scheduleCount={schedules.length}
        onAddSubject={onAddSubjectClick}
        onAddClass={onAddClassClick}
        onAddSchedule={() => openAddSchedule()}
      />

      <StatsCards
        classCount={classes.length}
        studentCount={students.length}
        subjectCount={subjects.length}
        scheduleCount={schedules.length}
      />

      <TabsNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
          <AlertCircle size={18} /> {error}
          <button onClick={fetchAll} className="ml-auto text-[11px] underline">
            Réessayer
          </button>
        </div>
      )}

      {!error && failedEndpoints.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-700 dark:text-amber-300 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Chargement partiel</p>
            <p className="text-xs leading-relaxed">
              Certaines données n'ont pas pu être chargées : {failedEndpoints.map(f => f.split(' (')[0]).join(', ')}.
              Le reste de la page reste utilisable.
            </p>
          </div>
          <button onClick={fetchAll} className="text-[11px] underline font-semibold">
            Réessayer
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'emplois' && (
          <EmploisTab
            loading={loading}
            filteredClasses={filteredClasses}
            schedules={schedules}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onOpenClassDetail={openClassDetail}
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
      </AnimatePresence>

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
        onChange={setClassForm}
        onClose={() => setIsClassModalOpen(false)}
        onSubmit={handleSubmitClass}
        onOpenYearModal={() => setIsAcademicYearModalOpen(true)}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        form={subjectForm}
        submitting={submitting}
        onChange={setSubjectForm}
        onClose={() => setIsSubjectModalOpen(false)}
        onSubmit={handleSubmitSubject}
      />

      <AcademicYearModal
        isOpen={isAcademicYearModalOpen}
        form={academicYearForm}
        submitting={submitting}
        onChange={setAcademicYearForm}
        onClose={() => setIsAcademicYearModalOpen(false)}
        onSubmit={handleSubmitAcademicYear}
      />

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
