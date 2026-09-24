"use client";

import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { CURRENT_USER_ID } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfileForm } from "@/components/features/users/ProfileForm";

/** HU-SE-02 · Perfil del usuario actual (teléfono y fotografía). */
export default function PerfilPage() {
  const { users, updateUser } = useData();
  const { notify } = useToast();
  const me = users.find((u) => u.id === CURRENT_USER_ID);

  return (
    <>
      <PageHeader
        eyebrow="HU-SE-02"
        title="Mi perfil"
        description="Actualiza tu número de contacto y tu foto para el álbum del equipo."
      />
      {me ? (
        <ProfileForm
          user={me}
          onSave={(patch) => {
            updateUser(me.id, patch);
            notify("Perfil actualizado. ¡Listo para el partido!");
          }}
        />
      ) : (
        <EmptyState title="Perfil no disponible" description="El usuario de demostración fue eliminado." />
      )}
    </>
  );
}
