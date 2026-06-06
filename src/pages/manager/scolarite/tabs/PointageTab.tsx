// src/pages/manager/scolarite/tabs/PointageTab.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  GraduationCap,
  History as HistoryIcon,
  Printer,
  QrCode,
  Save,
  UserCheck,
  Users,
} from 'lucide-react';
import { Button, Card, Input, Select } from '../../../../components/ui';
import { cn } from '../../../../utils/cn';
import QrScannerModal, { ScannerMode } from '../../../../components/shared/QrScannerModal';
import LiveAttendanceBoard from '../../../../components/shared/LiveAttendanceBoard';
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
}) => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerMode: ScannerMode = activePointageTab === 'professeurs' ? 'professeur' : 'eleve';

  const pointageModes = [
    {
      id: 'live' as PointageTabId,
      label: 'Temps réel',
      description: 'Flux live des scans QR du jour avec auto-rafraîchissement.',
      icon: Activity,
      accentClassName: 'bg-cyan-500 text-white shadow-[0_18px_35px_-20px_rgba(6,182,212,0.85)]',
    },
    {
      id: 'eleves' as PointageTabId,
      label: 'Élèves',
      description: 'Appel par classe et par créneau avec sauvegarde rapide.',
      icon: Users,
      accentClassName: 'bg-bleu-600 text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.85)]',
    },
    {
      id: 'professeurs' as PointageTabId,
      label: 'Professeurs',
      description: 'Suivi des arrivées, départs et historiques d\'équipe.',
      icon: GraduationCap,
      accentClassName: 'bg-emerald-500 text-white shadow-[0_18px_35px_-20px_rgba(16,185,129,0.85)]',
    },
  ];

  const activeMode = pointageModes.find(mode => mode.id === activePointageTab) ?? pointageModes[0];

  return (
    <>
    <QrScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} mode={scannerMode} />
    <motion.div
      key="pointage"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Bouton scan QR */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Pointage manuel ou par QR code
        </p>
        <Button
          onClick={() => setScannerOpen(true)}
          className={`border-none text-white h-10 px-4 flex items-center gap-2 ${
            scannerMode === 'professeur'
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
        >
          <QrCode size={15} />
          {scannerMode === 'professeur' ? 'Scanner carte professeur' : 'Scanner carte élève'}
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {pointageModes.map(({ id, label, description, icon: Icon, accentClassName }) => {
            const isActive = activePointageTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActivePointageTab(id)}
                className={cn(
                  'rounded-[1.6rem] border p-4 text-left transition-all duration-300',
                  isActive
                    ? 'border-slate-200 bg-white shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-900/60'
                    : 'border-slate-200/80 bg-white/75 hover:border-bleu-200 hover:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-white/20 dark:hover:bg-slate-900/60',
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', accentClassName)}>
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                      {label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">
                      {description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Vue active
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {activeMode.label}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">
            {activeMode.description}
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-bleu-500" />
            Date du suivi : {pointageDate}
          </div>
        </div>
      </div>

      {activePointageTab === 'live' ? (
        <Card className="border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
          <LiveAttendanceBoard />
        </Card>
      ) : activePointageTab === 'eleves' ? (
        <Card className="border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
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
        <Card className="border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
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
    </>
  );
};

export default PointageTab;
