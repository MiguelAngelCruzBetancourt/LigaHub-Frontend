import { request } from "./http";
import type { PermissionRequestDTO, PermissionResponseDTO } from "./types";

/** PermissionController — @RequestMapping("/api/permissions"). */
export const permissionsApi = {
  /** POST /api/permissions → 201 */
  create(payload: PermissionRequestDTO) {
    return request<PermissionResponseDTO>("/api/permissions", { method: "POST", body: payload });
  },

  /** GET /api/permissions */
  findAll() {
    return request<PermissionResponseDTO[]>("/api/permissions");
  },

  /** GET /api/permissions/{id} */
  findById(id: number) {
    return request<PermissionResponseDTO>(`/api/permissions/${id}`);
  },

  /** PUT /api/permissions/{id} */
  update(id: number, payload: PermissionRequestDTO) {
    return request<PermissionResponseDTO>(`/api/permissions/${id}`, { method: "PUT", body: payload });
  },

  /** DELETE /api/permissions/{id} → 204 */
  remove(id: number) {
    return request<void>(`/api/permissions/${id}`, { method: "DELETE" });
  },
};
