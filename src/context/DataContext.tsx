"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Permission, Role, RolePermissions, SystemModule, User } from "@/types";
import { MOCK_MODULES } from "@/lib/mock-data";
import {
  adaptPermission,
  adaptRole,
  adaptUser,
  buildModules,
  buildRoleIdsByUser,
  buildRolePermissions,
  toBackendId,
} from "@/lib/api/adapters";
import { ApiError } from "@/lib/api/http";
import { permissionsApi } from "@/lib/api/permissions";
import { profilesApi } from "@/lib/api/profiles";
import { rolePermissionsApi } from "@/lib/api/role-permissions";
import { rolesApi } from "@/lib/api/roles";
import { userRolesApi } from "@/lib/api/user-roles";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/context/AuthContext";

/**
 * `password` y `birthDate` no son parte del tipo `User` del frontend, pero el
 * backend los necesita: el primero para CreateUserDTO y el segundo porque
 * ProfileRequestDTO exige phone + birthDate juntos.
 */
export type UserInput = Omit<User, "id" | "createdAt"> & {
  password?: string;
  birthDate?: string;
};
export type RoleInput = Omit<Role, "id">;
/** `moduleId` no se envía: el frontend lo deriva de `model`. */
export type PermissionInput = Omit<Permission, "id" | "moduleId">;

interface DataContextValue {
  users: User[];
  roles: Role[];
  modules: SystemModule[];
  permissions: Permission[];
  rolePermissions: RolePermissions;

  /** Carga inicial en curso. */
  loading: boolean;
  /** Mensaje del último fallo de carga, si lo hubo. */
  error: string | null;
  refresh: () => Promise<void>;

