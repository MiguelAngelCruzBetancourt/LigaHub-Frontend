"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import type { User, UserStatus } from "@/types";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { useDisclosure } from "@/hooks/useDisclosure";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UsersTable } from "@/components/features/users/UsersTable";
import { UserFormModal } from "@/components/features/users/UserFormModal";
import { cn } from "@/utils/cn";

type StatusFilter = "todos" | UserStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "activo", label: "Activos" },
  { id: "inactivo", label: "Inactivos" },
];

/** HU-SE-01 / HU-SE-02 · Gestión de usuarios (componente contenedor). */
export default function UsuariosPage() {
  const router = useRouter();
  const { users, roles, createUser, updateUser, deleteUser, toggleUserStatus } = useData();
  const { notify } = useToast();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");

  const form = useDisclosure<User>();
  const confirmDelete = useDisclosure<User>();
  const confirmStatus = useDisclosure<User>();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (status === "todos" || u.status === status) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    );
  }, [users, query, status]);

  return (
    <>
      <PageHeader
        eyebrow="HU-SE-01 · HU-SE-02"
        title="Gestión de usuarios"
        description="Administra la plantilla de usuarios: fichajes, ediciones, suspensiones y bajas."
        actions={
          <Button leftIcon={<UserPlus className="size-4" />} onClick={() => form.open()}>
            Nuevo usuario
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader
          icon={<Users />}
          title="Plantilla"
          description={`${filtered.length} de ${users.length} usuarios`}
          action={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-black">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatus(f.id)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      status === f.id
                        ? "bg-co-blue text-white dark:bg-co-yellow dark:text-zinc-950"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre o correo" />
            </div>
          }
        />
        <UsersTable
          users={filtered}
          roles={roles}
          onView={(u) => router.push(`/usuarios/${u.id}`)}
          onEdit={(u) => form.open(u)}
          onToggleStatus={(u) => confirmStatus.open(u)}
          onDelete={(u) => confirmDelete.open(u)}
        />
      </Card>

      <UserFormModal
        open={form.isOpen}
        onClose={form.close}
        user={form.payload}
        roles={roles}
        onSubmit={(input) => {
          if (form.payload) {
            updateUser(form.payload.id, input);
            notify(`Usuario “${input.name}” actualizado.`);
          } else {
            createUser(input);
            notify(`¡Fichaje confirmado! ${input.name} se unió al equipo.`);
          }
        }}
      />

      <ConfirmDialog
        open={confirmStatus.isOpen}
        onClose={confirmStatus.close}
        tone={confirmStatus.payload?.status === "activo" ? "danger" : "primary"}
        title={confirmStatus.payload?.status === "activo" ? "Desactivar usuario" : "Reactivar usuario"}
        confirmLabel={confirmStatus.payload?.status === "activo" ? "Mandar a la banca" : "Volver a la cancha"}
        message={
          confirmStatus.payload?.status === "activo" ? (
            <>
              <strong>{confirmStatus.payload?.name}</strong> no podrá iniciar sesión hasta que sea reactivado.
            </>
          ) : (
            <>
              <strong>{confirmStatus.payload?.name}</strong> recuperará el acceso con sus roles actuales.
            </>
          )
        }
        onConfirm={() => {
          const u = confirmStatus.payload;
          if (!u) return;
          toggleUserStatus(u.id);
          notify(u.status === "activo" ? `${u.name} fue desactivado.` : `${u.name} fue reactivado.`);
        }}
      />

      <ConfirmDialog
        open={confirmDelete.isOpen}
        onClose={confirmDelete.close}
        title="Eliminar usuario"
        confirmLabel="Tarjeta roja: eliminar"
        message={
          <>
            ¿Seguro que deseas eliminar a <strong>{confirmDelete.payload?.name}</strong>? Esta acción es
            definitiva y no se puede deshacer.
          </>
        }
        onConfirm={() => {
          const u = confirmDelete.payload;
          if (!u) return;
          deleteUser(u.id);
          notify(`${u.name} fue eliminado.`, "error");
        }}
      />
    </>
  );
}
