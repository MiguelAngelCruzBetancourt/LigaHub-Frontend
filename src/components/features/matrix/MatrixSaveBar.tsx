import { RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface MatrixSaveBarProps {
  pendingChanges: number;
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
}

export function MatrixSaveBar({ pendingChanges, saving, onReset, onSave }: MatrixSaveBarProps) {
  const dirty = pendingChanges > 0;
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex flex-col gap-3 border-t px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between",
        dirty
          ? "border-co-yellow/60 bg-co-yellow/10 dark:bg-co-yellow/5"
          : "border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-950/90",
      )}
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {dirty ? (
          <>
            <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-co-red text-xs font-bold text-white">
              {pendingChanges}
            </span>
            cambio(s) pendiente(s) · el VAR aún no confirma la jugada.
          </>
        ) : (
          "Sin cambios pendientes. La matriz está al día."
        )}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          leftIcon={<RotateCcw className="size-4" />}
          disabled={!dirty || saving}
          onClick={onReset}
          className="flex-1 sm:flex-none"
        >
          Descartar
        </Button>
        <Button
          leftIcon={<Save className="size-4" />}
          disabled={!dirty}
          loading={saving}
          onClick={onSave}
          className="flex-1 sm:flex-none"
        >
          Guardar Cambios de la Matriz
        </Button>
      </div>
    </div>
  );
}
