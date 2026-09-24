"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Permission, Role, RolePermissions, SystemModule, User } from "@/types";
import {
  MOCK_MODULES,
  MOCK_PERMISSIONS,
  MOCK_ROLE_PERMISSIONS,
  MOCK_ROLES,
  MOCK_USERS,
} from "@/lib/mock-data";
import { uid } from "@/utils/format";

export type UserInput = Omit<User, "id" | "createdAt">;
export type RoleInput = Omit<Role, "id">;
export type PermissionInput = Omit<Permission, "id">;

interface DataContextValue {
  users: User[];
  roles: Role[];
  modules: SystemModule[];
  permissions: Permission[];
  rolePermissions: RolePermissions;

  createUser: (input: UserInput) => User;
  updateUser: (id: string, patch: Partial<UserInput>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  createRole: (input: RoleInput) => Role;
  updateRole: (id: string, patch: Partial<RoleInput>) => void;
  deleteRole: (id: string) => void;
  addUsersToRole: (roleId: string, userIds: string[]) => void;
  removeUserFromRole: (roleId: string, userId: string) => void;

  createPermission: (input: PermissionInput) => Permission;
  updatePermission: (id: string, patch: Partial<PermissionInput>) => void;
  deletePermission: (id: string) => void;
  setRolePermissions: (roleId: string, permissionIds: string[]) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

/**
 * Store en memoria con datos mock. Sustituye a un backend real:
 * todos los cambios viven en el estado de React y se pierden al recargar.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS);
  const [rolePermissions, setRolePermissionsState] = useState<RolePermissions>(MOCK_ROLE_PERMISSIONS);

  // --- Usuarios ---
  const createUser = useCallback((input: UserInput) => {
    const user: User = { ...input, id: uid("u"), createdAt: new Date().toISOString().slice(0, 10) };
    setUsers((prev) => [user, ...prev]);
    return user;
  }, []);

  const updateUser = useCallback((id: string, patch: Partial<UserInput>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "activo" ? "inactivo" : "activo" } : u)),
    );
  }, []);

  // --- Roles ---
  const createRole = useCallback((input: RoleInput) => {
    const role: Role = { ...input, id: uid("r") };
    setRoles((prev) => [...prev, role]);
    setRolePermissionsState((prev) => ({ ...prev, [role.id]: [] }));
    return role;
  }, []);

  const updateRole = useCallback((id: string, patch: Partial<RoleInput>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setUsers((prev) => prev.map((u) => ({ ...u, roleIds: u.roleIds.filter((r) => r !== id) })));
    setRolePermissionsState((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const addUsersToRole = useCallback((roleId: string, userIds: string[]) => {
    setUsers((prev) =>
      prev.map((u) =>
        userIds.includes(u.id) && !u.roleIds.includes(roleId) ? { ...u, roleIds: [...u.roleIds, roleId] } : u,
      ),
    );
  }, []);

  const removeUserFromRole = useCallback((roleId: string, userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, roleIds: u.roleIds.filter((r) => r !== roleId) } : u)),
    );
  }, []);

  // --- Permisos ---
  const createPermission = useCallback((input: PermissionInput) => {
    const permission: Permission = { ...input, id: uid("p") };
    setPermissions((prev) => [...prev, permission]);
    return permission;
  }, []);

  const updatePermission = useCallback((id: string, patch: Partial<PermissionInput>) => {
    setPermissions((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const deletePermission = useCallback((id: string) => {
    setPermissions((prev) => prev.filter((p) => p.id !== id));
    setRolePermissionsState((prev) =>
      Object.fromEntries(Object.entries(prev).map(([roleId, ids]) => [roleId, ids.filter((p) => p !== id)])),
    );
  }, []);

  const setRolePermissions = useCallback((roleId: string, permissionIds: string[]) => {
    setRolePermissionsState((prev) => ({ ...prev, [roleId]: permissionIds }));
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      users,
      roles,
      modules: MOCK_MODULES,
      permissions,
      rolePermissions,
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
      permissions,
      rolePermissions,
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
