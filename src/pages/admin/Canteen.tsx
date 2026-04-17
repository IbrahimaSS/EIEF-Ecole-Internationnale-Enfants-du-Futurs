import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Calendar, Users, TrendingUp, Plus, Clock, Coffee,
  Drumstick, History, FileSpreadsheet, CheckCircle2, Salad, Apple,
  Info, X, FileText, Pizza, Fish, Soup, Beef, Star, Image as ImageIcon,
  Loader2, AlertTriangle, Trash2, Edit3, RefreshCw
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar, Modal, Input, Select } from '../../components/ui';
import { cn } from '../../utils/cn';
import {
  getMeals,
  getMenus,
  getSubscriptions,
  createMenu,
  updateMenu,
  deleteMenu,
  createSubscription,
  deleteSubscription,
  CanteenMenuResponse,
  CanteenSubscriptionResponse,
  MealResponse,
  CanteenMenuRequest,
} from '../../services/cafeteriaService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toLocalDateString = (date: Date = new Date()): string =>
  date.toISOString().split('T')[0];

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const formatPrice = (price?: number): string =>
  price != null ? `${price.toLocaleString('fr-FR')} FGN` : '—';

const DAY_ICONS: Record<string, React.ElementType> = {
  lundi: Drumstick, mardi: Soup, mercredi: Beef,
  jeudi: Fish, vendredi: Pizza,
};

const DAY_COLORS: string[] = [
  'text-bleu-600 bg-bleu-50 dark:bg-bleu-900/30 border-bleu-100',
  'text-or-600 bg-or-50 dark:bg-or-900/30 border-or-100',
  'text-vert-600 bg-vert-50 dark:bg-vert-900/30 border-vert-100',
  'text-rouge-600 bg-rouge-50 dark:bg-rouge-900/30 border-rouge-100',
  'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100',
];

const getDayIcon = (menuDate: string): React.ElementType => {
  const day = new Date(menuDate).toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
  return DAY_ICONS[day] ?? Utensils;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Chargement...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
    <Loader2 size={28} className="animate-spin text-bleu-500" />
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </div>
);

