import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión · LigaHub" };

export default function Page() {
  return <LoginForm />;
}
