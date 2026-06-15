import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Building2,
  History,
  Save,
  RefreshCw,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  UploadCloud,
  Loader2,
  XCircle,
  Filter,
  Eye,
  Info,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Card, Badge, Button, Input, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAdminSettings, useAuditLogs, useBackup, SETTING_KEYS } from '../../hooks/useAdminSettings';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers : normalise les champs AuditLog selon ce que le backend peut renvoyer
// ─────────────────────────────────────────────────────────────────────────────
const getLogLabel = (log: any): string =>
  log.utilisateur ?? log.performedBy ?? log.userName ?? '—';

const getLogDate = (log: any): string => {
  const rawDate = log.date ?? log.createdAt ?? log.timestamp ?? '—';
  if (rawDate === '—') return rawDate;
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(d);
  } catch (e) {
    return rawDate;
  }
};

const getLogStatus = (log: any): string =>
  log.statut ?? log.status ?? 'Confirmé';

const getLogModule = (log: any): string =>
  log.module ?? log.moduleName ?? '—';

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────
const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'systeme' | 'securite' | 'donnees' | 'logs'>('systeme');

  // ── Settings ──
  const { getValue, loading: settingsLoading, saving, error: settingsError, saveChanges, load: reloadSettings } =
    useAdminSettings();

  // Champs locaux (état contrôlé du formulaire)
  const [fields, setFields] = useState<Record<string, string>>({});

  // Initialise les champs depuis le backend dès que les settings sont chargés
  // On utilise une ref pour éviter d'écraser les modifications utilisateur
  const [initialized, setInitialized] = useState(false);
  // Dans AdminSettings.tsx, les imports restent identiques.
// La seule modification : s'assurer que useEffect utilise bien load() et pas
// une initialisation directe. Remplacer le useEffect d'initialisation par :

