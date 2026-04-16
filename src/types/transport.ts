export interface BusResponse {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string | null;
  capacity: number;
  isActive: boolean;
}

export interface BusRequest {
  plateNumber: string;
  driverName: string;
  driverPhone?: string;
  capacity: number;
}

export interface RouteResponse {
  id: string;
  busId: string;
  busPlateNumber: string;
  name: string;
  direction: string | null;
}

export interface RouteRequest {
  busId: string;
  name: string;
  direction?: string;
}

export interface StopResponse {
  id: string;
  routeId: string;
  routeName: string;
  name: string;
  orderPosition: number;
  latitude: number | null;
  longitude: number | null;
}

export interface StopRequest {
  routeId: string;
  name: string;
  orderPosition: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface StudentTransportResponse {
  id: string;
  studentId: string;
  studentName: string;
  busId: string;
  busPlateNumber: string;
  stopId: string | null;
  stopName: string | null;
  direction: string | null;
  academicYearId: string | null;
}

export interface StudentTransportRequest {
  studentId: string;
  busId: string;
  stopId?: string | null;
  direction?: string;
  academicYearId?: string | null;
}

export interface TransportLineForm {
  routeName: string;
  direction: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
}

export interface TransportLineView {
  route: RouteResponse;
  bus: BusResponse | null;
  enrolledCount: number;
  occupancyRate: number;
  status: "En route" | "Disponible" | "Inactif";
}
