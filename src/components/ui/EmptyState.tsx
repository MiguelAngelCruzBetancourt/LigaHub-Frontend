import type { ReactNode } from "react";
import { Volleyball } from "lucide-react";

export function EmptyState({
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
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 [&>svg]:size-6">
        {icon ?? <Volleyball />}
      </span>
      <div>
        <p className="font-medium text-zinc-800 dark:text-zinc-200">{title}</p>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
