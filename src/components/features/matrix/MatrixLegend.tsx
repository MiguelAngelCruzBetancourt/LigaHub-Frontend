import { Check } from "lucide-react";

/** Leyenda visual de los estados de las celdas. */
export function MatrixLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
      <li className="flex items-center gap-2">
        <span className="flex size-4 items-center justify-center rounded border-2 border-co-blue bg-co-blue text-white dark:border-co-yellow dark:bg-co-yellow dark:text-zinc-950">
          <Check className="size-3" strokeWidth={3} />
        </span>
        Asignado
      </li>
      <li className="flex items-center gap-2">
        <span className="size-4 rounded border-2 border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950" />
        Sin asignar
      </li>
      <li className="flex items-center gap-2">
        <span className="size-4 rounded border-2 border-zinc-300 ring-2 ring-co-red/60 ring-offset-1 ring-offset-white dark:border-zinc-700 dark:ring-offset-black" />
        Cambio pendiente
      </li>
      <li className="flex items-center gap-2">
        <span className="size-4 rounded border-2 border-dashed border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
        Endpoint no registrado
      </li>
    </ul>
  );
}
