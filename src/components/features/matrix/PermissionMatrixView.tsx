"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid3x3, Users } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { usePermissionMatrix } from "@/hooks/usePermissionMatrix";
import { describeError } from "@/lib/api/http";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RoleSelector } from "./RoleSelector";
import { PermissionMatrix } from "./PermissionMatrix";
import { MatrixLegend } from "./MatrixLegend";
import { MatrixSaveBar } from "./MatrixSaveBar";

/** Contenedor (smart) de la matriz: conecta el store, el hook de la matriz y los componentes visuales. */
export function PermissionMatrixView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roles, users, loading } = useData();
  const { notify } = useToast();

  const initialRole = roles.find((r) => r.id === searchParams.get("rol"))?.id ?? roles[0]?.id ?? "";
  const [roleId, setRoleId] = useState(initialRole);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Los roles llegan del backend después del primer render: hay que elegir
  // el inicial cuando la lista esté disponible.
  useEffect(() => {
    if (roleId && roles.some((r) => r.id === roleId)) return;
    const next = roles.find((r) => r.id === searchParams.get("rol"))?.id ?? roles[0]?.id ?? "";
    if (next !== roleId) setRoleId(next);
  }, [roles, roleId, searchParams]);

  const matrix = usePermissionMatrix(roleId);
  const role = roles.find((r) => r.id === roleId);
  const memberCount = users.filter((u) => u.roleIds.includes(roleId)).length;

  const applyRole = (id: string) => {
    setRoleId(id);
    router.replace(`/matriz?rol=${id}`, { scroll: false });
  };

  const handleSelectRole = (id: string) => {
    if (id === roleId) return;
    if (matrix.isDirty) setPendingRole(id);
    else applyRole(id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persiste el diff vía /api/role-permissions.
      await matrix.save();
      notify(`Matriz de “${role?.name}” guardada: ${matrix.totalAssigned} permisos en juego.`);
    } catch (error) {
      notify(describeError(error, "No se pudo guardar la matriz."), "error");
    } finally {
      setSaving(false);
    }
  };

  if (!role) {
    return loading ? (
      <EmptyState title="Cargando roles…" description="Consultando los datos en el servidor." />
    ) : (
      <EmptyState title="No hay roles" description="Crea un rol para configurar su matriz de permisos." />
    );
  }

  const coverage = matrix.totalAvailable ? Math.round((matrix.totalAssigned / matrix.totalAvailable) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Matriz de permisos"
        description="Selecciona un rol y marca las operaciones que puede ejecutar en cada módulo. Los cambios se aplican al pulsar “Guardar”."
      />

      <div className="mb-4">
        <RoleSelector roles={roles} selectedId={roleId} onSelect={handleSelectRole} />
      </div>

      {/* overflow-clip (no hidden) para que la barra de guardado pueda ser sticky respecto a la ventana */}
      <Card className="overflow-clip">
        <CardHeader
          icon={<Grid3x3 />}
          title={`Tácticas de ${role.name}`}
          description={role.description}
          action={
            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">
                <Users className="size-3" /> {memberCount} usuarios
              </Badge>
              <Badge tone="yellow">
                {matrix.totalAssigned}/{matrix.totalAvailable} permisos · {coverage}%
              </Badge>
            </div>
          }
        />

        <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <MatrixLegend />
        </div>

        <PermissionMatrix
          roleName={role.name}
          groups={matrix.groups}
          draft={matrix.draft}
          isAvailable={matrix.isAvailable}
          isPending={matrix.isPending}
          rowState={matrix.rowState}
          columnState={matrix.columnState}
          onToggle={matrix.toggle}
          onToggleRow={matrix.toggleRow}
          onToggleColumn={matrix.toggleColumn}
        />

        <MatrixSaveBar
          pendingChanges={matrix.pendingChanges}
          saving={saving}
          onReset={matrix.reset}
          onSave={handleSave}
        />
      </Card>

      <ConfirmDialog
        open={pendingRole !== null}
        onClose={() => setPendingRole(null)}
        title="Cambios sin guardar"
        confirmLabel="Descartar y cambiar"
        message={
          <>
            Tienes <strong>{matrix.pendingChanges} cambio(s)</strong> sin guardar en <strong>{role.name}</strong>. Si
            cambias de rol se perderán.
          </>
        }
        onConfirm={() => {
          if (pendingRole) applyRole(pendingRole);
        }}
      />
    </>
  );
}
