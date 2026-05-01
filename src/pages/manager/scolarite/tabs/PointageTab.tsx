// src/pages/manager/scolarite/tabs/PointageTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  GraduationCap,
  History as HistoryIcon,
  Printer,
  Save,
  UserCheck,
  Users,
} from 'lucide-react';
import { Button, Card, Input, Select } from '../../../../components/ui';
import { ATTENDANCE_STATUSES } from '../constants';
import {
  ClassResponse,
  PointageTab as PointageTabId,
  ScheduleResponse,
  StudentResponse,
  TeacherResponse,
} from '../types';

interface Props {
  // navigation
  activePointageTab: PointageTabId;
  setActivePointageTab: (id: PointageTabId) => void;

  // données
  classes: ClassResponse[];
  schedules: ScheduleResponse[];
  teachers: TeacherResponse[];
  classStudents: StudentResponse[];

  // pointage state
  selectedClassId: string;
  setSelectedClassId: (v: string) => void;
  pointageScheduleId: string;
  setPointageScheduleId: (v: string) => void;
  pointageDate: string;
  setPointageDate: (v: string) => void;

  studentAttendances: Record<string, any>;
  setStudentAttendances: (
    updater: (prev: Record<string, any>) => Record<string, any>,
  ) => void;
  teacherAttendances: Record<string, any>;
  setTeacherAttendances: (
    updater: (prev: Record<string, any>) => Record<string, any>,
  ) => void;

  submitting: boolean;
  onSaveStudentAttendance: () => void;
  onSaveSingleStudentAttendance: (studentId: string) => void;
  onShowStudentHistory: (student: StudentResponse) => void;
  onSaveTeacherAttendance: () => void;
  onSaveSingleTeacherAttendance: (teacherId: string) => void;
  onShowTeacherHistory: (teacher: TeacherResponse) => void;
  onPrintTeacherReport: () => void;
}

