import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  TrendingUp,
  Activity,
  BookOpen,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Calendar,
  Download,
  BarChart3,
} from 'lucide-react';
import { Card, Avatar, Badge, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { userService, StudentResponse } from '../../services/userService';
import { studentService, StudentNotesResponse } from '../../services/studentService';
import { apiRequest } from '../../services/api';
import { ScheduleResponse } from '../../types/schedule';

type Semestre = 1 | 2;

const ParentEleves: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [selectedSemestre, setSelectedSemestre] = useState<Record<string, Semestre>>({});
  const [notesCache, setNotesCache] = useState<Record<string, StudentNotesResponse>>({});
  const [todaySchedules, setTodaySchedules] = useState<Record<string, ScheduleResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !token) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const linkedStudents = await userService.getStudentsByParent(token, user.id);
        setStudents(linkedStudents);

        if (linkedStudents.length > 0) {
          setExpandedChild(linkedStudents[0].id);
        }

        const semSelection: Record<string, Semestre> = {};
        linkedStudents.forEach((student) => {
          semSelection[student.id] = 1;
        });
        setSelectedSemestre(semSelection);

        const notesPayload = await Promise.all(
          linkedStudents.flatMap((student) => [
            studentService.getNotes(student.id, 1),
            studentService.getNotes(student.id, 2),
          ]),
        );

        const nextNotesCache: Record<string, StudentNotesResponse> = {};
        linkedStudents.forEach((student, index) => {
          nextNotesCache[`${student.id}-1`] = notesPayload[index * 2];
          nextNotesCache[`${student.id}-2`] = notesPayload[index * 2 + 1];
        });

        setNotesCache(nextNotesCache);

        const schedulesPayload = await Promise.all(
          linkedStudents.map((student) => apiRequest<ScheduleResponse[]>(`/student/${student.id}/schedule/today`, { method: 'GET', token })),
        );

        const nextScheduleCache: Record<string, ScheduleResponse[]> = {};
        linkedStudents.forEach((student, index) => {
          nextScheduleCache[student.id] = schedulesPayload[index];
        });

        setTodaySchedules(nextScheduleCache);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des donnees eleves');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, user?.id]);

  const semestres: { key: Semestre; label: string }[] = [
    { key: 1, label: 'Semestre 1' },
    { key: 2, label: 'Semestre 2' },
  ];

  const toggleChild = (id: string) => {
    setExpandedChild(expandedChild === id ? null : id);
  };

  const setSemestreForChild = (childId: string, sem: Semestre) => {
    setSelectedSemestre((prev) => ({ ...prev, [childId]: sem }));
  };

  const getNotes = (studentId: string): StudentNotesResponse | null => {
    const semester = selectedSemestre[studentId] ?? 1;
    return notesCache[`${studentId}-${semester}`] ?? null;
  };

  const formatTime = (value: string): string => value.slice(0, 5);

  const kpi = useMemo(() => {
    if (students.length === 0) {
      return { avg: 0, absences: 0 };
    }

    const notes = students
      .map((s) => {
        const semester = selectedSemestre[s.id] ?? 1;
        return notesCache[`${s.id}-${semester}`] ?? null;
      })
      .filter((n): n is StudentNotesResponse => n !== null);

    if (notes.length === 0) {
      return { avg: 0, absences: 0 };
    }

    const avg = notes.reduce((sum, item) => sum + item.overallAverage, 0) / notes.length;
    const absences = notes.reduce((sum, item) => sum + item.absences, 0);

    return { avg, absences };
  }, [students, selectedSemestre, notesCache]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <GraduationCap size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mes enfants</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Suivez les resultats scolaires avec les donnees backend en temps reel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-bleu-50 text-bleu-700 dark:bg-bleu-900/20 dark:text-bleu-300 border-none font-bold px-3 py-2">
            Moyenne famille: {kpi.avg.toFixed(2)}/20
          </Badge>
          <Badge className="bg-rouge-50 text-rouge-700 dark:bg-rouge-900/20 dark:text-rouge-300 border-none font-bold px-3 py-2">
            Absences cumulees: {kpi.absences}
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="p-4 border border-rouge-100 bg-rouge-50 dark:bg-rouge-900/10">
          <p className="text-sm font-bold text-rouge-600">{error}</p>
        </Card>
      )}

      {loading && (
        <Card className="p-6">
          <p className="text-sm font-semibold text-gray-500">Chargement des donnees eleves...</p>
        </Card>
      )}

      {!loading && students.length === 0 && (
        <Card className="p-6">
          <p className="text-sm font-semibold text-gray-500">Aucun enfant lie a ce compte parent.</p>
        </Card>
      )}

      <div className="space-y-6">
        {students.map((student) => {
          const isExpanded = expandedChild === student.id;
          const currentSem = selectedSemestre[student.id] ?? 1;
          const semData = getNotes(student.id);
          const scheduleData = todaySchedules[student.id] ?? [];
          const moyenneNum = semData?.overallAverage ?? 0;

          return (
            <Card key={student.id} className="p-0 border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50 overflow-hidden">
              <button
                onClick={() => toggleChild(student.id)}
                className="w-full p-6 flex flex-col sm:flex-row items-center gap-6 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <Avatar name={`${student.firstName} ${student.lastName}`} size="lg" className="ring-4 ring-gray-100 dark:ring-gray-800 shadow-md flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{student.firstName} {student.lastName}</h2>
                    <Badge className="bg-bleu-50 text-bleu-600 dark:bg-bleu-900/20 dark:text-bleu-400 border-none font-bold text-[10px] w-fit">
                      {student.className || 'Classe non renseignee'}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400 border-none font-bold text-[10px] w-fit">
                      Matricule: {student.registrationNumber}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className={moyenneNum >= 14 ? 'text-vert-500' : moyenneNum >= 10 ? 'text-or-500' : 'text-rouge-500'} />
                      <span className="text-[12px] font-semibold text-gray-500">Moyenne:</span>
                      <span className="font-black text-lg text-gray-900 dark:text-white">
                        {moyenneNum.toFixed(2)}<span className="text-[10px] text-gray-400">/20</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-or-500" />
                      <span className="text-[12px] font-semibold text-gray-500">Rang:</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {semData ? `${semData.rank} / ${semData.classSize}` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity size={16} className={(semData?.absences ?? 0) > 2 ? 'text-rouge-500' : 'text-vert-500'} />
                      <span className="text-[12px] font-semibold text-gray-500">Absences:</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{semData?.absences ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="text-gray-400 flex-shrink-0">{isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 dark:border-white/5">
                      <div className="px-6 pt-5 pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={18} className="text-bleu-500" />
                          <h3 className="font-bold text-gray-900 dark:text-white">Resultats scolaires</h3>
                        </div>
                        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
                          {semestres.map((sem) => (
                            <button
                              key={sem.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSemestreForChild(student.id, sem.key);
                              }}
                              className={cn(
                                'px-4 py-2 rounded-lg text-[11px] font-bold transition-all',
                                currentSem === sem.key
                                  ? 'bg-white dark:bg-gray-800 text-bleu-600 dark:text-or-400 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
                              )}
                            >
                              {sem.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                        <div className="col-span-2 p-6 border-r border-gray-100 dark:border-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <BookOpen size={18} className="text-bleu-500" />
                              <h3 className="font-bold text-gray-900 dark:text-white">Bulletin - {semestres.find((s) => s.key === currentSem)?.label}</h3>
                            </div>
                            <Button variant="ghost" className="text-[10px] font-bold text-bleu-600 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 flex items-center gap-1 h-8 px-3">
                              <Download size={12} /> PDF bientot
                            </Button>
                          </div>

                          {!semData || semData.subjects.length === 0 ? (
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                              <p className="text-sm font-semibold text-gray-500">Aucune note disponible pour ce semestre.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-gray-100 dark:border-white/5 rounded-xl">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                  <tr>
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Matiere</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Note</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Coef.</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Commentaire</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                  {semData.subjects.map((subject) => (
                                    <tr key={subject.subjectId} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{subject.subjectName}</td>
                                      <td className="px-4 py-3 text-center font-black text-gray-900 dark:text-white">{subject.value.toFixed(2)}</td>
                                      <td className="px-4 py-3 text-center font-semibold text-gray-500">{subject.coefficient}</td>
                                      <td className="px-4 py-3 text-[12px] font-semibold text-gray-500 italic">{subject.comment || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {semData?.appreciation && (
                            <div className="mt-4 p-4 rounded-xl border bg-bleu-50 dark:bg-bleu-900/10 border-bleu-100 dark:border-bleu-900/20 text-bleu-700 dark:text-bleu-400">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Avis du conseil de classe</p>
                              <p className="text-[12px] font-semibold leading-relaxed">{semData.appreciation}</p>
                            </div>
                          )}
                        </div>

                        <div className="col-span-1 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Calendar size={18} className="text-or-500" />
                            <h3 className="font-bold text-gray-900 dark:text-white">Emploi du temps du jour</h3>
                          </div>

                          <div className="space-y-3">
                            {scheduleData.length === 0 && (
                              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <p className="text-[12px] font-semibold text-gray-500">Aucun cours prevu aujourd'hui.</p>
                              </div>
                            )}
                            {scheduleData.map((cours) => (
                              <div key={cours.id} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold text-bleu-600 dark:text-bleu-400 uppercase tracking-wider">{cours.subjectName}</span>
                                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <Clock size={10} />
                                    {formatTime(cours.startTime)} - {formatTime(cours.endTime)}
                                  </span>
                                </div>
                                <p className="text-[10px] font-semibold text-gray-500">Salle: {cours.room || '-'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ParentEleves;
