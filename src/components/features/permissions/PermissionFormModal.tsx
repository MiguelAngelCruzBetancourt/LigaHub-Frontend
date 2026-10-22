"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { KeyRound, Layers, Link2, Pencil, TriangleAlert } from "lucide-react";
import type { HttpMethod, Operation, Permission } from "@/types";
import type { PermissionInput } from "@/context/DataContext";
import { DEFAULT_METHOD, HTTP_METHODS, OPERATIONS } from "@/lib/constants";
import { describeError } from "@/lib/api/http";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { cn } from "@/utils/cn";

interface PermissionFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Puede ser asíncrono: el modal espera y solo cierra si no hubo error. */
  onSubmit: (input: PermissionInput) => void | Promise<void>;
  permission?: Permission;
  /** Permisos existentes para detectar duplicados (mismo método + URL). */
  existing: Permission[];
}

type FormErrors = Partial<Record<keyof PermissionInput | "form", string>>;

export function PermissionFormModal({ open, onClose, onSubmit, permission, existing }: PermissionFormModalProps) {
  const [values, setValues] = useState<PermissionInput>({ model: "", operation: "ver", url: "", method: "GET" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitting(false);
    setValues(
      permission
        ? { model: permission.model, operation: permission.operation, url: permission.url, method: permission.method }
        : { model: "", operation: "ver", url: "/api/", method: "GET" },
    );
  }, [open, permission]);

  // Modelos ya registrados: se sugieren al escribir para no duplicar variantes ("User" vs "user").
  const knownModels = useMemo(
    () => [...new Set(existing.map((p) => p.model).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")),
    [existing],
  );

  const set = <K extends keyof PermissionInput>(key: K, value: PermissionInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleOperation = (op: Operation) => {
    // Sugerimos el método HTTP convencional para la operación elegida.
    setValues((v) => ({ ...v, operation: op, method: DEFAULT_METHOD[op] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: FormErrors = {};
    const model = values.model.trim();
    if (!model) errs.model = "Indica el modelo o recurso.";
    else if (model.length > 255) errs.model = "El modelo no puede superar 255 caracteres.";
    if (!/^\/[\w\-/:{}]*$/.test(values.url)) errs.url = "La URL debe iniciar con “/”, ej. /api/partidos/{id}";
    else if (
      existing.some((p) => p.id !== permission?.id && p.url === values.url && p.method === values.method)
    )
      errs.url = "Ya existe un permiso con ese método y URL.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await onSubmit({ ...values, model });
      onClose();
    } catch (error) {
      // El backend tiene una restricción única sobre (url, method): puede dar 409.
      setErrors({ form: describeError(error, "No se pudo guardar el permiso.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={permission ? <Pencil /> : <KeyRound />}
      title={permission ? "Editar permiso" : "Registrar permiso"}
      description="Relaciona un endpoint del sistema con un modelo y una operación."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="permission-form" loading={submitting}>
            {permission ? "Guardar cambios" : "Registrar permiso"}
          </Button>
        </>
      }
    >
      <form id="permission-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-co-red/30 bg-co-red/10 px-3 py-2.5 text-sm text-co-red"
          >
            <TriangleAlert className="size-4 shrink-0" />
            {errors.form}
          </div>
        )}
        <div>
          <Input
            label="Modelo / Recurso"
            placeholder="User"
            icon={<Layers />}
            list="permission-models"
            autoComplete="off"
            value={values.model}
            onChange={(e) => set("model", e.target.value)}
            error={errors.model}
            hint="Entidad a la que pertenece el permiso: agrupa las filas de la matriz de asignación."
          />
          <datalist id="permission-models">
            {knownModels.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

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
            placeholder="/api/partidos/{id}"
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
