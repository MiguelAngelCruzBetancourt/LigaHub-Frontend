"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import type { Permission, SystemModule } from "@/types";
import { OPERATION_LABEL } from "@/lib/constants";
import { toBackendId } from "@/lib/api/adapters";
import { describeError } from "@/lib/api/http";
import { permissionsApi } from "@/lib/api/permissions";
import { rolePermissionsApi } from "@/lib/api/role-permissions";
import type { PermissionResponseDTO, PermissionRoleResponseDTO } from "@/lib/api/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MethodBadge } from "./MethodBadge";

interface PermissionDetailModalProps {
  open: boolean;
  onClose: () => void;
  permission?: Permission;
  modules: SystemModule[];
}

/** Detalle de solo lectura de un permiso y de los roles que lo tienen asignado. */
export function PermissionDetailModal({ open, onClose, permission, modules }: PermissionDetailModalProps) {
  const [detail, setDetail] = useState<PermissionResponseDTO | null>(null);
  const [roles, setRoles] = useState<PermissionRoleResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open || !permission) return;
    let active = true;
    const id = toBackendId(permission.id);

    setDetail(null);
    setRoles([]);
    setError(undefined);
    setLoading(true);

    Promise.all([permissionsApi.findById(id), rolePermissionsApi.findByPermissionId(id)])
      .then(([found, assigned]) => {
        if (!active) return;
        setDetail(found);
        setRoles(assigned);
      })
      .catch((caught) => {
        if (active) setError(describeError(caught, "No se pudo cargar el detalle del permiso."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, permission]);

  const moduleName = modules.find((m) => m.id === permission?.moduleId)?.name;

  const rows: { label: string; value: React.ReactNode }[] = permission
    ? [
        { label: "Módulo", value: moduleName ?? "—" },
        { label: "Modelo / Recurso", value: <span className="font-mono">{detail?.model ?? permission.model}</span> },
        { label: "Operación", value: OPERATION_LABEL[permission.operation] },
        { label: "Método HTTP", value: <MethodBadge method={permission.method} /> },
        {
          label: "URL",
          value: <code className="font-mono text-xs">{detail?.url ?? permission.url}</code>,
        },
      ]
    : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Eye />}
      title="Detalle del permiso"
      description="Información del permiso y roles que lo tienen asignado."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <dl className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2.5">
            <dt className="w-36 shrink-0 text-zinc-500">{label}</dt>
            <dd className="min-w-0 flex-1 font-medium">{value}</dd>
          </div>
        ))}
        <div className="flex items-start gap-3 py-2.5">
          <dt className="w-36 shrink-0 text-zinc-500">Roles con este permiso</dt>
          <dd className="flex min-w-0 flex-1 flex-wrap gap-1">
            {loading ? (
              <span className="text-zinc-500">Cargando…</span>
            ) : error ? (
              <span className="text-co-red">{error}</span>
            ) : roles.length === 0 ? (
              <span className="text-zinc-500">Ningún rol lo tiene asignado.</span>
            ) : (
              roles.map((link) => (
                <Badge key={link.id} tone="blue">
                  {link.role.name}
                </Badge>
              ))
            )}
          </dd>
        </div>
      </dl>
    </Modal>
  );
}
