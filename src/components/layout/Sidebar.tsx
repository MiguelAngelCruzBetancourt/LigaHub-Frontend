"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldEllipsis, X } from "lucide-react";
import { AUTH_LINKS, NAV_SECTIONS } from "@/lib/navigation";
import { cn } from "@/utils/cn";
import { Logo } from "./Logo";
import { TricolorBar } from "@/components/ui/TricolorBar";

interface SidebarProps {
  /** Drawer móvil abierto. */
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Navegación principal">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-co-blue/10 text-co-blue dark:bg-co-yellow/10 dark:text-co-yellow"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-co-blue dark:bg-co-yellow" />
                      )}
                      <Icon className="size-4.5 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {badge && (
                        <span className="rounded-full bg-co-red px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div>
          <p className="mb-2 flex items-center gap-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            <ShieldEllipsis className="size-3.5" /> Autenticación (demo UI)
          </p>
          <ul className="space-y-0.5">
            {AUTH_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-co-red/10 hover:text-co-red dark:text-zinc-400"
        >
          <LogOut className="size-4.5" /> Salir del estadio
        </Link>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-zinc-50 lg:block dark:border-zinc-800 dark:bg-zinc-950">
        <TricolorBar />
        <SidebarContent />
      </aside>

      {/* Móvil: drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 animate-in" onClick={onClose} aria-hidden />
          <aside className="relative h-full w-72 max-w-[85vw] border-r border-zinc-200 bg-zinc-50 shadow-xl animate-in dark:border-zinc-800 dark:bg-zinc-950">
            <TricolorBar />
            <button
              onClick={onClose}
              className="absolute right-3 top-5 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Cerrar menú"
            >
              <X className="size-5" />
            </button>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
