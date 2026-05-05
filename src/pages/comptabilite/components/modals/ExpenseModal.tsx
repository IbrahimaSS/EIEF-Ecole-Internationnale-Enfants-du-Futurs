import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Input, Modal } from '../../../../components/ui';
import { ExpenseCategoryResponse, ExpensePayload } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategoryResponse[];
  formData: ExpensePayload;
  loading: boolean;
  onChange: (next: ExpensePayload) => void;
  onSubmit: () => void;
}

const ExpenseModal: React.FC<Props> = ({
  categories,
  formData,
  isOpen,
  loading,
  onChange,
  onClose,
  onSubmit,
}) => {
  // Validation détaillée pour afficher exactement ce qui manque
  const missing: string[] = [];
  if (!formData.categoryId) missing.push('Catégorie');
  if (!formData.description.trim()) missing.push('Description');
  if (!formData.amount || formData.amount <= 0) missing.push('Montant');
  if (!formData.expenseDate) missing.push('Date');

  const canSubmit = missing.length === 0 && !loading;

  // Groupement des catégories par module pour faciliter la lecture
  const categoriesByModule = React.useMemo(() => {
    const groups: Record<string, ExpenseCategoryResponse[]> = {};
    for (const cat of categories) {
      const key = cat.module || 'Autres';
      if (!groups[key]) groups[key] = [];
      groups[key].push(cat);
    }
    return groups;
  }, [categories]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle dépense">
      <div className="space-y-4 p-1">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Catégorie *
          </label>
          <select
            value={formData.categoryId ?? ''}
            onChange={(event) =>
              onChange({
                ...formData,
                categoryId: event.target.value ? Number(event.target.value) : null,
              })
            }
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 outline-none transition-all focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-or-400"
          >
            <option value="">Sélectionner une catégorie...</option>
            {Object.entries(categoriesByModule).map(([module, cats]) => (
              <optgroup key={module} label={module}>
                {cats.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1 text-[10px] font-bold text-or-600">
              Aucune catégorie disponible — créez-en depuis l'administration.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Description *
          </label>
          <Input
            value={formData.description}
            onChange={(event) =>
              onChange({ ...formData, description: event.target.value })
            }
            placeholder="Ex: Achat cantine, salaire prof, carburant bus..."
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Montant (GNF) *
            </label>
            <Input
              type="number"
              value={formData.amount || ''}
              onChange={(event) =>
                onChange({ ...formData, amount: Number(event.target.value) })
              }
              placeholder="0"
              min={0}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Date *
            </label>
            <Input
              type="date"
              value={formData.expenseDate}
              onChange={(event) =>
                onChange({ ...formData, expenseDate: event.target.value })
              }
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="mt-1 text-[10px] font-bold text-gray-400">
              Date à laquelle la dépense a été engagée.
            </p>
          </div>
        </div>

        {/* Erreurs de validation visibles */}
        {missing.length > 0 && (
          <div className="flex items-start gap-2 rounded-2xl border border-or-200 bg-or-50 px-3 py-2 text-or-800 dark:border-or-500/30 dark:bg-or-500/10 dark:text-or-200">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <div className="text-[11px] font-bold leading-relaxed">
              Champs manquants : {missing.join(', ')}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit} className="flex-1">
            {loading ? 'Enregistrement...' : 'Enregistrer la dépense'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