const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex items-center gap-4 p-4 bg-rouge-50 dark:bg-rouge-900/20 border border-rouge-100 dark:border-rouge-900/30 rounded-2xl text-rouge-600 dark:text-rouge-400">
    <AlertTriangle size={20} className="shrink-0" />
    <p className="text-[10px] font-bold uppercase tracking-widest flex-1">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="p-1.5 hover:bg-rouge-100 rounded-lg transition-colors">
        <RefreshCw size={14} />
      </button>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminCanteen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'inscrits'>('menu');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Opération réussie');
  const [editingMenu, setEditingMenu] = useState<CanteenMenuResponse | null>(null);

  // ── Data state
  const [menus, setMenus] = useState<CanteenMenuResponse[]>([]);
  const [subscriptions, setSubscriptions] = useState<CanteenSubscriptionResponse[]>([]);
  const [meals, setMeals] = useState<MealResponse[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [errorMenus, setErrorMenus] = useState<string | null>(null);
  const [errorSubscriptions, setErrorSubscriptions] = useState<string | null>(null);

  // ── Form state (Menu)
  const [menuForm, setMenuForm] = useState<CanteenMenuRequest>({
    menuDate: toLocalDateString(),
    description: '',
    price: undefined,
  });
  const [menuFormError, setMenuFormError] = useState<string | null>(null);
  const [submittingMenu, setSubmittingMenu] = useState(false);

  // ── Form state (Subscription)
  const [subForm, setSubForm] = useState({
    studentId: '',
    startDate: toLocalDateString(),
    endDate: toLocalDateString(new Date(Date.now() + 30 * 86400_000)),
    planType: 'MENSUEL',
    amount: '',
  });
  const [submittingSub, setSubmittingSub] = useState(false);
  const [subFormError, setSubFormError] = useState<string | null>(null);

  // ─── Fetch data ──────────────────────────────────────────────────────────────

  const fetchMenus = useCallback(async () => {
    setLoadingMenus(true);
    setErrorMenus(null);
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (e: any) {
      setErrorMenus(e?.message || 'Impossible de charger les menus.');
    } finally {
      setLoadingMenus(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setLoadingSubscriptions(true);
    setErrorSubscriptions(null);
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch (e: any) {
      setErrorSubscriptions(e?.message || 'Impossible de charger les abonnements.');
    } finally {
      setLoadingSubscriptions(false);
    }
  }, []);

  const fetchMeals = useCallback(async () => {
    setLoadingMeals(true);
    try {
      const data = await getMeals(toLocalDateString());
      setMeals(data);
    } catch {
      // Non-blocking
    } finally {
      setLoadingMeals(false);
    }
  }, []);

  useEffect(() => { fetchMenus(); fetchSubscriptions(); fetchMeals(); }, []);

  // ─── Toast helper ────────────────────────────────────────────────────────────

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);
  };

  // ─── Menu CRUD ───────────────────────────────────────────────────────────────

  const openCreateMenu = () => {
    setEditingMenu(null);
    setMenuForm({ menuDate: toLocalDateString(), description: '', price: undefined });
    setMenuFormError(null);
    setIsMenuModalOpen(true);
  };

  const openEditMenu = (menu: CanteenMenuResponse) => {
    setEditingMenu(menu);
    setMenuForm({ menuDate: menu.menuDate, description: menu.description, price: menu.price });
    setMenuFormError(null);
    setIsMenuModalOpen(true);
  };

  const handleMenuSubmit = async () => {
    if (!menuForm.description.trim() || !menuForm.menuDate) {
      setMenuFormError('La date et la description sont obligatoires.');
      return;
    }
    setMenuFormError(null);
    setSubmittingMenu(true);
    try {
      if (editingMenu) {
        const updated = await updateMenu(editingMenu.id, menuForm);
        setMenus(prev => prev.map(m => m.id === updated.id ? updated : m));
        showSuccess('Menu mis à jour avec succès.');
      } else {
        const created = await createMenu(menuForm);
        setMenus(prev => [created, ...prev]);
        showSuccess('Menu créé et publié.');
      }
      setIsMenuModalOpen(false);
    } catch (e: any) {
      setMenuFormError(e?.message || 'Une erreur est survenue.');
    } finally {
      setSubmittingMenu(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!window.confirm('Supprimer ce menu ?')) return;
    try {
      await deleteMenu(id);
      setMenus(prev => prev.filter(m => m.id !== id));
      showSuccess('Menu supprimé.');
    } catch (e: any) {
      alert(e?.message || 'Erreur lors de la suppression.');
    }
  };

  // ─── Subscription CRUD ───────────────────────────────────────────────────────

  const handleSubSubmit = async () => {
    if (!subForm.studentId.trim()) {
      setSubFormError("L'identifiant de l'élève est requis.");
      return;
    }
    setSubFormError(null);
    setSubmittingSub(true);
    try {
      const created = await createSubscription({
        studentId: subForm.studentId,
        startDate: subForm.startDate,
        endDate: subForm.endDate,
        planType: subForm.planType,
        amount: subForm.amount ? parseFloat(subForm.amount) : undefined,
      });
      setSubscriptions(prev => [created, ...prev]);
      showSuccess('Abonnement créé avec succès.');
      setIsSubscriptionModalOpen(false);
    } catch (e: any) {
      setSubFormError(e?.message || 'Une erreur est survenue.');
    } finally {
      setSubmittingSub(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm('Supprimer cet abonnement ?')) return;
    try {
      await deleteSubscription(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      showSuccess('Abonnement supprimé.');
    } catch (e: any) {
      alert(e?.message || 'Erreur lors de la suppression.');
    }
  };

  // ─── Derived stats ───────────────────────────────────────────────────────────

  const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const todayMenusCount = menus.filter(m => m.menuDate === toLocalDateString()).length;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Utensils className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-bold gradient-bleu-or-text tracking-tight">Restauration Scolaire</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Gestion des menus, nutrition et facturation globale</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsReportModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[10px] uppercase tracking-widest font-bold px-5 h-11"
          >
            <FileSpreadsheet size={18} /> Relevés mensuels
          </Button>
          <Button
            onClick={openCreateMenu}
            className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 shadow-blue border-none font-bold text-[10px] uppercase tracking-widest h-11 px-6 shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Nouveau Menu
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <StatCard
          title="Repas Aujourd'hui"
          value={loadingMeals ? '...' : meals.length.toString()}
          subtitle="Plats disponibles ce jour"
          icon={<Salad />}
          color="vert"
          trend={{ value: "Menus actifs", direction: "up" }}
        />
        <StatCard
          title="Recettes Abonnements"
          value={`${totalRevenue.toLocaleString('fr-FR')} FGN`}
          subtitle={`${subscriptions.length} abonnés inscrits`}
          icon={<TrendingUp />}
          color="bleu"
          trend={{ value: "+12.5%", direction: "up" }}
        />
        <StatCard
          title="Menus Planifiés"
          value={menus.length.toString()}
          subtitle={`${todayMenusCount} menu(s) aujourd'hui`}
          icon={<Apple />}
          color="or"
        />
      </div>

      {/* TABS */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-2">
        {[
          { id: 'menu', label: 'Menus Planifiés', icon: Utensils },
          { id: 'inscrits', label: 'Abonnements', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-3 px-6 py-3 rounded-t-2xl text-[10px] font-bold uppercase tracking-widest transition-all relative',
              activeTab === tab.id
                ? 'text-bleu-600 dark:text-or-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabCanteen"
                className="absolute bottom-0 left-0 right-0 h-1 bg-bleu-600 dark:bg-or-500 rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">

        {/* ── TAB: MENUS ─────────────────────────────────────────────────────── */}
        {activeTab === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            {loadingMenus && <LoadingSpinner label="Chargement des menus..." />}
            {errorMenus && <ErrorBanner message={errorMenus} onRetry={fetchMenus} />}

            {!loadingMenus && !errorMenus && menus.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Utensils size={32} className="opacity-30" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Aucun menu planifié</p>
                <Button onClick={openCreateMenu} className="mt-2 text-[10px] uppercase tracking-widest font-bold h-10 px-6">
                  <Plus size={14} className="mr-2" /> Créer le premier menu
                </Button>
              </div>
            )}

            {!loadingMenus && menus.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {menus.map((menu, i) => {
                  const Icon = getDayIcon(menu.menuDate);
                  const colorClass = DAY_COLORS[i % DAY_COLORS.length];
                  return (
                    <Card
                      key={menu.id}
                      className="p-6 border-none shadow-soft dark:bg-gray-900/50 flex items-start gap-5 group hover:shadow-xl hover:scale-[1.01] transition-all"
                    >
                      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-all group-hover:scale-110', colorClass)}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{formatDate(menu.menuDate)}</span>
                          {menu.price != null && (
                            <Badge variant="default" className="text-[8px] font-bold px-2 bg-bleu-50 text-bleu-600 dark:bg-bleu-900/30 dark:text-bleu-400 border-none">
                              {formatPrice(menu.price)}
                            </Badge>
                          )}
                        </div>
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm group-hover:text-bleu-600 dark:group-hover:text-bleu-400 transition-colors leading-snug">
                          {menu.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openEditMenu(menu)}
                          className="p-2 rounded-xl hover:bg-bleu-50 dark:hover:bg-bleu-900/20 text-gray-400 hover:text-bleu-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="p-2 rounded-xl hover:bg-rouge-50 dark:hover:bg-rouge-900/20 text-gray-400 hover:text-rouge-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: ABONNEMENTS ───────────────────────────────────────────────── */}
        {activeTab === 'inscrits' && (
          <motion.div
            key="inscrits"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <Button
                onClick={() => { setSubFormError(null); setIsSubscriptionModalOpen(true); }}
                className="flex gap-2 text-[10px] uppercase tracking-widest font-bold h-10 px-5"
              >
                <Plus size={16} /> Nouvel abonnement
              </Button>
            </div>

            {loadingSubscriptions && <LoadingSpinner label="Chargement des abonnements..." />}
            {errorSubscriptions && <ErrorBanner message={errorSubscriptions} onRetry={fetchSubscriptions} />}

            {!loadingSubscriptions && !errorSubscriptions && subscriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Users size={32} className="opacity-30" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Aucun abonnement enregistré</p>
              </div>
            )}

            {!loadingSubscriptions && subscriptions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub) => (
                  <Card
                    key={sub.id}
                    className="p-4 border-none shadow-soft flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group dark:bg-gray-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={sub.studentName || sub.studentId} size="md" />
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white leading-none mb-1 group-hover:text-bleu-600 transition-colors">
                          {sub.studentName || sub.studentId}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {sub.planType ?? 'Forfait'}
                        </p>
                        <p className="text-[9px] text-gray-300 dark:text-gray-500 mt-0.5">
                          {new Date(sub.startDate).toLocaleDateString('fr-FR')} → {new Date(sub.endDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="success" className="text-[8px] font-bold uppercase tracking-widest px-2">Actif</Badge>
                      {sub.amount != null && (
                        <span className="text-[9px] text-gray-400 font-medium">{formatPrice(sub.amount)}</span>
                      )}
                      <button
                        onClick={() => handleDeleteSubscription(sub.id)}
                        className="p-1 rounded-lg hover:bg-rouge-50 dark:hover:bg-rouge-900/20 text-gray-300 hover:text-rouge-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: MENU (Create / Edit) ──────────────────────────────────────── */}
      <Modal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        title={
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 shadow-inner">
              <Utensils size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">
              {editingMenu ? 'Modifier le Menu' : 'Planifier un nouveau Menu'}
            </span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6 text-left py-2">
          {menuFormError && <ErrorBanner message={menuFormError} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date du menu"
              type="date"
              value={menuForm.menuDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMenuForm(prev => ({ ...prev, menuDate: e.target.value }))
              }
            />
            <Input
              label="Prix par repas (FGN)"
              type="number"
              placeholder="ex: 25000"
              value={menuForm.price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMenuForm(prev => ({ ...prev, price: e.target.value ? parseFloat(e.target.value) : undefined }))
              }
            />
          </div>

          <Input
            label="Description / Plat du jour"
            placeholder="ex: Riz au Gras & Poulet, sauce tomate..."
            value={menuForm.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMenuForm(prev => ({ ...prev, description: e.target.value }))
            }
          />

          <div className="flex gap-5 pt-6 border-t border-gray-100 dark:border-white/5">
            <Button
              variant="outline"
              onClick={() => setIsMenuModalOpen(false)}
              className="flex-1 h-12 text-[10px] tracking-wider font-bold uppercase"
              disabled={submittingMenu}
            >
              Annuler
            </Button>
            <Button
              onClick={handleMenuSubmit}
              className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold text-[10px] tracking-wider uppercase"
              disabled={submittingMenu}
            >
              {submittingMenu
                ? <Loader2 size={16} className="animate-spin mr-2" />
                : null}
              {editingMenu ? 'Mettre à jour' : 'Publier le Menu'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: SUBSCRIPTION ─────────────────────────────────────────────── */}
      <Modal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        title={
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-vert-100 dark:bg-vert-900/30 rounded-xl text-vert-600 shadow-inner">
              <Users size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">Nouvel Abonnement Cantine</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6 text-left py-2">
          {subFormError && <ErrorBanner message={subFormError} />}

          <Input
            label="ID de l'élève (UUID)"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={subForm.studentId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSubForm(prev => ({ ...prev, studentId: e.target.value }))
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date de début"
              type="date"
              value={subForm.startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubForm(prev => ({ ...prev, startDate: e.target.value }))
              }
            />
            <Input
              label="Date de fin"
              type="date"
              value={subForm.endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubForm(prev => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Type de forfait"
              options={[
                { value: 'MENSUEL', label: 'Mensuel' },
                { value: 'TRIMESTRIEL', label: 'Trimestriel' },
                { value: 'ANNUEL', label: 'Annuel' },
              ]}
              value={subForm.planType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSubForm(prev => ({ ...prev, planType: e.target.value }))
              }
            />
            <Input
              label="Montant (FGN)"
              type="number"
              placeholder="ex: 150000"
              value={subForm.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubForm(prev => ({ ...prev, amount: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-5 pt-6 border-t border-gray-100 dark:border-white/5">
            <Button
              variant="outline"
              onClick={() => setIsSubscriptionModalOpen(false)}
              className="flex-1 h-12 text-[10px] tracking-wider font-bold uppercase"
              disabled={submittingSub}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubSubmit}
              className="flex-1 h-12 shadow-lg shadow-bleu-600/20 font-bold text-[10px] tracking-wider uppercase"
              disabled={submittingSub}
            >
              {submittingSub ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Créer l'abonnement
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: RAPPORTS ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={
          <div className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600 shadow-inner">
              <FileSpreadsheet size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">Rapports de Restauration</span>
          </div>
        }
        size="md"
      >
        <div className="space-y-6 text-left py-2 font-bold uppercase tracking-widest">
          <div className="space-y-3">
            {[
              { name: 'Journal des Repas', desc: 'Listing quotidien des consommations', type: 'PDF' },
              { name: 'Bilan Financier Cantine', desc: 'Rapport mensuel des forfaits', type: 'EXCEL' },
            ].map((rep, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl group hover:border-bleu-500/50 transition-all uppercase tracking-widest font-bold">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-bleu-600 transition-colors shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div className="text-left uppercase tracking-widest font-bold">
                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-none mb-1">{rep.name}</p>
                    <p className="text-[9px] text-gray-400 font-medium leading-none">{rep.desc}</p>
                  </div>
                </div>
                <Badge variant={rep.type === 'PDF' ? 'error' : 'success'} className="text-[8px] px-2">{rep.type}</Badge>
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => setIsReportModalOpen(false)} className="w-full h-12 font-bold uppercase text-[10px] tracking-wider">Fermer</Button>
        </div>
      </Modal>

      {/* ── SUCCESS TOAST ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-[100] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 border border-green-100 dark:border-green-900/30 flex items-center gap-4 min-w-[300px]"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-green-200/50">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-left flex-1 font-bold uppercase tracking-widest">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-widest">Opération réussie</p>
              <p className="text-[10px] text-gray-500 font-semibold leading-none uppercase tracking-widest">{successMessage}</p>
            </div>
            <button onClick={() => setIsSuccess(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminCanteen;
