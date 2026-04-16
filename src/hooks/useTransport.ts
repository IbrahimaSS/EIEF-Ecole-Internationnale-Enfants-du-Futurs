import { useCallback, useState } from "react";
import { ApiError } from "../services/api";
import { transportService } from "../services/transportService";
import {
  BusRequest,
  BusResponse,
  RouteRequest,
  RouteResponse,
  StopResponse,
  StudentTransportResponse,
  TransportLineForm,
} from "../types/transport";

interface UseTransportReturn {
  buses: BusResponse[];
  routes: RouteResponse[];
  enrollmentsByBus: Record<string, StudentTransportResponse[]>;
  routeStops: Record<string, StopResponse[]>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchTransportData: () => Promise<void>;
  fetchRouteStops: (routeId: string) => Promise<StopResponse[]>;
  fetchBusEnrollments: (busId: string) => Promise<StudentTransportResponse[]>;
  createLine: (data: TransportLineForm) => Promise<void>;
  updateLine: (
    routeId: string,
    busId: string,
    data: TransportLineForm,
  ) => Promise<void>;
  deleteLine: (routeId: string) => Promise<void>;
  clearError: () => void;
}

const toBusRequest = (data: TransportLineForm): BusRequest => ({
  plateNumber: data.plateNumber.trim(),
  driverName: data.driverName.trim(),
  driverPhone: data.driverPhone.trim() || undefined,
  capacity: Number(data.capacity) || 0,
});

const toRouteRequest = (busId: string, data: TransportLineForm): RouteRequest => ({
  busId,
  name: data.routeName.trim(),
  direction: data.direction.trim() || undefined,
});

export const useTransport = (): UseTransportReturn => {
  const [buses, setBuses] = useState<BusResponse[]>([]);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [enrollmentsByBus, setEnrollmentsByBus] = useState<
    Record<string, StudentTransportResponse[]>
  >({});
  const [routeStops, setRouteStops] = useState<Record<string, StopResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchTransportData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [busesData, routesData] = await Promise.all([
        transportService.getBuses(),
        transportService.getRoutes(),
      ]);

      setBuses(busesData);
      setRoutes(routesData);

      const activeBusIds = busesData
        .filter((bus) => bus.isActive)
        .map((bus) => bus.id);

      const enrollmentsEntries = await Promise.all(
        activeBusIds.map(async (busId) => {
          try {
            const enrollments = await transportService.getEnrollmentsByBus(busId);
            return [busId, enrollments] as const;
          } catch {
            return [busId, []] as const;
          }
        }),
      );

      setEnrollmentsByBus(Object.fromEntries(enrollmentsEntries));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors du chargement du transport");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRouteStops = useCallback(async (routeId: string) => {
    try {
      const stops = await transportService.getStopsByRoute(routeId);
      setRouteStops((prev) => ({ ...prev, [routeId]: stops }));
      return stops;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors du chargement des arrêts");
      return [];
    }
  }, []);

  const fetchBusEnrollments = useCallback(async (busId: string) => {
    try {
      const enrollments = await transportService.getEnrollmentsByBus(busId);
      setEnrollmentsByBus((prev) => ({ ...prev, [busId]: enrollments }));
      return enrollments;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors du chargement des abonnements");
      return [];
    }
  }, []);

  const createLine = useCallback(
    async (data: TransportLineForm) => {
      setSaving(true);
      setError(null);

      try {
        const createdBus = await transportService.createBus(toBusRequest(data));
        await transportService.createRoute(toRouteRequest(createdBus.id, data));
        await fetchTransportData();
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Erreur lors de la création de la ligne");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchTransportData],
  );

  const updateLine = useCallback(
    async (routeId: string, busId: string, data: TransportLineForm) => {
      setSaving(true);
      setError(null);

      try {
        await Promise.all([
          transportService.updateBus(busId, toBusRequest(data)),
          transportService.updateRoute(routeId, toRouteRequest(busId, data)),
        ]);
        await fetchTransportData();
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Erreur lors de la mise à jour de la ligne");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchTransportData],
  );

  const deleteLine = useCallback(
    async (routeId: string) => {
      setSaving(true);
      setError(null);

      try {
        await transportService.deleteRoute(routeId);
        await fetchTransportData();
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Erreur lors de la suppression de la ligne");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchTransportData],
  );

  return {
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
  };
};
