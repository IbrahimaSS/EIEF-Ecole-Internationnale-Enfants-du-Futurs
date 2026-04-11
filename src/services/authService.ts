import {
  AuthRequest,
  AuthResponse,
  User,
  UserResponse,
  mapBackendRoleToUserRole,
  mapUserResponseToUser,
} from "../types/auth";
import { apiRequest } from "./api";

export const loginRequest = async (
  payload: AuthRequest,
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>("/users/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchCurrentUser = async (
  token: string,
): Promise<UserResponse> => {
  return apiRequest<UserResponse>("/users/me", {
    method: "GET",
    token,
  });
};

export const fetchAuthenticatedUser = async (token: string): Promise<User> => {
  const userResponse = await fetchCurrentUser(token);
  const mappedUser = mapUserResponseToUser(userResponse);

  return {
    ...mappedUser,
    role: mapBackendRoleToUserRole(userResponse.roleName),
  };
};
