/**
 * Traducción entre los DTOs de ms-security y los tipos de dominio del frontend
 * (`@/types`), que no cambian.
 *
 * Reglas:
 * - Los ids del backend son `Long`; en el frontend siguen siendo `string`.
 * - El backend guarda `url`, `method` y `model` en `Permission`. El módulo de
 *   la UI (`moduleId`) se deriva de `model`; `operation` se DERIVA de método + URL.
 *   Solo los permisos antiguos sin `model` caen en la derivación por URL.
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
import { DEFAULT_MODULE_GROUP, HTTP_METHODS } from "@/lib/constants";
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

/** Primer segmento tras /api/ → id de módulo del frontend (solo permisos sin `model`). */
const SEGMENT_TO_MODULE: Record<string, string> = {
  users: "m-usuarios",
  roles: "m-roles",
  permissions: "m-permisos",
  "user-roles": "m-usuarios-roles",
  "role-permissions": "m-roles-permisos",
};

/** `model` del backend (en kebab-case) → id de módulo del frontend. */
const MODEL_TO_MODULE: Record<string, string> = {
  user: "m-usuarios",
  profile: "m-perfiles",
  session: "m-sesiones",
  role: "m-roles",
  permission: "m-permisos",
  "user-role": "m-usuarios-roles",
  "role-permission": "m-roles-permisos",
};

const SECURITY_GROUP = "Administración";

/** Metadatos de los módulos que sí existen en ms-security. */
const SECURITY_MODULES: Record<string, Omit<SystemModule, "id">> = {
  "m-usuarios": { name: "Usuarios", description: "Cuentas de acceso", icon: "users", group: SECURITY_GROUP },
  "m-perfiles": { name: "Perfiles", description: "Datos personales", icon: "shirt", group: SECURITY_GROUP },
  "m-sesiones": { name: "Sesiones", description: "Tokens y 2FA", icon: "calendar", group: SECURITY_GROUP },
  "m-roles": { name: "Roles", description: "Perfiles y cargos", icon: "shield", group: SECURITY_GROUP },
  "m-permisos": { name: "Permisos", description: "Catálogo de endpoints", icon: "card", group: SECURITY_GROUP },
  "m-usuarios-roles": {
    name: "Usuarios por rol",
    description: "Asignación de roles",
    icon: "whistle",
    group: SECURITY_GROUP,
  },
  "m-roles-permisos": {
    name: "Permisos por rol",
    description: "Matriz de autorización",
    icon: "trophy",
    group: SECURITY_GROUP,
  },
};

/** "UserRole" / "user role" → "user-role". */
const modelSlug = (model: string) =>
  model
    .trim()
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

/** Id de módulo de la UI para un valor de `model` del backend. */
export function moduleIdFromModel(model: string): string {
  const slug = modelSlug(model);
  return MODEL_TO_MODULE[slug] ?? `m-${slug}`;
}

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
  const isSingleResource =
    last === "{id}" || last === "profile" || last === "me" || last.startsWith("detail-with-");
  return isSingleResource ? "ver" : "listar";
}

const toHttpMethod = (method: string): HttpMethod => {
  const upper = method.toUpperCase() as HttpMethod;
  return HTTP_METHODS.includes(upper) ? upper : "GET";
};

export function adaptPermission(dto: PermissionResponseDTO): Permission {
  const model = dto.model?.trim() ?? "";
  const moduleId = model ? moduleIdFromModel(model) : resolveModuleId(dto.url);

  return {
    id: toFrontendId(dto.id),
    model,
    moduleId,
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
 * en último caso, usa el propio `model` del permiso como nombre.
 */
export function buildModules(permissions: Permission[]): SystemModule[] {
  const modelById = new Map<string, string>();
  for (const permission of permissions) {
    if (!modelById.has(permission.moduleId)) modelById.set(permission.moduleId, permission.model);
  }

  return [...modelById]
    .map<SystemModule>(([id, model]) => {
      const known = SECURITY_MODULES[id];
      if (known) return { id, ...known };

      const fromCatalog = MOCK_MODULES.find((module) => module.id === id);
      if (fromCatalog) return fromCatalog;

      return {
        id,
        name: capitalize(model || id.replace(/^m-/, "").replace(/-/g, " ")),
        description: "Recurso del backend",
        icon: "map",
        group: DEFAULT_MODULE_GROUP,
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
 * `createdAt` no existe en la entidad User del backend y se devuelve vacío;
 * `status` sale de `active` y la foto (`avatarUrl`) de `Profile.photoUrl`.
 */
export function adaptUser(dto: UserResponseDTO, extras: UserExtras = {}): User {
  return {
    id: toFrontendId(dto.id),
    name: dto.name,
    email: dto.email,
    phone: extras.profile?.phone ?? "",
    avatarUrl: extras.profile?.photoUrl ?? undefined,
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
