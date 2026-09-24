"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { AuthDivider, AuthHeader, OAuthButtons } from "./OAuthButtons";

/**
 * HU-SE-07 · Inicio de sesión (solo UI).
 * 60%: fondo blanco/negro · 30%: inputs, bordes y botones OAuth en grises · 10%: CTA azul, enlaces y acentos tricolor.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Ingresa un correo válido.";
    if (password.length < 6) errs.password = "La contraseña debe tener al menos 6 caracteres.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    // Simulación: cualquier credencial válida pasa al segundo factor.
    setTimeout(() => {
      setLoading(false);
      if (password === "offside") {
        setErrors({ form: "Credenciales incorrectas: estás en fuera de lugar." });
        return;
      }
      router.push("/verificar-2fa");
    }, 900);
  };

  return (
    <>
      <AuthHeader
        title="¡De vuelta al estadio!"
        subtitle="Inicia sesión para gestionar usuarios, roles y permisos de tu club."
      />

      <OAuthButtons onSelect={() => router.push("/dashboard")} />
      <AuthDivider>o con tu correo</AuthDivider>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-co-red/30 bg-co-red/10 px-3 py-2.5 text-sm text-co-red">
            <TriangleAlert className="size-4 shrink-0" />
            {errors.form}
          </div>
        )}
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="capitan@futbolapp.co"
          icon={<Mail />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordInput
          label="Contraseña"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          labelAction={
            <Link href="/recuperar" className="text-xs font-medium text-co-blue hover:underline dark:text-co-yellow">
              ¿Olvidaste tu contraseña?
            </Link>
          }
        />
        <Checkbox size="sm" label="Mantener la sesión iniciada" checked={remember} onChange={() => setRemember((v) => !v)} />

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {!loading && <>Saltar a la cancha <ArrowRight className="size-4" /></>}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-co-red hover:underline">
          Regístrate gratis
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-zinc-400">
        Demo: cualquier correo válido funciona. Usa la clave <code className="font-mono">offside</code> para ver el error.
      </p>
    </>
  );
}
