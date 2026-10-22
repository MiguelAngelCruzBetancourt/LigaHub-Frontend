import type { Metadata } from "next";
import { TwoFactorForm } from "@/components/features/auth/TwoFactorForm";

export const metadata: Metadata = { title: "Verificación 2FA · LigaHub" };

export default function Page() {
  return <TwoFactorForm />;
}
