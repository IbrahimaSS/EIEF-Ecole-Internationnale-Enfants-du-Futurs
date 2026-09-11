import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Download,
  ChevronRight,
  ChevronLeft,
  AlarmClock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useStudentSchedule } from '../../hooks/useSchedule';
import {
  DAY_LABELS,
  getSubjectColor,
  timeToDecimal,
  getDuration,
  getCurrentCourse,
  getNextCourse,
} from '../../utils/scheduleUtils';
import { ScheduleResponse } from '../../types/schedule';

// ─── Color map ─────────────────────────────────────────────────────────────────
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

// ─── Constants ─────────────────────────────────────────────────────────────────
const DAYS = [1, 2, 3, 4, 5, 6] as const;
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const GRID_START_HOUR = 8;
const ROW_HEIGHT_PX = 80;

// ─── Component ─────────────────────────────────────────────────────────────────
const EleveEmploi: React.FC = () => {

  const { data: schedules, isLoading, error, refetch } = useStudentSchedule();

  const currentCourse = schedules ? getCurrentCourse(schedules) : null;
  const nextCourse    = schedules ? getNextCourse(schedules)    : null;

  // Mobile day selector: default to today (1=Mon … 6=Sat)
  const todayJava = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(
    DAYS.includes(todayJava as typeof DAYS[number]) ? todayJava : 1
  );

  if (isLoading) {
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
        <p className="text-sm font-semibold">{(error as Error).message}</p>
        <Button onClick={() => refetch()} className="text-xs px-4 h-9 rounded-xl">
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
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-or-100 dark:bg-or-900/30 rounded-2xl shadow-inner text-or-600">
            <Calendar size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Emploi du Temps</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Gère ton planning hebdomadaire et tes cours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
          <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-1">
            <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest px-4 text-gray-500">
              Semaine en cours
            </span>
            <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
          <Button className="h-10 px-4 bg-white dark:bg-gray-800 border-none shadow-soft text-gray-700 dark:text-white font-bold text-xs rounded-xl">
            <Download size={14} className="mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* ── VUE MOBILE : sélecteur de jour + liste ── */}
      <div className="block xl:hidden space-y-4">
        {/* Sélecteur de jour */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {DAYS.map((day) => {
            const hasCourse = (schedules ?? []).some((s: ScheduleResponse) => s.dayOfWeek === day);
            return (
              <button key={day} onClick={() => setSelectedDay(day)}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl text-xs font-black transition-all',
                  selectedDay === day
                    ? 'bg-or-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 shadow-soft',
                )}>
                <span>{DAY_LABELS[day].slice(0, 3)}</span>
                {hasCourse && <span className={cn('w-1.5 h-1.5 rounded-full mt-1', selectedDay === day ? 'bg-white' : 'bg-or-400')} />}
              </button>
            );
          })}
        </div>

        {/* Cours du jour sélectionné */}
        <div className="space-y-3">
          {(() => {
            const dayCourses = (schedules ?? [])
              .filter((s: ScheduleResponse) => s.dayOfWeek === selectedDay)
              .sort((a: ScheduleResponse, b: ScheduleResponse) => timeToDecimal(a.startTime) - timeToDecimal(b.startTime));
            if (dayCourses.length === 0)
              return <Card className="p-6 text-center border-none shadow-soft bg-white dark:bg-gray-900/50"><p className="text-sm text-gray-400 font-semibold">Pas de cours ce jour.</p></Card>;
            return dayCourses.map((s: ScheduleResponse, i: number) => {
              const color = getSubjectColor(s.subjectName);
              const now = new Date();
              const isPast = timeToDecimal(s.endTime) < now.getHours() + now.getMinutes() / 60;
              return (
                <Card key={i} className={cn('p-4 border-none shadow-soft bg-white dark:bg-gray-900/50 flex gap-4', isPast && 'opacity-60')}>
                  <div className={cn('w-1.5 rounded-full flex-shrink-0', colorBarClass[color] ?? 'bg-gray-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 dark:text-white text-sm">{s.subjectName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1"><Clock size={10}/>{s.startTime} – {s.endTime}</span>
                      {s.room && <span className="text-[11px] text-gray-500 flex items-center gap-1"><MapPin size={10}/>{s.room}</span>}
                      {s.teacherName && <span className="text-[11px] text-gray-500 flex items-center gap-1"><User size={10}/>{s.teacherName}</span>}
                    </div>
                  </div>
                </Card>
              );
            });
          })()}
        </div>
      </div>

      {/* ── VUE DESKTOP : grille complète ── */}
      <div className="hidden xl:grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* ── GRILLE ── */}
        <Card className="xl:col-span-3 p-0 border-none shadow-soft overflow-hidden bg-white dark:bg-gray-900/50">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days Header */}
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

              {/* Rows */}
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

                {/* Overlays */}
                {(schedules ?? []).map((item: ScheduleResponse, idx: number) => {
                  const dayIdx = DAYS.indexOf(item.dayOfWeek as typeof DAYS[number]);
                  if (dayIdx === -1) return null;

                  const startDecimal = timeToDecimal(item.startTime);
                  const duration     = getDuration(item.startTime, item.endTime);
                  const color        = getSubjectColor(item.subjectName);
                  const topPx        = (startDecimal - GRID_START_HOUR) * ROW_HEIGHT_PX;
                  const heightPx     = duration * ROW_HEIGHT_PX;
                  const leftPct      = ((dayIdx + 1) / 7) * 100;
                  const widthPct     = (1 / 7) * 100;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'absolute p-1 mx-1 transition-all hover:scale-[1.02] cursor-pointer rounded-lg border',
                        getColorClasses(color),
                      )}
                      style={{
                        left:   `${leftPct}%`,
                        width:  `calc(${widthPct}% - 8px)`,
                        top:    `${topPx}px`,
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

        {/* ── SIDEBAR ── */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-or-500 to-or-600 text-white relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
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
                    <p className="text-[10px] opacity-80 mt-0.5">
                      {nextCourse.startTime} · {nextCourse.room}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-black text-left">Pas de cours</p>
                )}
              </div>
            </div>
          </Card>

          {schedules && schedules.length > 0 && (
            <Card className="p-6 border-none shadow-soft bg-white dark:bg-gray-900/50">
              <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">
                Tous les cours
              </h3>
              <div className="space-y-2">
                {schedules.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className={"w-2 h-2 rounded-full flex-shrink-0 bg-bleu-500"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">{s.subjectName}</p>
                      <p className="text-[10px] text-gray-400">{DAY_LABELS[s.dayOfWeek]} · {s.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>{/* fin vue desktop */}
    </motion.div>
  );
};

export default EleveEmploi;
