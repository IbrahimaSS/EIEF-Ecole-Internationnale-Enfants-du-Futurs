import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { Badge, Button, Card, Input, Modal, StatCard } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { TeacherRequest, TeacherResponse, userService } from '../../services/userService';
import { teacherService } from '../../services/teacherService';
import { scheduleService } from '../../services/scheduleService';
import { TeacherClassDetailResponse } from '../../types/academic';
import { ScheduleResponse } from '../../types/schedule';
import { apiRequest } from '../../services/api';

interface TeacherAttendanceSummary {
  id: string;
  teacherId: string;
  teacherUserId: string;
  teacherName: string;
  date: string;
  status: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  note?: string | null;
}

interface TeacherRow {
  teacher: TeacherResponse;
  classAssignments: number;
  classCount: number;
  weeklySlots: number;
  todayAttendance?: TeacherAttendanceSummary;
}

const today = new Date().toISOString().split('T')[0];

const getAttendanceVariant = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'PRESENT':
      return 'success' as const;
    case 'LATE':
      return 'warning' as const;
    case 'ABSENT':
      return 'error' as const;
    case 'EXCUSED':
      return 'info' as const;
    default:
      return 'default' as const;
  }
};

const getAttendanceLabel = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'PRESENT':
      return 'Présent';
    case 'LATE':
      return 'Retard';
    case 'ABSENT':
      return 'Absent';
    case 'EXCUSED':
      return 'Excusé';
    default:
      return 'Non pointé';
  }
};

const emptyTeacher = (): TeacherRequest => ({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  employeeNumber: '',
  specialty: '',
  hireDate: '',
});

