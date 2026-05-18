import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight, Minus, Repeat, RefreshCw, CheckCircle2,
  AlertCircle, Loader2, GraduationCap, Users, Trophy, Sparkles,
} from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { apiRequest } from '../../services/api';
import {
  reassignmentService,
  type ReassignmentPlanResponse,
  type ReassignmentItem,
  type ReassignmentChange,
} from '../../services/reassignmentService';
import { cn } from '../../utils/cn';

interface BackendClass { id: string; name: string; level: string }

const SEMESTERS = [1, 2, 3, 4, 5] as const;

const CHANGE_LABEL: Record<ReassignmentChange, string> = {
  PROMOTED: 'Montée',
  DEMOTED: 'Rétrogradation',
  UNCHANGED: 'Inchangé',
  UNRANKED: 'Sans note',
};

const CHANGE_COLOR: Record<ReassignmentChange, string> = {
  PROMOTED: 'bg-vert-100 text-vert-700 dark:bg-vert-900/30 dark:text-vert-300 border-vert-200 dark:border-vert-800',
  DEMOTED: 'bg-rouge-100 text-rouge-700 dark:bg-rouge-900/30 dark:text-rouge-300 border-rouge-200 dark:border-rouge-800',
  UNCHANGED: 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border-gray-200 dark:border-white/10',
  UNRANKED: 'bg-or-100 text-or-700 dark:bg-or-900/30 dark:text-or-300 border-or-200 dark:border-or-800',
};

