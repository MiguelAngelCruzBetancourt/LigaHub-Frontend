import { request } from "./http";
import type {
  CreateUserDTO,
  UpdateUserDTO,
  UserDetailResponseDTO,
  UserResponseDTO,
  UserRolesResponseDTO,
  UserSessionsResponseDTO,
} from "./types";

/** UserController — @RequestMapping("/api/users"). */
export const usersApi = {
  /** POST /api/users → 201 */
  create(payload: CreateUserDTO) {
    return request<UserResponseDTO>("/api/users", { method: "POST", body: payload });
  },

  /** GET /api/users */
  findAll() {
    return request<UserResponseDTO[]>("/api/users");
  },

  /** GET /api/users/{id} */
  findById(id: number) {
    return request<UserResponseDTO>(`/api/users/${id}`);
  },

  /** GET /api/users/{id}/profile → usuario + perfil anidado (profile puede ser null). */
  findByIdWithProfile(id: number) {
    return request<UserDetailResponseDTO>(`/api/users/${id}/profile`);
  },

  /** PUT /api/users/{id} */
  update(id: number, payload: UpdateUserDTO) {
    return request<UserResponseDTO>(`/api/users/${id}`, { method: "PUT", body: payload });
  },

  /** PUT /api/users/{id}/status — activa o desactiva sin tocar roles ni permisos. */
  updateStatus(id: number, active: boolean) {
    return request<UserResponseDTO>(`/api/users/${id}/status`, { method: "PUT", body: { active } });
  },

  /** DELETE /api/users/{id} → 204 */
  remove(id: number) {
    return request<void>(`/api/users/${id}`, { method: "DELETE" });
  },

  /** GET /api/users/{id}/detail-with-sessions */
  findByIdWithSessions(id: number) {
    return request<UserSessionsResponseDTO>(`/api/users/${id}/detail-with-sessions`);
  },

  /** GET /api/users/{id}/detail-with-roles */
  findByIdWithRoles(id: number) {
    return request<UserRolesResponseDTO>(`/api/users/${id}/detail-with-roles`);
  },
};
