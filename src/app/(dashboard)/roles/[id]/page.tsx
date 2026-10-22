"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Grid3x3, KeyRound, Pencil, ShieldCheck } from "lucide-react";
import type { User } from "@/types";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { useDisclosure } from "@/hooks/useDisclosure";
import { describeError } from "@/lib/api/http";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TricolorBar } from "@/components/ui/TricolorBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RoleUsersPanel } from "@/components/features/roles/RoleUsersPanel";
import { AddUsersModal } from "@/components/features/roles/AddUsersModal";
import { RoleFormModal } from "@/components/features/roles/RoleFormModal";

/** Detalle del rol y asignación de usuarios. */
export default function RolDetallePage() {
  const { id } = useParams<{ id: string }>();
  const {
    roles,
    users,
    rolePermissions,
    modules,
    permissions,
    updateRole,
    addUsersToRole,
    removeUserFromRole,
    loading,
  } = useData();
  const { notify } = useToast();

  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const confirmRemove = useDisclosure<User>();

  const role = roles.find((r) => r.id === id);

  if (!role) {
    return loading ? (
      <EmptyState title="Cargando rol…" description="Consultando los datos en el servidor." />
    ) : (
      <EmptyState
        title="Rol no encontrado"
        description="Puede que haya sido eliminado."
        action={
          <LinkButton href="/roles" variant="secondary">
            Volver a roles
          </LinkButton>
        }
      />
    );
  }

  const members = users.filter((u) => u.roleIds.includes(role.id));
  const available = users.filter((u) => !u.roleIds.includes(role.id));
  const assigned = new Set(rolePermissions[role.id] ?? []);
  const moduleCount = new Set(permissions.filter((p) => assigned.has(p.id)).map((p) => p.moduleId)).size;

  const stats = [
    { label: "Usuarios", value: members.length, icon: ShieldCheck },
    { label: "Permisos", value: assigned.size, icon: KeyRound },
    { label: "Módulos", value: `${moduleCount}/${modules.length}`, icon: Grid3x3 },
  ];

  return (
    <>
      <Link
        href="/roles"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="size-4" /> Volver a roles
      </Link>
      <PageHeader
        title={role.name}
        description={role.description}
        actions={
          <>
            <Button variant="secondary" leftIcon={<Pencil className="size-4" />} onClick={() => editModal.open()}>
              Editar rol
            </Button>
            <LinkButton href={`/matriz?rol=${role.id}`} leftIcon={<Grid3x3 className="size-4" />}>
              Configurar permisos
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card className="overflow-hidden">
            <TricolorBar />
            <dl className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-2 py-5">
                  <Icon className="size-4 text-co-blue dark:text-co-yellow" />
                  <dd className="text-2xl font-bold">{value}</dd>
                  <dt className="text-xs text-zinc-500">{label}</dt>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="p-5 text-sm text-zinc-600 dark:text-zinc-400">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">¿Cómo funciona?</p>
            <p className="mt-1">
              Los usuarios agregados heredan automáticamente todos los permisos configurados para este rol en la
              matriz. Remover a un usuario le retira dichos permisos.
            </p>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <RoleUsersPanel
            users={members}
            canAdd={available.length > 0}
            onAdd={() => addModal.open()}
            onRemove={(u) => confirmRemove.open(u)}
          />
        </div>
      </div>

      <AddUsersModal
        open={addModal.isOpen}
        onClose={addModal.close}
        roleName={role.name}
        available={available}
        onConfirm={async (ids) => {
          try {
            await addUsersToRole(role.id, ids);
            notify(`${ids.length} usuario(s) convocado(s) al rol ${role.name}.`);
          } catch (error) {
            notify(describeError(error, "No se pudo asignar el rol."), "error");
          }
        }}
      />

      <RoleFormModal
        open={editModal.isOpen}
        onClose={editModal.close}
        role={role}
        existingNames={roles.map((r) => r.name)}
        onSubmit={async (input) => {
          await updateRole(role.id, input);
          notify("Rol actualizado.");
        }}
      />

      <ConfirmDialog
        open={confirmRemove.isOpen}
        onClose={confirmRemove.close}
        title="Remover usuario del rol"
        confirmLabel="Remover del rol"
        message={
          <>
            ¿Deseas remover a <strong>{confirmRemove.payload?.name}</strong> del rol <strong>{role.name}</strong>?
            Perderá los permisos asociados a este rol.
          </>
        }
        onConfirm={async () => {
          const u = confirmRemove.payload;
          if (!u) return;
          try {
            await removeUserFromRole(role.id, u.id);
            notify(`${u.name} fue removido del rol.`, "error");
          } catch (error) {
            notify(describeError(error, "No se pudo remover el usuario del rol."), "error");
          }
        }}
      />
    </>
  );
}
