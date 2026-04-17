import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Bell,
  Building2,
  Key,
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
} from 'lucide-react';
import { Card, Badge, Button, Input } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useAdminSettings, useAuditLogs, SETTING_KEYS } from '../../hooks/useAdminSettings';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers : normalise les champs AuditLog selon ce que le backend peut renvoyer
// ─────────────────────────────────────────────────────────────────────────────
const getLogLabel = (log: any): string =>
  log.utilisateur ?? log.performedBy ?? log.userName ?? '—';

const getLogDate = (log: any): string =>
  log.date ?? log.createdAt ?? log.timestamp ?? '—';

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
  React.useEffect(() => {
    if (!settingsLoading && !initialized) {
      setFields({
        [SETTING_KEYS.NOM_ETABLISSEMENT]: getValue(SETTING_KEYS.NOM_ETABLISSEMENT, 'Écoles Internationales Enfants du Futur'),
        [SETTING_KEYS.SLOGAN]: getValue(SETTING_KEYS.SLOGAN, 'Faisons Plus !'),
        [SETTING_KEYS.EMAIL]: getValue(SETTING_KEYS.EMAIL, 'admin@eief.edu.gn'),
        [SETTING_KEYS.TELEPHONE]: getValue(SETTING_KEYS.TELEPHONE, '+224 622 00 00 00'),
      });
      setInitialized(true);
    }
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

  // ── Logs ──
  const [logModuleFilter, setLogModuleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { logs, loading: logsLoading, error: logsError, reload: reloadLogs } =
    useAuditLogs(logModuleFilter ? { module: logModuleFilter } : undefined);

  const filteredLogs = logs.filter(log =>
    !searchQuery ||
    (log.action ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    getLogLabel(log).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getLogModule(log).toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <div className="mb-4">
                    <h2 className="text-xl font-bold gradient-bleu-or-text tracking-tight uppercase">Sauvegarde & Données</h2>
                  </div>
                  <div className="p-8 bg-vert-50 dark:bg-vert-900/10 rounded-[2rem] border border-vert-100 dark:border-vert-900/20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-vert-100 dark:bg-vert-900/30 text-vert-600 rounded-full flex items-center justify-center animate-pulse">
                      <Database size={32} />
                    </div>
                    <div className="font-bold">
                      <p className="text-gray-900 dark:text-white uppercase tracking-tight text-lg">Système à jour</p>
                      <p className="text-[11px] text-vert-600 dark:text-vert-400 uppercase tracking-widest mt-1">Dernière sauvegarde : il y a 2h</p>
                    </div>
                    <Button className="mt-4 bg-vert-600 text-white font-bold uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-vert-600/20">
                      Lancer une sauvegarde
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── LOGS ── */}
            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
                  <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between text-gray-900 dark:text-white font-bold uppercase tracking-widest text-[11px]">
                    <span>Journal d'audit système</span>
                    <div className="flex items-center gap-3">
                      {/* Filtre par module */}
                      <AnimatePresence>
                        {showSearch && (
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 200, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Input
                              autoFocus
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              placeholder="Rechercher…"
                              className="h-9 rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-[11px] font-bold"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={() => { setShowSearch(v => !v); setSearchQuery(''); }}
                        className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <Search size={18} className="text-gray-400 dark:text-gray-500" />
                      </button>

                      <button
                        onClick={reloadLogs}
                        className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <RefreshCw size={18} className={cn('text-gray-400', logsLoading && 'animate-spin')} />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-transparent">
                    {logsLoading ? (
                      <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Chargement…</span>
                      </div>
                    ) : logsError ? (
                      <div className="flex items-center justify-center py-16 gap-3 text-rouge-500">
                        <AlertTriangle size={20} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{logsError}</span>
                      </div>
                    ) : filteredLogs.length === 0 ? (
                      <div className="flex items-center justify-center py-16 text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-widest">Aucun log trouvé.</span>
                      </div>
                    ) : (
                      filteredLogs.map(log => {
                        const status = getLogStatus(log);
                        const isAlert = status === 'Alerte' || status === 'ALERT' || status === 'ERROR';
                        return (
                          <div
                            key={log.id}
                            className="p-6 hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                'p-4 rounded-2xl shadow-inner transition-transform group-hover:scale-110',
                                isAlert
                                  ? 'bg-rouge-100 dark:bg-rouge-900/20 text-rouge-600 dark:text-rouge-400'
                                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400',
                              )}>
                                {isAlert ? <AlertTriangle size={20} /> : <History size={20} />}
                              </div>
                              <div className="text-left font-bold">
                                <p className="text-gray-900 dark:text-white uppercase tracking-tight text-sm mb-1">{log.action}</p>
                                <div className="flex items-center gap-3">
                                  <p className="text-[10px] uppercase tracking-widest text-bleu-600 dark:text-bleu-400">{getLogLabel(log)}</p>
                                  <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                  <p className="text-[10px] uppercase tracking-widest text-gray-400">{getLogDate(log)}</p>
                                  <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                  <Badge className="bg-gray-100 dark:bg-white/5 text-gray-500 border-none px-2 py-0.5 text-[8px]">{getLogModule(log)}</Badge>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={isAlert ? 'error' : 'success'}
                              className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 shadow-sm border-none"
                            >
                              {status}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
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

export default AdminSettings;
