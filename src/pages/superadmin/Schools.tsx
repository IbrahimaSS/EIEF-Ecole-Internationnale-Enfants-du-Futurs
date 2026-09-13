import React, { useState } from 'react';
import { AlertCircle, Building2, Globe, Mail, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Modal, Table } from '../../components/ui';
import { useSchools } from '../../hooks/useSchools';
import {
  SUBDOMAIN_PATTERN,
  SchoolProfileRequest,
  SchoolResponse,
  SchoolStatus,
} from '../../services/platformService';

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

const EMPTY_FORM = {
  name: '',
  subdomain: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  shortName: '',
  slogan: '',
  contactEmail: '',
  phone: '',
  phoneSecondary: '',
  address: '',
  facebookUrl: '',
};

const PROFILE_FIELDS: Array<{ field: keyof typeof EMPTY_FORM; key: keyof SchoolProfileRequest }> = [
  { field: 'shortName', key: 'shortName' },
  { field: 'slogan', key: 'slogan' },
  { field: 'contactEmail', key: 'email' },
  { field: 'phone', key: 'phone' },
  { field: 'phoneSecondary', key: 'phoneSecondary' },
  { field: 'address', key: 'address' },
  { field: 'facebookUrl', key: 'facebookUrl' },
];

const profileOf = (form: typeof EMPTY_FORM): SchoolProfileRequest =>
  PROFILE_FIELDS.reduce<SchoolProfileRequest>((profile, { field, key }) => {
    const value = form[field].trim();
    return value ? { ...profile, [key]: value } : profile;
  }, {});

const SuperAdminSchools: React.FC = () => {
  const { schools, pendingAdminSchoolIds, loading, error, refetch, registerSchool, resendAdminCredentials } =
    useSchools();
  const [resendingSchoolId, setResendingSchoolId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const setField = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Le nom de l'école est obligatoire.";
    if (!SUBDOMAIN_PATTERN.test(form.subdomain)) {
      return 'Le sous-domaine doit faire 3 à 30 caractères, en minuscules, et commencer par une lettre.';
    }
    if (!form.adminEmail.trim()) return "L'e-mail du directeur est obligatoire.";
    if (!form.adminFirstName.trim() || !form.adminLastName.trim()) {
      return 'Le prénom et le nom du directeur sont obligatoires.';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const created = await registerSchool({
        name: form.name.trim(),
        subdomain: form.subdomain.trim(),
        admin: {
          email: form.adminEmail.trim(),
          firstName: form.adminFirstName.trim(),
          lastName: form.adminLastName.trim(),
        },
        profile: profileOf(form),
      });
      toast.success(`École « ${created.name} » enregistrée sur ${created.subdomain}.`, {
        description: `Les identifiants du directeur ont été envoyés à ${form.adminEmail.trim()}.`,
      });
      closeModal();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "L'enregistrement a échoué.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (school: SchoolResponse) => {
    setResendingSchoolId(school.id);
    try {
      const resent = await resendAdminCredentials(school.id);
      toast.success(`Nouveaux identifiants envoyés à ${resent.recipients.join(', ')}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Le renvoi des identifiants a échoué.");
    } finally {
      setResendingSchoolId(null);
    }
  };

  const columns = [
    {
      key: 'name' as keyof SchoolResponse,
      label: 'École',
      sortable: true,
      render: (value: string, row: SchoolResponse) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bleu-500/10">
            <Building2 className="h-4 w-4 text-bleu-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="font-mono text-xs text-gray-500">{row.schemaName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subdomain' as keyof SchoolResponse,
      label: 'Adresse',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 dark:text-gray-300">
          <Globe className="h-3.5 w-3.5" />
          {value}
        </span>
      ),
    },
    {
      key: 'status' as keyof SchoolResponse,
      label: 'Statut',
      sortable: true,
      render: (value: SchoolStatus, row: SchoolResponse) => (
        <div>
          <Badge variant={STATUS_VARIANT[value]}>{STATUS_LABEL[value]}</Badge>
          {row.provisioningError && (
            <p className="mt-1 max-w-xs text-xs text-red-600" title={row.provisioningError}>
              {row.provisioningError}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'id' as keyof SchoolResponse,
      label: 'Directeur',
      render: (_value: string, row: SchoolResponse) => {
        if (row.status !== 'ACTIVE') {
          return <span className="text-xs text-gray-400">—</span>;
        }
        return pendingAdminSchoolIds.has(row.id) ? (
          <Button
            variant="outline"
            size="sm"
            loading={resendingSchoolId === row.id}
            disabled={resendingSchoolId !== null}
            onClick={() => void handleResend(row)}
          >
            <Mail className="h-4 w-4" />
            Renvoyer les identifiants
          </Button>
        ) : (
          <span className="text-xs text-gray-500">Compte activé</span>
        );
      },
    },
    {
      key: 'createdAt' as keyof SchoolResponse,
      label: 'Créée le',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {new Date(value).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {schools.length} école{schools.length > 1 ? 's' : ''} hébergée
          {schools.length > 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle école
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      <Card>
        <Table data={schools as any} columns={columns as any} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Enregistrer une école" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom de l'école"
              placeholder="École Internationale de Kipé"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
            />
            <Input
              label="Sous-domaine"
              placeholder="kipe"
              helper="L'école sera joignable sur cette adresse."
              value={form.subdomain}
              onChange={(e) => setField('subdomain', e.target.value.toLowerCase())}
            />
          </div>

          <div className="border-t border-gray-100 pt-5 dark:border-white/10">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Compte du directeur
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Prénom"
                value={form.adminFirstName}
                onChange={(e) => setField('adminFirstName', e.target.value)}
              />
              <Input
                label="Nom"
                value={form.adminLastName}
                onChange={(e) => setField('adminLastName', e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="E-mail"
                  type="email"
                  helper="Un mot de passe temporaire y sera envoyé."
                  value={form.adminEmail}
                  onChange={(e) => setField('adminEmail', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 dark:border-white/10">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Identité de l'école — facultatif
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nom court"
                placeholder="KIPÉ"
                value={form.shortName}
                onChange={(e) => setField('shortName', e.target.value)}
              />
              <Input
                label="Slogan"
                value={form.slogan}
                onChange={(e) => setField('slogan', e.target.value)}
              />
              <Input
                label="E-mail de contact"
                type="email"
                helper="Par défaut, celui du directeur."
                value={form.contactEmail}
                onChange={(e) => setField('contactEmail', e.target.value)}
              />
              <Input
                label="Adresse"
                placeholder="Quartier, commune, ville"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
              />
              <Input
                label="Téléphone"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
              />
              <Input
                label="Téléphone secondaire"
                value={form.phoneSecondary}
                onChange={(e) => setField('phoneSecondary', e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Page Facebook"
                  type="url"
                  placeholder="https://www.facebook.com/..."
                  value={form.facebookUrl}
                  onChange={(e) => setField('facebookUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              Enregistrer l'école
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminSchools;
