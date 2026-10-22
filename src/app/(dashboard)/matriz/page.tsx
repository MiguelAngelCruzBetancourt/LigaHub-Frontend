import { Suspense } from "react";
import { PermissionMatrixView } from "@/components/features/matrix/PermissionMatrixView";

/** Matriz de asignación de permisos a roles. */
export default function MatrizPage() {
  // useSearchParams (?rol=) requiere un límite de Suspense en rutas pre-renderizadas.
  return (
    <Suspense>
      <PermissionMatrixView />
    </Suspense>
  );
}
