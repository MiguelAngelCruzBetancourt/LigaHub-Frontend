import { request } from "./http";
import type { SessionRequestDTO, SessionResponseDTO } from "./types";

/**
 * SessionController — @RequestMapping("/api/users/{userId}/sessions").
 *
 * Es un CRUD manual: el login NO crea filas aquí y `code2FA` es solo una
 * columna de texto (el backend no genera ni valida códigos).
 */
export const sessionsApi = {
  /** POST /api/users/{userId}/sessions → 201 */
  create(userId: number, payload: SessionRequestDTO) {
    return request<SessionResponseDTO>(`/api/users/${userId}/sessions`, { method: "POST", body: payload });
  },

  /** GET /api/users/{userId}/sessions */
  findAll(userId: number) {
    return request<SessionResponseDTO[]>(`/api/users/${userId}/sessions`);
  },

  /** GET /api/users/{userId}/sessions/{sessionId} */
  findById(userId: number, sessionId: number) {
    return request<SessionResponseDTO>(`/api/users/${userId}/sessions/${sessionId}`);
  },

  /** PUT /api/users/{userId}/sessions/{sessionId} */
  update(userId: number, sessionId: number, payload: SessionRequestDTO) {
    return request<SessionResponseDTO>(`/api/users/${userId}/sessions/${sessionId}`, {
      method: "PUT",
      body: payload,
    });
  },

  /** DELETE /api/users/{userId}/sessions/{sessionId} → 204 */
  remove(userId: number, sessionId: number) {
    return request<void>(`/api/users/${userId}/sessions/${sessionId}`, { method: "DELETE" });
  },
};
