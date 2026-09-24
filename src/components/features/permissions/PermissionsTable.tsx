"use client";

import { Pencil, Trash } from "lucide-react";
import type { Permission, SystemModule } from "@/types";
import { OPERATION_LABEL } from "@/lib/constants";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { ModuleIcon } from "@/components/features/ModuleIcon";
import { MethodBadge } from "./MethodBadge";

interface PermissionsTableProps {
  permissions: Permission[];
  modules: SystemModule[];
  onEdit: (p: Permission) => void;
  onDelete: (p: Permission) => void;
}

export function PermissionsTable({ permissions, modules, onEdit, onDelete }: PermissionsTableProps) {
  const moduleById = (id: string) => modules.find((m) => m.id === id);

  const columns: Column<Permission>[] = [
    {
      key: "module",
      header: "Recurso / Módulo",
      cell: (p) => {
        const m = moduleById(p.moduleId);
        return m ? (
          <div className="flex items-center gap-3">
            <ModuleIcon name={m.icon} />
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{m.name}</span>
          </div>
        ) : (
          <span className="text-zinc-500">—</span>
        );
      },
    },
    {
      key: "operation",
      header: "Operación",
      cell: (p) => <Badge tone={p.operation === "eliminar" ? "red" : "neutral"}>{OPERATION_LABEL[p.operation]}</Badge>,
    },
    { key: "method", header: "Método", cell: (p) => <MethodBadge method={p.method} /> },
    {
      key: "url",
      header: "URL",
      cell: (p) => (
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {p.url}
        </code>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Acciones</span>,
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end gap-0.5">
          <IconButton label="Editar" tone="blue" onClick={() => onEdit(p)}>
            <Pencil />
          </IconButton>
          <IconButton label="Eliminar" tone="red" onClick={() => onDelete(p)}>
            <Trash />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={permissions}
      rowKey={(p) => p.id}
      emptyTitle="Sin permisos registrados"
      emptyDescription="Registra endpoints para poder asignarlos en la matriz."
    />
  );
}
