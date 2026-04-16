import { useQuery } from "@tanstack/react-query";
import { teacherService } from "../services/teacherService";

const QUERY_KEYS = {
  teacherDashboard: "teacherDashboard",
  teacherClasses: "teacherClasses",
  classStudents: "classStudents",
};

export const useTeacherDashboard = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.teacherDashboard, userId],
    queryFn: () => teacherService.getDashboard(userId),
    enabled: !!userId,
  });
};

export const useTeacherClasses = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.teacherClasses, userId],
    queryFn: () => teacherService.getClasses(userId),
    enabled: !!userId,
  });
};

export const useClassStudents = (classId: string, subjectId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.classStudents, classId, subjectId],
    queryFn: () => teacherService.getClassStudents(classId, subjectId),
    enabled: !!classId && !!subjectId,
  });
};