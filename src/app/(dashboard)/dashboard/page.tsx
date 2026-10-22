"use client";

import Link from "next/link";
import { ArrowRight, Grid3x3, KeyRound, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { TricolorBar } from "@/components/ui/TricolorBar";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { users, roles, permissions, rolePermissions } = useData();
  const { user: me } = useAuth();
  const active = users.filter((u) => u.status === "activo").length;

  const kpis = [
    { label: "Usuarios registrados", value: users.length, hint: `${active} en cancha`, icon: Users, href: "/usuarios" },
    { label: "Usuarios activos", value: active, hint: `${users.length - active} en la banca`, icon: UserCheck, href: "/usuarios" },
    { label: "Roles", value: roles.length, hint: "posiciones definidas", icon: ShieldCheck, href: "/roles" },
    { label: "Permisos", value: permissions.length, hint: "endpoints protegidos", icon: KeyRound, href: "/permisos" },
  ];

  // El backend no guarda fecha de creación: el id autoincremental marca el orden de ingreso.
  const recent = [...users].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Camerino"
        title={`¡Hola, ${me?.name.split(" ")[0] ?? "capitán"}! Este es tu camerino`}
        description="Resumen del estado de seguridad de la plataforma antes del pitazo inicial."
        actions={
          <LinkButton href="/matriz" leftIcon={<Grid3x3 className="size-4" />}>
            Ir a la matriz
          </LinkButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, hint, icon: Icon, href }) => (
          <Link key={label} href={href} className="group">
            <Card className="relative h-full overflow-hidden p-5 transition-colors group-hover:border-co-blue/40 dark:group-hover:border-co-yellow/40">
              <div className="flex items-start justify-between">
                <p className="text-sm text-zinc-500">{label}</p>
                <span className="flex size-9 items-center justify-center rounded-lg bg-white text-co-blue ring-1 ring-zinc-200 dark:bg-black dark:text-co-yellow dark:ring-zinc-800">
                  <Icon className="size-4.5" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-zinc-500">{hint}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="overflow-hidden lg:col-span-3">
          <CardHeader
            icon={<ShieldCheck />}
            title="Cobertura de permisos por rol"
            description="Porcentaje de endpoints habilitados para cada rol."
          />
          <ul className="space-y-4 p-5">
            {roles.map((r) => {
              const count = rolePermissions[r.id]?.length ?? 0;
              const pct = permissions.length ? Math.round((count / permissions.length) * 100) : 0;
              return (
                <li key={r.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <Link href={`/roles/${r.id}`} className="font-medium hover:text-co-blue dark:hover:text-co-yellow">
                      {r.name}
                    </Link>
                    <span className="tabular-nums text-zinc-500">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-co-blue transition-all dark:bg-co-yellow"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader
            icon={<Users />}
            title="Últimos fichajes"
            action={
              <Link
                href="/usuarios"
                className="inline-flex items-center gap-1 text-xs font-medium text-co-blue hover:underline dark:text-co-yellow"
              >
                Ver todos <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recent.map((u) => (
              <li key={u.id}>
                <Link href={`/usuarios/${u.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white dark:hover:bg-zinc-900">
                  <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-zinc-500">{u.email}</p>
                  </div>
                  {u.status === "activo" ? <Badge tone="success">Activo</Badge> : <Badge tone="red">Inactivo</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <TricolorBar />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Vistas de autenticación</p>
            <p className="text-sm text-zinc-500">
              {/* 2FA desactivado por ahora: "login, registro, recuperación y verificación en dos pasos" */}
              Pantallas de acceso: login, registro y recuperación.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/login" variant="accent">
              Ver login
            </LinkButton>
            {/* 2FA desactivado por ahora:
            <LinkButton href="/verificar-2fa" variant="secondary">
              Ver 2FA
            </LinkButton> */}
          </div>
        </div>
      </Card>
    </>
  );
}
