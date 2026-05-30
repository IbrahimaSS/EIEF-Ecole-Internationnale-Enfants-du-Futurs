import React from 'react';
import { Users, Loader2 } from 'lucide-react';
import { Table, Badge, Card } from '../../../../components/ui';
import { formatCurrency } from '../utils';

interface FamilyStatusOverviewProps {
  data: Array<{ parent: any; status: any }>;
  loading: boolean;
  onSelectFamily: (parent: any) => void;
}

const FamilyStatusOverview: React.FC<FamilyStatusOverviewProps> = ({
  data,
  loading,
  onSelectFamily,
}) => {
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-bleu-600" size={32} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
        <Users size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm font-bold">Aucune famille à afficher.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
      <Table
        data={data}
        columns={[
          {
            key: 'family',
            label: 'Famille',
            render: (_: any, row: any) => (
              <div className="text-left">
                <p className="font-bold text-gray-900">
                  Famille {row.parent.lastName}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {row.parent.firstName} {row.parent.address ? `• ${row.parent.address}` : ''}
                </p>
              </div>
            ),
          },
          {
            key: 'children',
            label: 'Enfants',
            render: (_: any, row: any) => (
              <span className="text-xs font-black text-gray-700">
                {row.status.students?.length ?? 0}
              </span>
            ),
          },
          {
            key: 'paid',
            label: 'Versé',
            render: (_: any, row: any) => (
              <span className="text-xs font-black text-vert-600">
                {formatCurrency(row.status.totalPaid)}
              </span>
            ),
          },
          {
            key: 'remaining',
            label: 'Restant',
            render: (_: any, row: any) => (
              <span
                className={`text-xs font-black ${
                  row.status.totalRemaining > 0 ? 'text-rouge-600' : 'text-gray-400'
                }`}
              >
                {formatCurrency(row.status.totalRemaining)}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Statut',
            render: (_: any, row: any) =>
              row.status.totalRemaining <= 0 ? (
                <Badge variant="success">Soldé</Badge>
              ) : row.status.hasOverdue ? (
                <Badge variant="error">{row.status.overdueCount} en retard</Badge>
              ) : (
                <Badge variant="warning">En cours</Badge>
              ),
          },
          {
            key: 'actions',
            label: '',
            render: (_: any, row: any) => (
              <div className="flex justify-end pr-2">
                <button
                  onClick={() => onSelectFamily(row.parent)}
                  className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-bleu-600 hover:bg-bleu-50 rounded-xl transition-colors"
                >
                  Voir / Payer
                </button>
              </div>
            ),
          },
        ] as any}
      />
    </Card>
  );
};

export default FamilyStatusOverview;
