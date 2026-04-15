import { useQuery } from "@tanstack/react-query";
import { classService } from "../services/classService";

const QUERY_KEYS = {
  classes: "classes",
};

export const useClasses = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.classes],
    queryFn: classService.getAll,
  });
};
