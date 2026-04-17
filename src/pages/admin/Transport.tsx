import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Bus,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Edit,
  Loader2,
  MapPin,
  MoreVertical,
  Navigation,
  Navigation2,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Avatar, Badge, Button, Card, Input, Modal, Popover, Select, StatCard } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useTransport } from '../../hooks/useTransport';
import { StudentTransportResponse, TransportLineForm, TransportLineView } from '../../types/transport';

type TabId = 'lignes' | 'eleves';

const EMPTY_FORM: TransportLineForm = {
  routeName: '',
  direction: '',
  plateNumber: '',
  driverName: '',
  driverPhone: '',
  capacity: 32,
};

const AdminTransport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('lignes');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingLine, setEditingLine] = useState<TransportLineView | null>(null);
  const [deletingLine, setDeletingLine] = useState<TransportLineView | null>(null);
  const [formData, setFormData] = useState<TransportLineForm>(EMPTY_FORM);

  const {
    buses,
    routes,
    enrollmentsByBus,
    routeStops,
    loading,
    saving,
    error,
    fetchTransportData,
    fetchRouteStops,
    fetchBusEnrollments,
    createLine,
    updateLine,
    deleteLine,
    clearError,
  } = useTransport();

  useEffect(() => {
    fetchTransportData();
  }, [fetchTransportData]);

  const lines = useMemo<TransportLineView[]>(() => {
    return routes.map((route) => {
      const bus = buses.find((item) => item.id === route.busId) ?? null;
      const enrolledCount = enrollmentsByBus[route.busId]?.length ?? 0;
      const occupancyRate = bus?.capacity ? Math.round((enrolledCount / bus.capacity) * 100) : 0;

      let status: TransportLineView['status'] = 'Disponible';
      if (!bus?.isActive) status = 'Inactif';
      else if (enrolledCount > 0) status = 'En route';

      return {
        route,
        bus,
        enrolledCount,
        occupancyRate,
        status,
      };
    });
  }, [buses, routes, enrollmentsByBus]);

  const selectedLine = useMemo(
    () => lines.find((line) => line.route.id === selectedRouteId) ?? null,
    [lines, selectedRouteId],
  );

  const selectedStops = selectedLine ? routeStops[selectedLine.route.id] ?? [] : [];
  const selectedPassengers = selectedLine ? enrollmentsByBus[selectedLine.route.busId] ?? [] : [];

  const filteredLines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return lines;

    return lines.filter((line) =>
      [
        line.route.name,
        line.route.direction ?? '',
        line.bus?.plateNumber ?? '',
        line.bus?.driverName ?? '',
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [lines, searchQuery]);

  const passengerRows = useMemo(() => {
    const rows = Object.values(enrollmentsByBus).flat().map((enrollment) => {
      const bus = buses.find((item) => item.id === enrollment.busId) ?? null;
      const route = routes.find((item) => item.busId === enrollment.busId) ?? null;

      return {
        ...enrollment,
        bus,
        route,
      };
    });

    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      [
        row.studentName,
        row.busPlateNumber,
        row.stopName ?? '',
        row.direction ?? '',
        row.route?.name ?? '',
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [buses, enrollmentsByBus, routes, searchQuery]);

  const totalActiveBuses = buses.filter((bus) => bus.isActive).length;
  const totalEnrollments = Object.values(enrollmentsByBus).reduce((sum, items) => sum + items.length, 0);
  const totalStops = Object.values(routeStops).reduce((sum, items) => sum + items.length, 0);
  const averageOccupancy = lines.length
    ? Math.round(lines.reduce((sum, line) => sum + line.occupancyRate, 0) / lines.length)
    : 0;

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const openLineDetails = async (line: TransportLineView) => {
    setSelectedRouteId(line.route.id);
    setIsDetailsModalOpen(true);
    await Promise.all([
      fetchRouteStops(line.route.id),
      fetchBusEnrollments(line.route.busId),
    ]);
  };

  const openGpsPreview = async (line?: TransportLineView | null) => {
    const target = line ?? selectedLine ?? filteredLines[0] ?? null;
    if (!target) return;

    setSelectedRouteId(target.route.id);
    setIsMapModalOpen(true);
    await fetchRouteStops(target.route.id);
  };

  const openCreateModal = () => {
    setEditingLine(null);
    setFormData(EMPTY_FORM);
    setIsAddModalOpen(true);
  };

  const openEditModal = (line: TransportLineView) => {
    setEditingLine(line);
    setFormData({
      routeName: line.route.name,
      direction: line.route.direction ?? '',
      plateNumber: line.bus?.plateNumber ?? '',
      driverName: line.bus?.driverName ?? '',
      driverPhone: line.bus?.driverPhone ?? '',
      capacity: line.bus?.capacity ?? 32,
    });
    setOpenMenuId(null);
    setIsAddModalOpen(true);
  };

  const handleSaveLine = async () => {
    if (!formData.routeName.trim() || !formData.plateNumber.trim() || !formData.driverName.trim()) {
      return;
    }

    try {
      if (editingLine?.bus) {
        await updateLine(editingLine.route.id, editingLine.bus.id, formData);
        showSuccess('La ligne de transport a ete mise a jour.');
      } else {
        await createLine(formData);
        showSuccess('La ligne de transport a ete creee.');
      }

      setIsAddModalOpen(false);
      setEditingLine(null);
      setFormData(EMPTY_FORM);
    } catch {
      // Gere dans le hook.
    }
  };

  const handleDeleteLine = async () => {
    if (!deletingLine) return;

    try {
      await deleteLine(deletingLine.route.id);
      showSuccess('La ligne a ete supprimee.');
      setDeletingLine(null);
      if (selectedRouteId === deletingLine.route.id) {
        setSelectedRouteId(null);
      }
    } catch {
      // Gere dans le hook.
    }
  };

  const renderPassengerCard = (passenger: StudentTransportResponse & { route?: TransportLineView['route'] | null }) => (
    <Card
      key={passenger.id}
      className="p-5 border-none shadow-soft flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all group dark:bg-gray-900/50"
    >
      <div className="flex items-center gap-4">
        <Avatar name={passenger.studentName} size="md" />
        <div className="text-left font-bold">
          <p className="text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-bleu-600 transition-colors">
            {passenger.studentName}
          </p>
          <div className="flex items-center gap-2 text-gray-400 font-semibold text-[10px] uppercase tracking-widest italic">
            <Bus size={12} className="text-or-500" />
            {passenger.route?.name ?? passenger.busPlateNumber}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            Arret: {passenger.stopName || 'Non defini'}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant="info" className="text-[9px] font-bold px-2 py-0.5 border-none shadow-sm">
          {passenger.direction || 'ALLER'}
        </Badge>
        <div className="text-[9px] text-vert-500 font-bold flex items-center gap-1">
          <CheckCircle2 size={10} /> Inscrit
        </div>
      </div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
      onClick={() => setOpenMenuId(null)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="text-left font-bold">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-soft">
              <Bus className="text-bleu-600 dark:text-bleu-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight">Transport Scolaire</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
                Les bus, lignes, arrêts et abonnements
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => openGpsPreview()}
            disabled={filteredLines.length === 0}
            className="flex gap-3 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-bleu-600/5 group-hover:bg-bleu-600/10 transition-colors" />
            <Activity className="text-bleu-600 dark:text-bleu-400 animate-pulse" size={18} />
            Apercu de trajet
          </Button>
          <Button
            onClick={openCreateModal}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Nouvelle ligne
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold"
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
            <button onClick={clearError} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-full">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Vehicules Actifs"
          value={loading ? '...' : totalActiveBuses.toString()}
          subtitle="Buses connectes"
          icon={<Bus />}
          color="bleu"
        />
        <StatCard
          title="Lignes Configurees"
          value={loading ? '...' : routes.length.toString()}
          subtitle="Routes backend"
          icon={<Navigation />}
          color="or"
        />
        <StatCard
          title="Eleves Inscrits"
          value={loading ? '...' : totalEnrollments.toString()}
          subtitle="Abonnements transport"
          icon={<Users />}
          color="vert"
        />
        <StatCard
          title="Occupation Moyenne"
          value={loading ? '...' : `${averageOccupancy}%`}
          subtitle={`${totalStops} arrets charges`}
          icon={<CreditCard />}
          color="rouge"
        />
      </div>

      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none relative overflow-visible">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-2 lg:border-b-0 lg:pb-0">
            {[
              { id: 'lignes', label: 'Lignes & Itineraires', icon: Navigation },
              { id: 'eleves', label: 'Passagers par Bus', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  'flex items-center gap-3 px-6 py-4 rounded-t-2xl text-[11px] font-bold uppercase tracking-widest transition-all relative group',
                  activeTab === tab.id
                    ? 'text-bleu-600 dark:text-or-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
                )}
              >
                <tab.icon size={16} className={cn(activeTab === tab.id ? 'text-bleu-600 dark:text-or-400' : 'text-gray-400')} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabTransport"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-bleu-600 dark:bg-or-500 rounded-t-full shadow-[0_-2px_6px_rgba(37,99,235,0.2)]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder={activeTab === 'lignes' ? 'Chercher une ligne, un bus, un chauffeur...' : 'Chercher un eleve, un arret, un bus...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-bold text-gray-700 dark:text-white shadow-sm text-sm"
            />
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-500"
          >
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm font-semibold">Chargement des donnees transport...</span>
          </motion.div>
        ) : activeTab === 'lignes' ? (
          <motion.div
            key="lignes"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredLines.length === 0 ? (
              <Card className="lg:col-span-3 p-10 text-center">
                <p className="text-gray-500 font-semibold">Aucune ligne trouvee.</p>
              </Card>
            ) : (
              filteredLines.map((line) => (
                <Card
                  key={line.route.id}
                  onClick={() => openLineDetails(line)}
                  className="p-0 border-none shadow-soft overflow-hidden group hover:shadow-2xl transition-all duration-500 dark:bg-gray-900/50 dark:backdrop-blur-md relative cursor-pointer"
                >
                  <div
                    className={cn(
                      'p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between transition-colors',
                      line.status === 'En route'
                        ? 'bg-vert-50/50 dark:bg-vert-900/10'
                        : line.status === 'Inactif'
                        ? 'bg-rouge-50/50 dark:bg-rouge-900/10'
                        : 'bg-gray-50/50 dark:bg-white/5',
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-transform group-hover:scale-110',
                          line.status === 'En route'
                            ? 'text-vert-600'
                            : line.status === 'Inactif'
                            ? 'text-rouge-600'
                            : 'text-gray-400',
                        )}
                      >
                        <Bus size={24} strokeWidth={2.5} />
                      </div>
                      <div className="text-left font-bold">
                        <h3 className="text-gray-900 dark:text-white line-clamp-1 text-sm">{line.route.name}</h3>
                        <p className="text-[11px] text-gray-400 font-semibold italic">{line.bus?.plateNumber || line.route.busPlateNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Badge
                        variant={line.status === 'En route' ? 'success' : line.status === 'Inactif' ? 'error' : 'default'}
                        className="text-[9px] font-bold px-3 py-1 border-none shadow-sm h-6 uppercase"
                      >
                        {line.status}
                      </Badge>
                      <Popover
                        isOpen={openMenuId === line.route.id}
                        onClose={() => setOpenMenuId(null)}
                        trigger={
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === line.route.id ? null : line.route.id);
                            }}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all text-gray-400"
                          >
                            <MoreVertical size={16} />
                          </button>
                        }
                      >
                        <div className="bg-white dark:bg-gray-900 rounded-[1.2rem] shadow-2xl border border-gray-100 dark:border-white/10 p-2 min-w-[200px] text-left">
                          <button
                            onClick={() => {
                              openGpsPreview(line);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
                          >
                            <Navigation2 size={16} className="text-bleu-600" /> Voir le trajet
                          </button>
                          <button
                            onClick={() => openEditModal(line)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
                          >
                            <Edit size={16} className="text-or-600" /> Modifier ligne
                          </button>
                          <div className="h-px bg-gray-50 dark:bg-white/5 my-1 mx-2" />
                          <button
                            onClick={() => {
                              setDeletingLine(line);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all"
                          >
                            <Trash2 size={16} /> Supprimer ligne
                          </button>
                        </div>
                      </Popover>
                    </div>
                  </div>

                  <div className="p-6 bg-white dark:bg-transparent space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                        <MapPin size={16} className="text-or-500" />
                        Direction :
                        <span className="text-gray-900 dark:text-white ml-1">{line.route.direction || 'Non definie'}</span>
                      </div>
                      <Badge variant="info" className="text-[8px] h-5 px-2 border-none">
                        <Clock size={10} className="mr-1" /> {line.enrolledCount} inscrits
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-left font-bold">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Chauffeur assigne</p>
                        <div className="flex items-center gap-2">
                          <Avatar name={line.bus?.driverName || 'Bus'} size="sm" />
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{line.bus?.driverName || 'Non renseigne'}</p>
                            <p className="text-[10px] text-gray-400">{line.bus?.driverPhone || 'Telephone indisponible'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-bold">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Taux d'occupation</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {line.occupancyRate}% <span className="text-[9px] text-gray-400 font-medium">({line.enrolledCount}/{line.bus?.capacity || 0})</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(line.occupancyRate, 100)}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className={cn(
                            'h-full rounded-full transition-all duration-1000',
                            line.occupancyRate > 90
                              ? 'bg-rouge-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                              : 'bg-gradient-to-r from-bleu-600 to-bleu-400 shadow-[0_0_8px_rgba(37,99,235,0.3)]',
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <button className="w-full p-4 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-bleu-600 dark:hover:text-or-400 hover:bg-bleu-50 dark:hover:bg-white/10 transition-all border-t border-gray-100 dark:border-white/5">
                    <span className="flex items-center gap-2"><Settings size={14} /> Details de la ligne</span>
                    <ChevronRight size={16} />
                  </button>
                </Card>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="eleves"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {passengerRows.length === 0 ? (
              <Card className="lg:col-span-3 p-10 text-center">
                <p className="text-gray-500 font-semibold">Aucun abonnement transport trouve.</p>
              </Card>
            ) : (
              passengerRows.map((row) => renderPassengerCard(row))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          <span className="gradient-bleu-or-text">
            {editingLine ? 'Modifier la ligne de transport' : 'Nouvelle ligne de transport'}
          </span>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nom de la ligne"
              placeholder="ex: Ligne Nord - Ratoma/Nongo"
              value={formData.routeName}
              onChange={(e) => setFormData((prev) => ({ ...prev, routeName: e.target.value }))}
            />
            <Input
              label="Direction"
              placeholder="ex: Campus EIEF"
              value={formData.direction}
              onChange={(e) => setFormData((prev) => ({ ...prev, direction: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Immatriculation Bus"
              placeholder="ex: AG-6044-EIEF"
              value={formData.plateNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, plateNumber: e.target.value }))}
            />
            <Input
              label="Nom du Chauffeur"
              placeholder="Nom complet"
              value={formData.driverName}
              onChange={(e) => setFormData((prev) => ({ ...prev, driverName: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Telephone du Chauffeur"
              placeholder="+224 6XX XX XX XX"
              value={formData.driverPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, driverPhone: e.target.value }))}
            />
            <Select
              label="Capacite"
              value={String(formData.capacity)}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))
              }
              options={[20, 28, 32, 45, 50].map((value) => ({
                value: String(value),
                label: `${value} places`,
              }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button className="bg-bleu-600 text-white" onClick={handleSaveLine} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin mr-2" />}
              {editingLine ? 'Enregistrer' : 'Creer la ligne'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedLine && isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600 shadow-inner">
              <Bus size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">{selectedLine?.route.name || 'Details de la ligne'}</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">
                Bus : {selectedLine?.bus?.plateNumber || selectedLine?.route.busPlateNumber || '-'}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-8 py-2 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 border-none bg-gray-50 dark:bg-white/5 rounded-2xl text-left border border-gray-100 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-bleu-100 dark:bg-bleu-900/20 rounded-xl text-bleu-600">
                  <Users size={18} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chauffeur</p>
              </div>
              <div className="flex items-center gap-3">
                <Avatar name={selectedLine?.bus?.driverName || 'Bus'} size="sm" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedLine?.bus?.driverName || 'Non renseigne'}</p>
                  <p className="text-[10px] text-gray-500 font-semibold italic">{selectedLine?.bus?.driverPhone || 'Telephone indisponible'}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-none bg-gray-50 dark:bg-white/5 rounded-2xl text-left border border-gray-100 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-or-100 dark:bg-or-900/20 rounded-xl text-or-600">
                  <Settings size={18} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicule</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{selectedLine?.bus?.plateNumber || '-'}</p>
                <Badge variant={selectedLine?.bus?.isActive ? 'success' : 'error'} className="text-[8px] font-bold px-2 border-none">
                  {selectedLine?.bus?.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </Card>

            <Card className="p-4 border-none bg-gray-50 dark:bg-white/5 rounded-2xl text-left border border-gray-100 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-vert-100 dark:bg-vert-900/20 rounded-xl text-vert-600">
                  <Activity size={18} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Occupation</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  {selectedPassengers.length} / {selectedLine?.bus?.capacity || 0} Eleves
                </p>
                <div className="w-full h-1 bg-gray-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-vert-500" style={{ width: `${Math.min(selectedLine?.occupancyRate || 0, 100)}%` }} />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5 px-1">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Plan de Route</h3>
                <button
                  onClick={() => openGpsPreview(selectedLine)}
                  className="text-bleu-600 dark:text-or-400 text-[10px] font-bold flex items-center gap-2 hover:underline"
                >
                  <MapPin size={12} /> Voir sur la carte
                </button>
              </div>
              <div className="relative space-y-4 max-h-[250px] overflow-y-auto no-scrollbar pr-2 text-left">
                {selectedStops.length === 0 ? (
                  <p className="text-sm text-gray-400 px-1">Aucun arret n'est encore enregistre pour cette ligne.</p>
                ) : (
                  selectedStops
                    .slice()
                    .sort((a, b) => a.orderPosition - b.orderPosition)
                    .map((stop) => (
                      <div key={stop.id} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold bg-bleu-100 text-bleu-600">
                            {String(stop.orderPosition).padStart(2, '0')}
                          </div>
                          <div className="text-left font-bold">
                            <p className="text-xs transition-colors text-gray-900 dark:text-white">{stop.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic leading-none">
                              Lat: {stop.latitude ?? '-'} | Lng: {stop.longitude ?? '-'}
                            </p>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-bleu-600 animate-pulse" />
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5 px-1">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Passagers Assignes</h3>
                <Badge className="bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400 border-none font-bold text-[9px]">
                  {selectedPassengers.length} Eleves
                </Badge>
              </div>
              <div className="relative space-y-3 max-h-[250px] overflow-y-auto no-scrollbar pr-2">
                {selectedPassengers.length === 0 ? (
                  <p className="text-sm text-gray-400 px-1">Aucun eleve n'est inscrit sur ce bus.</p>
                ) : (
                  selectedPassengers.map((passenger) => (
                    <div key={passenger.id} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm group hover:border-bleu-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <Avatar name={passenger.studentName} size="sm" />
                        <div className="text-left font-bold">
                          <p className="text-xs text-gray-900 dark:text-white leading-tight">{passenger.studentName}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{passenger.stopName || 'Sans arret'}</p>
                        </div>
                      </div>
                      <Badge variant="info" className="text-[8px] font-bold px-2 h-5 border-none">
                        {passenger.direction || 'ALLER'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl" onClick={() => setIsDetailsModalOpen(false)}>
              Fermer
            </Button>
            <Button className="flex-1 h-12 bg-bleu-600 text-white shadow-lg shadow-bleu-600/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl" onClick={() => openGpsPreview(selectedLine)}>
              Ouvrir l'apercu du trajet
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl text-bleu-600 shadow-inner">
              <Navigation2 size={24} className="animate-pulse" />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Apercu de trajet</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">
                {selectedLine ? `${selectedLine.route.name} - ${selectedLine.bus?.plateNumber || selectedLine.route.busPlateNumber}` : 'Aucune ligne selectionnee'}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-8 py-2">
          <div className="relative aspect-video rounded-[2rem] bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-white/5 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-bleu-600/5 to-transparent" />

            <svg className="absolute inset-0 w-full h-full p-12" viewBox="0 0 800 400" fill="none">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
                d="M50 300 C 150 100, 350 400, 450 150 C 550 50, 750 250, 750 100"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-bleu-600/20 dark:text-bleu-400/10"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 0.6 }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
                d="M50 300 C 150 100, 350 400, 450 150 C 550 50, 750 250, 750 100"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="8 12"
                strokeLinecap="round"
                className="text-bleu-600 dark:text-or-400"
              />
            </svg>

            <motion.div
              animate={{ x: [100, 150, 300, 400, 380], y: [280, 150, 320, 180, 160] }}
              transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
              className="absolute z-20"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-bleu-600/30 rounded-full animate-ping" />
                <div className="bg-bleu-600 text-white p-3 rounded-2xl shadow-2xl relative border-2 border-white dark:border-gray-900 group-hover:scale-125 transition-transform">
                  <Bus size={20} />
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-lg border border-gray-100 dark:border-white/10 whitespace-nowrap">
                  <p className="text-[9px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                    {selectedLine?.bus?.plateNumber || selectedLine?.route.busPlateNumber || '-'}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/50 dark:border-white/10 shadow-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-vert-500 animate-pulse" />
                <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest leading-none">
                  Direction : {selectedLine?.route.direction || 'Non definie'}
                </p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/50 dark:border-white/10 shadow-xl flex items-center gap-3 text-right">
                <div className="text-right">
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Prochain arret</p>
                  <p className="text-[10px] text-gray-900 dark:text-white font-bold uppercase tracking-widest">
                    {selectedStops[0]?.name || 'Aucun arret'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Feuille de Route</h3>
              <Badge className="bg-vert-100 text-vert-700 border-none font-bold text-[9px] px-3 py-1">
                {selectedStops.length} arrets
              </Badge>
            </div>

            <div className="flex items-center relative px-2 overflow-x-auto no-scrollbar gap-8">
              <div className="absolute left-10 right-10 top-5 h-0.5 bg-gray-100 dark:bg-white/5" />
              {(selectedStops.length
                ? selectedStops
                : [{ id: 'empty', name: 'Aucun arret', orderPosition: 1, routeId: '', routeName: '', latitude: null, longitude: null }]).map((stop, idx, array) => (
                <div key={stop.id} className="relative z-10 flex flex-col items-center min-w-[100px] group">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2',
                      idx === 0
                        ? 'bg-bleu-600 text-white border-white shadow-xl scale-110'
                        : idx === array.length - 1
                        ? 'bg-rouge-50 text-rouge-600 border-rouge-100'
                        : 'bg-white dark:bg-gray-800 text-gray-300 border-gray-100 dark:border-white/5',
                    )}
                  >
                    {idx === 0 ? <MapPin size={18} className="animate-bounce" /> : idx === array.length - 1 ? <Navigation2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />}
                  </div>
                  <div className="mt-3 text-center">
                    <p className={cn('text-[9px] font-bold uppercase tracking-tighter transition-colors mb-0.5', idx === 0 ? 'text-bleu-600' : 'text-gray-400')}>
                      {stop.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-900 dark:text-white">
                      {stop.latitude ?? '-'} / {stop.longitude ?? '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-white/5">
            <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl" onClick={() => setIsMapModalOpen(false)}>
              Fermer l'apercu
            </Button>
            <Button className="flex-1 h-12 bg-bleu-600 text-white shadow-lg shadow-bleu-600/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl" onClick={() => setIsDetailsModalOpen(true)}>
              Revenir aux details
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deletingLine}
        onClose={() => setDeletingLine(null)}
        title={<span className="text-red-500">Supprimer la ligne</span>}
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Voulez-vous vraiment supprimer la route <strong>{deletingLine?.route.name}</strong> ?
          </p>
          <p className="text-xs text-gray-400">
            Cette action supprime la route cote frontend/backend transport. Le bus lui-meme n'est pas desactive ici.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeletingLine(null)} disabled={saving}>
              Annuler
            </Button>
            <Button className="bg-red-600 text-white flex items-center gap-2" onClick={handleDeleteLine} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-vert-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 backdrop-blur-md">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div className="text-left">
                <p className="font-bold text-base tracking-tight">Operation accomplie !</p>
                <p className="text-[12px] text-white/80 font-semibold italic">{successMessage}</p>
              </div>
              <button onClick={() => setIsSuccess(false)} className="ml-6 p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminTransport;
