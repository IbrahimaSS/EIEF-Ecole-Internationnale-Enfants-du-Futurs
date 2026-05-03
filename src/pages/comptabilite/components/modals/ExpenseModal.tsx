import React from 'react';
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
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-rouge-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="">Sélectionner une catégorie...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} {category.module ? `(${category.module})` : ''}
              </option>
            ))}
          </select>
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
            placeholder="Ex: Achat cantine, salaire, carburant..."
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
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              loading ||
              !formData.amount ||
              !formData.description.trim() ||
              !formData.expenseDate ||
              !formData.categoryId
            }
            className="flex-1"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