const Permutation: React.FC = () => {
  const [classes, setClasses] = useState<BackendClass[]>([]);
  const [level, setLevel] = useState<string>('');
  const [semester, setSemester] = useState<number>(1);
  const [plan, setPlan] = useState<ReassignmentPlanResponse | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({}); // studentId -> targetClassId
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Charge les classes au montage
  useEffect(() => {
    apiRequest<BackendClass[]>('/courses/classes')
      .then(data => setClasses(data ?? []))
      .catch(err => setError(err?.message ?? 'Impossible de charger les classes'));
  }, []);

  const levels = useMemo(() => {
    const set = new Set<string>();
    classes.forEach(c => { if (c.level) set.add(c.level); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [classes]);

  const previewPlan = async () => {
    if (!level) { setError('Choisis un niveau'); return; }
    setLoading(true); setError(null); setInfo(null);
    try {
      const result = await reassignmentService.preview(level, semester);
      setPlan(result);
      setOverrides({});
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors du calcul du plan');
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const applyPlan = async () => {
    if (!plan) return;
    if (!window.confirm(
      `Confirmer la permutation pour ${plan.items.length} eleve(s) du niveau "${plan.level}" ` +
      `(semestre ${plan.semester}) ? Cette operation modifie les classes des eleves.`
    )) return;

    setApplying(true); setError(null); setInfo(null);
    try {
      const items = plan.items.map(it => ({
        studentId: it.studentId,
        targetClassId: overrides[it.studentId] ?? it.targetClassId,
      }));
      const result = await reassignmentService.apply({
        level: plan.level,
        semester: plan.semester,
        items,
      });
      setPlan(result);
      setOverrides({});
      setInfo(`${items.length} affectation(s) appliquee(s) avec succes.`);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de l\'application');
    } finally {
      setApplying(false);
    }
  };

  // Calcul du compte par classe cible en tenant compte des overrides
  const adjustedCounts = useMemo(() => {
    if (!plan) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    plan.classes.forEach(c => { counts[c.classId] = 0; });
    plan.items.forEach(it => {
      const tgt = overrides[it.studentId] ?? it.targetClassId;
      counts[tgt] = (counts[tgt] ?? 0) + 1;
    });
    return counts;
  }, [plan, overrides]);

  // Tri des items : on respecte l'ordre du plan (deja trie par moyenne desc)
  const orderedItems: ReassignmentItem[] = plan?.items ?? [];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-or-100 dark:bg-or-900/30 rounded-2xl shadow-inner text-or-600">
            <Repeat size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Permutation par mérite
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Réaffecte les élèves entre les classes d'un même niveau selon leur moyenne du semestre
            </p>
          </div>
        </div>
      </div>

      {/* Sélecteurs */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Niveau</label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-or-500/40 focus:outline-none"
            >
              <option value="">Choisir un niveau...</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Semestre / Période</label>
            <select
              value={semester}
              onChange={e => setSemester(parseInt(e.target.value, 10))}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-or-500/40 focus:outline-none"
            >
              {SEMESTERS.map(s => <option key={s} value={s}>Semestre {s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end gap-3">
            <Button
              onClick={previewPlan}
              disabled={!level || loading}
              className="h-11 px-6 bg-or-600 hover:bg-or-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Prévisualiser
            </Button>
            {plan && (
              <Button
                onClick={applyPlan}
                disabled={applying}
                className="h-11 px-6 bg-vert-600 hover:bg-vert-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
              >
                {applying ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Appliquer
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rouge-50 text-rouge-700 border border-rouge-200 dark:bg-rouge-900/20 dark:text-rouge-300 dark:border-rouge-900/40 text-sm font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {info && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-vert-50 text-vert-700 border border-vert-200 dark:bg-vert-900/20 dark:text-vert-300 dark:border-vert-900/40 text-sm font-bold">
          <CheckCircle2 size={16} /> {info}
        </div>
      )}

      {plan && (
        <>
          {/* Bloc résumé des classes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plan.classes.map(c => {
              const target = adjustedCounts[c.classId] ?? c.targetCount;
              const overCap = c.capacity > 0 && target > c.capacity;
              return (
                <motion.div
                  key={c.classId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={cn('p-5', overCap && 'border-rouge-400 border-2')}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{plan.level}</p>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{c.name}</h3>
                      </div>
                      <div className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest',
                        c.rankOrder === 1 ? 'bg-or-100 text-or-700' : 'bg-gray-100 text-gray-600'
                      )}>
                        Rang {c.rankOrder}
                      </div>
                    </div>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{target}</span>
                      <span className="text-sm font-bold text-gray-400 mb-1">
                        / {c.capacity > 0 ? c.capacity : '∞'}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500">
                      Actuel : {c.currentCount} • Plan : {c.targetCount}
                    </p>
                    {overCap && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-rouge-600 mt-2">
                        ⚠ Dépassement de capacité
                      </p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Tableau des affectations */}
          <Card className="overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy size={18} className="text-or-500" />
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Plan de permutation ({orderedItems.length} élève{orderedItems.length > 1 ? 's' : ''})
                </h2>
              </div>
              <p className="text-[11px] text-gray-500 font-bold">
                Trié par moyenne décroissante. Les élèves sans note sont placés en fin de liste.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Élève</th>
                    <th className="px-4 py-3 text-left">Matricule</th>
                    <th className="px-4 py-3 text-center">Moyenne</th>
                    <th className="px-4 py-3 text-left">Classe actuelle</th>
                    <th className="px-4 py-3 text-left">→ Classe cible</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedItems.map((it, idx) => {
                    const tgt = overrides[it.studentId] ?? it.targetClassId;
                    return (
                      <tr key={it.studentId} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="px-4 py-3 font-black text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{it.studentName}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{it.registrationNumber}</td>
                        <td className="px-4 py-3 text-center">
                          {it.average !== null ? (
                            <span className="inline-flex items-center gap-1 font-black text-or-600">
                              {it.average.toFixed(2)}
                              <span className="text-[9px] text-gray-400">/ 20</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 uppercase">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{it.currentClassName ?? '—'}</td>
                        <td className="px-4 py-3">
                          <select
                            value={tgt}
                            onChange={e => setOverrides(prev => ({ ...prev, [it.studentId]: e.target.value }))}
                            className="h-8 px-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-xs font-bold focus:ring-2 focus:ring-or-500/40 focus:outline-none"
                          >
                            {plan.classes.map(c => (
                              <option key={c.classId} value={c.classId}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest',
                            CHANGE_COLOR[it.change]
                          )}>
                            {it.change === 'PROMOTED' && <ArrowUpRight size={12} />}
                            {it.change === 'DEMOTED' && <ArrowDownRight size={12} />}
                            {it.change === 'UNCHANGED' && <Minus size={12} />}
                            {it.change === 'UNRANKED' && <Sparkles size={12} />}
                            {CHANGE_LABEL[it.change]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {orderedItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400 font-bold">
                        Aucun élève dans ce niveau.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!plan && !loading && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm font-bold">Choisis un niveau et un semestre puis clique sur Prévisualiser.</p>
        </div>
      )}
    </div>
  );
};

export default Permutation;
