import type { HttpMethod, Operation } from "@/types";

export const OPERATIONS: { id: Operation; label: string }[] = [
  { id: "ver", label: "Ver" },
  { id: "listar", label: "Listar" },
  { id: "crear", label: "Crear" },
  { id: "actualizar", label: "Actualizar" },
  { id: "eliminar", label: "Eliminar" },
];

export const OPERATION_LABEL: Record<Operation, string> = Object.fromEntries(
  OPERATIONS.map((o) => [o.id, o.label]),
) as Record<Operation, string>;

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const DEFAULT_METHOD: Record<Operation, HttpMethod> = {
  ver: "GET",
  listar: "GET",
  crear: "POST",
  actualizar: "PUT",
  eliminar: "DELETE",
};
