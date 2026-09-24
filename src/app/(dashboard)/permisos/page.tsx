"use client";

import { useMemo, useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import type { Permission } from "@/types";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { useDisclosure } from "@/hooks/useDisclosure";
import { OPERATION_LABEL } from "@/lib/constants";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PermissionsTable } from "@/components/features/permissions/PermissionsTable";
import { PermissionFormModal } from "@/components/features/permissions/PermissionFormModal";

/** HU-SE-05 · Catálogo de permisos. */
export default function PermisosPage() {
  const { permissions, modules, createPermission, updatePermission, deletePermission } = useData();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("todos");
  const form = useDisclosure<Permission>();
  const confirmDelete = useDisclosure<Permission>();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return permissions.filter(
      (p) =>
        (moduleFilter === "todos" || p.moduleId === moduleFilter) &&
        (!q || p.url.toLowerCase().includes(q) || p.method.toLowerCase().includes(q) || p.operation.includes(q)),
    );
  }, [permissions, query, moduleFilter]);

  const describe = (p?: Permission) =>
    p ? `${OPERATION_LABEL[p.operation]} · ${modules.find((m) => m.id === p.moduleId)?.name ?? ""}` : "";

  return (
    <>
      <PageHeader
        eyebrow="HU-SE-05"
        title="Permisos"
        description="Catálogo de endpoints protegidos del sistema: el reglamento que luego se asigna a cada rol."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => form.open()}>
            Nuevo permiso
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader
          icon={<KeyRound />}
          title="Reglamento de acceso"
          description={`${filtered.length} de ${permissions.length} permisos`}
          action={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="sm:w-48">
                <Select
                  aria-label="Filtrar por módulo"
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  options={[{ value: "todos", label: "Todos los módulos" }, ...modules.map((m) => ({ value: m.id, label: m.name }))]}
                />
              </div>
              <SearchInput value={query} onChange={setQuery} placeholder="Buscar URL o método" />
            </div>
          }
        />
        <PermissionsTable
          permissions={filtered}
          modules={modules}
          onEdit={(p) => form.open(p)}
          onDelete={(p) => confirmDelete.open(p)}
        />
      </Card>

      <PermissionFormModal
        open={form.isOpen}
        onClose={form.close}
        permission={form.payload}
        modules={modules}
        existing={permissions}
        onSubmit={(input) => {
          if (form.payload) {
            updatePermission(form.payload.id, input);
            notify("Permiso actualizado.");
          } else {
            createPermission(input);
            notify("Permiso registrado. Ya puedes asignarlo en la matriz.");
          }
        }}
      />

      <ConfirmDialog
        open={confirmDelete.isOpen}
        onClose={confirmDelete.close}
        title="Eliminar permiso"
        confirmLabel="Eliminar permiso"
        message={
          <>
            Se eliminará <strong>{describe(confirmDelete.payload)}</strong> (
            <code className="font-mono">{confirmDelete.payload?.method} {confirmDelete.payload?.url}</code>) y se
            retirará de todos los roles que lo tengan asignado.
          </>
        }
        onConfirm={() => {
          if (!confirmDelete.payload) return;
          deletePermission(confirmDelete.payload.id);
          notify("Permiso eliminado.", "error");
        }}
      />
    </>
  );
}
