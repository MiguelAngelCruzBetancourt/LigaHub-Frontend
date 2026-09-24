import { cn } from "@/utils/cn";

/** Franja con las proporciones de la bandera de Colombia (2:1:1). */
export function TricolorBar({ className, vertical }: { className?: string; vertical?: boolean }) {
  return (
    <div className={cn("flex overflow-hidden", vertical ? "h-full w-1 flex-col" : "h-1 w-full", className)} aria-hidden>
      <span className="flex-[2] bg-co-yellow" />
      <span className="flex-1 bg-co-blue" />
      <span className="flex-1 bg-co-red" />
    </div>
  );
}
