"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldPlus } from "lucide-react";
import type { Role } from "@/types";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { useDisclosure } from "@/hooks/useDisclosure";
import { describeError } from "@/lib/api/http";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RolesTable, type RoleRow } from "@/components/features/roles/RolesTable";
import { RoleFormModal } from "@/components/features/roles/RoleFormModal";

/** Gestión de roles. */
export default function RolesPage() {
  const router = useRouter();
  const { roles, users, rolePermissions, createRole, updateRole, deleteRole, loading } = useData();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const form = useDisclosure<Role>();
  const confirmDelete = useDisclosure<Role>();

  const rows = useMemo<RoleRow[]>(() => {
    const q = query.trim().toLowerCase();
    return roles
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
      .map((r) => ({
        ...r,
        userCount: users.filter((u) => u.roleIds.includes(r.id)).length,
        permissionCount: rolePermissions[r.id]?.length ?? 0,
      }));
  }, [roles, users, rolePermissions, query]);

  const deletingUsers = confirmDelete.payload
    ? users.filter((u) => u.roleIds.includes(confirmDelete.payload!.id)).length
    : 0;

  return (
    <>
      <PageHeader
        title="Roles"
        description="Define las posiciones del sistema: cada rol agrupa permisos que luego se asignan a usuarios."
        actions={
          <Button leftIcon={<ShieldPlus className="size-4" />} onClick={() => form.open()}>
            Nuevo rol
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader
          icon={<ShieldCheck />}
          title="Alineación de roles"
          description={loading ? "Cargando roles…" : `${roles.length} roles registrados`}
          action={<SearchInput value={query} onChange={setQuery} placeholder="Buscar rol" />}
        />
        <RolesTable
          roles={rows}
          onView={(r) => router.push(`/roles/${r.id}`)}
          onEdit={(r) => form.open(r)}
          onDelete={(r) => confirmDelete.open(r)}
        />
      </Card>

      <RoleFormModal
        open={form.isOpen}
        onClose={form.close}
        role={form.payload}
        existingNames={roles.map((r) => r.name)}
        onSubmit={async (input) => {
          if (form.payload) {
            await updateRole(form.payload.id, input);
            notify(`Rol “${input.name}” actualizado.`);
          } else {
            await createRole(input);
            notify(`Rol “${input.name}” creado. Ahora asígnale permisos en la matriz.`);
          }
        }}
      />

      <ConfirmDialog
        open={confirmDelete.isOpen}
        onClose={confirmDelete.close}
        title="Eliminar rol"
        confirmLabel="Eliminar rol"
        message={
          deletingUsers > 0 ? (
            <>
              El rol <strong>{confirmDelete.payload?.name}</strong> está asignado a{" "}
              <strong>{deletingUsers} usuario(s)</strong> y no se puede eliminar. Retira primero a esos usuarios
              desde el detalle del rol.
            </>
          ) : (
            <>
              Se eliminará el rol <strong>{confirmDelete.payload?.name}</strong> y se desligarán sus permisos. Los
              usuarios y los permisos del sistema no se eliminan.
            </>
          )
        }
        onConfirm={async () => {
          const r = confirmDelete.payload;
          if (!r) return;
          try {
            await deleteRole(r.id);
            notify(`Rol “${r.name}” eliminado.`, "error");
          } catch (error) {
            notify(describeError(error, "No se pudo eliminar el rol."), "error");
          }
        }}
      />
    </>
  );
}
