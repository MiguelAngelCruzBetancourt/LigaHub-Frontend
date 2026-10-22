"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/lib/access";
import { canAccessPath } from "@/lib/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";

/**
 * Bloquea las pantallas cuyo módulo el rol del usuario no tiene permitido.
 * La regla vive en `navigation.ts`, la misma que decide qué muestra el menú.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const access = useAccess();

  if (!user || canAccessPath(pathname, access)) return <>{children}</>;

  return (
    <EmptyState
      icon={<ShieldOff />}
      title="No tienes acceso a este módulo"
      description="Tu rol no tiene permisos asignados para esta sección. Pide a un administrador que los habilite."
      action={<LinkButton href="/dashboard">Volver al camerino</LinkButton>}
    />
  );
}
