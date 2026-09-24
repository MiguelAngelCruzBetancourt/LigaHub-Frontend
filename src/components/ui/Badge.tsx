import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Tone = "neutral" | "blue" | "yellow" | "red" | "success";

const tones: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800",
  blue: "bg-co-blue/10 text-co-blue ring-co-blue/20 dark:bg-co-blue-light/15 dark:text-co-blue-light dark:ring-co-blue-light/30",
  yellow: "bg-co-yellow/20 text-zinc-900 ring-co-yellow/50 dark:bg-co-yellow/15 dark:text-co-yellow dark:ring-co-yellow/30",
  red: "bg-co-red/10 text-co-red ring-co-red/20 dark:bg-co-red/15 dark:text-red-400 dark:ring-co-red/30",
  success: "bg-co-blue/10 text-co-blue ring-co-blue/20 dark:bg-co-yellow/15 dark:text-co-yellow dark:ring-co-yellow/30",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
