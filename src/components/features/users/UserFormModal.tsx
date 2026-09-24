"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Mail, Phone, User as UserIcon, UserPlus, Pencil } from "lucide-react";
import type { Role, User, UserStatus } from "@/types";
import type { UserInput } from "@/context/DataContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: UserInput) => void;
  roles: Role[];
  /** Si se pasa, el formulario funciona en modo edición. */
  user?: User;
}

const EMPTY: UserInput = { name: "", email: "", phone: "", roleIds: [], status: "activo", avatarUrl: undefined };

type Errors = Partial<Record<"name" | "email" | "phone" | "roleIds", string>>;

function validate(values: UserInput): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 3) errors.name = "Ingresa el nombre completo (mínimo 3 caracteres).";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Correo inválido: fuera de lugar.";
  if (values.phone && !/^[+\d\s()-]{7,}$/.test(values.phone)) errors.phone = "Teléfono inválido.";
  if (values.roleIds.length === 0) errors.roleIds = "Asigna al menos un rol.";
  return errors;
}

export function UserFormModal({ open, onClose, onSubmit, roles, user }: UserFormModalProps) {
  const [values, setValues] = useState<UserInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const isEdit = Boolean(user);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(
      user
        ? { name: user.name, email: user.email, phone: user.phone, roleIds: user.roleIds, status: user.status, avatarUrl: user.avatarUrl }
        : EMPTY,
    );
  }, [open, user]);

  const set = <K extends keyof UserInput>(key: K, value: UserInput[K]) => setValues((v) => ({ ...v, [key]: value }));

  const toggleRole = (roleId: string) =>
    set(
      "roleIds",
      values.roleIds.includes(roleId) ? values.roleIds.filter((r) => r !== roleId) : [...values.roleIds, roleId],
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() });
    onClose();
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
          <Button type="submit" form="user-form">
            {isEdit ? "Guardar cambios" : "Registrar usuario"}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
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
        <Select
          label="Estado"
          value={values.status}
          onChange={(e) => set("status", e.target.value as UserStatus)}
          options={[
            { value: "activo", label: "Activo · en cancha" },
            { value: "inactivo", label: "Inactivo · en la banca" },
          ]}
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
