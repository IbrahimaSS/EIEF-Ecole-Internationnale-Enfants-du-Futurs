import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "../services/attendanceService";
import {
  AttendanceRequest,
  BulkAttendanceRequest,
} from "../types/academic";
import { toast } from "sonner"; // ou ta lib de notifications

const QUERY_KEYS = {
  attendance: "attendance",
  studentAttendance: "studentAttendance",
  scheduleAttendance: "scheduleAttendance",
};

export const useAttendance = () => {
  const queryClient = useQueryClient();

  // Mutation: Créer une présence
  const createMutation = useMutation({
    mutationFn: attendanceService.create,
    onSuccess: () => {
      toast.success("Présence enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.attendance] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    },
  });

  // Mutation: Créer en masse
  const bulkCreateMutation = useMutation({
    mutationFn: attendanceService.bulkCreate,
    onSuccess: () => {
      toast.success("Présences enregistrées avec succès");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.attendance] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'enregistrement en masse");
    },
  });

  // Mutation: Mettre à jour
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AttendanceRequest }) =>
      attendanceService.update(id, data),
    onSuccess: () => {
      toast.success("Présence mise à jour");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.attendance] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  // Mutation: Supprimer
  const deleteMutation = useMutation({
    mutationFn: attendanceService.delete,
    onSuccess: () => {
      toast.success("Présence supprimée");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.attendance] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  return {
    create: createMutation.mutate,
    bulkCreate: bulkCreateMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isBulkCreating: bulkCreateMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// Query: Récupérer les présences par emploi du temps et date
export const useScheduleAttendance = (scheduleId: string, date: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.scheduleAttendance, scheduleId, date],
    queryFn: () => attendanceService.getByScheduleAndDate(scheduleId, date),
    enabled: !!scheduleId && !!date,
  });
};

// Query: Récupérer les présences d'un étudiant
export const useStudentAttendance = (studentId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.studentAttendance, studentId],
    queryFn: () => attendanceService.getByStudent(studentId),
    enabled: !!studentId,
  });
};