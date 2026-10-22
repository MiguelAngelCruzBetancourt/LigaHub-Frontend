"use client";

import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { usersApi } from "@/lib/api/users";
import { toBackendId } from "@/lib/api/adapters";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfileForm } from "@/components/features/users/ProfileForm";

/** Perfil del usuario autenticado (teléfono, fecha y fotografía). */
export default function PerfilPage() {
  const { users, updateUser, loading } = useData();
  const { notify } = useToast();
  const { user: sessionUser } = useAuth();

  const me = users.find((u) => u.id === sessionUser?.id);
  const [birthDate, setBirthDate] = useState<string>();

  // La fecha de nacimiento vive en Profile y no viene en el listado de usuarios.
  useEffect(() => {
    if (!sessionUser) return;
    let active = true;

    usersApi
      .findByIdWithProfile(toBackendId(sessionUser.id))
      .then((detail) => {
        if (active) setBirthDate(detail.profile?.birthDate ?? "");
      })
      .catch(() => {
        if (active) setBirthDate("");
      });

    return () => {
      active = false;
    };
  }, [sessionUser]);

  return (
    <>
      <PageHeader
        title="Mi perfil"
        description="Actualiza tu número de contacto y tu foto para el álbum del equipo."
      />
      {me ? (
        <ProfileForm
          user={me}
          birthDate={birthDate}
          onSave={async (patch) => {
            await updateUser(me.id, patch);
            notify("Perfil actualizado. ¡Listo para el partido!");
          }}
        />
      ) : loading ? (
        <EmptyState title="Cargando tu perfil…" description="Consultando los datos en el servidor." />
      ) : (
        <EmptyState
          title="Perfil no disponible"
          description="No pudimos leer tu usuario. Verifica que tu rol tenga permiso de consulta."
        />
      )}
    </>
  );
}
