import { apiRequest } from "./api";
import {
  BusRequest,
  BusResponse,
  RouteRequest,
  RouteResponse,
  StopRequest,
  StopResponse,
  StudentTransportRequest,
  StudentTransportResponse,
} from "../types/transport";

const BASE_PATH = "/buses";

export const transportService = {
  getBuses: (): Promise<BusResponse[]> => apiRequest<BusResponse[]>(BASE_PATH),

  getActiveBuses: (): Promise<BusResponse[]> =>
    apiRequest<BusResponse[]>(`${BASE_PATH}/active`),

  getBusById: (id: string): Promise<BusResponse> =>
    apiRequest<BusResponse>(`${BASE_PATH}/${id}`),

  createBus: (data: BusRequest): Promise<BusResponse> =>
    apiRequest<BusResponse>(BASE_PATH, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBus: (id: string, data: BusRequest): Promise<BusResponse> =>
    apiRequest<BusResponse>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteBus: (id: string): Promise<void> =>
    apiRequest<void>(`${BASE_PATH}/${id}`, { method: "DELETE" }),

  getRoutes: (busId?: string): Promise<RouteResponse[]> => {
    const params = new URLSearchParams();
    if (busId) params.set("busId", busId);
    const query = params.toString();
    return apiRequest<RouteResponse[]>(
      `${BASE_PATH}/routes${query ? `?${query}` : ""}`,
    );
  },

  getRouteById: (id: string): Promise<RouteResponse> =>
    apiRequest<RouteResponse>(`${BASE_PATH}/routes/${id}`),

  createRoute: (data: RouteRequest): Promise<RouteResponse> =>
    apiRequest<RouteResponse>(`${BASE_PATH}/routes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRoute: (id: string, data: RouteRequest): Promise<RouteResponse> =>
    apiRequest<RouteResponse>(`${BASE_PATH}/routes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteRoute: (id: string): Promise<void> =>
    apiRequest<void>(`${BASE_PATH}/routes/${id}`, { method: "DELETE" }),

  getStopsByRoute: (routeId: string): Promise<StopResponse[]> =>
    apiRequest<StopResponse[]>(`${BASE_PATH}/routes/${routeId}/stops`),

  createStop: (data: StopRequest): Promise<StopResponse> =>
    apiRequest<StopResponse>(`${BASE_PATH}/stops`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStop: (id: string, data: StopRequest): Promise<StopResponse> =>
    apiRequest<StopResponse>(`${BASE_PATH}/stops/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteStop: (id: string): Promise<void> =>
    apiRequest<void>(`${BASE_PATH}/stops/${id}`, { method: "DELETE" }),

  createEnrollment: (
    data: StudentTransportRequest,
  ): Promise<StudentTransportResponse> =>
    apiRequest<StudentTransportResponse>(`${BASE_PATH}/enrollments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getEnrollmentsByBus: (busId: string): Promise<StudentTransportResponse[]> =>
    apiRequest<StudentTransportResponse[]>(`${BASE_PATH}/${busId}/enrollments`),

  getEnrollmentsByStudent: (
    studentId: string,
  ): Promise<StudentTransportResponse[]> =>
    apiRequest<StudentTransportResponse[]>(
      `${BASE_PATH}/enrollments/student/${studentId}`,
    ),

  deleteEnrollment: (id: string): Promise<void> =>
    apiRequest<void>(`${BASE_PATH}/enrollments/${id}`, { method: "DELETE" }),
};
