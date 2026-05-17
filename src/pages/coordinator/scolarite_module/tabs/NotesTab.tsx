// src/pages/manager/scolarite/tabs/NotesTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  FileText,
  GraduationCap,
  Loader2,
  Save,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Select,
  Table,
} from '../../../../components/ui';
import { cn } from '../../../../utils/cn';
import { SEMESTER_OPTIONS } from '../constants';
import {
  ClassResponse,
  EditableGradeRow,
  StudentResponse,
} from '../types';

interface Props {
  loading: boolean;
  classes: ClassResponse[];
  students: StudentResponse[];
  searchQuery: string;
  // Hook saisie de notes
  gradeClassId: string;
  setGradeClassId: (v: string) => void;
  gradeSubjectId: string;
  setGradeSubjectId: (v: string) => void;
  gradeSemester: string;
  setGradeSemester: (v: string) => void;
  gradeRows: EditableGradeRow[];
  gradeEntryLoading: boolean;
  gradeSaving: boolean;
  gradeClass: ClassResponse | null;
  gradeClassStudents: StudentResponse[];
  gradeSubjectOptions: Array<{ id: string; name: string }>;
  gradeAverage: number | null;
  filledGradesCount: number;
  onUpdateRow: (studentId: string, field: 'note' | 'appreciation', value: string) => void;
  onSaveGrades: () => void;
  // Filtres élèves pour la liste secondaire
  filteredStudents: StudentResponse[];
  onOpenGrades: (student: StudentResponse) => void;
}

const NotesTab: React.FC<Props> = ({
  loading,
  classes,
  students,
  searchQuery,
  gradeClassId,
  setGradeClassId,
  gradeSubjectId,
  setGradeSubjectId,
  gradeSemester,
  setGradeSemester,
  gradeRows,
  gradeEntryLoading,
  gradeSaving,
  gradeClass,
  gradeClassStudents,
  gradeSubjectOptions,
  gradeAverage,
  filledGradesCount,
  onUpdateRow,
  onSaveGrades,
  filteredStudents,
  onOpenGrades,
}) => {
  const studentColumns = [
    {
      key: 'lastName',
      label: 'Élève',
      sortable: true,
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
      key: 'isActive',
      label: 'Statut',
      render: (v: boolean) => (
        <Badge variant={v ? 'success' : 'default'}>{v ? 'Actif' : 'Inactif'}</Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: StudentResponse) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenGrades(row)}
          className="flex items-center gap-2 text-[10px] h-8 px-3"
        >
          <FileText size={13} /> Relevé de notes
        </Button>
      ),
    },
  ];

  return (
    <motion.div
      key="notes"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="space-y-6">
        {/* Sélecteurs */}
        <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
              <Select
                label="Classe"
                options={[
                  { value: '', label: 'Sélectionner une classe' },
                  ...classes.map(cls => ({ value: cls.id, label: cls.name })),
                ]}
                value={gradeClassId}
                onChange={e => setGradeClassId(e.target.value)}
              />
              <Select
                label="Matière"
                options={[
                  {
                    value: '',
                    label: gradeClassId
                      ? 'Sélectionner une matière'
                      : "Choisir une classe d'abord",
                  },
                  ...gradeSubjectOptions.map(s => ({ value: s.id, label: s.name })),
                ]}
                value={gradeSubjectId}
                onChange={e => setGradeSubjectId(e.target.value)}
              />
              <Select
                label="Semestre"
                options={SEMESTER_OPTIONS}
                value={gradeSemester}
                onChange={e => setGradeSemester(e.target.value)}
              />
            </div>
            <Button
              onClick={onSaveGrades}
              disabled={!gradeClassId || !gradeSubjectId || gradeSaving || gradeEntryLoading}
              className="h-11 px-6 bg-bleu-600 border-none text-white shadow-lg shadow-bleu-600/20 flex items-center gap-2"
            >
              {gradeSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Enregistrer les notes
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-gray-500">
            <span className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 font-semibold">
              Classe: {gradeClass?.name || '—'}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 font-semibold">
              Élèves: {gradeClassStudents.length}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 font-semibold">
              Notes saisies: {filledGradesCount}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 font-semibold">
              Moyenne: {gradeAverage !== null ? `${gradeAverage.toFixed(2)}/20` : '—'}
            </span>
          </div>
        </Card>

        {/* Tableau de saisie */}
        <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
          {loading || gradeEntryLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm font-medium">Chargement des notes...</span>
            </div>
          ) : !gradeClassId || !gradeSubjectId ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <ClipboardList size={40} className="opacity-20" />
              <span className="text-sm font-medium">
                Sélectionnez une classe et une matière pour saisir les notes.
              </span>
            </div>
          ) : gradeRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <GraduationCap size={40} className="opacity-20" />
              <span className="text-sm font-medium">Aucun élève trouvé pour cette classe.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Élève</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Matricule</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Note /20</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Appréciation</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {gradeRows
                    .filter(row =>
                      searchQuery
                        ? `${row.studentName} ${row.registrationNumber}`
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        : true,
                    )
                    .map(row => {
                      const currentStudent = students.find(s => s.id === row.studentId) ?? null;
                      const noteValue = Number(row.note);
                      const noteIsLow =
                        row.note !== '' && !Number.isNaN(noteValue) && noteValue < 10;
                      const noteIsSet = row.note !== '' && !Number.isNaN(noteValue);
                      return (
                        <tr key={row.studentId} className="bg-white dark:bg-transparent">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={row.studentName} size="sm" />
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {row.studentName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {row.registrationNumber}
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={row.note}
                              onChange={e => onUpdateRow(row.studentId, 'note', e.target.value)}
                              className={cn(
                                'h-10 max-w-[110px] mx-auto text-center font-black',
                                noteIsLow && 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/10',
                                noteIsSet &&
                                  !noteIsLow &&
                                  'text-bleu-600 bg-bleu-50 border-bleu-200 dark:bg-bleu-900/10',
                              )}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="text"
                              value={row.appreciation}
                              onChange={e =>
                                onUpdateRow(row.studentId, 'appreciation', e.target.value)
                              }
                              placeholder="Commentaire de la scolarité"
                              className="h-10 w-full"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => currentStudent && onOpenGrades(currentStudent)}
                                disabled={!currentStudent}
                                className="h-8 px-3 text-[10px] flex items-center gap-2"
                              >
                                <FileText size={13} /> Relevé
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

        {/* Liste secondaire des élèves */}
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
      </div>
    </motion.div>
  );
};

export default NotesTab;
