import { apiRequest } from "./api";
import { ClassResponse } from "../types/academic";

const BASE_PATH = "/courses/classes";

export const classService = {
  getAll: (): Promise<ClassResponse[]> => apiRequest<ClassResponse[]>(BASE_PATH),
};