const PointageTab: React.FC<Props> = ({
  activePointageTab,
  setActivePointageTab,
  classes,
  schedules,
  teachers,
  classStudents,
  selectedClassId,
  setSelectedClassId,
  pointageScheduleId,
  setPointageScheduleId,
  pointageDate,
  setPointageDate,
  studentAttendances,
  setStudentAttendances,
  teacherAttendances,
  setTeacherAttendances,
  submitting,
  onSaveStudentAttendance,
  onSaveSingleStudentAttendance,
  onShowStudentHistory,
  onSaveTeacherAttendance,
  onSaveSingleTeacherAttendance,
  onShowTeacherHistory,
  onPrintTeacherReport,
}) => (
  <motion.div
    key="pointage"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
    className="space-y-6"
  >
    {/* Sous-onglets */}
    <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6">
      <button
        onClick={() => setActivePointageTab('eleves')}
        className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
          activePointageTab === 'eleves'
            ? 'border-bleu-500 text-bleu-600'
            : 'border-transparent text-slate-500'
        }`}
      >
        <Users size={16} className="inline mr-2" /> Élèves
      </button>
      <button
        onClick={() => setActivePointageTab('professeurs')}
        className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
          activePointageTab === 'professeurs'
            ? 'border-purple-500 text-purple-600'
            : 'border-transparent text-slate-500'
        }`}
      >
        <GraduationCap size={16} className="inline mr-2" /> Professeurs
      </button>
    </div>

    {activePointageTab === 'eleves' ? (
      <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
        <div className="flex flex-wrap items-end gap-4 mb-3">
          <Select
            label="Classe"
            value={selectedClassId}
            onChange={e => {
              setSelectedClassId(e.target.value);
              // Reset le créneau si on change de classe
              setPointageScheduleId('');
            }}
            options={[
              { value: '', label: 'Sélectionner une classe' },
              ...classes.map(cls => ({ value: cls.id, label: cls.name })),
            ]}
          />
          <Select
            label="Emploi du temps"
            value={pointageScheduleId}
            onChange={e => setPointageScheduleId(e.target.value)}
            options={[
              { value: '', label: selectedClassId ? 'Sélectionner un créneau' : "Choisir une classe d'abord" },
              ...schedules
                .filter(s => s.classId === selectedClassId)
                .map(s => ({
                  value: s.id,
                  label: `${s.subjectName} (${s.startTime}-${s.endTime})`,
                })),
            ]}
          />
          <Input
            label="Date"
            type="date"
            value={pointageDate}
            onChange={e => setPointageDate(e.target.value)}
          />
          <Button
            onClick={onSaveStudentAttendance}
            disabled={!pointageScheduleId || submitting}
            className="bg-bleu-600 hover:bg-bleu-700 h-11 border-none"
            title={pointageScheduleId ? 'Enregistrer tous les pointages saisis' : 'Sélectionnez un créneau d\'abord'}
          >
            <Save size={16} className="mr-2" /> Enregistrer tous
          </Button>
        </div>

        <p className="text-[11px] text-gray-500 mb-4">
          Astuce : tu peux pointer chaque élève individuellement avec le bouton{' '}
          <strong>Pointer</strong> sur sa ligne, ou tout enregistrer en bloc avec
          <strong> Enregistrer tous</strong>.
        </p>

        {/* Empty states clairs */}
        {!selectedClassId ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Users size={40} className="opacity-20" />
            <span className="text-sm font-medium">Sélectionnez d'abord une classe.</span>
          </div>
        ) : classStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Users size={40} className="opacity-20" />
            <span className="text-sm font-medium">Aucun élève dans cette classe.</span>
            <span className="text-xs">Ajoute des élèves depuis l'onglet Utilisateurs.</span>
          </div>
        ) : !pointageScheduleId ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <span className="text-sm font-medium">
              Sélectionne un créneau (emploi du temps) pour activer le pointage.
            </span>
            {schedules.filter(s => s.classId === selectedClassId).length === 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Aucun créneau n'est défini pour cette classe. Crée d'abord des créneaux dans l'onglet Emplois du temps.
              </span>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Élève</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Matricule</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Note/Raison</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map(student => {
                  const existing = studentAttendances[student.id];
                  const att = existing || {
                    status: 'PRESENT',
                    note: '',
                    studentId: student.id,
                  };
                  const isSaved = !!(existing && existing.id);
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {student.firstName} {student.lastName}
                          </span>
                          {isSaved && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[9px] font-bold"
                              title="Pointage enregistré pour cette date"
                            >
                              <CheckCircle2 size={10} /> Enregistré
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {student.registrationNumber}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                          value={att.status}
                          onChange={e =>
                            setStudentAttendances(prev => ({
                              ...prev,
                              [student.id]: { ...att, status: e.target.value, studentId: student.id },
                            }))
                          }
                        >
                          {ATTENDANCE_STATUSES.map(s => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                          value={att.note || ''}
                          onChange={e =>
                            setStudentAttendances(prev => ({
                              ...prev,
                              [student.id]: { ...att, note: e.target.value, studentId: student.id },
                            }))
                          }
                          placeholder="Motif (optionnel)"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!existing) {
                                setStudentAttendances(prev => ({
                                  ...prev,
                                  [student.id]: { ...att, studentId: student.id },
                                }));
                              }
                              onSaveSingleStudentAttendance(student.id);
                            }}
                            disabled={submitting}
                            className="h-8 px-3 text-[10px] bg-bleu-600 hover:bg-bleu-700 text-white border-none flex items-center gap-1"
                            title="Enregistrer le pointage de cet élève"
                          >
                            <UserCheck size={12} />
                            {isSaved ? 'Mettre à jour' : 'Pointer'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onShowStudentHistory(student)}
                            className="h-8 px-3 text-[10px] flex items-center gap-1"
                            title="Voir l'historique de présence"
                          >
                            <HistoryIcon size={12} /> Historique
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    ) : (
      <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
        <div className="flex flex-wrap items-end gap-4 mb-3">
          <Input
            label="Date"
            type="date"
            value={pointageDate}
            onChange={e => setPointageDate(e.target.value)}
          />
          <Button
            onClick={onSaveTeacherAttendance}
            disabled={submitting}
            className="bg-bleu-600 hover:bg-bleu-700 h-11 border-none"
            title="Enregistrer tous les pointages saisis ci-dessous"
          >
            <Save size={16} className="mr-2" /> Enregistrer tous
          </Button>
          <Button onClick={onPrintTeacherReport} variant="outline" className="text-slate-600 h-11">
            <Printer size={16} className="mr-2" /> Rapport
          </Button>
        </div>

        <p className="text-[11px] text-gray-500 mb-4">
          Astuce : tu peux pointer chaque professeur individuellement d&egrave;s qu'il arrive avec
          le bouton <strong>Pointer</strong> sur sa ligne, ou tout enregistrer en bloc avec
          <strong> Enregistrer tous</strong>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10">
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professeur</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arrivée</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Départ</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Note/Raison</th>
                <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(teacher => {
                const existing = teacherAttendances[teacher.id];
                const att = existing || {
                  status: 'PRESENT',
                  checkInTime: '',
                  checkOutTime: '',
                  note: '',
                  teacherId: teacher.id,
                };
                const isSaved = !!(existing && existing.id);
                return (
                  <tr
                    key={teacher.id}
                    className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                        {isSaved && (
                          <span
                            title={`Pointé : ${att.checkInTime || '—'}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[9px] font-bold"
                          >
                            <CheckCircle2 size={10} /> Enregistré
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                        value={att.status}
                        onChange={e =>
                          setTeacherAttendances(prev => ({
                            ...prev,
                            [teacher.id]: { ...att, status: e.target.value, teacherId: teacher.id },
                          }))
                        }
                      >
                        {ATTENDANCE_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                        value={att.checkInTime || ''}
                        onChange={e =>
                          setTeacherAttendances(prev => ({
                            ...prev,
                            [teacher.id]: { ...att, checkInTime: e.target.value, teacherId: teacher.id },
                          }))
                        }
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                        value={att.checkOutTime || ''}
                        onChange={e =>
                          setTeacherAttendances(prev => ({
                            ...prev,
                            [teacher.id]: { ...att, checkOutTime: e.target.value, teacherId: teacher.id },
                          }))
                        }
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                        value={att.note || ''}
                        onChange={e =>
                          setTeacherAttendances(prev => ({
                            ...prev,
                            [teacher.id]: { ...att, note: e.target.value, teacherId: teacher.id },
                          }))
                        }
                        placeholder="Motif (optionnel)"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!existing) {
                              setTeacherAttendances(prev => ({
                                ...prev,
                                [teacher.id]: { ...att, teacherId: teacher.id },
                              }));
                            }
                            onSaveSingleTeacherAttendance(teacher.id);
                          }}
                          disabled={submitting}
                          className="h-8 px-3 text-[10px] bg-bleu-600 hover:bg-bleu-700 text-white border-none flex items-center gap-1"
                          title="Enregistrer le pointage de ce professeur"
                        >
                          <UserCheck size={12} />
                          {isSaved ? 'Mettre à jour' : 'Pointer'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onShowTeacherHistory(teacher)}
                          className="h-8 px-3 text-[10px] flex items-center gap-1"
                          title="Voir l'historique des pointages"
                        >
                          <HistoryIcon size={12} /> Historique
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    )}
  </motion.div>
);

export default PointageTab;
