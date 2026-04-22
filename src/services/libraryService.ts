import { apiRequest } from "./api";
import {
  Resource,
  ResourceRequest,
  ResourceFilters,
  Book,
  BookLoan,
  BookRequest,
} from "../types/library";

const BASE_PATH = "/resources";

export const libraryService = {
  // ===== RESOURCES =====

  // Créer une ressource - POST /resources?uploadedById={uuid}
  createResource: async (
    data: ResourceRequest,
    uploadedById: string,
  ): Promise<Resource> => {
    return apiRequest<Resource>(`${BASE_PATH}?uploadedById=${uploadedById}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Upload de document - POST /resources/upload (multipart/form-data)
  uploadResource: async (
    payload: {
      title: string;
      type: string;
      classId?: string;
      file: File;
    },
    uploadedById: string,
  ): Promise<Resource> => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("type", payload.type);
    if (payload.classId) {
      formData.append("classId", payload.classId);
    }
    formData.append("file", payload.file);
    formData.append("uploadedById", uploadedById);

    return apiRequest<Resource>(`${BASE_PATH}/upload`, {
      method: "POST",
      body: formData,
    });
  },

  // Récupérer toutes les ressources avec filtres - GET /resources?type=&classId=&search=
  getAllResources: async (filters?: ResourceFilters): Promise<Resource[]> => {
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);
    if (filters?.classId) params.append("classId", filters.classId);
    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    const path = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

    return apiRequest<Resource[]>(path, {
      method: "GET",
    });
  },

  // Récupérer une ressource par ID - GET /resources/{id}
  getResourceById: async (id: string): Promise<Resource> => {
    return apiRequest<Resource>(`${BASE_PATH}/${id}`, {
      method: "GET",
    });
  },

  // Récupérer les ressources par enseignant - GET /resources/teacher/{teacherId}
  getResourcesByTeacher: async (teacherId: string): Promise<Resource[]> => {
    return apiRequest<Resource[]>(`${BASE_PATH}/teacher/${teacherId}`, {
      method: "GET",
    });
  },

  // Modifier une ressource - PUT /resources/{id}
  updateResource: async (
    id: string,
    data: ResourceRequest,
  ): Promise<Resource> => {
    return apiRequest<Resource>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Supprimer une ressource - DELETE /resources/{id}
  deleteResource: async (id: string): Promise<void> => {
    return apiRequest<void>(`${BASE_PATH}/${id}`, {
      method: "DELETE",
    });
  },

  // ===== BOOKS =====

  // Récupérer les livres - GET /books?search=
  getAllBooks: async (search?: string): Promise<Book[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest<Book[]>(`/books${query}`, {
      method: "GET",
    });
  },

  // Ajouter un livre - POST /books
  createBook: async (payload: BookRequest): Promise<Book> => {
    return apiRequest<Book>("/books", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Modifier un livre - PUT /books/{id}
  updateBook: async (id: string, payload: BookRequest): Promise<Book> => {
    return apiRequest<Book>(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Supprimer un livre - DELETE /books/{id}
  deleteBook: async (id: string): Promise<void> => {
    return apiRequest<void>(`/books/${id}`, {
      method: "DELETE",
    });
  },

  // Enregistrer un emprunt - POST /books/{bookId}/lend?studentId={studentId}
  lendBook: async (bookId: string, studentId: string): Promise<Book> => {
    return apiRequest<Book>(
      `/books/${bookId}/lend?studentId=${encodeURIComponent(studentId)}`,
      {
        method: "POST",
      },
    );
  },

  // Récupérer les emprunts actifs - GET /books/loans/active
  getActiveLoans: async (): Promise<BookLoan[]> => {
    return apiRequest<BookLoan[]>("/books/loans/active", {
      method: "GET",
    });
  },

  // Récupérer l'historique des prêts d'un livre - GET /books/{bookId}/loans
  getLoansByBook: async (bookId: string): Promise<BookLoan[]> => {
    return apiRequest<BookLoan[]>(`/books/${bookId}/loans`, {
      method: "GET",
    });
  },

  // Récupérer les emprunts en retard - GET /books/loans/overdue
  getOverdueLoans: async (): Promise<BookLoan[]> => {
    return apiRequest<BookLoan[]>("/books/loans/overdue", {
      method: "GET",
    });
  },

  // Marquer le retour d'un emprunt - POST /books/loans/{loanId}/return
  returnLoan: async (loanId: string): Promise<Book> => {
    return apiRequest<Book>(`/books/loans/${loanId}/return`, {
      method: "POST",
    });
  },
};
