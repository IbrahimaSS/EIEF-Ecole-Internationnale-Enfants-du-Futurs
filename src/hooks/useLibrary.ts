import { useState, useCallback } from "react";
import { libraryService } from "../services/libraryService";
import { 
  Resource, 
  ResourceRequest, 
  ResourceFilters,
  Book,
  BookLoan 
} from "../types/library";
import { ApiError } from "../services/api";

interface UseLibraryReturn {
  // État
  resources: Resource[];
  currentResource: Resource | null;
  loading: boolean;
  error: string | null;
  
  // Actions Resources
  fetchResources: (filters?: ResourceFilters) => Promise<void>;
  fetchResourceById: (id: string) => Promise<void>;
  fetchResourcesByTeacher: (teacherId: string) => Promise<void>;
  createResource: (data: ResourceRequest, uploadedById: string) => Promise<void>;
  updateResource: (id: string, data: ResourceRequest) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  
  // Utilitaires
  clearError: () => void;
  clearCurrentResource: () => void;
}

export const useLibrary = (): UseLibraryReturn => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearCurrentResource = () => setCurrentResource(null);

  // Récupérer toutes les ressources (avec filtres optionnels)
  const fetchResources = useCallback(async (filters?: ResourceFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await libraryService.getAllResources(filters);
      setResources(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors du chargement des ressources");
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer une ressource par ID
  const fetchResourceById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await libraryService.getResourceById(id);
      setCurrentResource(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors du chargement de la ressource");
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les ressources par enseignant
  const fetchResourcesByTeacher = useCallback(async (teacherId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await libraryService.getResourcesByTeacher(teacherId);
      setResources(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors du chargement des ressources de l'enseignant");
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une ressource
  const createResource = useCallback(async (data: ResourceRequest, uploadedById: string) => {
    setLoading(true);
    setError(null);
    try {
      await libraryService.createResource(data, uploadedById);
      // Recharger la liste après création
      await fetchResources();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors de la création de la ressource");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchResources]);

  // Modifier une ressource
  const updateResource = useCallback(async (id: string, data: ResourceRequest) => {
    setLoading(true);
    setError(null);
    try {
      await libraryService.updateResource(id, data);
      // Recharger la liste après modification
      await fetchResources();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors de la modification de la ressource");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchResources]);

  // Supprimer une ressource
  const deleteResource = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await libraryService.deleteResource(id);
      // Recharger la liste après suppression
      await fetchResources();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors de la suppression de la ressource");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchResources]);

  return {
    resources,
    currentResource,
    loading,
    error,
    fetchResources,
    fetchResourceById,
    fetchResourcesByTeacher,
    createResource,
    updateResource,
    deleteResource,
    clearError,
    clearCurrentResource,
  };
};