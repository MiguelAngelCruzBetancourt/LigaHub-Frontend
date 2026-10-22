import { request } from "./http";
import type { AssignRoleRequestDTO, RoleUserResponseDTO, UserRoleResponseDTO } from "./types";

/** UserRoleController — @RequestMapping("/api/user-roles"). */
export const userRolesApi = {
  /** POST /api/user-roles → 201 */
  assign(payload: AssignRoleRequestDTO) {
    return request<UserRoleResponseDTO>("/api/user-roles", { method: "POST", body: payload });
  },

  /** GET /api/user-roles — todos los vínculos de una sola vez. */
  findAll() {
    return request<UserRoleResponseDTO[]>("/api/user-roles");
  },

  /** GET /api/user-roles/users/{userId} → `{id, userId, role}[]` */
  findByUserId(userId: number) {
    return request<UserRoleResponseDTO[]>(`/api/user-roles/users/${userId}`);
  },

  /** GET /api/user-roles/roles/{roleId} → `{id, roleId, user}[]` (forma distinta). */
  findByRoleId(roleId: number) {
    return request<RoleUserResponseDTO[]>(`/api/user-roles/roles/${roleId}`);
  },

  /** DELETE /api/user-roles/{userId}/{roleId} → 204 */
  remove(userId: number, roleId: number) {
    return request<void>(`/api/user-roles/${userId}/${roleId}`, { method: "DELETE" });
  },
};
