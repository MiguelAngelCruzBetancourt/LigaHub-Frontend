import { Check, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { getPasswordChecks, getPasswordStrength } from "@/utils/password";

const barColor = ["", "bg-co-red", "bg-co-yellow", "bg-co-blue", "bg-co-blue"];

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password);
  const checks = getPasswordChecks(password);

  return (
    <div className="space-y-2.5" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= score ? barColor[score] : "bg-zinc-200 dark:bg-zinc-800",
            )}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Seguridad: <span className="text-zinc-900 dark:text-zinc-100">{label}</span>
      </p>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {checks.map((c) => (
          <li
            key={c.id}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              c.passed ? "text-co-blue dark:text-co-yellow" : "text-zinc-400",
            )}
          >
            {c.passed ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
