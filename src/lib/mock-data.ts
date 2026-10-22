/**
 * Datos de demostración previos a la integración con ms-security.
 *
 * Desde que DataContext consume el backend real, lo único que sigue en uso es
 * `MOCK_MODULES`, que actúa como catálogo de iconos y etiquetas para los
 * módulos: el backend no tiene entidad Módulo, así que `adapters.ts` deriva los
 * módulos de las URLs de los permisos y completa su presentación con esta
 * lista. El resto se conserva como referencia del modelo original.
 *
 * Ver `frontend/docs/INTEGRACION.md`.
 */

import type { Permission, Role, RolePermissions, SystemModule, User } from "@/types";
import { DEFAULT_METHOD, OPERATIONS } from "./constants";

export const MOCK_ROLES: Role[] = [
  { id: "r-admin", name: "Administrador", description: "Control total del sistema: el capitán de la plataforma." },
  { id: "r-dt", name: "Director Técnico", description: "Gestiona plantillas, convocatorias y alineaciones del equipo." },
  { id: "r-arbitro", name: "Árbitro", description: "Registra incidencias, tarjetas y resultados de los partidos." },
  { id: "r-analista", name: "Analista", description: "Consulta estadísticas y reportes de rendimiento." },
  { id: "r-utilero", name: "Utilero", description: "Administra la logística de canchas e implementos." },
];

export const MOCK_MODULES: SystemModule[] = [
  { id: "m-usuarios", name: "Usuarios", description: "Cuentas de acceso", icon: "users", group: "Administración" },
  { id: "m-roles", name: "Roles", description: "Perfiles y cargos", icon: "shield", group: "Administración" },
  { id: "m-jugadores", name: "Jugadores", description: "Fichas y plantillas", icon: "shirt", group: "Gestión deportiva" },
  { id: "m-partidos", name: "Partidos", description: "Calendario y resultados", icon: "calendar", group: "Gestión deportiva" },
  { id: "m-canchas", name: "Canchas", description: "Escenarios deportivos", icon: "map", group: "Gestión deportiva" },
  { id: "m-torneos", name: "Torneos", description: "Ligas y copas", icon: "trophy", group: "Gestión deportiva" },
  { id: "m-arbitraje", name: "Arbitraje", description: "Designaciones arbitrales", icon: "whistle", group: "Gestión deportiva" },
  { id: "m-tarjetas", name: "Tarjetas", description: "Amonestaciones y sanciones", icon: "card", group: "Gestión deportiva" },
];

export const MOCK_PERMISSIONS: Permission[] = MOCK_MODULES.flatMap((m) =>
  OPERATIONS.map(({ id: op }) => {
    const base = `/api/${m.id.slice(2)}`;
    const url = op === "listar" || op === "crear" ? base : `${base}/:id`;
    return { id: `p-${m.id.slice(2)}-${op}`, model: m.name, moduleId: m.id, operation: op, url, method: DEFAULT_METHOD[op] };
  }),
);

const permsFor = (modules: string[], ops: string[]) =>
  MOCK_PERMISSIONS.filter((p) => modules.includes(p.moduleId) && ops.includes(p.operation)).map((p) => p.id);

export const MOCK_ROLE_PERMISSIONS: RolePermissions = {
  "r-admin": MOCK_PERMISSIONS.map((p) => p.id),
  "r-dt": [
    ...permsFor(["m-jugadores"], ["ver", "listar", "crear", "actualizar"]),
    ...permsFor(["m-partidos", "m-torneos", "m-canchas"], ["ver", "listar"]),
  ],
  "r-arbitro": [
    ...permsFor(["m-partidos"], ["ver", "listar", "actualizar"]),
    ...permsFor(["m-tarjetas"], ["ver", "listar", "crear", "actualizar"]),
    ...permsFor(["m-arbitraje"], ["ver", "listar"]),
  ],
  "r-analista": permsFor(["m-jugadores", "m-partidos", "m-torneos", "m-tarjetas"], ["ver", "listar"]),
  "r-utilero": permsFor(["m-canchas"], ["ver", "listar", "crear", "actualizar"]),
};

export const MOCK_USERS: User[] = [
  { id: "u-1", name: "Camila Rodríguez", email: "camila.rodriguez@futbolapp.co", phone: "+57 300 123 4567", avatarUrl: "https://i.pravatar.cc/150?img=47", roleIds: ["r-admin"], status: "activo", createdAt: "2026-01-12" },
  { id: "u-2", name: "Andrés Valencia", email: "andres.valencia@futbolapp.co", phone: "+57 311 555 0101", avatarUrl: "https://i.pravatar.cc/150?img=12", roleIds: ["r-dt"], status: "activo", createdAt: "2026-02-03" },
  { id: "u-3", name: "Juliana Ospina", email: "juliana.ospina@futbolapp.co", phone: "+57 315 222 3344", avatarUrl: "https://i.pravatar.cc/150?img=45", roleIds: ["r-arbitro"], status: "activo", createdAt: "2026-02-18" },
  { id: "u-4", name: "Santiago Cuadrado", email: "santiago.cuadrado@futbolapp.co", phone: "+57 320 987 6543", avatarUrl: "https://i.pravatar.cc/150?img=15", roleIds: ["r-analista", "r-dt"], status: "activo", createdAt: "2026-03-07" },
  { id: "u-5", name: "Valentina Mina", email: "valentina.mina@futbolapp.co", phone: "+57 301 444 7788", roleIds: ["r-utilero"], status: "inactivo", createdAt: "2026-03-21" },
  { id: "u-6", name: "Mateo Arias", email: "mateo.arias@futbolapp.co", phone: "+57 318 101 2020", avatarUrl: "https://i.pravatar.cc/150?img=33", roleIds: ["r-arbitro"], status: "activo", createdAt: "2026-04-02" },
  { id: "u-7", name: "Daniela Sánchez", email: "daniela.sanchez@futbolapp.co", phone: "+57 305 606 7070", avatarUrl: "https://i.pravatar.cc/150?img=44", roleIds: ["r-analista"], status: "activo", createdAt: "2026-05-15" },
  { id: "u-8", name: "Luis Díaz Herrera", email: "luis.diaz@futbolapp.co", phone: "+57 312 909 1010", roleIds: [], status: "inactivo", createdAt: "2026-06-30" },
];

/** Usuario "logueado" para la vista de perfil (no hay autenticación real). */
export const CURRENT_USER_ID = "u-1";
