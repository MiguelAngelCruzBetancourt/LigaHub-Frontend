import { cn } from "@/utils/cn";

/** Escudo con la bandera de Colombia y un balón: identidad visual de la app. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={cn("size-9", className)} aria-hidden>
      <defs>
        <clipPath id="crest">
          <path d="M20 1 L38 7 V22 C38 33 30 40 20 43 C10 40 2 33 2 22 V7 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#crest)">
        <rect x="0" y="0" width="40" height="22" fill="#FCD116" />
        <rect x="0" y="22" width="40" height="11" fill="#003893" />
        <rect x="0" y="33" width="40" height="11" fill="#CE1126" />
      </g>
      <path
        d="M20 1 L38 7 V22 C38 33 30 40 20 43 C10 40 2 33 2 22 V7 Z"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1.5"
      />
      {/* Balón */}
      <circle cx="20" cy="21" r="9" fill="#fff" stroke="#18181b" strokeWidth="1.4" />
      <path d="M20 16.2 l3.4 2.5 -1.3 4 h-4.2 l-1.3 -4 z" fill="#18181b" />
      <path
        d="M20 12 v4.2 M23.4 18.7 l4.3 -1.3 M22.1 22.7 l2.6 3.6 M17.9 22.7 l-2.6 3.6 M16.6 18.7 l-4.3 -1.3"
        stroke="#18181b"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Gol<span className="text-co-blue dark:text-co-yellow">Admin</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Gestión deportiva</p>
        </div>
      )}
    </div>
  );
}
