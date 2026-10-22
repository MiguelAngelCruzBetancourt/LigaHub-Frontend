import type { Metadata } from "next";
import { RecoverFlow } from "@/components/features/auth/RecoverFlow";

export const metadata: Metadata = { title: "Recuperar contraseña · LigaHub" };

export default function Page() {
  return <RecoverFlow />;
}