  createUser: (input: UserInput) => Promise<User>;
  updateUser: (id: string, patch: Partial<UserInput>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;

  createRole: (input: RoleInput) => Promise<Role>;
  updateRole: (id: string, patch: Partial<RoleInput>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  addUsersToRole: (roleId: string, userIds: string[]) => Promise<void>;
  removeUserFromRole: (roleId: string, userId: string) => Promise<void>;

  createPermission: (input: PermissionInput) => Promise<Permission>;
  updatePermission: (id: string, patch: Partial<PermissionInput>) => Promise<void>;
  deletePermission: (id: string) => Promise<void>;
  setRolePermissions: (roleId: string, permissionIds: string[]) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

/** Une los módulos derivados del backend con el catálogo visual del frontend. */
function mergeModules(derived: SystemModule[]): SystemModule[] {
  const byId = new Map<string, SystemModule>();
  for (const module of [...derived, ...MOCK_MODULES]) {
    if (!byId.has(module.id)) byId.set(module.id, module);
  }
  return [...byId.values()];
}

/**
 * Carga los usuarios y los completa con lo que vive en otras tablas:
 * los roles salen de GET /api/user-roles (una sola llamada) y el teléfono
 * del perfil de cada usuario (una llamada por usuario, porque el contrato
 * actual no expone el teléfono en el listado).
 */
async function fetchUsers(): Promise<User[]> {
  const [userDtos, links] = await Promise.all([
    usersApi.findAll(),
    userRolesApi.findAll().catch((error) => {
      // Si el rol no tiene permiso sobre /api/user-roles, se sigue sin roles.
      if (error instanceof ApiError && error.isForbidden) return [];
      throw error;
    }),
  ]);

  const roleIdsByUser = buildRoleIdsByUser(links);

  const details = await Promise.allSettled(
    userDtos.map((dto) => usersApi.findByIdWithProfile(dto.id)),
  );

  return userDtos.map((dto, index) => {
    const detail = details[index];
    return adaptUser(dto, {
      roleIds: roleIdsByUser.get(String(dto.id)) ?? [],
      profile: detail?.status === "fulfilled" ? detail.value.profile : null,
    });
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissionsState] = useState<RolePermissions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Cargas ---

  const reloadUsers = useCallback(async () => {
    setUsers(await fetchUsers());
  }, []);

  const reloadPermissions = useCallback(async () => {
    const dtos = await permissionsApi.findAll();
    setPermissions(dtos.map(adaptPermission));
  }, []);

  const reloadRolesAndMatrix = useCallback(async () => {
    const roleDtos = await rolesApi.findAll();
    const nextRoles = roleDtos.map(adaptRole);
    setRoles(nextRoles);

    const links = await rolePermissionsApi.findAll().catch((apiError) => {
      if (apiError instanceof ApiError && apiError.isForbidden) return [];
      throw apiError;
    });
    setRolePermissionsState(buildRolePermissions(links, nextRoles));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([reloadUsers(), reloadRolesAndMatrix(), reloadPermissions()]);
    } catch (caught) {
      const message =
        caught instanceof ApiError ? caught.message : "No se pudieron cargar los datos del servidor.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [reloadUsers, reloadRolesAndMatrix, reloadPermissions]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setUsers([]);
      setRoles([]);
      setPermissions([]);
      setRolePermissionsState({});
      setError(null);
      return;
    }

    void refresh();
  }, [authLoading, isAuthenticated, refresh]);

  // --- Usuarios ---

  /** El perfil (teléfono + fecha de nacimiento) es una entidad aparte. */
  const saveProfile = useCallback(
    async (userId: number, phone: string, birthDate: string | undefined, hadProfile: boolean) => {
      // ProfileRequestDTO exige ambos campos: sin fecha no se puede guardar.
      if (!phone.trim() || !birthDate) return;

      const payload = { phone: phone.trim(), birthDate };
      if (hadProfile) await profilesApi.update(userId, payload);
      else await profilesApi.create(userId, payload);
    },
    [],
  );

  const createUser = useCallback(
    async (input: UserInput) => {
      const created = await usersApi.create({
        name: input.name,
        email: input.email,
        password: input.password ?? "",
      });

      await saveProfile(created.id, input.phone, input.birthDate, false);

      for (const roleId of input.roleIds) {
        await userRolesApi.assign({ userId: created.id, roleId: toBackendId(roleId) });
      }

      await reloadUsers();

      return adaptUser(created, { roleIds: input.roleIds });
    },
    [saveProfile, reloadUsers],
  );

  const updateUser = useCallback(
    async (id: string, patch: Partial<UserInput>) => {
      const numericId = toBackendId(id);
      const current = users.find((user) => user.id === id);

      await usersApi.update(numericId, {
        name: patch.name ?? current?.name ?? "",
        email: patch.email ?? current?.email ?? "",
        // Vacío = el backend conserva la contraseña actual.
        ...(patch.password ? { password: patch.password } : {}),
      });

      if (patch.phone !== undefined || patch.birthDate !== undefined) {
        const detail = await usersApi.findByIdWithProfile(numericId);
        await saveProfile(
          numericId,
          patch.phone ?? detail.profile?.phone ?? "",
          patch.birthDate ?? detail.profile?.birthDate,
          detail.profile !== null,
        );
      }

      if (patch.roleIds && current) {
        const next = new Set(patch.roleIds);
        const previous = new Set(current.roleIds);

        for (const roleId of next) {
          if (!previous.has(roleId)) {
            await userRolesApi.assign({ userId: numericId, roleId: toBackendId(roleId) });
          }
        }
        for (const roleId of previous) {
          if (!next.has(roleId)) {
            await userRolesApi.remove(numericId, toBackendId(roleId));
          }
        }
      }

      await reloadUsers();
    },
    [users, saveProfile, reloadUsers],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await usersApi.remove(toBackendId(id));
      await reloadUsers();
    },
    [reloadUsers],
  );

  /** Activa o desactiva al usuario; sus roles y permisos no se modifican. */
  const toggleUserStatus = useCallback(
    async (id: string) => {
      const current = users.find((user) => user.id === id);
      if (!current) return;
      await usersApi.updateStatus(toBackendId(id), current.status !== "activo");
      await reloadUsers();
    },
    [users, reloadUsers],
  );

  // --- Roles ---

  const createRole = useCallback(
    async (input: RoleInput) => {
      const created = await rolesApi.create(input);
      await reloadRolesAndMatrix();
      return adaptRole(created);
    },
    [reloadRolesAndMatrix],
  );

  const updateRole = useCallback(
    async (id: string, patch: Partial<RoleInput>) => {
      const current = roles.find((role) => role.id === id);
      await rolesApi.update(toBackendId(id), {
        name: patch.name ?? current?.name ?? "",
        description: patch.description ?? current?.description ?? "",
      });
      await reloadRolesAndMatrix();
    },
    [roles, reloadRolesAndMatrix],
  );

  const deleteRole = useCallback(
    async (id: string) => {
      await rolesApi.remove(toBackendId(id));
      await Promise.all([reloadRolesAndMatrix(), reloadUsers()]);
    },
    [reloadRolesAndMatrix, reloadUsers],
  );

  const addUsersToRole = useCallback(
    async (roleId: string, userIds: string[]) => {
      const numericRoleId = toBackendId(roleId);
      for (const userId of userIds) {
        await userRolesApi.assign({ userId: toBackendId(userId), roleId: numericRoleId });
      }
      await reloadUsers();
    },
    [reloadUsers],
  );

  const removeUserFromRole = useCallback(
    async (roleId: string, userId: string) => {
      await userRolesApi.remove(toBackendId(userId), toBackendId(roleId));
      await reloadUsers();
    },
    [reloadUsers],
  );

  // --- Permisos ---

  const createPermission = useCallback(
    async (input: PermissionInput) => {
      // El backend almacena url + method + model; la operación se deriva de método y URL.
      const created = await permissionsApi.create({ url: input.url, method: input.method, model: input.model.trim() });
      await Promise.all([reloadPermissions(), reloadRolesAndMatrix()]);
      return adaptPermission(created);
    },
    [reloadPermissions, reloadRolesAndMatrix],
  );

  const updatePermission = useCallback(
    async (id: string, patch: Partial<PermissionInput>) => {
      const current = permissions.find((permission) => permission.id === id);
      await permissionsApi.update(toBackendId(id), {
        url: patch.url ?? current?.url ?? "",
        method: patch.method ?? current?.method ?? "GET",
        model: (patch.model ?? current?.model ?? "").trim(),
      });
      await Promise.all([reloadPermissions(), reloadRolesAndMatrix()]);
    },
    [permissions, reloadPermissions, reloadRolesAndMatrix],
  );

  const deletePermission = useCallback(
    async (id: string) => {
      await permissionsApi.remove(toBackendId(id));
      await Promise.all([reloadPermissions(), reloadRolesAndMatrix()]);
    },
    [reloadPermissions, reloadRolesAndMatrix],
  );

  /** Persiste la matriz como un diff: solo lo que cambió. */
  const setRolePermissions = useCallback(
    async (roleId: string, permissionIds: string[]) => {
      const numericRoleId = toBackendId(roleId);
      const next = new Set(permissionIds);
      const previous = new Set(rolePermissions[roleId] ?? []);

      for (const permissionId of next) {
        if (!previous.has(permissionId)) {
          await rolePermissionsApi.assign({
            roleId: numericRoleId,
            permissionId: toBackendId(permissionId),
          });
        }
      }
      for (const permissionId of previous) {
        if (!next.has(permissionId)) {
          await rolePermissionsApi.remove(numericRoleId, toBackendId(permissionId));
        }
      }

      await reloadRolesAndMatrix();
    },
    [rolePermissions, reloadRolesAndMatrix],
  );

  const modules = useMemo(() => mergeModules(buildModules(permissions)), [permissions]);

  const value = useMemo<DataContextValue>(
    () => ({
      users,
      roles,
      modules,
      permissions,
      rolePermissions,
      loading,
      error,
      refresh,
      createUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      createRole,
      updateRole,
      deleteRole,
      addUsersToRole,
      removeUserFromRole,
      createPermission,
      updatePermission,
      deletePermission,
      setRolePermissions,
    }),
    [
      users,
      roles,
      modules,
      permissions,
      rolePermissions,
      loading,
      error,
      refresh,
      createUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      createRole,
      updateRole,
      deleteRole,
      addUsersToRole,
      removeUserFromRole,
      createPermission,
      updatePermission,
      deletePermission,
      setRolePermissions,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de <DataProvider>");
  return ctx;
}
