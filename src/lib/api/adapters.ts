/**
 * Traducción entre los DTOs de ms-security y los tipos de dominio del frontend
 * (`@/types`), que no cambian.
 *
 * Reglas:
 * - Los ids del backend son `Long`; en el frontend siguen siendo `string`.
 * - El backend NO guarda `moduleId` ni `operation` en `Permission` (solo
 *   `url` + `method`), así que ambos se DERIVAN aquí de forma determinista.
 * - Tampoco guarda `avatarUrl` ni `createdAt` de usuario: se rellenan con
 *   valores neutros y la UI los sigue mostrando.
 */

import type {
  HttpMethod,
  Operation,
  Permission,
  Role,
  RolePermissions,
  SystemModule,
  User,
} from "@/types";
import { HTTP_METHODS } from "@/lib/constants";
import { MOCK_MODULES } from "@/lib/mock-data";
import type {
  PermissionResponseDTO,
  ProfileResponseDTO,
  RolePermissionResponseDTO,
  RoleResponseDTO,
  UserResponseDTO,
  UserRoleResponseDTO,
} from "./types";

// --- Ids ---

export const toFrontendId = (id: number): string => String(id);

/** Convierte el id de la UI al `Long` que espera el backend. */
export function toBackendId(id: string): number {
  const parsed = Number(id);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Id no numérico: "${id}". El backend solo acepta ids Long.`);
  }
  return parsed;
}

// --- Permisos: derivación de módulo y operación ---

/** Primer segmento tras /api/ → id de módulo del frontend. */
const SEGMENT_TO_MODULE: Record<string, string> = {
  users: "m-usuarios",
  roles: "m-roles",
  permissions: "m-permisos",
  "user-roles": "m-usuarios-roles",
  "role-permissions": "m-roles-permisos",
};

/** Metadatos de los módulos que sí existen en ms-security. */
const SECURITY_MODULES: Record<string, Omit<SystemModule, "id">> = {
  "m-usuarios": { name: "Usuarios", description: "Cuentas de acceso", icon: "users" },
  "m-perfiles": { name: "Perfiles", description: "Datos personales", icon: "shirt" },
  "m-sesiones": { name: "Sesiones", description: "Tokens y 2FA", icon: "calendar" },
  "m-roles": { name: "Roles", description: "Perfiles y cargos", icon: "shield" },
  "m-permisos": { name: "Permisos", description: "Catálogo de endpoints", icon: "card" },
  "m-usuarios-roles": { name: "Usuarios por rol", description: "Asignación de roles", icon: "whistle" },
  "m-roles-permisos": { name: "Permisos por rol", description: "Matriz de autorización", icon: "trophy" },
};

/** Sustituye cualquier `{...}` por `{id}`, igual que PermissionService.normalizeUrl. */
const normalize = (url: string) => url.replace(/\{[^}]*\}/g, "{id}").replace(/\/+$/, "");

const segmentsOf = (url: string) => normalize(url).split("/").filter(Boolean);

/**
 * Deriva el módulo de un permiso a partir de su URL.
 * Los sub-recursos de usuario (`/profile`, `/sessions`) se agrupan aparte
 * para que la matriz no mezcle todo dentro de "Usuarios".
 */
export function resolveModuleId(url: string): string {
  const segments = segmentsOf(url);
  const [, base, ...rest] = segments; // se descarta "api"
  if (!base) return "m-otros";

  const tail = rest.filter((segment) => segment !== "{id}");
  if (tail.includes("profile")) return "m-perfiles";
  if (tail.includes("sessions")) return "m-sesiones";

  return SEGMENT_TO_MODULE[base] ?? `m-${base}`;
}

/**
 * Deriva la operación del método HTTP y la forma de la URL.
 * GET sobre un recurso concreto (`/{id}`, `/profile`, `/detail-with-*`) es
 * "ver"; GET sobre una colección es "listar".
 */
export function resolveOperation(url: string, method: string): Operation {
  switch (method.toUpperCase()) {
    case "POST":
      return "crear";
    case "PUT":
    case "PATCH":
      return "actualizar";
    case "DELETE":
      return "eliminar";
    default:
      break;
  }

  const last = segmentsOf(url).pop() ?? "";
  const isSingleResource = last === "{id}" || last === "profile" || last.startsWith("detail-with-");
  return isSingleResource ? "ver" : "listar";
}

const toHttpMethod = (method: string): HttpMethod => {
  const upper = method.toUpperCase() as HttpMethod;
  return HTTP_METHODS.includes(upper) ? upper : "GET";
};

export function adaptPermission(dto: PermissionResponseDTO): Permission {
  return {
    id: toFrontendId(dto.id),
    moduleId: resolveModuleId(dto.url),
    operation: resolveOperation(dto.url, dto.method),
    url: dto.url,
    method: toHttpMethod(dto.method),
  };
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Catálogo de módulos efectivo: se calcula de los permisos reales.
 * Para los ids conocidos usa los metadatos de arriba; si no, cae en
 * MOCK_MODULES (que conserva iconos y etiquetas del dominio de fútbol) y,
 * en último caso, deriva un nombre del propio segmento de la URL.
 */
export function buildModules(permissions: Permission[]): SystemModule[] {
  const ids = [...new Set(permissions.map((permission) => permission.moduleId))];

  return ids
    .map<SystemModule>((id) => {
      const known = SECURITY_MODULES[id];
      if (known) return { id, ...known };

      const fromCatalog = MOCK_MODULES.find((module) => module.id === id);
      if (fromCatalog) return fromCatalog;

      return {
        id,
        name: capitalize(id.replace(/^m-/, "").replace(/-/g, " ")),
        description: "Recurso del backend",
        icon: "map",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

// --- Roles ---

export const adaptRole = (dto: RoleResponseDTO): Role => ({
  id: toFrontendId(dto.id),
  name: dto.name,
  description: dto.description,
});

// --- Usuarios ---

interface UserExtras {
  /** Vínculos de GET /api/user-roles. */
  roleIds?: string[];
  /** Vive en Profile, no en User. */
  profile?: ProfileResponseDTO | null;
}

/**
 * `avatarUrl` y `createdAt` no existen en la entidad User del backend. Se
 * devuelven en estado neutro para no romper las pantallas; `status` sale de
 * `active`.
 */
export function adaptUser(dto: UserResponseDTO, extras: UserExtras = {}): User {
  return {
    id: toFrontendId(dto.id),
    name: dto.name,
    email: dto.email,
    phone: extras.profile?.phone ?? "",
    avatarUrl: undefined,
    roleIds: extras.roleIds ?? [],
    status: dto.active ? "activo" : "inactivo",
    createdAt: "",
  };
}

/** Agrupa GET /api/user-roles en un mapa userId → roleIds. */
export function buildRoleIdsByUser(links: UserRoleResponseDTO[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const link of links) {
    const userId = toFrontendId(link.userId);
    const roleId = toFrontendId(link.role.id);
    const current = map.get(userId);
    if (current) current.push(roleId);
    else map.set(userId, [roleId]);
  }

  return map;
}

/** Agrupa GET /api/role-permissions en el `Record<roleId, permissionId[]>` de la UI. */
export function buildRolePermissions(
  links: RolePermissionResponseDTO[],
  roles: Role[],
): RolePermissions {
  // Todos los roles deben existir como clave, incluso sin permisos asignados.
  const result: RolePermissions = Object.fromEntries(roles.map((role) => [role.id, [] as string[]]));

  for (const link of links) {
    const roleId = toFrontendId(link.roleId);
    const permissionId = toFrontendId(link.permission.id);
    result[roleId] = [...(result[roleId] ?? []), permissionId];
  }

  return result;
}
