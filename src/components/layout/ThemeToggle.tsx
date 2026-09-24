"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/utils/cn";

/** Interruptor Light/Dark estilizado como un toggle con acento amarillo/azul. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-8 w-15 shrink-0 items-center rounded-full border border-zinc-200 bg-zinc-100 p-0.5 transition-colors dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-6.5 items-center justify-center rounded-full shadow transition-transform duration-200",
          isDark ? "translate-x-7 bg-co-yellow text-zinc-950" : "translate-x-0 bg-co-blue text-white",
        )}
      >
        {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      </span>
    </button>
  );
}
