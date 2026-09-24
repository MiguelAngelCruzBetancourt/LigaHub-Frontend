"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/utils/cn";

export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
  /** Si es true el label solo es accesible (no visible). */
  srOnlyLabel?: boolean;
  size?: "sm" | "md";
  /** Resalta la celda (por ejemplo, cambio pendiente de guardar). */
  highlight?: boolean;
}

/** Checkbox estilizado y accesible (role="checkbox"). */
export function Checkbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  label,
  srOnlyLabel,
  size = "md",
  highlight,
}: CheckboxProps) {
  const state = indeterminate ? "mixed" : checked;
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state}
      aria-label={srOnlyLabel ? label : undefined}
      disabled={disabled}
      onClick={onChange}
      className={cn("group inline-flex items-center gap-2 disabled:cursor-not-allowed", !srOnlyLabel && "text-sm")}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-md border-2 transition-all",
          size === "md" ? "size-6" : "size-5",
          on
            ? "border-co-blue bg-co-blue text-white dark:border-co-yellow dark:bg-co-yellow dark:text-zinc-950"
            : "border-zinc-300 bg-white group-hover:border-co-blue dark:border-zinc-700 dark:bg-zinc-950 dark:group-hover:border-co-yellow",
          disabled && "border-dashed border-zinc-200 bg-zinc-100 group-hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:group-hover:border-zinc-800",
          highlight && "ring-2 ring-co-red/60 ring-offset-2 ring-offset-white dark:ring-offset-black",
        )}
      >
        {indeterminate ? (
          <Minus className="size-3.5" strokeWidth={3} />
        ) : checked ? (
          <Check className="size-3.5" strokeWidth={3} />
        ) : null}
      </span>
      {!srOnlyLabel && <span>{label}</span>}
    </button>
  );
}
