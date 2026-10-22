"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, ShieldPlus, TriangleAlert } from "lucide-react";
import type { Role } from "@/types";
import type { RoleInput } from "@/context/DataContext";
import { describeError } from "@/lib/api/http";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Puede ser asíncrono: el modal espera y solo cierra si no hubo error. */
  onSubmit: (input: RoleInput) => void | Promise<void>;
  role?: Role;
  /** Nombres ya usados, para validar duplicados. */
  existingNames: string[];
}

export function RoleFormModal({ open, onClose, onSubmit, role, existingNames }: RoleFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; description?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setErrors({});
    setSubmitting(false);
  }, [open, role]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    const trimmed = name.trim();
    if (trimmed.length < 3) errs.name = "El nombre debe tener al menos 3 caracteres.";
    else if (
      existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase() && n.toLowerCase() !== role?.name.toLowerCase())
    )
      errs.name = "Ya existe un rol con ese nombre.";
    if (description.trim().length < 10) errs.description = "Describe el rol en al menos 10 caracteres.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await onSubmit({ name: trimmed, description: description.trim() });
      onClose();
    } catch (error) {
      // Por ejemplo un 409 si el nombre ya existe en la base de datos.
      setErrors({ form: describeError(error, "No se pudo guardar el rol.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={role ? <Pencil /> : <ShieldPlus />}
      title={role ? "Editar rol" : "Crear rol"}
      description="Define la posición que ocupará este rol dentro del sistema."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="role-form" loading={submitting}>
            {role ? "Guardar cambios" : "Crear rol"}
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-co-red/30 bg-co-red/10 px-3 py-2.5 text-sm text-co-red"
          >
            <TriangleAlert className="size-4 shrink-0" />
            {errors.form}
          </div>
        )}
        <Input
          label="Nombre del rol"
          placeholder="Ej. Preparador Físico"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />
        <Textarea
          label="Descripción"
          placeholder="Ej. Supervisa cargas de entrenamiento y reportes médicos de la plantilla."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          hint={`${description.length}/200`}
          maxLength={200}
        />
      </form>
    </Modal>
  );
}
