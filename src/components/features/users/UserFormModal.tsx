"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Mail, Phone, TriangleAlert, User as UserIcon, UserPlus, Pencil } from "lucide-react";
import type { Role, User } from "@/types";
import type { UserInput } from "@/context/DataContext";
import { PASSWORD_HINT, PASSWORD_PATTERN } from "@/lib/constants";
import { toBackendId } from "@/lib/api/adapters";
import { describeError } from "@/lib/api/http";
import { usersApi } from "@/lib/api/users";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Checkbox } from "@/components/ui/Checkbox";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Puede ser asíncrono: el modal espera y solo cierra si no hubo error. */
  onSubmit: (input: UserInput) => void | Promise<void>;
  roles: Role[];
  /** Si se pasa, el formulario funciona en modo edición. */
  user?: User;
  /** Fecha de nacimiento ya registrada en el perfil, si existe. */
  birthDate?: string;
}

const EMPTY: UserInput = {
  name: "",
  email: "",
  phone: "",
  roleIds: [],
  status: "activo",
  avatarUrl: undefined,
  password: "",
  birthDate: "",
};

type Errors = Partial<
  Record<"name" | "email" | "phone" | "roleIds" | "password" | "birthDate" | "form", string>
>;

function validate(values: UserInput, isEdit: boolean): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 3) errors.name = "Ingresa el nombre completo (mínimo 3 caracteres).";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Correo inválido: fuera de lugar.";
  if (values.phone && !/^[+\d\s()-]{7,}$/.test(values.phone)) errors.phone = "Teléfono inválido.";
  if (values.roleIds.length === 0) errors.roleIds = "Asigna al menos un rol.";

  const password = values.password ?? "";
  // Al crear es obligatoria; al editar, vacía significa "no cambiarla".
  if (!isEdit && !password) errors.password = "Define una contraseña para el nuevo usuario.";
  else if (password && !PASSWORD_PATTERN.test(password)) errors.password = PASSWORD_HINT;

  // El backend guarda el teléfono en Profile, que exige también la fecha.
  if (values.phone.trim() && !values.birthDate) {
    errors.birthDate = "Para guardar el teléfono también se necesita la fecha de nacimiento.";
  } else if (values.birthDate && new Date(values.birthDate) >= new Date()) {
    errors.birthDate = "La fecha de nacimiento debe estar en el pasado.";
  }

  return errors;
}

export function UserFormModal({ open, onClose, onSubmit, roles, user, birthDate }: UserFormModalProps) {
  const [values, setValues] = useState<UserInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(user);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitting(false);
    setValues(
      user
        ? {
            name: user.name,
            email: user.email,
            phone: user.phone,
            roleIds: user.roleIds,
            status: user.status,
            avatarUrl: user.avatarUrl,
            password: "",
            birthDate: birthDate ?? "",
          }
        : EMPTY,
    );
  }, [open, user, birthDate]);

  // La fecha vive en Profile y no viene en el listado: si el llamador no la
  // pasó, se consulta para no obligar a reescribirla al editar.
  useEffect(() => {
    if (!open || !user || birthDate !== undefined) return;
    let active = true;

    usersApi
      .findByIdWithProfile(toBackendId(user.id))
      .then((detail) => {
        const stored = detail.profile?.birthDate;
        if (active && stored) setValues((v) => (v.birthDate ? v : { ...v, birthDate: stored }));
      })
      .catch(() => {
        // Sin perfil legible, el campo queda vacío y el usuario puede llenarlo.
      });

    return () => {
      active = false;
    };
  }, [open, user, birthDate]);

  const set = <K extends keyof UserInput>(key: K, value: UserInput[K]) => setValues((v) => ({ ...v, [key]: value }));

  const toggleRole = (roleId: string) =>
    set(
      "roleIds",
      values.roleIds.includes(roleId) ? values.roleIds.filter((r) => r !== roleId) : [...values.roleIds, roleId],
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values, isEdit);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() });
      onClose();
    } catch (error) {
      // El backend respondió con error: se mantiene el modal abierto.
      setErrors({ form: describeError(error, "No se pudo guardar el usuario.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={isEdit ? <Pencil /> : <UserPlus />}
      title={isEdit ? "Editar usuario" : "Registrar nuevo usuario"}
      description={isEdit ? "Actualiza la ficha del integrante." : "Ficha a un nuevo integrante para el equipo de gestión."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" loading={submitting}>
            {isEdit ? "Guardar cambios" : "Registrar usuario"}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        {errors.form && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-co-red/30 bg-co-red/10 px-3 py-2.5 text-sm text-co-red sm:col-span-2"
          >
            <TriangleAlert className="size-4 shrink-0" />
            {errors.form}
          </div>
        )}
        <div className="sm:col-span-2">
          <Input
            label="Nombre completo"
            placeholder="Ej. James Rodríguez"
            icon={<UserIcon />}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            error={errors.name}
          />
        </div>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="capitan@futbolapp.co"
          icon={<Mail />}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label="Teléfono"
          placeholder="+57 300 000 0000"
          icon={<Phone />}
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          error={errors.phone}
        />

        <div className="sm:col-span-2">
          <PasswordInput
            label={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.password ?? ""}
            onChange={(e) => set("password", e.target.value)}
            error={errors.password}
            hint={isEdit ? "Déjala vacía para conservar la actual." : PASSWORD_HINT}
          />
          {values.password ? (
            <div className="mt-3">
              <PasswordStrength password={values.password} />
            </div>
          ) : null}
        </div>

        <Input
          label="Fecha de nacimiento"
          type="date"
          icon={<CalendarDays />}
          value={values.birthDate ?? ""}
          onChange={(e) => set("birthDate", e.target.value)}
          error={errors.birthDate}
          hint="Requerida para guardar el teléfono."
        />

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Roles asignados</legend>
          <div className="grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            {roles.map((r) => (
              <div key={r.id} className="rounded-lg px-2 py-1.5 hover:bg-white dark:hover:bg-zinc-900">
                <Checkbox
                  size="sm"
                  label={r.name}
                  checked={values.roleIds.includes(r.id)}
                  onChange={() => toggleRole(r.id)}
                />
              </div>
            ))}
          </div>
          {errors.roleIds && <p className="mt-1.5 text-xs text-co-red">{errors.roleIds}</p>}
        </fieldset>
      </form>
    </Modal>
  );
}
