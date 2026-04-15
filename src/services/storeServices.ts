import { apiRequest } from "./api";

// ─── Types alignés sur les DTOs backend ─────────────────────────────────────

export interface ProductResponse {
  id: string;
  category: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  alertThreshold: number;
  lowStock: boolean;
}

export interface ProductRequest {
  category: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  alertThreshold: number;
}

export interface SaleItemRequest {
  productId: string;
  quantity: number;
}

export interface SaleRequest {
  studentId?: string | null;
  items: SaleItemRequest[];
}

export interface SaleItemResponse {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleResponse {
  id: string;
  studentId: string | null;
  studentName: string | null;
  totalAmount: number;
  items: SaleItemResponse[];
  createdAt: string; // ISO 8601 LocalDateTime
}

// ─── Products ────────────────────────────────────────────────────────────────

export const addProduct = (data: ProductRequest): Promise<ProductResponse> =>
  apiRequest<ProductResponse>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getAllProducts = (params?: {
  category?: string;
  search?: string;
}): Promise<ProductResponse[]> => {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  else if (params?.category) query.set("category", params.category);
  const qs = query.toString();
  return apiRequest<ProductResponse[]>(`/products${qs ? `?${qs}` : ""}`);
};

export const getProductById = (id: string): Promise<ProductResponse> =>
  apiRequest<ProductResponse>(`/products/${id}`);

export const getLowStockProducts = (): Promise<ProductResponse[]> =>
  apiRequest<ProductResponse[]>("/products/low-stock");

export const updateProduct = (
  id: string,
  data: ProductRequest
): Promise<ProductResponse> =>
  apiRequest<ProductResponse>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const updateStock = (
  id: string,
  quantity: number
): Promise<ProductResponse> =>
  apiRequest<ProductResponse>(`/products/${id}/stock?quantity=${quantity}`, {
    method: "PATCH",
  });

export const deleteProduct = (id: string): Promise<void> =>
  apiRequest<void>(`/products/${id}`, { method: "DELETE" });

// ─── Sales ───────────────────────────────────────────────────────────────────

export const createSale = (data: SaleRequest): Promise<SaleResponse> =>
  apiRequest<SaleResponse>("/products/sales", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getAllSales = (studentId?: string): Promise<SaleResponse[]> => {
  const qs = studentId ? `?studentId=${studentId}` : "";
  return apiRequest<SaleResponse[]>(`/products/sales${qs}`);
};

export const getSaleById = (id: string): Promise<SaleResponse> =>
  apiRequest<SaleResponse>(`/products/sales/${id}`);
