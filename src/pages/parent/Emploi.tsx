import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Bell,
  AlarmClock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ChevronDown,
  Users,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { userService, StudentResponse } from '../../services/userService';
import { studentScheduleService } from '../../services/scheduleService';
import { ScheduleResponse } from '../../types/schedule';
import {
  DAY_LABELS,
  getSubjectColor,
  timeToDecimal,
  getDuration,
  getCurrentCourse,
  getNextCourse,
} from '../../utils/scheduleUtils';

const getColorClasses = (color: string): string => {
  const map: Record<string, string> = {
    blue:    'bg-bleu-50/50 dark:bg-bleu-900/20 border-bleu-200 dark:border-bleu-800 text-bleu-700 dark:text-bleu-400',
    indigo:  'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400',
    violet:  'bg-violet-50/50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400',
    amber:   'bg-or-50/50 dark:bg-or-900/20 border-or-200 dark:border-or-800 text-or-700 dark:text-or-400',
    emerald: 'bg-vert-50/50 dark:bg-vert-900/20 border-vert-200 dark:border-vert-800 text-vert-700 dark:text-vert-400',
    rose:    'bg-rouge-50/50 dark:bg-rouge-900/20 border-rouge-200 dark:border-rouge-800 text-rouge-700 dark:text-rouge-400',
    cyan:    'bg-cyan-50/50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400',
    orange:  'bg-orange-50/50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400',
  };
  return map[color] ?? 'bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300';
};

const colorBarClass: Record<string, string> = {
  blue:    'bg-bleu-500',
  indigo:  'bg-indigo-500',
  violet:  'bg-violet-500',
  amber:   'bg-or-500',
  emerald: 'bg-vert-500',
  rose:    'bg-rouge-500',
  cyan:    'bg-cyan-500',
  orange:  'bg-orange-500',
};

const DAYS = [1, 2, 3, 4, 5, 6] as const;
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const GRID_START_HOUR = 8;
const ROW_HEIGHT_PX = 80;

