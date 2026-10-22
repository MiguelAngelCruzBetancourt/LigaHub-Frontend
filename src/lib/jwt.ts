import type { JwtPayload } from "@/lib/api/types";

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 *
 * El login solo devuelve `{accessToken, tokenType, expiresAt}`, así que el id
 * y el correo del usuario hay que sacarlos de los claims `sub` y `email`.
 * La verificación la hace el backend en cada petición; aquí solo leemos.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const segment = token.split(".")[1];
  if (!segment) return null;

  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
