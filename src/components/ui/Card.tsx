import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-co-yellow/20 text-zinc-900 dark:bg-co-yellow/15 dark:text-co-yellow [&>svg]:size-4">
            {icon}
          </span>
        )}
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
