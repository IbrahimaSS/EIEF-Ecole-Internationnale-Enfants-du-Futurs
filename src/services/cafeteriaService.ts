import { apiRequest } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MealRequest {
  name: string;
  description?: string;
  servedOn: string; // ISO date "YYYY-MM-DD"
  price?: number;
  stockQuantity: number;
}

export interface MealResponse {
  id: string;
  name: string;
  description?: string;
  servedOn: string;
  price?: number;
  stockQuantity: number;
}

export interface CanteenMenuRequest {
  menuDate: string; // ISO date "YYYY-MM-DD"
  description: string;
  price?: number;
}

export interface CanteenMenuResponse {
  id: string;
  menuDate: string;
  description: string;
  price?: number;
}

export interface CanteenSubscriptionRequest {
  studentId: string;
  startDate: string; // ISO date
  endDate: string;
  planType?: string;
  amount?: number;
}

export interface CanteenSubscriptionResponse {
  id: string;
  studentId: string;
  studentName: string;
  startDate: string;
  endDate: string;
  planType?: string;
  amount?: number;
}

// ─── Meals ────────────────────────────────────────────────────────────────────

export const createMeal = (data: MealRequest): Promise<MealResponse> =>
  apiRequest<MealResponse>("/meals", { method: "POST", body: JSON.stringify(data) });

export const getMeals = (date?: string): Promise<MealResponse[]> =>
  apiRequest<MealResponse[]>(`/meals${date ? `?date=${date}` : ""}`);

export const getMealById = (id: string): Promise<MealResponse> =>
  apiRequest<MealResponse>(`/meals/${id}`);

export const updateMealStock = (id: string, quantity: number): Promise<MealResponse> =>
  apiRequest<MealResponse>(`/meals/${id}/stock?quantity=${quantity}`, { method: "PATCH" });

export const deleteMeal = (id: string): Promise<void> =>
  apiRequest<void>(`/meals/${id}`, { method: "DELETE" });

// ─── Menus ────────────────────────────────────────────────────────────────────

export const createMenu = (data: CanteenMenuRequest): Promise<CanteenMenuResponse> =>
  apiRequest<CanteenMenuResponse>("/meals/menus", { method: "POST", body: JSON.stringify(data) });

export const getMenus = (date?: string): Promise<CanteenMenuResponse[]> =>
  apiRequest<CanteenMenuResponse[]>(`/meals/menus${date ? `?date=${date}` : ""}`);

export const getMenuById = (id: string): Promise<CanteenMenuResponse> =>
  apiRequest<CanteenMenuResponse>(`/meals/menus/${id}`);

export const updateMenu = (id: string, data: CanteenMenuRequest): Promise<CanteenMenuResponse> =>
  apiRequest<CanteenMenuResponse>(`/meals/menus/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteMenu = (id: string): Promise<void> =>
  apiRequest<void>(`/meals/menus/${id}`, { method: "DELETE" });

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const createSubscription = (data: CanteenSubscriptionRequest): Promise<CanteenSubscriptionResponse> =>
  apiRequest<CanteenSubscriptionResponse>("/meals/subscriptions", { method: "POST", body: JSON.stringify(data) });

export const getSubscriptions = (): Promise<CanteenSubscriptionResponse[]> =>
  apiRequest<CanteenSubscriptionResponse[]>("/meals/subscriptions");

export const deleteSubscription = (id: string): Promise<void> =>
  apiRequest<void>(`/meals/subscriptions/${id}`, { method: "DELETE" });
