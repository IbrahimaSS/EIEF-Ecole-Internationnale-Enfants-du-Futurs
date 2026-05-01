// src/pages/manager/scolarite/components/modals/DeleteConfirmModal.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Modal } from '../../../../../components/ui';
import { DeleteTarget } from '../../types';

interface Props {
  target: DeleteTarget | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<Props> = ({ target, onCancel, onConfirm }) => (
  <Modal
    isOpen={!!target}
    onClose={onCancel}
    title={
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
          <Trash2 size={22} />
        </div>
        <span className="font-bold text-red-600">Confirmer la suppression</span>
      </div>
    }
    size="sm"
  >
    <div className="text-left space-y-6 py-2">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer le créneau <strong>{target?.label}</strong> ?
        Cette action est irréversible.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onCancel} className="flex-1 h-12">
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 h-12 bg-red-600 hover:bg-red-700 border-none shadow-lg"
        >
          Supprimer
        </Button>
      </div>
    </div>
  </Modal>
);

export default DeleteConfirmModal;
