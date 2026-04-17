// src/pages/admin/AdminScolarite.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, CalendarDays, BookOpen, Plus, Trash2, Search,
  GraduationCap, Clock, Users, ChevronRight, X, CheckCircle2,
  AlertCircle, Loader2, FileText, Download, Printer, MoreVertical,
  Edit, Eye, ClipboardList, Award, TrendingUp, BarChart3,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Select, Avatar, Table } from '../../components/ui';
import { cn } from '../../utils/cn';

// ─── API helpers ──────────────────────────────────────────────────────────────

const API_BASE =
  (process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');

const AUTH_HEADER = 'enfantsfuture-auth-token';
const AUTH_PREFIX = 'enfantsfuture';

const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch { return null; }
};

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers[AUTH_HEADER] = `${AUTH_PREFIX} ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.message ?? 'Erreur API');
  return payload.data as T;
}

// ─── Types (calqués sur les DTOs backend) ─────────────────────────────────────

interface ClassResponse {
  id: string;
  name: string;
  level: string;
  academicYearName: string;
  mainTeacherName: string;
  maxStudents: number;
  studentCount: number;
}

interface SubjectResponse {
  id: string;
  name: string;
  code: string;
  coefficient: number;
}

interface ScheduleResponse {
  id: string;
  classSubjectId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  subjectName: string;
  className: string;
  teacherName: string;
}

interface GradeResponse {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  value: number;
  semester: number;
  evaluationType: string;
  comment: string;
  gradedAt: string;
}

interface StudentResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  registrationNumber: string;
  birthDate: string;
  gender: string;
  className: string;
  parentName: string;
  isActive: boolean;
}

interface TeacherResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AcademicYearResponse {
  id: string;
  name: string;
  isActive: boolean;
}

// ClassSubject est l'association classe↔matière côté backend (CourseRequest attend un classSubjectId).
// On les reconstruit depuis les schedules existants ou on les crée manuellement.

// ─── Constantes ───────────────────────────────────────────────────────────────

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAY_OPTIONS = DAYS.map((d, i) => ({ value: String(i + 1), label: d }));

type TabId = 'emplois' | 'notes';
type NotifKind = 'success' | 'error';
interface Notif { kind: NotifKind; message: string }

const empty = {
  schedule: () => ({
    classId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: '1',
    startTime: '',
    endTime: '',
    room: '',
  }),
  class: () => ({
    name: '',
    level: '',
    academicYearId: '',
    mainTeacherId: '',
    maxStudents: 40,
  }),
  subject: () => ({
    name: '',
    code: '',
    coefficient: 1,
  }),
};

// ─── Sous-composant: Badge de note coloré ─────────────────────────────────────

const GradeBadge: React.FC<{ value: number }> = ({ value }) => {
  const color =
    value >= 16 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
    value >= 12 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
    value >= 10 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  return (
    <span className={cn('inline-block px-2.5 py-1 rounded-full text-[11px] font-bold', color)}>
      {value.toFixed(2)}/20
    </span>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const AdminScolarite: React.FC = () => {

  // ── Data ──────────────────────────────────────────────────────────────────
  const [classes,   setClasses]   = useState<ClassResponse[]>([]);
  const [subjects,  setSubjects]  = useState<SubjectResponse[]>([]);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [students,  setStudents]  = useState<StudentResponse[]>([]);
  const [teachers,  setTeachers]  = useState<TeacherResponse[]>([]);
  const [years,     setYears]     = useState<AcademicYearResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState<TabId>('emplois');
  const [selectedClass,    setSelectedClass]    = useState<ClassResponse | null>(null);
  const [selectedStudent,  setSelectedStudent]  = useState<StudentResponse | null>(null);
  const [studentGrades,    setStudentGrades]    = useState<GradeResponse[]>([]);
  const [gradesLoading,    setGradesLoading]    = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [classSchedules,   setClassSchedules]   = useState<ScheduleResponse[]>([]);
  const [classSchLoading,  setClassSchLoading]  = useState(false);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isClassModalOpen,    setIsClassModalOpen]    = useState(false);
  const [isSubjectModalOpen,  setIsSubjectModalOpen]  = useState(false);
  const [isAcademicYearModalOpen, setIsAcademicYearModalOpen] = useState(false);
  const [isDetailModalOpen,   setIsDetailModalOpen]   = useState(false);
  const [isGradesModalOpen,   setIsGradesModalOpen]   = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [deleteTarget,     setDeleteTarget]     = useState<{ id: string; label: string } | null>(null);
  const [notif,            setNotif]            = useState<Notif | null>(null);
  const [scheduleForm,     setScheduleForm]     = useState(empty.schedule());
  const [classForm,        setClassForm]        = useState(empty.class());
  const [subjectForm,      setSubjectForm]      = useState(empty.subject());
  const [academicYearForm, setAcademicYearForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });
  const [openMenuId,       setOpenMenuId]       = useState<string | null>(null);

  // ── Notification ──────────────────────────────────────────────────────────
 // Remplacez la ligne 171 par :
  const notifTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const showNotif = useCallback((kind: NotifKind, message: string) => {
    clearTimeout(notifTimer.current);
    setNotif({ kind, message });
    notifTimer.current = setTimeout(() => setNotif(null), 3500);
  }, []);

  // ── Fetch initial ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cls, subj, sch, stu, tea, yr] = await Promise.all([
        apiFetch<ClassResponse[]>('/courses/classes'),
        apiFetch<SubjectResponse[]>('/courses/subjects'),
        apiFetch<ScheduleResponse[]>('/schedules'),
        apiFetch<StudentResponse[]>('/users/students'),
        apiFetch<TeacherResponse[]>('/users/teachers'),
        apiFetch<AcademicYearResponse[]>('/courses/academic-years'),
      ]);
      setClasses(cls);
      setSubjects(subj);
      setSchedules(sch);
      setStudents(stu);
      setTeachers(tea);
      setYears(yr);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Fetch emplois du temps d'une classe ───────────────────────────────────
  const fetchClassSchedules = useCallback(async (classId: string) => {
    setClassSchLoading(true);
    try {
      const data = await apiFetch<ScheduleResponse[]>(`/schedules/class/${classId}`);
      setClassSchedules(data);
    } catch { setClassSchedules([]); }
    finally { setClassSchLoading(false); }
  }, []);

  // ── Fetch notes d'un élève ────────────────────────────────────────────────
  const fetchStudentGrades = useCallback(async (studentId: string, semester?: string) => {
    setGradesLoading(true);
    try {
      const qs = semester ? `?semester=${semester}` : '';
      const data = await apiFetch<GradeResponse[]>(`/grades/student/${studentId}${qs}`);
      setStudentGrades(data);
    } catch { setStudentGrades([]); }
    finally { setGradesLoading(false); }
  }, []);

  // ── Ouvrir détail classe ──────────────────────────────────────────────────
  const openClassDetail = (cls: ClassResponse) => {
    setSelectedClass(cls);
    fetchClassSchedules(cls.id);
    setIsDetailModalOpen(true);
  };

  // ── Ouvrir modal ajout/édition d'horaire ──────────────────────────────────
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
    setOpenMenuId(null);
  };

  // ── Soumettre horaire ─────────────────────────────────────────────────────
  const handleSubmitSchedule = async () => {
    if (!scheduleForm.classId || !scheduleForm.subjectId) {
      showNotif('error', 'Veuillez sélectionner une classe et une matière.');
      return;
    }
    if (!scheduleForm.startTime || !scheduleForm.endTime) {
      showNotif('error', 'Heures de début et fin requises.');
      return;
    }
    if (scheduleForm.endTime <= scheduleForm.startTime) {
      showNotif('error', "L'heure de fin doit être après l'heure de début.");
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
        showNotif('success', 'Horaire mis à jour.');
      } else {
        await apiFetch('/schedules', { method: 'POST', body });
        showNotif('success', 'Horaire créé.');
      }
      setIsScheduleModalOpen(false);
      setEditingScheduleId(null);
      setScheduleForm(empty.schedule());
      await fetchAll();
      if (selectedClass) fetchClassSchedules(selectedClass.id);
    } catch (e: any) {
      showNotif('error', e?.message ?? 'Erreur.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Supprimer horaire ─────────────────────────────────────────────────────
  const handleDeleteSchedule = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/schedules/${deleteTarget.id}`, { method: 'DELETE' });
      showNotif('success', 'Horaire supprimé.');
      setDeleteTarget(null);
      await fetchAll();
      if (selectedClass) fetchClassSchedules(selectedClass.id);
    } catch (e: any) {
      showNotif('error', e?.message ?? 'Erreur suppression.');
    }
  };

  // ── Soumettre année académique ────────────────────────────────────────────
  const handleSubmitAcademicYear = async () => {
    if (!academicYearForm.name || !academicYearForm.startDate || !academicYearForm.endDate) {
      showNotif('error', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<AcademicYearResponse>('/courses/academic-years', {
        method: 'POST',
        body: JSON.stringify(academicYearForm),
      });
      showNotif('success', 'Année académique créée.');
      setIsAcademicYearModalOpen(false);
      setAcademicYearForm({ name: '', startDate: '', endDate: '', isCurrent: false });
      
      // Mettre à jour la liste et auto-sélectionner la nouvelle année
      await fetchAll();
      setClassForm(f => ({ ...f, academicYearId: res.id }));
    } catch (e: any) {
      showNotif('error', e?.message ?? 'Erreur création année.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Soumettre classe ──────────────────────────────────────────────────────
  const handleSubmitClass = async () => {
    if (!classForm.name || !classForm.academicYearId) {
      showNotif('error', 'Nom et Année Académique requis.');
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
      showNotif('success', 'Classe créée avec succès.');
      setIsClassModalOpen(false);
      setClassForm(empty.class());
      await fetchAll();
    } catch (e: any) {
      showNotif('error', e?.message ?? 'Erreur création classe.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Soumettre matière ─────────────────────────────────────────────────────
  const handleSubmitSubject = async () => {
    if (!subjectForm.name || !subjectForm.code) {
      showNotif('error', 'Nom et Code requis.');
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/courses/subjects', {
        method: 'POST',
        body: JSON.stringify(subjectForm),
      });
      showNotif('success', 'Matière créée avec succès.');
      setIsSubjectModalOpen(false);
      setSubjectForm(empty.subject());
      await fetchAll();
    } catch (e: any) {
      showNotif('error', e?.message ?? 'Erreur création matière.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Ouvrir relevé ─────────────────────────────────────────────────────────
  const openGrades = (student: StudentResponse) => {
    setSelectedStudent(student);
    setSelectedSemester('');
    fetchStudentGrades(student.id);
    setIsGradesModalOpen(true);
  };

  // ── Filtres recherche ──────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();
  const filteredClasses  = classes.filter(c =>
    c.name.toLowerCase().includes(q) || (c.level ?? '').toLowerCase().includes(q)
  );
  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
    s.registrationNumber.toLowerCase().includes(q) ||
    s.className.toLowerCase().includes(q)
  );

  // ── Calcul résumé relevé ──────────────────────────────────────────────────
  const gradesBySubject = studentGrades.reduce<Record<string, GradeResponse[]>>((acc, g) => {
    const key = g.subjectName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {});

  const overallAvg = studentGrades.length
    ? studentGrades.reduce((s, g) => s + Number(g.value), 0) / studentGrades.length
    : null;

  // ── Colonnes tableau schedules ────────────────────────────────────────────
  const scheduleColumns = [
    {
      key: 'dayOfWeek', label: 'Jour', sortable: true,
      render: (v: number) => (
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{DAYS[v - 1]}</span>
      ),
    },
    {
      key: 'startTime', label: 'Horaire',
      render: (_: any, row: ScheduleResponse) => (
        <span className="text-sm font-medium text-bleu-600 dark:text-bleu-300">
          {row.startTime} – {row.endTime}
        </span>
      ),
    },
    { key: 'className',   label: 'Classe',   render: (v: string) => <span className="text-sm">{v}</span> },
    { key: 'subjectName', label: 'Matière',  render: (v: string) => <span className="text-sm font-medium">{v}</span> },
    { key: 'teacherName', label: 'Enseignant', render: (v: string) => <span className="text-sm text-gray-500">{v || '—'}</span> },
    { key: 'room',        label: 'Salle',    render: (v: string) => <span className="text-sm text-gray-500">{v || '—'}</span> },
    {
      key: 'actions', label: '',
      render: (_: any, row: ScheduleResponse) => {
        const isOpen = openMenuId === row.id;
        return (
          <div className="relative flex justify-end px-2">
            <button
              onClick={e => { e.stopPropagation(); setOpenMenuId(isOpen ? null : row.id); }}
              className={cn(
                'p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all text-gray-400 focus:outline-none',
                isOpen && 'bg-gray-100 dark:bg-white/5 text-bleu-600 dark:text-or-400'
              )}
            >
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 10 }}
                  className="absolute right-full mr-2 top-0 w-44 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[1.25rem] shadow-2xl border border-gray-100 dark:border-white/5 p-2 z-[60]"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); openEditSchedule(row); }}
                      className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-or-50 dark:hover:bg-or-900/40 hover:text-or-600 rounded-xl transition-all w-full"
                    >
                      <div className="w-7 h-7 rounded-lg bg-or-50 dark:bg-or-900/20 flex items-center justify-center"><Edit size={13} /></div>
                      Modifier
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setDeleteTarget({ id: row.id, label: `${DAYS[row.dayOfWeek - 1]} ${row.startTime}` });
                      }}
                      className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all w-full"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><Trash2 size={13} /></div>
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      },
    },
  ];

  // ── Colonnes tableau élèves (pour relevé) ─────────────────────────────────
  const studentColumns = [
    {
      key: 'lastName', label: 'Élève', sortable: true,
      render: (_: any, row: StudentResponse) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm leading-none mb-1">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">{row.registrationNumber}</div>
          </div>
        </div>
      ),
    },
    { key: 'className', label: 'Classe', render: (v: string) => <span className="text-sm">{v}</span> },
    {
      key: 'isActive', label: 'Statut',
      render: (v: boolean) => <Badge variant={v ? 'success' : 'default'}>{v ? 'Actif' : 'Inactif'}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (_: any, row: StudentResponse) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openGrades(row)}
          className="flex items-center gap-2 text-[10px] h-8 px-3"
        >
          <FileText size={13} /> Relevé de notes
        </Button>
      ),
    },
  ];

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
      onClick={() => setOpenMenuId(null)}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-semibold gradient-bleu-or-text">Gestion de la Scolarité</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            {classes.length} classes • {students.length} élèves • {schedules.length} créneaux
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setSubjectForm(empty.subject());
              setIsSubjectModalOpen(true);
            }}
            variant="outline"
            className="flex gap-2 border-or-500 text-or-600 hover:bg-or-50 font-semibold text-[10px] h-11 px-6 rounded-2xl"
          >
            <BookOpen size={18} /> Nouvelle Matière
          </Button>
          <Button
            onClick={() => {
              const currentYear = years.find(y => y.isActive)?.id || years[0]?.id || '';
              setClassForm({ ...empty.class(), academicYearId: currentYear });
              setIsClassModalOpen(true);
            }}
            variant="outline"
            className="flex gap-2 border-bleu-500 text-bleu-600 hover:bg-bleu-50 font-semibold text-[10px] h-11 px-6 rounded-2xl"
          >
            <Building2 size={18} /> Nouvelle Classe
          </Button>
          <Button
            onClick={() => openAddSchedule()}
            className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 border-none font-semibold text-[10px] h-11 px-6 shadow-lg shadow-bleu-600/20 rounded-2xl"
          >
            <Plus size={18} /> Nouveau Créneau
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Classes',   value: classes.length,   icon: Building2,     color: 'text-bleu-600' },
          { label: 'Élèves',    value: students.length,  icon: GraduationCap, color: 'text-or-500' },
          { label: 'Matières',  value: subjects.length,  icon: BookOpen,      color: 'text-vert-600' },
          { label: 'Créneaux',  value: schedules.length, icon: CalendarDays,  color: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5 border-none bg-gradient-to-br from-bleu-500/5 to-or-500/5 dark:from-bleu-900/10 dark:to-or-900/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </Card>
        ))}
      </div>

      {/* ONGLETS */}
      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none overflow-x-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
            {([
              { id: 'emplois', label: 'Emplois du temps', icon: CalendarDays },
              { id: 'notes',   label: 'Relevés de notes', icon: ClipboardList },
            ] as const).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={e => { e.stopPropagation(); setActiveTab(tab.id); setSearchQuery(''); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-or-500 text-bleu-600 dark:text-white shadow-sm'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={15} /> {tab.label}
                </button>
              );
            })}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder={activeTab === 'emplois' ? 'Rechercher une classe...' : 'Rechercher un élève...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm text-sm"
            />
          </div>
        </div>
      </Card>

      {/* ERREUR */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
          <AlertCircle size={18} /> {error}
          <button onClick={fetchAll} className="ml-auto text-[11px] underline">Réessayer</button>
        </div>
      )}

      {/* CONTENU */}
      <AnimatePresence mode="wait">

        {/* ── TAB: EMPLOIS DU TEMPS ────────────────────────────────────────── */}
        {activeTab === 'emplois' && (
          <motion.div key="emplois" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-6">

            {/* Grille des classes */}
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-sm font-medium">Chargement...</span>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <Building2 size={40} className="opacity-20" />
                <span className="text-sm font-medium">Aucune classe trouvée</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredClasses.map(cls => {
                  const count = schedules.filter(s => s.className === cls.name).length;
                  return (
                    <Card
                      key={cls.id}
                      className="p-0 border-none shadow-soft overflow-hidden group cursor-pointer hover:scale-[1.03] transition-all duration-300 dark:bg-gray-900/50 dark:backdrop-blur-md"
                    >
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 p-5 border-b border-gray-100 dark:border-white/5 group-hover:from-bleu-50 dark:group-hover:from-bleu-900/20 group-hover:to-bleu-100 dark:group-hover:to-bleu-900/10 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-bleu-600 dark:text-bleu-400 shadow-sm">
                            <GraduationCap size={20} />
                          </div>
                          <Badge variant="info" className="text-[9px] font-semibold px-2">{cls.level || 'N/A'}</Badge>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{cls.name}</h3>
                        <p className="text-[10px] text-gray-400 font-medium">{cls.mainTeacherName || 'Prof non défini'}</p>
                      </div>
                      <div className="p-5 bg-white dark:bg-transparent flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                            <Users size={13} /> {cls.studentCount} élèves
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                            <Clock size={13} /> {count} créneau{count !== 1 ? 'x' : ''}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openClassDetail(cls)}
                            className="px-3 py-1.5 text-[9px] font-bold bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600 dark:text-bleu-300 rounded-lg hover:bg-bleu-100 transition-all flex items-center gap-1"
                          >
                            <Eye size={11} /> Voir
                          </button>
                          <button
                            onClick={() => openAddSchedule(cls)}
                            className="px-3 py-1.5 text-[9px] font-bold bg-or-50 dark:bg-or-900/20 text-or-600 dark:text-or-300 rounded-lg hover:bg-or-100 transition-all flex items-center gap-1"
                          >
                            <Plus size={11} /> Ajouter
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Tableau global des créneaux */}
            {schedules.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CalendarDays size={14} className="text-bleu-500" />
                  Tous les créneaux ({schedules.length})
                </p>
                <Card className="p-2 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <Table data={schedules as any} columns={scheduleColumns as any} />
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: RELEVÉS DE NOTES ────────────────────────────────────────── */}
        {activeTab === 'notes' && (
          <motion.div key="notes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <Card className="p-2 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
              {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                  <Loader2 size={22} className="animate-spin" />
                  <span className="text-sm font-medium">Chargement...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                  <GraduationCap size={40} className="opacity-20" />
                  <span className="text-sm font-medium">Aucun élève trouvé</span>
                </div>
              ) : (
                <Table data={filteredStudents as any} columns={studentColumns as any} />
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE: DÉTAIL EMPLOI DU TEMPS D'UNE CLASSE ────────────────────── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedClass(null); }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600"><CalendarDays size={22} /></div>
            <div>
              <span className="font-bold gradient-bleu-or-text">Emploi du temps</span>
              <p className="text-[10px] text-gray-500 font-normal">{selectedClass?.name}</p>
            </div>
          </div>
        }
        size="xl"
      >
        <div className="space-y-6 text-left py-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3 bg-bleu-500 rounded-full" />
              {classSchedules.length} créneau{classSchedules.length !== 1 ? 'x' : ''} programmé{classSchedules.length !== 1 ? 's' : ''}
            </p>
            <Button
              size="sm"
              onClick={() => { setIsDetailModalOpen(false); openAddSchedule(selectedClass!); }}
              className="flex items-center gap-2 text-[10px] h-8 px-3 bg-bleu-600 border-none text-white"
            >
              <Plus size={13} /> Ajouter un créneau
            </Button>
          </div>

          {/* Vue semaine */}
          {classSchLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin" /> Chargement...
            </div>
          ) : classSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <CalendarDays size={36} className="opacity-20" />
              <span className="text-sm">Aucun créneau pour cette classe.</span>
              <Button onClick={() => { setIsDetailModalOpen(false); openAddSchedule(selectedClass!); }} className="mt-2 text-[10px]">
                <Plus size={14} className="mr-1" /> Créer le premier créneau
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {DAYS.map((day, dIdx) => {
                const daySlots = classSchedules.filter(s => s.dayOfWeek === dIdx + 1);
                return (
                  <div key={day} className="space-y-2">
                    <div className="text-center py-1.5 bg-bleu-600 dark:bg-bleu-900/40 rounded-lg">
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">{day}</span>
                    </div>
                    <div className="space-y-2 min-h-[80px]">
                      {daySlots.length === 0 ? (
                        <div className="p-2 text-center text-[9px] text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg">—</div>
                      ) : daySlots.map(s => (
                        <div key={s.id} className="p-2 bg-white dark:bg-gray-800/50 rounded-lg border-l-2 border-bleu-500 shadow-sm text-left relative group">
                          <p className="text-[9px] font-bold text-bleu-600 mb-0.5">{s.startTime}–{s.endTime}</p>
                          <p className="text-[10px] font-bold text-gray-900 dark:text-white">{s.subjectName}</p>
                          {s.room && <p className="text-[9px] text-gray-400">{s.room}</p>}
                          <button
                            onClick={() => setDeleteTarget({ id: s.id, label: `${day} ${s.startTime}` })}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-red-400 hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => { setIsDetailModalOpen(false); setSelectedClass(null); }} className="flex-1 h-11">
              Fermer
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODALE: CRÉER / MODIFIER UN CRÉNEAU ────────────────────────────── */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => { setIsScheduleModalOpen(false); setEditingScheduleId(null); }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600"><CalendarDays size={22} /></div>
            <span className="font-bold gradient-bleu-or-text">
              {editingScheduleId ? 'Modifier le créneau' : 'Nouveau créneau'}
            </span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6 text-left py-2" onClick={e => e.stopPropagation()}>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-bleu-500 rounded-full" /> Configuration
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Classe"
                options={[
                  { value: '', label: 'Sélectionner une classe...' },
                  ...classes.map(c => ({ value: c.id, label: c.name }))
                ]}
                value={scheduleForm.classId}
                onChange={e => setScheduleForm(f => ({ ...f, classId: e.target.value }))}
              />
              <Select
                label="Matière"
                options={[
                  { value: '', label: 'Sélectionner une matière...' },
                  ...subjects.map(s => ({ value: s.id, label: s.name }))
                ]}
                value={scheduleForm.subjectId}
                onChange={e => setScheduleForm(f => ({ ...f, subjectId: e.target.value }))}
              />
              <Select
                label="Enseignant (Optionnel)"
                options={[
                  { value: '', label: 'Aucun (Sélection automatique / Non défini)' },
                  ...teachers.map(t => ({ value: t.userId, label: `${t.firstName} ${t.lastName}` }))
                ]}
                value={scheduleForm.teacherId}
                onChange={e => setScheduleForm(f => ({ ...f, teacherId: e.target.value }))}
              />
              <Select
                label="Jour de la semaine"
                options={DAY_OPTIONS}
                value={scheduleForm.dayOfWeek}
                onChange={e => setScheduleForm(f => ({ ...f, dayOfWeek: e.target.value }))}
              />
              <Input
                label="Salle"
                placeholder="ex: Salle A101"
                value={scheduleForm.room}
                onChange={e => setScheduleForm(f => ({ ...f, room: e.target.value }))}
              />
              <Input
                type="time"
                label="Heure de début"
                value={scheduleForm.startTime}
                onChange={e => setScheduleForm(f => ({ ...f, startTime: e.target.value }))}
              />
              <Input
                type="time"
                label="Heure de fin"
                value={scheduleForm.endTime}
                onChange={e => setScheduleForm(f => ({ ...f, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => { setIsScheduleModalOpen(false); setEditingScheduleId(null); }} className="flex-1 h-12">
              Annuler
            </Button>
            <Button onClick={handleSubmitSchedule} disabled={submitting} className="flex-1 h-12 shadow-lg shadow-bleu-600/20 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editingScheduleId ? 'Enregistrer les modifications' : 'Créer le créneau'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODALE: RELEVÉ DE NOTES ─────────────────────────────────────────── */}
      <Modal
        isOpen={isGradesModalOpen}
        onClose={() => { setIsGradesModalOpen(false); setSelectedStudent(null); setStudentGrades([]); }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600"><Award size={22} /></div>
            <div>
              <span className="font-bold gradient-bleu-or-text">Relevé de notes</span>
              <p className="text-[10px] text-gray-500 font-normal">
                {selectedStudent?.firstName} {selectedStudent?.lastName} • {selectedStudent?.className}
              </p>
            </div>
          </div>
        }
        size="xl"
      >
        <div className="space-y-6 text-left py-2">

          {/* Filtres */}
          <div className="flex items-center gap-4">
            <Select
              label="Semestre"
              options={[
                { value: '',  label: 'Tous les semestres' },
                { value: '1', label: 'Semestre 1' },
                { value: '2', label: 'Semestre 2' },
              ]}
              value={selectedSemester}
              onChange={e => {
                setSelectedSemester(e.target.value);
                if (selectedStudent) fetchStudentGrades(selectedStudent.id, e.target.value || undefined);
              }}
            />
            {overallAvg !== null && (
              <div className="flex-1 flex justify-end">
                <div className="px-4 py-2 bg-gradient-to-r from-bleu-50 to-or-50 dark:from-bleu-900/20 dark:to-or-900/20 rounded-2xl text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Moyenne générale</p>
                  <GradeBadge value={overallAvg} />
                </div>
              </div>
            )}
          </div>

          {/* Infos élève */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Matricule', value: selectedStudent?.registrationNumber },
              { label: 'Classe',    value: selectedStudent?.className },
{
  label: 'Semestres',
  value: Array.isArray(studentGrades) && studentGrades.length
    ? Array.from(
        new Set(
          studentGrades
            .map(g => g.semester)
            .filter(Boolean)
        )
      ).join(', ')
    : '—'
},
              { label: 'Matières',  value: Object.keys(gradesBySubject).length || '—' },
            ].map(({ label, value }) => (
              <Card key={label} className="p-3 bg-gray-50 dark:bg-white/5 border-none">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{value || '—'}</p>
              </Card>
            ))}
          </div>

          {/* Notes par matière */}
          {gradesLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin" /> Chargement des notes...
            </div>
          ) : studentGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <BarChart3 size={36} className="opacity-20" />
              <span className="text-sm">Aucune note enregistrée pour cet élève.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(gradesBySubject).map(([subjectName, grades]) => {
                const subjectAvg = grades.reduce((s, g) => s + Number(g.value), 0) / grades.length;
                const coef = subjects.find(s => s.name === subjectName)?.coefficient ?? 1;
                return (
                  <div key={subjectName} className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bleu-100 dark:bg-bleu-900/30 flex items-center justify-center text-bleu-600">
                          <BookOpen size={15} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{subjectName}</p>
                          <p className="text-[9px] text-gray-400">Coef. {coef} • {grades.length} évaluation{grades.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 mb-1">Moyenne</p>
                        <GradeBadge value={subjectAvg} />
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                      {grades.map(g => (
                        <div key={g.id} className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-transparent">
                          <div>
                            <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                              {g.evaluationType || 'Évaluation'}
                            </p>
                            <p className="text-[9px] text-gray-400">
                              S{g.semester} • {g.gradedAt ? new Date(g.gradedAt).toLocaleDateString('fr-FR') : '—'}
                            </p>
                            {g.comment && <p className="text-[9px] text-gray-400 italic">{g.comment}</p>}
                          </div>
                          <GradeBadge value={Number(g.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions impression */}
          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1 h-12 flex items-center justify-center gap-2"
            >
              <Printer size={16} /> Imprimer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Export CSV simple
                const rows = [
                  ['Matière', 'Type', 'Note', 'Semestre', 'Date', 'Commentaire'],
                  ...studentGrades.map(g => [
                    g.subjectName,
                    g.evaluationType ?? '',
                    String(g.value),
                    String(g.semester),
                    g.gradedAt ? new Date(g.gradedAt).toLocaleDateString('fr-FR') : '',
                    g.comment ?? '',
                  ]),
                ];
                const csv = rows.map(r => r.join(';')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `releve_${selectedStudent?.lastName}_${selectedStudent?.firstName}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 h-12 flex items-center justify-center gap-2"
            >
              <Download size={16} /> Exporter CSV
            </Button>
            <Button
              onClick={() => { setIsGradesModalOpen(false); setSelectedStudent(null); setStudentGrades([]); }}
              className="flex-1 h-12"
            >
              Fermer
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODALE: AJOUTER UNE CLASSE ────────────────────────────────────────── */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600"><Building2 size={22} /></div>
            <span className="font-bold gradient-bleu-or-text">Nouvelle Classe</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6 text-left py-2" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Nom de la classe"
              placeholder="ex: 10ème Année A"
              value={classForm.name}
              onChange={e => setClassForm(f => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Niveau"
              placeholder="ex: Collège / Lycée"
              value={classForm.level}
              onChange={e => setClassForm(f => ({ ...f, level: e.target.value }))}
            />
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Select
                  label="Année Académique"
                  options={years.map(y => ({ value: y.id, label: y.name }))}
                  value={classForm.academicYearId}
                  onChange={e => setClassForm(f => ({ ...f, academicYearId: e.target.value }))}
                />
              </div>
              <Button
                variant="outline"
                className="h-[46px] px-3 border-gray-200 dark:border-white/10"
                onClick={() => setIsAcademicYearModalOpen(true)}
                title="Ajouter une année académique"
              >
                <Plus size={18} />
              </Button>
            </div>
            <Select
              label="Professeur Principal"
              options={[
                { value: '', label: 'Aucun (Optionnel)' },
                ...teachers.map(t => ({ value: t.userId, label: `${t.firstName} ${t.lastName}` }))
              ]}
              value={classForm.mainTeacherId}
              onChange={e => setClassForm(f => ({ ...f, mainTeacherId: e.target.value }))}
            />
            <Input
              type="number"
              label="Nombre max d'élèves"
              value={classForm.maxStudents}
              onChange={e => setClassForm(f => ({ ...f, maxStudents: Number(e.target.value) }))}
            />
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsClassModalOpen(false)} className="flex-1 h-12">Annuler</Button>
            <Button
              onClick={handleSubmitClass}
              disabled={submitting}
              className="flex-1 h-12 bg-bleu-600 border-none text-white shadow-lg"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Créer la Classe
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODALE: AJOUTER UNE MATIÈRE ───────────────────────────────────────── */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600"><BookOpen size={22} /></div>
            <span className="font-bold gradient-bleu-or-text">Nouvelle Matière</span>
          </div>
        }
        size="md"
      >
        <div className="space-y-6 text-left py-2" onClick={e => e.stopPropagation()}>
          <Input
            label="Nom de la matière"
            placeholder="ex: Mathématiques"
            value={subjectForm.name}
            onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Code"
              placeholder="ex: MATH"
              value={subjectForm.code}
              onChange={e => setSubjectForm(f => ({ ...f, code: e.target.value }))}
            />
            <Input
              type="number"
              label="Coefficient"
              value={subjectForm.coefficient}
              onChange={e => setSubjectForm(f => ({ ...f, coefficient: Number(e.target.value) }))}
            />
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsSubjectModalOpen(false)} className="flex-1 h-12">Annuler</Button>
            <Button
              onClick={handleSubmitSubject}
              disabled={submitting}
              className="flex-1 h-12 bg-or-500 border-none text-white shadow-lg"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Créer la Matière
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODALE: CONFIRMER SUPPRESSION ───────────────────────────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600"><Trash2 size={22} /></div>
            <span className="font-bold text-red-600">Confirmer la suppression</span>
          </div>
        }
        size="sm"
      >
        <div className="text-left space-y-6 py-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer le créneau <strong>{deleteTarget?.label}</strong> ?
            Cette action est irréversible.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 h-12">Annuler</Button>
            <Button onClick={handleDeleteSchedule} className="flex-1 h-12 bg-red-600 hover:bg-red-700 border-none shadow-lg">
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── TOAST ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              'fixed bottom-10 right-10 z-[100] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[300px]',
              notif.kind === 'success'
                ? 'border border-green-100 dark:border-green-900/30'
                : 'border border-red-100 dark:border-red-900/30'
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              notif.kind === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                : 'bg-red-100 dark:bg-red-900/30 text-red-500'
            )}>
              {notif.kind === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {notif.kind === 'success' ? 'Opération réussie' : 'Erreur'}
              </p>
              <p className="text-xs text-gray-500">{notif.message}</p>
            </div>
            <button onClick={() => setNotif(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALE: AJOUTER UNE ANNÉE ACADÉMIQUE ───────────────────────────── */}
      <Modal
        isOpen={isAcademicYearModalOpen}
        onClose={() => setIsAcademicYearModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600"><CalendarDays size={22} /></div>
            <span className="font-bold gradient-bleu-or-text">Nouvelle Année</span>
          </div>
        }
        size="md"
      >
        <div className="space-y-6 text-left py-2" onClick={e => e.stopPropagation()}>
          <Input
            label="Nom de l'année"
            placeholder="ex: 2025-2026"
            value={academicYearForm.name}
            onChange={e => setAcademicYearForm(f => ({ ...f, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date de début"
              value={academicYearForm.startDate}
              onChange={e => setAcademicYearForm(f => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              type="date"
              label="Date de fin"
              value={academicYearForm.endDate}
              onChange={e => setAcademicYearForm(f => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              checked={academicYearForm.isCurrent}
              onChange={e => setAcademicYearForm(f => ({ ...f, isCurrent: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-bleu-600 focus:ring-bleu-500"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Définir comme année courante</p>
              <p className="text-[10px] text-gray-500 leading-tight">Ceci remplacera l'année actuellement active dans le système.</p>
            </div>
          </label>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsAcademicYearModalOpen(false)} className="flex-1 h-12">
              Annuler
            </Button>
            <Button onClick={handleSubmitAcademicYear} disabled={submitting} className="flex-1 h-12 shadow-lg shadow-bleu-600/20">
              {submitting ? 'Création...' : 'Créer l\'année'}
            </Button>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
};

export default AdminScolarite;