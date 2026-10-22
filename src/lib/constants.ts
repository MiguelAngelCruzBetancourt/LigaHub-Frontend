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

/** Sección de la matriz para los módulos sin grupo asignado. */
export const DEFAULT_MODULE_GROUP = "General";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const DEFAULT_METHOD: Record<Operation, HttpMethod> = {
  ver: "GET",
  listar: "GET",
  crear: "POST",
  actualizar: "PUT",
  eliminar: "DELETE",
};

/**
 * Mismo patrón que CreateUserDTO/UpdateUserDTO en ms-security: entre 8 y 72
 * caracteres sin espacios, con minúscula, mayúscula, dígito y uno de @$!%*?&.
 * Validarlo en el cliente evita un 400 del backend.
 */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])\S{8,72}$/;

export const PASSWORD_HINT = "8-72 caracteres con mayúscula, minúscula, número y uno de @$!%*?&";
