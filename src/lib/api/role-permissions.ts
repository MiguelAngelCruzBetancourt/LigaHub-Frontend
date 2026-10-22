import { request } from "./http";
import type {
  AssignPermissionRequestDTO,
  PermissionRoleResponseDTO,
  RolePermissionResponseDTO,
} from "./types";

/** RolePermissionController — @RequestMapping("/api/role-permissions"). */
export const rolePermissionsApi = {
  /** POST /api/role-permissions → 201 */
  assign(payload: AssignPermissionRequestDTO) {
    return request<RolePermissionResponseDTO>("/api/role-permissions", { method: "POST", body: payload });
  },

  /** GET /api/role-permissions — toda la matriz de una sola vez. */
  findAll() {
    return request<RolePermissionResponseDTO[]>("/api/role-permissions");
  },

  /** GET /api/role-permissions/roles/{roleId} → `{id, roleId, permission}[]` */
  findByRoleId(roleId: number) {
    return request<RolePermissionResponseDTO[]>(`/api/role-permissions/roles/${roleId}`);
  },

  /** GET /api/role-permissions/permissions/{permissionId} → `{id, permissionId, role}[]` */
  findByPermissionId(permissionId: number) {
    return request<PermissionRoleResponseDTO[]>(`/api/role-permissions/permissions/${permissionId}`);
  },

  /** DELETE /api/role-permissions/{roleId}/{permissionId} → 204 */
  remove(roleId: number, permissionId: number) {
    return request<void>(`/api/role-permissions/${roleId}/${permissionId}`, { method: "DELETE" });
  },
};
