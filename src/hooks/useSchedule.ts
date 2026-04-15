import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "../services/scheduleService";
import { ScheduleRequest } from "../types/academic";
import { toast } from "sonner";

const QUERY_KEYS = {
  schedules: "schedules",
  schedule: "schedule",
  teacherSchedules: "teacherSchedules",
  classSchedules: "classSchedules",
};

export const useSchedules = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.schedules],
    queryFn: scheduleService.getAll,
  });
};

export const useSchedule = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.schedule, id],
    queryFn: () => scheduleService.getById(id),
    enabled: !!id,
  });
};

export const useTeacherSchedules = (teacherId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.teacherSchedules, teacherId],
    queryFn: () => scheduleService.getByTeacher(teacherId),
    enabled: !!teacherId,
  });
};

export const useTeacherDaySchedules = (teacherId: string, day: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.teacherSchedules, teacherId, day],
    queryFn: () => scheduleService.getByTeacherAndDay(teacherId, day),
    enabled: !!teacherId && day >= 1 && day <= 7,
  });
};

export const useClassSchedules = (classId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.classSchedules, classId],
    queryFn: () => scheduleService.getByClass(classId),
    enabled: !!classId,
  });
};

export const useScheduleMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: scheduleService.create,
    onSuccess: () => {
      toast.success("Emploi du temps créé");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.schedules] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.classSchedules] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScheduleRequest }) =>
      scheduleService.update(id, data),
    onSuccess: () => {
      toast.success("Emploi du temps mis à jour");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.schedules] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.classSchedules] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: scheduleService.delete,
    onSuccess: () => {
      toast.success("Emploi du temps supprimé");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.schedules] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.classSchedules] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
