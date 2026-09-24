"use client";

import { Eye, Pencil, ShieldCheck, Trash } from "lucide-react";
import type { Role } from "@/types";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";

export interface RoleRow extends Role {
  userCount: number;
  permissionCount: number;
}

interface RolesTableProps {
  roles: RoleRow[];
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RolesTable({ roles, onView, onEdit, onDelete }: RolesTableProps) {
  const columns: Column<RoleRow>[] = [
    {
      key: "name",
      header: "Nombre",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-co-yellow/20 text-zinc-900 dark:bg-co-yellow/15 dark:text-co-yellow">
            <ShieldCheck className="size-4" />
          </span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{r.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      className: "max-w-sm",
      cell: (r) => <p className="line-clamp-2 text-zinc-600 dark:text-zinc-400">{r.description}</p>,
    },
    {
      key: "users",
      header: "Usuarios",
      hideOnMobile: true,
      cell: (r) => <Badge tone="blue">{r.userCount} usuarios</Badge>,
    },
    {
      key: "perms",
      header: "Permisos",
      hideOnMobile: true,
      cell: (r) => <Badge tone="yellow">{r.permissionCount} permisos</Badge>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Acciones</span>,
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          <IconButton label="Ver detalle" onClick={() => onView(r)}>
            <Eye />
          </IconButton>
          <IconButton label="Editar" tone="blue" onClick={() => onEdit(r)}>
            <Pencil />
          </IconButton>
          <IconButton label="Eliminar" tone="red" onClick={() => onDelete(r)}>
            <Trash />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={roles}
      rowKey={(r) => r.id}
      onRowClick={onView}
      emptyTitle="No hay roles en la alineación"
      emptyDescription="Crea el primer rol para empezar a asignar permisos."
    />
  );
}
