import { request } from "./http";
import type { ProfileRequestDTO, ProfileResponseDTO, UserDetailResponseDTO } from "./types";

/**
 * ProfileController — @RequestMapping("/api/users/{userId}/profile").
 *
 * Ojo: este controlador no expone GET. Para leer un perfil hay que usar
 * `usersApi.findByIdWithProfile`, que devuelve el usuario con el perfil anidado.
 */
export const profilesApi = {
  /**
   * GET /api/profile/me — usuario autenticado + su perfil (null si aún no tiene).
   * El backend toma la identidad del token: no se envía ningún id.
   */
  findMine() {
    return request<UserDetailResponseDTO>("/api/profile/me");
  },

  /** PUT /api/profile/me — crea el perfil propio si no existe; si existe, lo actualiza. */
  saveMine(payload: ProfileRequestDTO) {
    return request<ProfileResponseDTO>("/api/profile/me", { method: "PUT", body: payload });
  },

  /** POST /api/users/{userId}/profile → 201 */
  create(userId: number, payload: ProfileRequestDTO) {
    return request<ProfileResponseDTO>(`/api/users/${userId}/profile`, { method: "POST", body: payload });
  },

  /** PUT /api/users/{userId}/profile */
  update(userId: number, payload: ProfileRequestDTO) {
    return request<ProfileResponseDTO>(`/api/users/${userId}/profile`, { method: "PUT", body: payload });
  },

  /** DELETE /api/users/{userId}/profile → 204 */
  remove(userId: number) {
    return request<void>(`/api/users/${userId}/profile`, { method: "DELETE" });
  },
};
