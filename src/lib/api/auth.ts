import { request } from "./http";
import type { AuthResponseDTO, CreateUserDTO, LoginRequestDTO, UserResponseDTO } from "./types";

/** Rutas públicas del backend: login y registro (POST /api/users). */
export const authApi = {
  /** POST /api/users → 201. Registro sin sesión: el usuario queda sin roles. */
  register(payload: CreateUserDTO) {
    return request<UserResponseDTO>("/api/users", { method: "POST", body: payload, skipAuth: true });
  },

  /** POST /api/auth/login */
  login(credentials: LoginRequestDTO) {
    return request<AuthResponseDTO>("/api/auth/login", {
      method: "POST",
      body: credentials,
      skipAuth: true,
    });
  },
};
