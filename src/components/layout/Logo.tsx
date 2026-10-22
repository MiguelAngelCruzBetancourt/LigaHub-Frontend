import { cn } from "@/utils/cn";

/** Logo de la app: exclusivamente la imagen `public/logo.png`. */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="LigaHub" className={cn("size-9 object-contain", className)} />
  );
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Liga<span className="text-co-blue dark:text-co-yellow">Hub</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Gestión deportiva</p>
        </div>
      )}
    </div>
  );
}
