import { apiRequest } from "./api";
import { 
  Resource, 
  ResourceRequest, 
  Book, 
  BookRequest, 
  BookLoan,
  ResourceFilters 
} from "../types/library";

const BASE_PATH = "/resources";

export const libraryService = {
  // ===== RESOURCES =====
  
  // Créer une ressource - POST /resources?uploadedById={uuid}
  createResource: async (
    data: ResourceRequest, 
    uploadedById: string
  ): Promise<Resource> => {
    return apiRequest<Resource>(`${BASE_PATH}?uploadedById=${uploadedById}`, {
      method: "POST",
      body: JSON.stringify(data),
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
    data: ResourceRequest
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

  // ===== BOOKS (à implémenter côté backend si nécessaire) =====
  
  // Note: Votre backend montre des DTOs Book mais pas de contrôleur exposé
  // Si vous avez un BookController, ajoutez les méthodes similaires ici
};