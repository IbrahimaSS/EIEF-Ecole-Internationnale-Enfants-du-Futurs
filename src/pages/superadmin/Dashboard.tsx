import React from 'react';
import { AlertCircle, Building2, GraduationCap, RefreshCw, Users } from 'lucide-react';
import { Badge, Button, Card, LoadingScreen, StatCard, Table } from '../../components/ui';
import { useSchoolsOverview } from '../../hooks/useSchools';
import { SchoolOverviewResponse, SchoolStatus } from '../../services/platformService';

const STATUS_VARIANT: Record<SchoolStatus, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  PROVISIONING: 'warning',
  FAILED: 'error',
};

const STATUS_LABEL: Record<SchoolStatus, string> = {
  ACTIVE: 'Active',
  PROVISIONING: 'En cours',
  FAILED: 'Échec',
};

const sum = (rows: SchoolOverviewResponse[], field: keyof SchoolOverviewResponse): number =>
  rows.reduce((total, row) => total + (row[field] as number), 0);

const SuperAdminDashboard: React.FC = () => {
  const { overview, loading, error, refetch } = useSchoolsOverview();

  if (loading && overview.length === 0) {
    return <LoadingScreen message="Chargement de la plateforme..." />;
  }

  const activeCount = overview.filter((school) => school.status === 'ACTIVE').length;
  const failedCount = overview.filter((school) => school.status === 'FAILED').length;

  const columns = [
    {
      key: 'name' as keyof SchoolOverviewResponse,
      label: 'École',
      sortable: true,
      render: (value: string, row: SchoolOverviewResponse) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="font-mono text-xs text-gray-500">{row.subdomain}</p>
        </div>
      ),
    },
    {
      key: 'status' as keyof SchoolOverviewResponse,
      label: 'Statut',
      sortable: true,
      render: (value: SchoolStatus) => (
        <Badge variant={STATUS_VARIANT[value]}>{STATUS_LABEL[value]}</Badge>
      ),
    },
    { key: 'studentCount' as keyof SchoolOverviewResponse, label: 'Élèves', sortable: true },
    { key: 'teacherCount' as keyof SchoolOverviewResponse, label: 'Enseignants', sortable: true },
    { key: 'userCount' as keyof SchoolOverviewResponse, label: 'Comptes', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Card>
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Écoles actives"
          value={String(activeCount)}
          subtitle={failedCount > 0 ? `${failedCount} en échec` : 'Aucun incident'}
          icon={<Building2 className="h-5 w-5" />}
          color={failedCount > 0 ? 'rouge' : 'bleu'}
        />
        <StatCard
          title="Élèves"
          value={String(sum(overview, 'studentCount'))}
          subtitle="Toutes écoles confondues"
          icon={<GraduationCap className="h-5 w-5" />}
          color="vert"
        />
        <StatCard
          title="Enseignants"
          value={String(sum(overview, 'teacherCount'))}
          subtitle="Toutes écoles confondues"
          icon={<Users className="h-5 w-5" />}
          color="or"
        />
        <StatCard
          title="Comptes"
          value={String(sum(overview, 'userCount'))}
          subtitle="Toutes écoles confondues"
          icon={<Users className="h-5 w-5" />}
          color="bleu"
        />
      </div>

      <Card>
        <Table data={overview as any} columns={columns as any} />
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
