import type { HttpMethod } from "@/types";
import { cn } from "@/utils/cn";

const styles: Record<HttpMethod, string> = {
  GET: "bg-co-blue/10 text-co-blue dark:bg-co-blue-light/15 dark:text-co-blue-light",
  POST: "bg-co-yellow/25 text-zinc-900 dark:bg-co-yellow/15 dark:text-co-yellow",
  PUT: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  PATCH: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  DELETE: "bg-co-red/10 text-co-red dark:bg-co-red/15 dark:text-red-400",
};

export function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={cn("inline-flex w-16 justify-center rounded-md py-0.5 font-mono text-[11px] font-bold", styles[method])}>
      {method}
    </span>
  );
}
