"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Operation, Permission, SystemModule } from "@/types";
import { DEFAULT_MODULE_GROUP, OPERATIONS } from "@/lib/constants";
import { useData } from "@/context/DataContext";

/** Clave de celda de la matriz: "moduloId:operacion". */
export type CellKey = `${string}:${Operation}`;

/** Sección de la matriz: módulos que comparten `group` (ej. "Administración"). */
export interface ModuleGroup {
  name: string;
  modules: SystemModule[];
}

export const cellKey = (moduleId: string, op: Operation): CellKey => `${moduleId}:${op}`;

/**
 * Lógica de la matriz de permisos.
 * Mantiene una copia de trabajo de las celdas marcadas para el rol seleccionado,
 * calcula los cambios pendientes y los persiste en el store mock al guardar.
 */
export function usePermissionMatrix(roleId: string) {
  const { modules: allModules, permissions, rolePermissions, setRolePermissions } = useData();

  // Permisos registrados agrupados por celda (puede haber varios endpoints por módulo/operación).
  const permissionsByCell = useMemo(() => {
    const map = new Map<CellKey, Permission[]>();
    for (const p of permissions) {
      const key = cellKey(p.moduleId, p.operation);
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return map;
  }, [permissions]);

  const assignedIds = useMemo(() => new Set(rolePermissions[roleId] ?? []), [rolePermissions, roleId]);

  /**
   * Una celda puede agrupar varios permisos (endpoints). Está marcada solo si el
   * rol los tiene TODOS; si tiene algunos pero no todos es "parcial" y se
   * muestra indeterminada, para no aparentar ni conceder lo que no está asignado.
   */
  const { savedCells, partialCells } = useMemo(() => {
    const all = new Set<CellKey>();
    const partial = new Set<CellKey>();
    for (const [key, cellPermissions] of permissionsByCell) {
      const count = cellPermissions.filter((p) => assignedIds.has(p.id)).length;
      if (count === 0) continue;
      if (count === cellPermissions.length) all.add(key);
      else partial.add(key);
    }
    return { savedCells: all, partialCells: partial };
  }, [permissionsByCell, assignedIds]);

  const [draft, setDraft] = useState<Set<CellKey>>(savedCells);
  /** Celdas que el usuario tocó: solo esas cambian al guardar. */
  const [touched, setTouched] = useState<Set<CellKey>>(new Set());

  /**
   * Firma del conjunto guardado. Al venir de la API, `savedCells` cambia de
   * identidad en cada recarga aunque su contenido sea el mismo; comparar la
   * firma evita que un refetch borre los cambios sin guardar.
   */
  const savedSignature = useMemo(
    () => `${[...savedCells].sort().join("|")}#${[...partialCells].sort().join("|")}`,
    [savedCells, partialCells],
  );
  const lastSignature = useRef(savedSignature);

  useEffect(() => {
    if (lastSignature.current === savedSignature) return;
    lastSignature.current = savedSignature;
    setDraft(new Set(savedCells));
    setTouched(new Set());
  }, [savedSignature, savedCells]);

  const isAvailable = useCallback((key: CellKey) => permissionsByCell.has(key), [permissionsByCell]);

  /** Solo se muestran los módulos que tienen al menos un permiso registrado. */
  const modules = useMemo(
    () => allModules.filter((module) => OPERATIONS.some((op) => isAvailable(cellKey(module.id, op.id)))),
    [allModules, isAvailable],
  );

  /** Módulos agrupados por sección; el grupo por defecto va al final. */
  const groups = useMemo<ModuleGroup[]>(() => {
    const byName = new Map<string, SystemModule[]>();
    for (const module of modules) {
      const name = module.group ?? DEFAULT_MODULE_GROUP;
      byName.set(name, [...(byName.get(name) ?? []), module]);
    }
    return [...byName]
      .map(([name, groupModules]) => ({ name, modules: groupModules }))
      .sort((a, b) => {
        if (a.name === DEFAULT_MODULE_GROUP) return 1;
        if (b.name === DEFAULT_MODULE_GROUP) return -1;
        return a.name.localeCompare(b.name, "es");
      });
  }, [modules]);

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
      setTouched((prev) => new Set(prev).add(key));
    },
    [isAvailable],
  );

  const setMany = useCallback(
    (keys: CellKey[], value: boolean) => {
      const targets = keys.filter(isAvailable);
      setDraft((prev) => {
        const next = new Set(prev);
        for (const k of targets) {
          if (value) next.add(k);
          else next.delete(k);
        }
        return next;
      });
      setTouched((prev) => {
        const next = new Set(prev);
        for (const k of targets) next.add(k);
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

  /** Una celda tocada está pendiente si su destino (todos / ninguno) difiere de lo persistido. */
  const isPending = useCallback(
    (key: CellKey) => {
      if (!touched.has(key)) return false;
      return draft.has(key) ? !savedCells.has(key) : savedCells.has(key) || partialCells.has(key);
    },
    [touched, draft, savedCells, partialCells],
  );

  const pendingChanges = useMemo(() => [...touched].filter(isPending).length, [touched, isPending]);

  /** Parcial = el rol tiene solo algunos permisos de la celda y el usuario no la ha tocado. */
  const isPartial = useCallback((key: CellKey) => partialCells.has(key) && !touched.has(key), [partialCells, touched]);

  const totalAvailable = useMemo(() => permissionsByCell.size, [permissionsByCell]);

  const reset = useCallback(() => {
    setDraft(new Set(savedCells));
    setTouched(new Set());
  }, [savedCells]);

  const save = useCallback(async () => {
    // Celdas tocadas: todos sus permisos si quedaron marcadas, ninguno si no.
    // Celdas sin tocar: exactamente lo que ya estaba asignado (sin escalar permisos).
    const ids: string[] = [];
    for (const [key, cellPermissions] of permissionsByCell) {
      if (touched.has(key)) {
        if (draft.has(key)) ids.push(...cellPermissions.map((p) => p.id));
      } else {
        ids.push(...cellPermissions.filter((p) => assignedIds.has(p.id)).map((p) => p.id));
      }
    }
    await setRolePermissions(roleId, ids);
  }, [draft, touched, permissionsByCell, assignedIds, roleId, setRolePermissions]);

  return {
    modules,
    groups,
    draft,
    isAvailable,
    isPartial,
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
