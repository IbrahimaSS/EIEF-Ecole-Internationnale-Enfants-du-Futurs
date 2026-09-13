import {
  AuthRequest,
  ChangePasswordRequest,
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

export const changePasswordRequest = async (
  token: string,
  payload: ChangePasswordRequest,
): Promise<User> => {
  const userResponse = await apiRequest<UserResponse>("/users/me/password", {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  });
  return mapUserResponseToUser(userResponse);
};
