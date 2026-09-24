import {
  CircleUserRound,
  Grid3x3,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "General",
    items: [{ href: "/dashboard", label: "Camerino", icon: LayoutDashboard }],
  },
  {
    title: "Seguridad",
    items: [
      { href: "/usuarios", label: "Usuarios", icon: Users },
      { href: "/roles", label: "Roles", icon: ShieldCheck },
      { href: "/permisos", label: "Permisos", icon: KeyRound },
      { href: "/matriz", label: "Matriz de permisos", icon: Grid3x3, badge: "Clave" },
    ],
  },
  {
    title: "Cuenta",
    items: [{ href: "/perfil", label: "Mi perfil", icon: CircleUserRound }],
  },
];

export const AUTH_LINKS = [
  { href: "/login", label: "Login" },
  { href: "/registro", label: "Registro" },
  { href: "/recuperar", label: "Recuperar clave" },
  { href: "/verificar-2fa", label: "Verificación 2FA" },
];
