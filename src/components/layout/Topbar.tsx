"use client";

import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { useData } from "@/context/DataContext";
import { CURRENT_USER_ID } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "./ThemeToggle";
import { LogoMark } from "./Logo";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { users, roles } = useData();
  const me = users.find((u) => u.id === CURRENT_USER_ID);
  const myRole = roles.find((r) => me?.roleIds.includes(r.id));

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-black/85">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-900"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>
      <LogoMark className="size-7 lg:hidden" />

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Buscar jugadores, roles, permisos…"
          className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-co-blue focus:outline-none focus:ring-2 focus:ring-co-blue/20 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-co-yellow dark:focus:ring-co-yellow/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button
          className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          aria-label="Notificaciones"
        >
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-co-red ring-2 ring-white dark:ring-black" />
        </button>
        {me && (
          <Link
            href="/perfil"
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Avatar name={me.name} src={me.avatarUrl} size="sm" />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium">{me.name}</span>
              <span className="block text-xs text-zinc-500">{myRole?.name ?? "Sin rol"}</span>
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
