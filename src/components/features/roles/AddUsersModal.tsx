"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import type { User } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Avatar } from "@/components/ui/Avatar";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/cn";

interface AddUsersModalProps {
  open: boolean;
  onClose: () => void;
  roleName: string;
  /** Usuarios que aún no tienen el rol. */
  available: User[];
  /** Puede ser asíncrono; el modal cierra de inmediato y el aviso lo da la página. */
  onConfirm: (userIds: string[]) => void | Promise<void>;
}

export function AddUsersModal({ open, onClose, roleName, available, onConfirm }: AddUsersModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setSelected([]);
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return available.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [available, query]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<UserPlus />}
      title={`Agregar usuarios a “${roleName}”`}
      description="Selecciona a los integrantes disponibles para convocarlos a este rol."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={selected.length === 0}
            onClick={() => {
              onConfirm(selected);
              onClose();
            }}
          >
            Agregar {selected.length > 0 ? `(${selected.length})` : ""}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar usuario disponible" />
        {filtered.length === 0 ? (
          <EmptyState title="No hay usuarios disponibles" description="Todos los usuarios ya tienen este rol." />
        ) : (
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {filtered.map((u) => {
              const isSel = selected.includes(u.id);
              return (
                <li
                  key={u.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
                    isSel
                      ? "border-co-blue/40 bg-co-blue/5 dark:border-co-yellow/40 dark:bg-co-yellow/5"
                      : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900",
                  )}
                >
                  <Checkbox size="sm" srOnlyLabel label={`Seleccionar ${u.name}`} checked={isSel} onChange={() => toggle(u.id)} />
                  <button type="button" onClick={() => toggle(u.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{u.name}</span>
                      <span className="block truncate text-xs text-zinc-500">{u.email}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
