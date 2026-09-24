"use client";

import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Link2, Pencil } from "lucide-react";
import type { HttpMethod, Operation, Permission, SystemModule } from "@/types";
import type { PermissionInput } from "@/context/DataContext";
import { DEFAULT_METHOD, HTTP_METHODS, OPERATIONS } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { cn } from "@/utils/cn";

interface PermissionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: PermissionInput) => void;
  modules: SystemModule[];
  permission?: Permission;
  /** Permisos existentes para detectar duplicados (mismo método + URL). */
  existing: Permission[];
}

export function PermissionFormModal({ open, onClose, onSubmit, modules, permission, existing }: PermissionFormModalProps) {
  const [values, setValues] = useState<PermissionInput>({ moduleId: "", operation: "ver", url: "", method: "GET" });
  const [errors, setErrors] = useState<Partial<Record<keyof PermissionInput, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(
      permission
        ? { moduleId: permission.moduleId, operation: permission.operation, url: permission.url, method: permission.method }
        : { moduleId: "", operation: "ver", url: "/api/", method: "GET" },
    );
  }, [open, permission]);

  const set = <K extends keyof PermissionInput>(key: K, value: PermissionInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleOperation = (op: Operation) => {
    // Sugerimos el método HTTP convencional para la operación elegida.
    setValues((v) => ({ ...v, operation: op, method: DEFAULT_METHOD[op] }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!values.moduleId) errs.moduleId = "Selecciona el módulo o recurso.";
    if (!/^\/[\w\-/:{}]*$/.test(values.url)) errs.url = "La URL debe iniciar con “/”, ej. /api/partidos/:id";
    else if (
      existing.some((p) => p.id !== permission?.id && p.url === values.url && p.method === values.method)
    )
      errs.url = "Ya existe un permiso con ese método y URL.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit(values);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={permission ? <Pencil /> : <KeyRound />}
      title={permission ? "Editar permiso" : "Registrar permiso"}
      description="Relaciona un endpoint del sistema con un módulo y una operación."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="permission-form">
            {permission ? "Guardar cambios" : "Registrar permiso"}
          </Button>
        </>
      }
    >
      <form id="permission-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Select
          label="Recurso / Módulo"
          placeholder="Selecciona un módulo"
          value={values.moduleId}
          onChange={(e) => set("moduleId", e.target.value)}
          options={modules.map((m) => ({ value: m.id, label: `${m.name} — ${m.description}` }))}
          error={errors.moduleId}
        />

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">Operación</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {OPERATIONS.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => handleOperation(op.id)}
                aria-pressed={values.operation === op.id}
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                  values.operation === op.id
                    ? "border-co-blue bg-co-blue text-white dark:border-co-yellow dark:bg-co-yellow dark:text-zinc-950"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700",
                )}
              >
                {op.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <Select
            label="Método HTTP"
            value={values.method}
            onChange={(e) => set("method", e.target.value as HttpMethod)}
            options={HTTP_METHODS.map((m) => ({ value: m, label: m }))}
          />
          <Input
            label="URL"
            placeholder="/api/partidos/:id"
            icon={<Link2 />}
            className="font-mono"
            value={values.url}
            onChange={(e) => set("url", e.target.value)}
            error={errors.url}
          />
        </div>
      </form>
    </Modal>
  );
}
