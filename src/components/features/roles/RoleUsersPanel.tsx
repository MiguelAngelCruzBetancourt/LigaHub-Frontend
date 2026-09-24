import { UserMinus, UserPlus, Users } from "lucide-react";
import type { User } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface RoleUsersPanelProps {
  users: User[];
  onAdd: () => void;
  onRemove: (user: User) => void;
  canAdd: boolean;
}

/** Sub-panel de HU-SE-04: usuarios que tienen el rol. */
export function RoleUsersPanel({ users, onAdd, onRemove, canAdd }: RoleUsersPanelProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<Users />}
        title="Usuarios con este rol"
        description={`${users.length} integrantes convocados`}
        action={
          <Button size="sm" leftIcon={<UserPlus className="size-3.5" />} onClick={onAdd} disabled={!canAdd}>
            Agregar usuarios
          </Button>
        }
      />
      {users.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="Nadie en esta posición todavía"
          description="Agrega usuarios disponibles para asignarles este rol."
        />
      ) : (
        <ul className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-black">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={u.name} src={u.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-zinc-500">{u.email}</p>
              </div>
              {u.status === "inactivo" && (
                <Badge tone="red" className="hidden sm:inline-flex">
                  Inactivo
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-co-red hover:bg-co-red/10 hover:text-co-red dark:text-red-400 dark:hover:bg-co-red/15"
                leftIcon={<UserMinus className="size-3.5" />}
                onClick={() => onRemove(u)}
              >
                <span className="hidden sm:inline">Remover</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
