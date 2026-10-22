import type { Metadata } from "next";
import { RegisterForm } from "@/components/features/auth/RegisterForm";

export const metadata: Metadata = { title: "Registro · LigaHub" };

export default function Page() {
  return <RegisterForm />;
}
