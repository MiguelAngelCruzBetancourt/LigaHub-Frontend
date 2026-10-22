"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Operation } from "@/types";
import { OPERATIONS } from "@/lib/constants";
import { cellKey, type CellKey, type ModuleGroup } from "@/hooks/usePermissionMatrix";
import { Checkbox } from "@/components/ui/Checkbox";
import { ModuleIcon } from "@/components/features/ModuleIcon";
import { cn } from "@/utils/cn";

type SelectionState = "all" | "some" | "none";

export interface PermissionMatrixProps {
  roleName: string;
  groups: ModuleGroup[];
  draft: Set<CellKey>;
  isAvailable: (key: CellKey) => boolean;
  isPending: (key: CellKey) => boolean;
  rowState: (moduleId: string) => SelectionState;
  columnState: (op: Operation) => SelectionState;
  onToggle: (moduleId: string, op: Operation) => void;
  onToggleRow: (moduleId: string) => void;
  onToggleColumn: (op: Operation) => void;
}

/**
 * Matriz interactiva Módulo × Operación (componente visual puro).
 * Filas: módulos (derivados de `model`) agrupados en secciones colapsables.
 * Columnas: Ver, Listar, Crear, Actualizar, Eliminar.
 */
export function PermissionMatrix({
  roleName,
  groups,
  draft,
  isAvailable,
  isPending,
  rowState,
  columnState,
  onToggle,
  onToggleRow,
  onToggleColumn,
}: PermissionMatrixProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (name: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const totalColumns = OPERATIONS.length + 2;
  let rowIndex = 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
        <caption className="sr-only">Matriz de permisos del rol {roleName}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
            >
              Módulo / Recurso
            </th>
            {OPERATIONS.map((op) => {
              const state = columnState(op.id);
              return (
                <th
                  key={op.id}
                  scope="col"
                  className="border-b border-zinc-200 bg-zinc-100 px-2 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        op.id === "eliminar" ? "text-co-red" : "text-zinc-600 dark:text-zinc-300",
                      )}
                    >
                      {op.label}
                    </span>
                    <Checkbox
                      size="sm"
                      srOnlyLabel
                      label={`Marcar ${op.label} en todos los módulos`}
                      checked={state === "all"}
                      indeterminate={state === "some"}
                      onChange={() => onToggleColumn(op.id)}
                    />
                  </div>
                </th>
              );
            })}
            <th
              scope="col"
              className="border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
            >
              Todos
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const isCollapsed = collapsed.has(group.name);
            const keys = group.modules.flatMap((m) => OPERATIONS.map((op) => cellKey(m.id, op.id))).filter(isAvailable);
            const assigned = keys.filter((k) => draft.has(k)).length;

            return [
              <tr key={`group-${group.name}`}>
                <td
                  colSpan={totalColumns}
                  className="border-b border-zinc-200 bg-zinc-100/70 p-0 dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.name)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-co-blue transition-colors hover:bg-co-yellow/10 dark:text-co-yellow dark:hover:bg-zinc-900"
                  >
                    <ChevronDown className={cn("size-4 transition-transform", isCollapsed && "-rotate-90")} />
                    {group.name}
                    <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200 dark:bg-black dark:ring-zinc-800">
                      {assigned}/{keys.length}
                    </span>
                  </button>
                </td>
              </tr>,
              ...(isCollapsed ? [] : group.modules.map((m) => {
                const rState = rowState(m.id);
                const zebra = rowIndex++ % 2 === 1;
                return (
                  <tr key={m.id} className="group">
                    <th
                      scope="row"
                      className={cn(
                        "sticky left-0 z-10 border-b border-zinc-200 px-4 py-3 text-left font-normal transition-colors dark:border-zinc-800",
                        zebra ? "bg-zinc-50 dark:bg-zinc-950" : "bg-white dark:bg-black",
                        "group-hover:bg-co-yellow/10 dark:group-hover:bg-zinc-900",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <ModuleIcon name={m.icon} />
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{m.name}</p>
                          <p className="truncate text-xs text-zinc-500">{m.description}</p>
                        </div>
                      </div>
                    </th>
                    {OPERATIONS.map((op) => {
                      const key = cellKey(m.id, op.id);
                      const available = isAvailable(key);
                      return (
                        <td
                          key={op.id}
                          className={cn(
                            "border-b border-zinc-200 px-2 py-3 text-center transition-colors dark:border-zinc-800",
                            zebra ? "bg-zinc-50 dark:bg-zinc-950" : "bg-white dark:bg-black",
                            "group-hover:bg-co-yellow/10 dark:group-hover:bg-zinc-900",
                          )}
                        >
                          <div className="flex justify-center" title={available ? undefined : "No hay un permiso registrado para esta operación"}>
                            <Checkbox
                              srOnlyLabel
                              label={`${op.label} en ${m.name}`}
                              checked={draft.has(key)}
                              disabled={!available}
                              highlight={isPending(key)}
                              onChange={() => onToggle(m.id, op.id)}
                            />
                          </div>
                        </td>
                      );
                    })}
                    <td
                      className={cn(
                        "border-b border-zinc-200 px-4 py-3 text-center transition-colors dark:border-zinc-800",
                        zebra ? "bg-zinc-50 dark:bg-zinc-950" : "bg-white dark:bg-black",
                        "group-hover:bg-co-yellow/10 dark:group-hover:bg-zinc-900",
                      )}
                    >
                      <div className="flex justify-center">
                        <Checkbox
                          size="sm"
                          srOnlyLabel
                          label={`Todas las operaciones en ${m.name}`}
                          checked={rState === "all"}
                          indeterminate={rState === "some"}
                          onChange={() => onToggleRow(m.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}
