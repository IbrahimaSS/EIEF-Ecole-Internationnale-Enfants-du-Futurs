// src/pages/manager/scolarite/components/modals/GradesModal.tsx
import React, { useMemo, useState } from 'react';
import { Award, BarChart3, BookOpen, Download, FileText, Loader2, Printer } from 'lucide-react';
import { Button, Card, Modal, Select } from '../../../../../components/ui';
import GradeBadge from '../GradeBadge';
import { GradeResponse, StudentResponse, SubjectResponse } from '../../types';

interface Props {
  isOpen: boolean;
  student: StudentResponse | null;
  grades: GradeResponse[];
  subjects: SubjectResponse[];
  loading: boolean;
  selectedSemester: string;
  onSelectSemester: (sem: string) => void;
  onClose: () => void;
  /** Imprime un bulletin pour une periode donnee (1..5). */
  onPrintBulletinPeriode?: (period: number) => void;
  /** Imprime un bulletin de fin d'annee. */
  onPrintBulletinAnnuel?: () => void;
  /** True pendant qu'on calcule le bulletin (lock UI). */
  bulletinLoading?: boolean;
}

const SEMESTER_OPTIONS_FULL = [
  { value: '',  label: 'Tous les semestres' },
  { value: '1', label: 'Semestre 1' },
  { value: '2', label: 'Semestre 2' },
  { value: '3', label: 'Semestre 3' },
  { value: '4', label: 'Semestre 4' },
  { value: '5', label: 'Semestre 5' },
];

const GradesModal: React.FC<Props> = ({
  isOpen,
  student,
  grades,
  subjects,
  loading,
  selectedSemester,
  onSelectSemester,
  onClose,
  onPrintBulletinPeriode,
  onPrintBulletinAnnuel,
  bulletinLoading = false,
}) => {
  const [bulletinPeriod, setBulletinPeriod] = useState<string>('1');
  const gradesBySubject = useMemo(
    () =>
      grades.reduce<Record<string, GradeResponse[]>>((acc, g) => {
        const key = g.subjectName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(g);
        return acc;
      }, {}),
    [grades],
  );

  const overallAvg = grades.length
    ? grades.reduce((s, g) => s + Number(g.value), 0) / grades.length
    : null;

  const exportCsv = () => {
    const rows = [
      ['Matière', 'Type', 'Note', 'Semestre', 'Date', 'Commentaire'],
      ...grades.map(g => [
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
    a.download = `releve_${student?.lastName}_${student?.firstName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600">
            <Award size={22} />
          </div>
          <div>
            <span className="font-bold gradient-bleu-or-text">Relevé de notes</span>
            <p className="text-[10px] text-gray-500 font-normal">
              {student?.firstName} {student?.lastName} • {student?.className}
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
            options={SEMESTER_OPTIONS_FULL}
            value={selectedSemester}
            onChange={e => onSelectSemester(e.target.value)}
          />
          {overallAvg !== null && (
            <div className="flex-1 flex justify-end">
              <div className="px-4 py-2 bg-gradient-to-r from-bleu-50 to-or-50 dark:from-bleu-900/20 dark:to-or-900/20 rounded-2xl text-center">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Moyenne générale
                </p>
                <GradeBadge value={overallAvg} />
              </div>
            </div>
          )}
        </div>

        {/* Infos élève */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Matricule', value: student?.registrationNumber },
            { label: 'Classe',    value: student?.className },
            {
              label: 'Semestres',
              value: grades.length
                ? Array.from(new Set(grades.map(g => g.semester).filter(Boolean))).join(', ')
                : '—',
            },
            { label: 'Matières', value: Object.keys(gradesBySubject).length || '—' },
          ].map(({ label, value }) => (
            <Card key={label} className="p-3 bg-gray-50 dark:bg-white/5 border-none">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {label}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{value || '—'}</p>
            </Card>
          ))}
        </div>

        {/* Notes par matière */}
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" /> Chargement des notes...
          </div>
        ) : grades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <BarChart3 size={36} className="opacity-20" />
            <span className="text-sm">Aucune note enregistrée pour cet élève.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(gradesBySubject).map(([subjectName, subjectGrades]) => {
              const subjectAvg =
                subjectGrades.reduce((s, g) => s + Number(g.value), 0) / subjectGrades.length;
              const coef = subjects.find(s => s.name === subjectName)?.coefficient ?? 1;
              return (
                <div
                  key={subjectName}
                  className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-bleu-100 dark:bg-bleu-900/30 flex items-center justify-center text-bleu-600">
                        <BookOpen size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {subjectName}
                        </p>
                        <p className="text-[9px] text-gray-400">
                          Coef. {coef} • {subjectGrades.length} évaluation
                          {subjectGrades.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 mb-1">Moyenne</p>
                      <GradeBadge value={subjectAvg} />
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {subjectGrades.map(g => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-transparent"
                      >
                        <div>
                          <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            {g.evaluationType || 'Évaluation'}
                          </p>
                          <p className="text-[9px] text-gray-400">
                            S{g.semester} •{' '}
                            {g.gradedAt
                              ? new Date(g.gradedAt).toLocaleDateString('fr-FR')
                              : '—'}
                          </p>
                          {g.comment && (
                            <p className="text-[9px] text-gray-400 italic">{g.comment}</p>
                          )}
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

        {/* Bulletins officiels (format EIEF) */}
        {(onPrintBulletinPeriode || onPrintBulletinAnnuel) && (
          <div className="border border-bleu-100 dark:border-bleu-900/30 bg-bleu-50/40 dark:bg-bleu-900/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-bleu-600" />
              <p className="text-sm font-bold text-bleu-700 dark:text-bleu-300">Bulletins officiels</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              {onPrintBulletinPeriode && (
                <>
                  <div className="w-40">
                    <Select
                      label="Periode"
                      options={[
                        { value: '1', label: 'Periode 1' },
                        { value: '2', label: 'Periode 2' },
                        { value: '3', label: 'Periode 3' },
                        { value: '4', label: 'Periode 4' },
                        { value: '5', label: 'Periode 5' },
                      ]}
                      value={bulletinPeriod}
                      onChange={e => setBulletinPeriod(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => onPrintBulletinPeriode(Number(bulletinPeriod))}
                    disabled={bulletinLoading}
                    className="h-11 bg-bleu-600 hover:bg-bleu-700 text-white border-none flex items-center gap-2"
                  >
                    {bulletinLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                    Bulletin de periode
                  </Button>
                </>
              )}
              {onPrintBulletinAnnuel && (
                <Button
                  onClick={onPrintBulletinAnnuel}
                  disabled={bulletinLoading}
                  variant="outline"
                  className="h-11 border-or-500 text-or-700 hover:bg-or-50 flex items-center gap-2"
                >
                  {bulletinLoading ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                  Bulletin annuel
                </Button>
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
              Les bulletins sont generes au format officiel EIEF (Republique de Guinee).
            </p>
          </div>
        )}

        {/* Actions impression */}
        <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1 h-12 flex items-center justify-center gap-2"
          >
            <Printer size={16} /> Apercu
          </Button>
          <Button
            variant="outline"
            onClick={exportCsv}
            className="flex-1 h-12 flex items-center justify-center gap-2"
          >
            <Download size={16} /> Exporter CSV
          </Button>
          <Button onClick={onClose} className="flex-1 h-12">
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GradesModal;
