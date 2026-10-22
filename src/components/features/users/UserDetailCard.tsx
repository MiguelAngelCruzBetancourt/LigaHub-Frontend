import Link from "next/link";
import { CalendarDays, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Role, User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TricolorBar } from "@/components/ui/TricolorBar";
import { formatDate } from "@/utils/format";

export function UserDetailCard({ user, roles }: { user: User; roles: Role[] }) {
  const userRoles = roles.filter((r) => user.roleIds.includes(r.id));

  const rows = [
    { icon: Mail, label: "Correo", value: user.email },
    { icon: Phone, label: "Teléfono", value: user.phone || "—" },
    { icon: CalendarDays, label: "Fecha de fichaje", value: formatDate(user.createdAt) },
  ];

  return (
    <Card className="overflow-hidden">
      <TricolorBar />
      <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-8 text-center">
        <Avatar name={user.name} src={user.avatarUrl} size="xl" />
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <div className="mt-2 flex justify-center">
            {user.status === "activo" ? <Badge tone="success">En cancha</Badge> : <Badge tone="red">Inactivo</Badge>}
          </div>
        </div>
      </div>
      <dl className="divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-6 py-3 text-sm">
            <Icon className="size-4 text-zinc-400" />
            <dt className="w-32 text-zinc-500">{label}</dt>
            <dd className="min-w-0 flex-1 truncate font-medium">{value}</dd>
          </div>
        ))}
        <div className="flex items-start gap-3 px-6 py-3 text-sm">
          <ShieldCheck className="mt-0.5 size-4 text-zinc-400" />
          <dt className="w-32 text-zinc-500">Roles</dt>
          <dd className="flex flex-1 flex-wrap gap-1">
            {userRoles.length ? (
              userRoles.map((r) => (
                <Link key={r.id} href={`/roles/${r.id}`} title="Gestionar rol">
                  <Badge tone="blue">{r.name}</Badge>
                </Link>
              ))
            ) : (
              <span className="text-zinc-500">Sin rol asignado</span>
            )}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