const CoordinatorTeachers: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [attendanceRows, setAttendanceRows] = useState<TeacherAttendanceSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedTeacherClasses, setSelectedTeacherClasses] = useState<TeacherClassDetailResponse[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState<TeacherRequest>(emptyTeacher());
  const [teacherSubmitError, setTeacherSubmitError] = useState<string | null>(null);
  const [creatingTeacher, setCreatingTeacher] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);

      try {
        const [teacherData, scheduleData, attendanceData] = await Promise.all([
          userService.getAllTeachers(token, search.trim() || undefined),
          scheduleService.getAll(),
          apiRequest<TeacherAttendanceSummary[]>(`/teacher-attendance/date/${today}`, { token }),
        ]);

        if (isMounted) {
          setTeachers(teacherData);
          setSchedules(scheduleData);
          setAttendanceRows(attendanceData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Impossible de charger les enseignants.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      void fetchTeachers();
    }, 200);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [search, token]);

  useEffect(() => {
    if (!selectedTeacherId) {
      return;
    }

    const selectedTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId);
    if (!selectedTeacher) {
      setSelectedTeacherId(null);
      setSelectedTeacherClasses([]);
    }
  }, [selectedTeacherId, teachers]);

  const activeTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.isActive).length,
    [teachers],
  );

  const specialtiesCount = useMemo(() => {
    return new Set(
      teachers
        .map((teacher) => teacher.specialty?.trim())
        .filter((specialty): specialty is string => Boolean(specialty)),
    ).size;
  }, [teachers]);

  const teacherRows = useMemo<TeacherRow[]>(() => {
    const scheduleMetrics = new Map<string, {
      assignments: Set<string>;
      classes: Set<string>;
      weeklySlots: number;
    }>();

    schedules.forEach((schedule) => {
      const key = schedule.teacherId;
      if (!key) {
        return;
      }

      const current = scheduleMetrics.get(key) ?? {
        assignments: new Set<string>(),
        classes: new Set<string>(),
        weeklySlots: 0,
      };

      current.weeklySlots += 1;
      current.assignments.add(`${schedule.classId}:${schedule.subjectId}`);
      current.classes.add(schedule.classId);
      scheduleMetrics.set(key, current);
    });

    const attendanceMap = new Map<string, TeacherAttendanceSummary>();
    attendanceRows.forEach((attendance) => {
      attendanceMap.set(attendance.teacherId, attendance);
    });

    return teachers.map((teacher) => {
      const metrics = scheduleMetrics.get(teacher.userId);
      return {
        teacher,
        classAssignments: metrics?.assignments.size ?? 0,
        classCount: metrics?.classes.size ?? 0,
        weeklySlots: metrics?.weeklySlots ?? 0,
        todayAttendance: attendanceMap.get(teacher.id),
      };
    });
  }, [attendanceRows, schedules, teachers]);

  const pointedTeachersCount = useMemo(
    () => teacherRows.filter((row) => row.todayAttendance).length,
    [teacherRows],
  );

  const totalAssignments = useMemo(
    () => teacherRows.reduce((sum, row) => sum + row.classAssignments, 0),
    [teacherRows],
  );

  const selectedTeacherRow = useMemo(
    () => teacherRows.find((row) => row.teacher.id === selectedTeacherId) ?? null,
    [selectedTeacherId, teacherRows],
  );

  const handleSelectTeacher = async (teacher: TeacherResponse) => {
    setSelectedTeacherId(teacher.id);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const data = await teacherService.getClasses(teacher.userId);
      setSelectedTeacherClasses(data);
    } catch (err) {
      setSelectedTeacherClasses([]);
      setDetailError(err instanceof Error ? err.message : 'Impossible de charger les affectations.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenTeacherModal = () => {
    setTeacherForm(emptyTeacher());
    setTeacherSubmitError(null);
    setIsTeacherModalOpen(true);
  };

  const handleCreateTeacher = async () => {
    if (!token) {
      setTeacherSubmitError('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    if (
      !teacherForm.firstName.trim()
      || !teacherForm.lastName.trim()
      || !teacherForm.email.trim()
      || !teacherForm.password.trim()
      || !teacherForm.employeeNumber.trim()
    ) {
      setTeacherSubmitError('Prénom, nom, email, mot de passe et matricule sont requis.');
      return;
    }

    if (teacherForm.password.trim().length < 8) {
      setTeacherSubmitError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setCreatingTeacher(true);
    setTeacherSubmitError(null);

    try {
      const createdTeacher = await userService.createTeacher(token, {
        firstName: teacherForm.firstName.trim(),
        lastName: teacherForm.lastName.trim(),
        email: teacherForm.email.trim(),
        password: teacherForm.password.trim(),
        employeeNumber: teacherForm.employeeNumber.trim(),
        phone: teacherForm.phone?.trim() || undefined,
        specialty: teacherForm.specialty?.trim() || undefined,
        hireDate: teacherForm.hireDate || undefined,
      });

      setTeachers((currentTeachers) => [
        createdTeacher,
        ...currentTeachers.filter((teacher) => teacher.id !== createdTeacher.id),
      ]);
      setSelectedTeacherId(createdTeacher.id);
      setSelectedTeacherClasses([]);
      setDetailError(null);
      setSearch('');
      setIsTeacherModalOpen(false);
      setTeacherForm(emptyTeacher());
    } catch (err) {
      setTeacherSubmitError(
        err instanceof Error ? err.message : 'Impossible de créer cet enseignant.',
      );
    } finally {
      setCreatingTeacher(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Effectif enseignant"
          value={loading ? '...' : String(teachers.length)}
          subtitle="Professeurs visibles par le coordinateur"
          icon={<Users />}
          color="bleu"
        />
        <StatCard
          title="Enseignants actifs"
          value={loading ? '...' : String(activeTeachers)}
          subtitle="Comptes actuellement actifs"
          icon={<UserCheck />}
          color="vert"
        />
        <StatCard
          title="Pointage du jour"
          value={loading ? '...' : String(pointedTeachersCount)}
          subtitle={`Présences saisies pour le ${today}`}
          icon={<CalendarDays />}
          color="or"
        />
        <StatCard
          title="Affectations"
          value={loading ? '...' : String(totalAssignments)}
          subtitle={`${specialtiesCount} spécialités couvertes`}
          icon={<BookOpen />}
          color="or"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.95fr]">
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
              Équipe pédagogique
            </p>
            <h2 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
              Gestion opérationnelle des enseignants
            </h2>
            <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              Le pointage enseignant reste centralisé dans la page Scolarité & Pointage. Cette vue sert au suivi de l’effectif pédagogique et à l’ajout de nouveaux enseignants.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
            <Button
              onClick={handleOpenTeacherModal}
              className="h-12 rounded-2xl bg-gradient-to-r from-bleu-600 to-bleu-500 border-none px-5 text-[11px] font-bold shadow-lg shadow-bleu-600/20"
            >
              <Plus size={16} className="mr-2" /> Nouvel enseignant
            </Button>

            <div className="relative w-full lg:min-w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un enseignant"
                className="h-12 rounded-2xl pl-11"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rouge-100 bg-rouge-50 px-4 py-3 text-left text-sm font-semibold text-rouge-700 dark:border-rouge-900/30 dark:bg-rouge-950/20 dark:text-rouge-300">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-white/5">
          <div className="grid grid-cols-[1.4fr_0.95fr_0.8fr_1fr_0.75fr_0.8fr] gap-4 bg-gray-50 px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <span>Enseignant</span>
            <span>Spécialité</span>
            <span>Charge</span>
            <span>Présence du jour</span>
            <span>Statut</span>
            <span></span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {!loading && teachers.length === 0 && (
              <div className="px-6 py-8 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Aucun enseignant trouvé pour ce filtre.
              </div>
            )}

            {loading && (
              <div className="px-6 py-8 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                Chargement des enseignants...
              </div>
            )}

            {!loading && teacherRows.map((row) => (
              <div
                key={row.teacher.id}
                className="grid grid-cols-1 gap-4 px-6 py-5 text-left md:grid-cols-[1.4fr_0.95fr_0.8fr_1fr_0.75fr_0.8fr]"
              >
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    {row.teacher.firstName} {row.teacher.lastName}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Matricule {row.teacher.employeeNumber}
                  </p>
                  <div className="mt-3 space-y-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{row.teacher.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span>{row.teacher.phone || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {row.teacher.specialty || 'Non renseignée'}
                </div>

                <div className="space-y-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-gray-400" />
                    <span>{row.classCount} classe{row.classCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-400" />
                    <span>{row.classAssignments} affectation{row.classAssignments > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} className="text-gray-400" />
                    <span>{row.weeklySlots} créneau{row.weeklySlots > 1 ? 'x' : ''}</span>
                  </div>
                </div>

                <div>
                  <Badge
                    variant={getAttendanceVariant(row.todayAttendance?.status)}
                    className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    {getAttendanceLabel(row.todayAttendance?.status)}
                  </Badge>
                  {row.todayAttendance?.checkInTime && (
                    <p className="mt-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Entrée {row.todayAttendance.checkInTime.slice(0, 5)}
                    </p>
                  )}
                </div>

                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${row.teacher.isActive ? 'bg-vert-100 text-vert-700 dark:bg-vert-900/20 dark:text-vert-300' : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300'}`}>
                    {row.teacher.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="flex items-start justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSelectTeacher(row.teacher)}
                    className="rounded-xl px-3 py-2 text-[11px] font-bold"
                  >
                    Voir la charge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-5 text-left">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
            Détail pédagogique
          </p>
          <h3 className="mt-2 text-xl font-black text-gray-900 dark:text-white">
            {selectedTeacherRow
              ? `${selectedTeacherRow.teacher.firstName} ${selectedTeacherRow.teacher.lastName}`
              : 'Sélectionnez un enseignant'}
          </h3>
          <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            Visualisez les classes suivies, les matières et la charge d’enseignement pour mieux répartir l’activité pédagogique.
          </p>
        </div>

        {!selectedTeacherRow && (
          <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-6 text-sm font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400">
            Choisissez un enseignant dans le tableau pour afficher ses affectations académiques.
          </div>
        )}

        {selectedTeacherRow && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 px-4 py-4 dark:bg-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Présence du jour</p>
                <div className="mt-3 flex items-center gap-3">
                  <Badge variant={getAttendanceVariant(selectedTeacherRow.todayAttendance?.status)} className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                    {getAttendanceLabel(selectedTeacherRow.todayAttendance?.status)}
                  </Badge>
                  {selectedTeacherRow.todayAttendance?.checkInTime && (
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Entrée {selectedTeacherRow.todayAttendance.checkInTime.slice(0, 5)}
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-4 dark:bg-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">Charge hebdomadaire</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  <span>{selectedTeacherRow.classCount} classes</span>
                  <span>{selectedTeacherRow.classAssignments} affectations</span>
                  <span>{selectedTeacherRow.weeklySlots} créneaux</span>
                </div>
              </div>
            </div>

            {detailError && (
              <div className="rounded-2xl border border-rouge-100 bg-rouge-50 px-4 py-3 text-sm font-semibold text-rouge-700 dark:border-rouge-900/30 dark:bg-rouge-950/20 dark:text-rouge-300">
                {detailError}
              </div>
            )}

            {detailLoading && (
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Chargement des affectations...
              </div>
            )}

            {!detailLoading && !detailError && selectedTeacherClasses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-6 text-sm font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400">
                Aucun groupe n’est encore affecté à cet enseignant.
              </div>
            )}

            {!detailLoading && selectedTeacherClasses.length > 0 && (
              <div className="space-y-3">
                {selectedTeacherClasses.map((assignment) => (
                  <div
                    key={`${assignment.classId}-${assignment.subjectId}`}
                    className="rounded-2xl border border-gray-100 bg-white px-4 py-4 dark:border-white/5 dark:bg-white/5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          {assignment.className}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                          {assignment.subjectName}
                        </p>
                      </div>
                      <Badge variant="info" className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                        {assignment.studentCount} élèves
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center gap-2">
                        <Activity size={14} className="text-gray-400" />
                        Moyenne {assignment.classAverage.toFixed(2)}/20
                      </span>
                      {assignment.level && (
                        <span className="inline-flex items-center gap-2">
                          <GraduationCap size={14} className="text-gray-400" />
                          {assignment.level}
                        </span>
                      )}
                      {assignment.room && (
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={14} className="text-gray-400" />
                          Salle {assignment.room}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
      </div>

      <Modal
        isOpen={isTeacherModalOpen}
        onClose={() => {
          setIsTeacherModalOpen(false);
          setTeacherSubmitError(null);
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-bleu-100 p-2 text-bleu-600 dark:bg-bleu-900/30 dark:text-bleu-300">
              <Users size={22} />
            </div>
            <span className="font-bold gradient-bleu-or-text">Nouvel enseignant</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-5 py-2" onClick={(event) => event.stopPropagation()}>
          {teacherSubmitError && (
            <div className="rounded-2xl border border-rouge-100 bg-rouge-50 px-4 py-3 text-left text-sm font-semibold text-rouge-700 dark:border-rouge-900/30 dark:bg-rouge-950/20 dark:text-rouge-300">
              {teacherSubmitError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Prénom"
              value={teacherForm.firstName}
              onChange={(event) => setTeacherForm((form) => ({ ...form, firstName: event.target.value }))}
              placeholder="ex: Fatou"
            />
            <Input
              label="Nom"
              value={teacherForm.lastName}
              onChange={(event) => setTeacherForm((form) => ({ ...form, lastName: event.target.value }))}
              placeholder="ex: Camara"
            />
            <Input
              label="Email"
              type="email"
              value={teacherForm.email}
              onChange={(event) => setTeacherForm((form) => ({ ...form, email: event.target.value }))}
              placeholder="enseignant@eief.edu.gn"
            />
            <Input
              label="Mot de passe"
              type="password"
              value={teacherForm.password}
              onChange={(event) => setTeacherForm((form) => ({ ...form, password: event.target.value }))}
              placeholder="Minimum 8 caractères"
            />
            <Input
              label="Matricule enseignant"
              value={teacherForm.employeeNumber}
              onChange={(event) => setTeacherForm((form) => ({ ...form, employeeNumber: event.target.value }))}
              placeholder="ex: EMP-024"
            />
            <Input
              label="Spécialité"
              value={teacherForm.specialty ?? ''}
              onChange={(event) => setTeacherForm((form) => ({ ...form, specialty: event.target.value }))}
              placeholder="ex: Mathématiques"
            />
            <Input
              label="Téléphone"
              value={teacherForm.phone ?? ''}
              onChange={(event) => setTeacherForm((form) => ({ ...form, phone: event.target.value }))}
              placeholder="+224..."
            />
            <Input
              label="Date d'embauche"
              type="date"
              value={teacherForm.hireDate ?? ''}
              onChange={(event) => setTeacherForm((form) => ({ ...form, hireDate: event.target.value }))}
            />
          </div>

          <div className="flex gap-4 border-t border-gray-100 pt-4 dark:border-white/5">
            <Button
              variant="outline"
              onClick={() => {
                setIsTeacherModalOpen(false);
                setTeacherSubmitError(null);
              }}
              className="h-12 flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={() => void handleCreateTeacher()}
              disabled={creatingTeacher}
              className="h-12 flex-1 bg-gradient-to-r from-bleu-600 to-bleu-500 border-none text-white shadow-lg shadow-bleu-600/20"
            >
              {creatingTeacher ? <Loader2 className="mr-2 animate-spin" size={18} /> : null}
              Créer l'enseignant
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CoordinatorTeachers;