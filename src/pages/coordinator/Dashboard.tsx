import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  FileSpreadsheet,
  GraduationCap,
  Users,
  UserCheck,
} from 'lucide-react';
import { Card, StatCard } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { classService } from '../../services/classService';
import { scheduleService } from '../../services/scheduleService';
import { userService, TeacherResponse } from '../../services/userService';
import { apiRequest } from '../../services/api';

interface TeacherAttendanceItem {
  id: string;
  teacherId: string;
  status: string;
}

interface DashboardStats {
  classCount: number;
  scheduleCount: number;
  teacherCount: number;
  teachersPresentToday: number;
}

const today = new Date().toISOString().split('T')[0];

const CoordinatorDashboard: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats>({
    classCount: 0,
    scheduleCount: 0,
    teacherCount: 0,
    teachersPresentToday: 0,
  });
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [classes, schedules, fetchedTeachers, attendances] = await Promise.all([
          classService.getAll(),
          scheduleService.getAll(),
          userService.getAllTeachers(token),
          apiRequest<TeacherAttendanceItem[]>(`/teacher-attendance/date/${today}`, { token }),
        ]);

        if (!isMounted) {
          return;
        }

        const presentStatuses = new Set(['PRESENT', 'LATE']);
        const teachersPresentToday = attendances.filter((item) =>
          presentStatuses.has(item.status.toUpperCase()),
        ).length;

        setTeachers(fetchedTeachers);
        setStats({
          classCount: classes.length,
          scheduleCount: schedules.length,
          teacherCount: fetchedTeachers.length,
          teachersPresentToday,
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Impossible de charger le tableau de bord.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const specialtiesCount = useMemo(() => {
    return new Set(
      teachers
        .map((teacher) => teacher.specialty?.trim())
        .filter((specialty): specialty is string => Boolean(specialty)),
    ).size;
  }, [teachers]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Classes suivies"
          value={loading ? '...' : String(stats.classCount)}
          subtitle="Périmètre académique disponible"
          icon={<GraduationCap />}
          color="bleu"
        />
        <StatCard
          title="Emplois du temps"
          value={loading ? '...' : String(stats.scheduleCount)}
          subtitle="Créneaux configurés"
          icon={<CalendarDays />}
          color="vert"
        />
        <StatCard
          title="Enseignants"
          value={loading ? '...' : String(stats.teacherCount)}
          subtitle={`${specialtiesCount} spécialités couvertes`}
          icon={<Users />}
          color="or"
        />
        <StatCard
          title="Présents aujourd'hui"
          value={loading ? '...' : String(stats.teachersPresentToday)}
          subtitle={`Pointage du ${today}`}
          icon={<UserCheck />}
          color="rouge"
        />
      </div>

      {error && (
        <Card className="border border-rouge-100 bg-rouge-50 text-left text-sm font-semibold text-rouge-700 dark:border-rouge-900/30 dark:bg-rouge-950/20 dark:text-rouge-300">
          {error}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card variant="glass" className="space-y-4 text-left">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-vert-700 dark:text-or-400">
              Pilotage académique
            </p>
            <h2 className="mt-3 text-2xl font-black text-gray-900 dark:text-white">
              Le coordinateur centralise les opérations pédagogiques.
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-gray-600 dark:text-gray-300">
              Gérez les classes, les emplois du temps, les notes, les bulletins et le pointage des enseignants depuis un espace dédié.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              to="/coordinator/scolarite"
              className="rounded-2xl border border-bleu-100 bg-bleu-50 p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-bleu-900/30 dark:bg-bleu-950/20"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bleu-600 text-white shadow-lg shadow-bleu-500/20">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">Coordination académique</h3>
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Notes, bulletins, classes, horaires et pointage enseignant.
              </p>
            </Link>

            <Link
              to="/coordinator/enseignants"
              className="rounded-2xl border border-or-100 bg-or-50 p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-or-900/30 dark:bg-or-950/20"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-or-500 text-gray-950 shadow-lg shadow-or-500/20">
                <Users size={24} />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">Suivi des enseignants</h3>
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Consultez l’équipe, les spécialités et l’activité du jour.
              </p>
            </Link>
          </div>
        </Card>

        <Card className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
            Session active
          </p>
          <h3 className="mt-3 text-xl font-black text-gray-900 dark:text-white">
            {user ? `${user.firstName} ${user.lastName}` : 'Coordinateur'}
          </h3>
          <div className="mt-6 space-y-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-white/5">
              <span>Rôle</span>
              <span className="font-black text-gray-900 dark:text-white">Coordinateur</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-white/5">
              <span>Date du jour</span>
              <span className="font-black text-gray-900 dark:text-white">{today}</span>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-vert-700 via-bleu-700 to-bleu-800 px-4 py-4 text-white shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-or-300">
                Priorité opérationnelle
              </p>
              <p className="mt-2 text-sm font-bold leading-6">
                Vérifier le pointage enseignant du jour puis finaliser les notes et bulletins en attente.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default CoordinatorDashboard;