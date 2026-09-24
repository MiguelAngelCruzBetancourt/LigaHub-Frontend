import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Oculta la columna en pantallas pequeñas. */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Tabla genérica y tipada. Componente visual puro: no conoce el origen de los datos. */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyTitle = "Sin resultados",
  emptyDescription = "No hay registros que coincidan con la búsqueda.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-900/60">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500",
                  col.hideOnMobile && "hidden md:table-cell",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "bg-white transition-colors hover:bg-zinc-50 dark:bg-black dark:hover:bg-zinc-900/60",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3 align-middle", col.hideOnMobile && "hidden md:table-cell", col.className)}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