React.useEffect(() => {
  if (!settingsLoading && !initialized) {
    setFields({
      [SETTING_KEYS.NOM_ETABLISSEMENT]: getValue(SETTING_KEYS.NOM_ETABLISSEMENT, 'Écoles Internationales Enfants du Futur'),
      [SETTING_KEYS.SLOGAN]:            getValue(SETTING_KEYS.SLOGAN,            'Faisons Plus !'),
      [SETTING_KEYS.EMAIL]:             getValue(SETTING_KEYS.EMAIL,             'admin@eief.edu.gn'),
      [SETTING_KEYS.TELEPHONE]:         getValue(SETTING_KEYS.TELEPHONE,         '+224 622 00 00 00'),
    });
    setInitialized(true);
  }
  // Réinitialiser le flag si on recharge (ex: bouton Réinitialiser)
}, [settingsLoading, initialized, getValue]);

  const handleField = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }));

  // ── Sauvegarde ──
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await saveChanges(fields);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Erreur lors de la sauvegarde.');
    }
  };

  const handleReset = () => {
    setInitialized(false);
    reloadSettings();
  };

  // ── Sauvegarde Système ──
  const { status: backupStatus, loading: backupLoading, backingUp, error: backupError, triggerBackup } = useBackup();


  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-soft">
            <SettingsIcon className="text-gray-900 dark:text-or-500" size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight uppercase">Administration</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Configuration système et sécurité</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Feedback sauvegarde */}
          <AnimatePresence>
            {saveSuccess && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-vert-600 dark:text-vert-400 text-[11px] font-bold uppercase tracking-widest"
              >
                <CheckCircle2 size={16} /> Enregistré
              </motion.span>
            )}
            {saveError && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-rouge-600 dark:text-rouge-400 text-[11px] font-bold uppercase tracking-widest"
              >
                <XCircle size={16} /> {saveError}
              </motion.span>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving || settingsLoading}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[11px] font-bold uppercase tracking-widest px-6 h-12 rounded-[1rem] hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
          >
            <RefreshCw size={18} className={settingsLoading ? 'animate-spin' : ''} />
            Réinitialiser
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving || settingsLoading}
            className="flex gap-2 bg-gradient-to-r from-or-600 to-or-400 text-gray-900 shadow-lg shadow-or-500/20 border-none font-bold uppercase tracking-widest text-[11px] h-12 px-8 rounded-[1rem] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:scale-100"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Erreur globale settings */}
      <AnimatePresence>
        {settingsError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-rouge-50 dark:bg-rouge-900/10 border border-rouge-100 dark:border-rouge-900/20 rounded-2xl text-rouge-600 dark:text-rouge-400 text-[11px] font-bold uppercase tracking-widest"
          >
            <AlertTriangle size={16} />
            {settingsError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* NAV SIDEBAR */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 'systeme', label: 'Établissement', icon: Building2 },
            { id: 'securite', label: 'Sécurité & Accès', icon: Shield },
            { id: 'donnees', label: 'Gestion Données', icon: Database },
            { id: 'logs', label: "Logs d'Audit", icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'w-full flex items-center gap-4 px-6 py-4 rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest transition-all',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-or-500 to-or-400 text-gray-900 shadow-lg shadow-or-500/20'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300',
              )}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENU */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">

            {/* ── ÉTABLISSEMENT ── */}
            {activeTab === 'systeme' && (
              <motion.div
                key="systeme"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold gradient-bleu-or-text tracking-tight uppercase">Établissement</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Informations publiques de l'école</p>
                  </div>

                  {settingsLoading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Chargement…</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                              Nom de l'établissement
                            </label>
                            <Input
                              value={fields[SETTING_KEYS.NOM_ETABLISSEMENT] ?? ''}
                              onChange={handleField(SETTING_KEYS.NOM_ETABLISSEMENT)}
                              className="w-full h-12 rounded-2xl border-gray-100 dark:border-white/10 dark:bg-white/5 font-bold"
                            />
                          </div>
                          <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                              Slogan / Devise
                            </label>
                            <Input
                              value={fields[SETTING_KEYS.SLOGAN] ?? ''}
                              onChange={handleField(SETTING_KEYS.SLOGAN)}
                              className="w-full h-12 rounded-2xl border-gray-100 dark:border-white/10 dark:bg-white/5 font-semibold italic text-bleu-600 dark:text-or-400"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-black/20 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 relative group cursor-pointer hover:border-or-400 dark:hover:border-or-500/50 hover:bg-or-50/50 dark:hover:bg-or-950/20 transition-all">
                          <div className="w-28 h-28 bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-2 overflow-hidden mb-4 group-hover:scale-110 transition-transform">
                            <img src="/logo_eief.jpeg" alt="Logo" className="w-full h-full object-contain" />
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <UploadCloud size={14} /> Logo Principal
                          </p>
                        </div>
                      </div>

                      <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-8" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                            Email Administratif
                          </label>
                          <Input
                            type="email"
                            value={fields[SETTING_KEYS.EMAIL] ?? ''}
                            onChange={handleField(SETTING_KEYS.EMAIL)}
                            className="w-full h-12 rounded-2xl border-gray-100 dark:border-white/10 dark:bg-white/5 font-semibold"
                          />
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                            Téléphone
                          </label>
                          <Input
                            type="text"
                            value={fields[SETTING_KEYS.TELEPHONE] ?? ''}
                            onChange={handleField(SETTING_KEYS.TELEPHONE)}
                            className="w-full h-12 rounded-2xl border-gray-100 dark:border-white/10 dark:bg-white/5 font-semibold"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            )}

            {/* ── SÉCURITÉ ── */}
            {activeTab === 'securite' && (
              <motion.div
                key="securite"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="p-8 border-none shadow-soft space-y-6 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold gradient-bleu-or-text tracking-tight uppercase">Sécurité et Accès</h2>
                  </div>

                  {/* 2FA — toggle géré par setting TWO_FA_ENABLED */}
                  <TwoFaRow getValue={getValue} saveChanges={saveChanges} />

                  <div className="flex w-full items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10 hover:border-bleu-200 dark:hover:border-bleu-500/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-bleu-100 dark:bg-bleu-900/20 text-bleu-600 dark:text-bleu-400 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                        <UserCheck size={28} />
                      </div>
                      <div className="text-left font-bold">
                        <h4 className="text-gray-900 dark:text-white uppercase tracking-tight">Gestion des Rôles</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 tracking-widest">Définissez qui peut accéder à quoi (8 rôles définis).</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-400 group-hover:text-bleu-600 dark:group-hover:text-bleu-400 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── DONNÉES ── */}
            {activeTab === 'donnees' && (
              <motion.div
                key="donnees"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="p-8 border-none shadow-soft space-y-6 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold gradient-bleu-or-text tracking-tight uppercase">Sauvegarde & Données</h2>
                  </div>

                  {backupError && (
                    <div className="flex items-center gap-3 p-4 bg-rouge-50 dark:bg-rouge-900/10 border border-rouge-100 rounded-2xl text-rouge-600 text-[11px] font-bold uppercase tracking-widest">
                      <AlertTriangle size={16} />
                      {backupError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 p-8 bg-vert-50 dark:bg-vert-900/10 rounded-[2rem] border border-vert-100 dark:border-vert-900/20 flex flex-col items-center justify-center text-center space-y-4 h-full">
                      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", 
                        backingUp ? "bg-or-100 text-or-600 animate-pulse" : "bg-vert-100 dark:bg-vert-900/30 text-vert-600"
                      )}>
                        {backingUp ? <Loader2 size={32} className="animate-spin" /> : <Database size={32} />}
                      </div>
                      <div className="font-bold">
                        <p className="text-gray-900 dark:text-white uppercase tracking-tight text-lg">
                          {backingUp ? "Sauvegarde en cours..." : (backupStatus?.status || "Système à jour")}
                        </p>
                        <p className="text-[11px] text-vert-600 dark:text-vert-400 uppercase tracking-widest mt-1">
                          {backupLoading ? "Chargement..." : 
                            backupStatus?.lastBackupDate ? 
                            `Dernière sauvegarde : ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(backupStatus.lastBackupDate))}` : 
                            "Aucune sauvegarde récente"
                          }
                        </p>
                      </div>
                      <Button 
                        onClick={triggerBackup}
                        disabled={backingUp || backupLoading}
                        className="mt-4 bg-vert-600 text-white font-bold uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-vert-600/20 hover:bg-vert-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                      >
                        {backingUp ? "Sauvegarde..." : "Lancer une sauvegarde"}
                      </Button>
                    </div>

                    <div className="lg:col-span-2">
                      <BackupHistoryTable />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── LOGS ── */}
            {activeTab === 'logs' && (
              <AuditLogsTab />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant : Historique des sauvegardes
// ─────────────────────────────────────────────────────────────────────────────
const BackupHistoryTable: React.FC = () => {
  const { logs, loading } = useAuditLogs();
  
  const backupLogs = logs.filter(log => log.module === 'DONNÉES' || log.action?.includes('Sauvegarde'));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="border border-gray-100 dark:border-white/10 rounded-[2rem] overflow-hidden bg-white dark:bg-gray-900/30">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-900 dark:text-white">
          Historique des sauvegardes
        </h3>
      </div>
      
      {backupLogs.length === 0 ? (
        <div className="p-12 text-center text-gray-500 text-sm font-medium">
          Aucune sauvegarde dans l'historique.
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-bold sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Utilisateur</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {backupLogs.map((log, idx) => {
                const isSuccess = getLogStatus(log).toLowerCase() === 'success' || getLogStatus(log).toLowerCase() === 'confirmé';
                return (
                  <tr key={log.id || idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-gray-900 dark:text-white font-medium">
                      {getLogDate(log)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={getLogLabel(log)} size="xs" />
                        <span className="text-gray-600 dark:text-gray-300">{getLogLabel(log)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                      {log.action}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Badge variant={isSuccess ? 'success' : 'error'} className="text-[10px] py-1 border-none">
                        {isSuccess ? 'Réussi' : 'Échec'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant : ligne 2FA avec toggle persisté
// ─────────────────────────────────────────────────────────────────────────────
const TwoFaRow: React.FC<{
  getValue: (key: string, fallback?: string) => string;
  saveChanges: (changes: Record<string, string>) => Promise<void>;
}> = ({ getValue, saveChanges }) => {
  const enabled = getValue(SETTING_KEYS.TWO_FA_ENABLED, 'false') === 'true';
  const [toggling, setToggling] = useState(false);

  const toggle = async () => {
    setToggling(true);
    try {
      await saveChanges({ [SETTING_KEYS.TWO_FA_ENABLED]: String(!enabled) });
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      onClick={toggle}
      className="flex w-full items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10 hover:border-red-200 dark:hover:border-rouge-500/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-6">
        <div className="p-4 bg-red-100 dark:bg-rouge-900/20 text-red-600 dark:text-rouge-400 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
          {toggling ? <Loader2 size={28} className="animate-spin" /> : <Lock size={28} />}
        </div>
        <div className="text-left font-bold">
          <h4 className="text-gray-900 dark:text-white uppercase tracking-tight">Authentification à deux facteurs</h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 tracking-widest">Renforcez la sécurité des comptes administrateurs.</p>
        </div>
      </div>
      <Badge
        variant={enabled ? 'success' : 'error'}
        className={cn(
          'font-bold uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full shadow-sm border-none',
          enabled
            ? 'bg-vert-50 text-vert-600 dark:bg-vert-900/20'
            : 'bg-rouge-50 text-rouge-600 dark:bg-rouge-900/20',
        )}
      >
        {enabled ? 'Activé' : 'Désactivé'}
      </Badge>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant : Onglet Logs d'Audit
// ─────────────────────────────────────────────────────────────────────────────
const AuditLogsTab: React.FC = () => {
  const { logs, loading, error, reload } = useAuditLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterModule, setFilterModule] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLogs = logs.filter(log => {
    const term = searchQuery.toLowerCase();
    const matchSearch = !term || 
      (log.action || '').toLowerCase().includes(term) ||
      (getLogLabel(log) || '').toLowerCase().includes(term) ||
      (log.description || '').toLowerCase().includes(term);
    
    const status = getLogStatus(log).toLowerCase();
    const matchStatus = !filterStatus || status === filterStatus.toLowerCase() || (filterStatus === 'failed' && (status === 'échec' || status === 'error'));
    
    const matchModule = !filterModule || (getLogModule(log) || '').toLowerCase() === filterModule.toLowerCase();
    
    const matchLevel = !filterLevel || (log.level || 'info').toLowerCase() === filterLevel.toLowerCase();

    return matchSearch && matchStatus && matchModule && matchLevel;
  });

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterModule, filterStatus, filterLevel]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterModule('');
    setFilterStatus('');
    setFilterLevel('');
  };

  const uniqueModules = Array.from(new Set(logs.map(l => getLogModule(l)).filter(Boolean)));

  const getLevelColor = (level?: string) => {
    const l = (level || 'info').toLowerCase();
    if (l === 'danger') return 'bg-rouge-100 text-rouge-700 dark:bg-rouge-900/30 dark:text-rouge-400';
    if (l === 'warning') return 'bg-or-100 text-or-700 dark:bg-or-900/30 dark:text-or-400';
    return 'bg-bleu-100 text-bleu-700 dark:bg-bleu-900/30 dark:text-bleu-400';
  };

  const getStatusColor = (status?: string) => {
    const s = (status || 'success').toLowerCase();
    if (s === 'failed' || s === 'échec' || s === 'alerte' || s === 'error') return 'bg-rouge-500 text-white';
    return 'bg-vert-500 text-white';
  };

  return (
    <motion.div
      key="logs"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">Journal d'audit système</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn("p-2 rounded-xl transition-colors", showFilters ? "bg-bleu-50 dark:bg-bleu-900/20 text-bleu-600" : "bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-600")}
                title="Rechercher et filtrer"
              >
                <Filter size={18} />
              </button>
              <button
                onClick={reload}
                className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400"
                title="Actualiser"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4 border-t border-gray-100 dark:border-white/5 mt-2">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input 
                        placeholder="Rechercher (utilisateur, action)..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 rounded-xl text-[12px] bg-gray-50 dark:bg-white/5 border-none w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <select 
                      value={filterModule} 
                      onChange={e => setFilterModule(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-[12px] font-semibold bg-gray-50 dark:bg-white/5 border-none text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-or-500/50 appearance-none"
                    >
                      <option value="">Tous modules</option>
                      {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <select 
                      value={filterStatus} 
                      onChange={e => setFilterStatus(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-[12px] font-semibold bg-gray-50 dark:bg-white/5 border-none text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-or-500/50 appearance-none"
                    >
                      <option value="">Tous statuts</option>
                      <option value="success">Succès</option>
                      <option value="failed">Échec</option>
                    </select>
                  </div>
                  <div>
                    <select 
                      value={filterLevel} 
                      onChange={e => setFilterLevel(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-[12px] font-semibold bg-gray-50 dark:bg-white/5 border-none text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-or-500/50 appearance-none"
                    >
                      <option value="">Tous niveaux</option>
                      <option value="info">Info</option>
                      <option value="warning">Alerte</option>
                      <option value="danger">Danger</option>
                    </select>
                  </div>
                  <div>
                    <Button variant="outline" onClick={resetFilters} className="w-full h-10 text-[11px] font-bold uppercase tracking-widest rounded-xl border-gray-200 dark:border-white/10 flex items-center justify-center gap-2">
                      <X size={14} />
                      Effacer
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-y border-gray-100 dark:border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Date & Heure</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Utilisateur</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Module</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Statut / Niveau</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Chargement des logs…</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-rouge-500">
                    <AlertTriangle size={24} className="mx-auto mb-2" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{error}</span>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <History size={32} className="mx-auto mb-3 opacity-50" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Aucun log trouvé pour le moment.</span>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                      {getLogDate(log)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-white">{getLogLabel(log)}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">{log.userRole || 'Utilisateur'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-none px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                        {getLogModule(log)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">{log.action}</span>
                        {log.description && <span className="text-[11px] text-gray-500 truncate max-w-xs">{log.description}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("border-none px-2 py-1 text-[9px] font-bold uppercase tracking-widest", getStatusColor(getLogStatus(log)))}>
                          {getLogStatus(log)}
                        </Badge>
                        <Badge className={cn("border-none px-2 py-1 text-[9px] font-bold uppercase tracking-widest", getLevelColor(log.level))}>
                          {log.level || 'info'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-gray-400 hover:text-bleu-600 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 rounded-xl transition-all inline-flex items-center gap-2"
                      >
                        <Eye size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Voir détail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredLogs.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
              Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredLogs.length)} sur {filteredLogs.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 px-2">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Détails Log */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 text-bleu-600 rounded-xl">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Détails de l'action</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{getLogDate(selectedLog)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-white/10 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Utilisateur</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{getLogLabel(selectedLog)}</p>
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">{selectedLog.userRole || 'Non défini'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Module</p>
                    <Badge className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-none px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                      {getLogModule(selectedLog)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Action effectuée</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedLog.action}</p>
                  {selectedLog.description && (
                    <p className="text-[12px] text-gray-600 dark:text-gray-400 mt-2 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 leading-relaxed">
                      {selectedLog.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Statut</p>
                    <Badge className={cn("border-none px-3 py-1 text-[11px] font-bold uppercase tracking-widest", getStatusColor(getLogStatus(selectedLog)))}>
                      {getLogStatus(selectedLog)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Niveau</p>
                    <Badge className={cn("border-none px-3 py-1 text-[11px] font-bold uppercase tracking-widest", getLevelColor(selectedLog.level))}>
                      {selectedLog.level || 'info'}
                    </Badge>
                  </div>
                </div>

                {(selectedLog.ipAddress || selectedLog.userAgent) && (
                  <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/10">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Informations Techniques</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                      {selectedLog.ipAddress && <div><span className="font-bold text-gray-900 dark:text-gray-200">Adresse IP:</span> {selectedLog.ipAddress}</div>}
                      {selectedLog.userAgent && <div><span className="font-bold text-gray-900 dark:text-gray-200">Appareil/Nav.:</span> {selectedLog.userAgent}</div>}
                    </div>
                  </div>
                )}

                {(selectedLog.oldValue || selectedLog.newValue) && (
                  <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/10">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Modifications des données</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                      {selectedLog.oldValue && (
                        <div className="p-4 bg-rouge-50 dark:bg-rouge-900/10 text-rouge-800 dark:text-rouge-300 rounded-xl border border-rouge-100 dark:border-rouge-900/20 overflow-x-auto">
                          <p className="font-bold uppercase tracking-widest mb-2 text-[9px] flex items-center gap-2"><XCircle size={14}/> Ancienne valeur</p>
                          <pre className="font-mono text-[10px] whitespace-pre-wrap">{selectedLog.oldValue}</pre>
                        </div>
                      )}
                      {selectedLog.newValue && (
                        <div className="p-4 bg-vert-50 dark:bg-vert-900/10 text-vert-800 dark:text-vert-300 rounded-xl border border-vert-100 dark:border-vert-900/20 overflow-x-auto">
                          <p className="font-bold uppercase tracking-widest mb-2 text-[9px] flex items-center gap-2"><CheckCircle2 size={14}/> Nouvelle valeur</p>
                          <pre className="font-mono text-[10px] whitespace-pre-wrap">{selectedLog.newValue}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminSettings;
