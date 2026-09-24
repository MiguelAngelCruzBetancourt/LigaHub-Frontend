"use client";

import { ShieldCheck } from "lucide-react";
import type { Role } from "@/types";
import { Select } from "@/components/ui/Field";
import { cn } from "@/utils/cn";

interface RoleSelectorProps {
  roles: Role[];
  selectedId: string;
  onSelect: (roleId: string) => void;
}

/** Pestañas de roles en escritorio, dropdown en móvil. */
export function RoleSelector({ roles, selectedId, onSelect }: RoleSelectorProps) {
  return (
    <>
      <div className="md:hidden">
        <Select
          label="Rol"
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          options={roles.map((r) => ({ value: r.id, label: r.name }))}
        />
      </div>

      <div
        role="tablist"
        aria-label="Seleccionar rol"
        className="hidden flex-wrap gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 md:flex dark:border-zinc-800 dark:bg-zinc-950"
      >
        {roles.map((r) => {
          const active = r.id === selectedId;
          return (
            <button
              key={r.id}
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(r.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-white text-co-blue shadow-sm ring-1 ring-zinc-200 dark:bg-black dark:text-co-yellow dark:ring-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              )}
            >
              <ShieldCheck className={cn("size-4", active ? "opacity-100" : "opacity-50")} />
              {r.name}
              {active && <span className="size-1.5 rounded-full bg-co-red" />}
            </button>
          );
        })}
      </div>
    </>
  );
}