const ParentEmploi: React.FC = () => {
  const { user, token } = useAuthStore();
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [schedules, setSchedules] = useState<ScheduleResponse[] | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Charger les enfants
  useEffect(() => {
    if (!user?.id || !token) return;
    setLoadingStudents(true);
    userService.getStudentsByParent(token, user.id)
      .then((list) => {
        setStudents(list);
        if (list.length > 0) setSelectedStudentId(list[0].id);
      })
      .catch(() => setError('Impossible de charger la liste des enfants.'))
      .finally(() => setLoadingStudents(false));
  }, [user?.id, token]);

  // Charger l'emploi du temps
  useEffect(() => {
    if (!selectedStudentId) return;
    setLoadingSchedule(true);
    setError(null);
    studentScheduleService.getSchedule(selectedStudentId)
      .then(setSchedules)
      .catch((err: Error) => setError(err.message || 'Impossible de charger l\'emploi du temps.'))
      .finally(() => setLoadingSchedule(false));
  }, [selectedStudentId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const currentCourse = schedules ? getCurrentCourse(schedules) : null;
  const nextCourse = schedules ? getNextCourse(schedules) : null;

  if (loadingStudents) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-400">
        <Loader2 size={36} className="animate-spin text-or-500" />
        <p className="text-sm font-semibold">Chargement…</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users size={40} className="text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Aucun enfant inscrit</h3>
        <p className="text-[13px] text-gray-500 font-semibold">Aucun élève n'est associé à votre compte.</p>
      </div>
    );
  }

  if (loadingSchedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-400">
        <Loader2 size={36} className="animate-spin text-or-500" />
        <p className="text-sm font-semibold">Chargement de l'emploi du temps…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-rouge-500">
        <AlertCircle size={36} />
        <p className="text-sm font-semibold">{error}</p>
        <Button onClick={() => setError(null)} className="text-xs px-4 h-9 rounded-xl">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-or-100 dark:bg-or-900/30 rounded-2xl shadow-inner text-or-600">
            <Calendar size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Emploi du Temps</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Planning hebdomadaire de vos enfants
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
          {/* Sélecteur enfant */}
          {students.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-black text-gray-700 dark:text-white shadow-soft"
              >
                <Users size={14} className="text-or-500" />
                {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Sélectionner'}
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 min-w-[200px] overflow-hidden">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedStudentId(s.id); setDropdownOpen(false); }}
                      className={cn(
                        'w-full text-left px-4 py-3 text-xs font-bold transition-colors',
                        s.id === selectedStudentId
                          ? 'bg-or-50 dark:bg-or-900/30 text-or-600'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {s.firstName} {s.lastName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-1">
            <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest px-4 text-gray-500">
              Semaine en cours
            </span>
            <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <Button className="h-10 px-4 bg-white dark:bg-gray-800 border-none shadow-soft text-gray-700 dark:text-white font-bold text-xs rounded-xl">
            <Download size={14} className="mr-2" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* GRILLE */}
        <Card className="xl:col-span-3 p-0 border-none shadow-soft overflow-hidden bg-white dark:bg-gray-900/50">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                <div className="p-4 border-r border-gray-100 dark:border-white/5" />
                {DAYS.map((day) => (
                  <div key={day} className="p-4 text-center border-r border-gray-100 dark:border-white/5">
                    <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">
                      {DAY_LABELS[day]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative">
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-7 min-h-[80px] border-b border-gray-50 dark:border-white/5">
                    <div className="p-4 border-r border-gray-100 dark:border-white/5 flex flex-col justify-start">
                      <span className="text-[10px] font-black text-gray-400">{hour}</span>
                    </div>
                    {DAYS.map((day) => (
                      <div key={day} className="border-r border-gray-50 dark:border-white/5 relative" />
                    ))}
                  </div>
                ))}
                {(schedules ?? []).map((item: ScheduleResponse, idx: number) => {
                  const dayIdx = DAYS.indexOf(item.dayOfWeek as typeof DAYS[number]);
                  if (dayIdx === -1) return null;
                  const startDecimal = timeToDecimal(item.startTime);
                  const duration = getDuration(item.startTime, item.endTime);
                  const color = getSubjectColor(item.subjectName);
                  const topPx = (startDecimal - GRID_START_HOUR) * ROW_HEIGHT_PX;
                  const heightPx = duration * ROW_HEIGHT_PX;
                  const leftPct = ((dayIdx + 1) / 7) * 100;
                  const widthPct = (1 / 7) * 100;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'absolute p-1 mx-1 transition-all hover:scale-[1.02] cursor-pointer rounded-lg border',
                        getColorClasses(color),
                      )}
                      style={{
                        left: `${leftPct}%`,
                        width: `calc(${widthPct}% - 8px)`,
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        zIndex: 10,
                      }}
                    >
                      <div className="p-2 border-l-2 border-current h-full flex flex-col justify-between overflow-hidden">
                        <div>
                          <p className="text-[10px] font-black leading-tight line-clamp-1">{item.subjectName}</p>
                          {item.room && (
                            <p className="text-[9px] font-bold opacity-60 mt-1 flex items-center gap-1">
                              <MapPin size={8} />{item.room}
                            </p>
                          )}
                        </div>
                        {item.teacherName && (
                          <p className="text-[8px] font-bold opacity-80 flex items-center gap-1">
                            <User size={8} />{item.teacherName}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-or-500 to-or-600 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <AlarmClock size={120} />
            </div>
            <div className="relative z-10">
              {currentCourse ? (
                <>
                  <Badge className="bg-white/20 text-white border-none font-black text-[9px] px-2 mb-4">
                    COURS ACTUEL
                  </Badge>
                  <h3 className="text-xl font-black mb-1">{currentCourse.subjectName}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold opacity-90 mb-4">
                    <Clock size={12} />
                    {currentCourse.startTime} - {currentCourse.endTime}
                    {currentCourse.room && ` (${currentCourse.room})`}
                  </div>
                </>
              ) : (
                <>
                  <Badge className="bg-white/20 text-white border-none font-black text-[9px] px-2 mb-4">
                    PAS DE COURS
                  </Badge>
                  <h3 className="text-xl font-black mb-1">Temps libre</h3>
                </>
              )}
              <div className="pt-4 border-t border-white/20">
                <p className="text-[10px] font-bold opacity-70 mb-2 uppercase tracking-widest text-left">
                  Prochain cours
                </p>
                {nextCourse ? (
                  <div className="text-left">
                    <p className="text-sm font-black">{nextCourse.subjectName}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{nextCourse.startTime} · {nextCourse.room}</p>
                  </div>
                ) : (
                  <p className="text-sm font-black text-left">Pas de cours</p>
                )}
              </div>
            </div>
          </Card>

          {schedules && schedules.length > 0 && (
            <Card className="p-6 border-none shadow-soft bg-white dark:bg-gray-900/50">
              <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={16} className="text-bleu-500" /> Cours aujourd'hui
              </h3>
              <div className="space-y-3">
                {(() => {
                  const now = new Date();
                  const javaDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
                  const todayCourses = schedules
                    .filter((s) => s.dayOfWeek === javaDayOfWeek)
                    .sort((a, b) => timeToDecimal(a.startTime) - timeToDecimal(b.startTime));
                  if (todayCourses.length === 0) {
                    return <p className="text-xs text-gray-400 font-semibold">Aucun cours aujourd'hui.</p>;
                  }
                  return todayCourses.map((s, i) => {
                    const color = getSubjectColor(s.subjectName);
                    const isPast = timeToDecimal(s.endTime) < now.getHours() + now.getMinutes() / 60;
                    return (
                      <div key={i} className={cn('flex gap-3 text-left', isPast && 'opacity-50')}>
                        <div
                          className={cn('w-1 rounded-full flex-shrink-0', colorBarClass[color] ?? 'bg-gray-400')}
                          style={{ minHeight: '2rem' }}
                        />
                        <div>
                          <p className="text-xs font-black text-gray-900 dark:text-white">{s.subjectName}</p>
                          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                            {s.startTime} – {s.endTime}{s.room && ` · ${s.room}`}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ParentEmploi;
