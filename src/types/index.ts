export type UserStatus = "activo" | "inactivo";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  roleIds: string[];
  status: UserStatus;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export type Operation = "ver" | "listar" | "crear" | "actualizar" | "eliminar";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ModuleIcon =
  | "users"
  | "shield"
  | "shirt"
  | "calendar"
  | "map"
  | "trophy"
  | "whistle"
  | "card";

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  icon: ModuleIcon;
  /** Sección de la matriz bajo la que se agrupa el módulo (ej. "Administración"). */
  group?: string;
}

export interface Permission {
  id: string;
  /** Valor de la columna `model` del backend (ej. "User", "Role"). */
  model: string;
  /** Id de módulo de la UI, derivado de `model`. */
  moduleId: string;
  operation: Operation;
  url: string;
  method: HttpMethod;
}

/** roleId -> ids de permisos asignados */
export type RolePermissions = Record<string, string[]>;
