"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Operation, Permission } from "@/types";
import { OPERATIONS } from "@/lib/constants";
import { useData } from "@/context/DataContext";

/** Clave de celda de la matriz: "moduloId:operacion". */
export type CellKey = `${string}:${Operation}`;

export const cellKey = (moduleId: string, op: Operation): CellKey => `${moduleId}:${op}`;

/**
 * Lógica de la matriz de permisos (HU-SE-06).
 * Mantiene una copia de trabajo de las celdas marcadas para el rol seleccionado,
 * calcula los cambios pendientes y los persiste en el store mock al guardar.
 */
export function usePermissionMatrix(roleId: string) {
  const { modules, permissions, rolePermissions, setRolePermissions } = useData();

  // Permisos registrados agrupados por celda (puede haber varios endpoints por módulo/operación).
  const permissionsByCell = useMemo(() => {
    const map = new Map<CellKey, Permission[]>();
    for (const p of permissions) {
      const key = cellKey(p.moduleId, p.operation);
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return map;
  }, [permissions]);

  const savedCells = useMemo(() => {
    const assigned = new Set(rolePermissions[roleId] ?? []);
    const cells = new Set<CellKey>();
    for (const p of permissions) {
      if (assigned.has(p.id)) cells.add(cellKey(p.moduleId, p.operation));
    }
    return cells;
  }, [permissions, rolePermissions, roleId]);

  const [draft, setDraft] = useState<Set<CellKey>>(savedCells);

  // Al cambiar de rol (o tras guardar) se reinicia la copia de trabajo.
  useEffect(() => setDraft(new Set(savedCells)), [savedCells]);

  const isAvailable = useCallback((key: CellKey) => permissionsByCell.has(key), [permissionsByCell]);

  const toggle = useCallback(
    (moduleId: string, op: Operation) => {
      const key = cellKey(moduleId, op);
      if (!isAvailable(key)) return;
      setDraft((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [isAvailable],
  );

  const setMany = useCallback(
    (keys: CellKey[], value: boolean) => {
      setDraft((prev) => {
        const next = new Set(prev);
        for (const k of keys.filter(isAvailable)) {
          if (value) next.add(k);
          else next.delete(k);
        }
        return next;
      });
    },
    [isAvailable],
  );

  const rowKeys = useCallback(
    (moduleId: string) => OPERATIONS.map((o) => cellKey(moduleId, o.id)).filter(isAvailable),
    [isAvailable],
  );
  const columnKeys = useCallback(
    (op: Operation) => modules.map((m) => cellKey(m.id, op)).filter(isAvailable),
    [modules, isAvailable],
  );

  const selectionState = useCallback(
    (keys: CellKey[]): "all" | "some" | "none" => {
      const count = keys.filter((k) => draft.has(k)).length;
      if (count === 0) return "none";
      return count === keys.length ? "all" : "some";
    },
    [draft],
  );

  const toggleRow = useCallback(
    (moduleId: string) => {
      const keys = rowKeys(moduleId);
      setMany(keys, selectionState(keys) !== "all");
    },
    [rowKeys, setMany, selectionState],
  );

  const toggleColumn = useCallback(
    (op: Operation) => {
      const keys = columnKeys(op);
      setMany(keys, selectionState(keys) !== "all");
    },
    [columnKeys, setMany, selectionState],
  );

  const pendingChanges = useMemo(() => {
    let count = 0;
    for (const k of draft) if (!savedCells.has(k)) count++;
    for (const k of savedCells) if (!draft.has(k)) count++;
    return count;
  }, [draft, savedCells]);

  const isPending = useCallback((key: CellKey) => draft.has(key) !== savedCells.has(key), [draft, savedCells]);

  const totalAvailable = useMemo(() => permissionsByCell.size, [permissionsByCell]);

  const reset = useCallback(() => setDraft(new Set(savedCells)), [savedCells]);

  const save = useCallback(() => {
    const ids = [...draft].flatMap((k) => (permissionsByCell.get(k) ?? []).map((p) => p.id));
    setRolePermissions(roleId, ids);
  }, [draft, permissionsByCell, roleId, setRolePermissions]);

  return {
    modules,
    draft,
    isAvailable,
    isPending,
    toggle,
    toggleRow,
    toggleColumn,
    rowState: (moduleId: string) => selectionState(rowKeys(moduleId)),
    columnState: (op: Operation) => selectionState(columnKeys(op)),
    totalAssigned: draft.size,
    totalAvailable,
    pendingChanges,
    isDirty: pendingChanges > 0,
    reset,
    save,
  };
}
