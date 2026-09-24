import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Tone = "neutral" | "blue" | "red";

const tones: Record<Tone, string> = {
  neutral: "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
  blue: "hover:bg-co-blue/10 hover:text-co-blue dark:hover:bg-co-yellow/10 dark:hover:text-co-yellow",
  red: "hover:bg-co-red/10 hover:text-co-red",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: Tone;
  children: ReactNode;
}

/** Botón de acción compacto con tooltip nativo, usado en filas de tablas. */
export function IconButton({ label, tone = "neutral", className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors [&>svg]:size-4",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
