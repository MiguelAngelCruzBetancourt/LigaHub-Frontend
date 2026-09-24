export interface PasswordCheck {
  id: string;
  label: string;
  passed: boolean;
}

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { id: "len", label: "Mínimo 8 caracteres", passed: password.length >= 8 },
    { id: "upper", label: "Una letra mayúscula", passed: /[A-Z]/.test(password) },
    { id: "lower", label: "Una letra minúscula", passed: /[a-z]/.test(password) },
    { id: "number", label: "Un número", passed: /\d/.test(password) },
    { id: "symbol", label: "Un símbolo (!@#$…)", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

const LABELS = ["Sin contraseña", "Débil · tarjeta roja", "Regular · tarjeta amarilla", "Buena", "Fuerte · ¡golazo!"];

export function getPasswordStrength(password: string): { score: StrengthScore; label: string } {
  if (!password) return { score: 0, label: LABELS[0] };
  const passed = getPasswordChecks(password).filter((c) => c.passed).length;
  const score = Math.max(1, Math.min(4, passed - 1)) as StrengthScore;
  return { score, label: LABELS[score] };
}
