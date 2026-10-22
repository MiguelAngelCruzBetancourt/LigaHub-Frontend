import { request } from "./http";
import type { RolePermissionsResponseDTO, RoleRequestDTO, RoleResponseDTO } from "./types";

/** RoleController — @RequestMapping("/api/roles"). */
export const rolesApi = {
  /** POST /api/roles → 201 */
  create(payload: RoleRequestDTO) {
    return request<RoleResponseDTO>("/api/roles", { method: "POST", body: payload });
  },

  /** GET /api/roles */
  findAll() {
    return request<RoleResponseDTO[]>("/api/roles");
  },

  /** GET /api/roles/{id} */
  findById(id: number) {
    return request<RoleResponseDTO>(`/api/roles/${id}`);
  },

  /** PUT /api/roles/{id} */
  update(id: number, payload: RoleRequestDTO) {
    return request<RoleResponseDTO>(`/api/roles/${id}`, { method: "PUT", body: payload });
  },

  /** DELETE /api/roles/{id} → 204 */
  remove(id: number) {
    return request<void>(`/api/roles/${id}`, { method: "DELETE" });
  },

  /** GET /api/roles/{id}/detail-with-permissions */
  findByIdWithPermissions(id: number) {
    return request<RolePermissionsResponseDTO>(`/api/roles/${id}/detail-with-permissions`);
  },
};
