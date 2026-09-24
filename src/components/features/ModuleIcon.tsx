import {
  CalendarDays,
  LandPlot,
  RectangleVertical,
  Shirt,
  ShieldCheck,
  Trophy,
  Users,
  Whistle,
  type LucideIcon,
} from "lucide-react";
import type { ModuleIcon as ModuleIconName } from "@/types";
import { cn } from "@/utils/cn";

const ICONS: Record<ModuleIconName, LucideIcon> = {
  users: Users,
  shield: ShieldCheck,
  shirt: Shirt,
  calendar: CalendarDays,
  map: LandPlot,
  trophy: Trophy,
  whistle: Whistle,
  card: RectangleVertical,
};

export function ModuleIcon({ name, className }: { name: ModuleIconName; className?: string }) {
  const Icon = ICONS[name];
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
        name === "card" && "text-co-red dark:text-co-red",
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}
