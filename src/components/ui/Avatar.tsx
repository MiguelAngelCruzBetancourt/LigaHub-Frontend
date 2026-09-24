/* eslint-disable @next/next/no-img-element */
import { cn } from "@/utils/cn";
import { initials } from "@/utils/format";

const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-16 text-lg", xl: "size-24 text-2xl" };

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 font-semibold text-zinc-700 ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-200 dark:ring-black",
        sizes[size],
        className,
      )}
    >
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : initials(name)}
    </span>
  );
}
