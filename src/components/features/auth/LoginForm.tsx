"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/http";
import { AuthDivider, AuthHeader, OAuthButtons } from "./OAuthButtons";

/**
 * Inicio de sesión.
 * Autentica contra POST /api/auth/login de ms-security.
 * 60%: fondo blanco/negro · 30%: inputs, bordes y botones OAuth en grises · 10%: CTA azul, enlaces y acentos tricolor.
 */
export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Ingresa un correo válido.";
    if (password.length < 6) errs.password = "La contraseña debe tener al menos 6 caracteres.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await login(email, password, remember);
      // 2FA desactivado por ahora (el backend no tiene endpoint 2FA):
      // router.push("/verificar-2fa");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader
        title="¡De vuelta al estadio!"
        subtitle="Inicia sesión para gestionar usuarios, roles y permisos de tu club."
      />

      <OAuthButtons
        onSelect={(provider) =>
          setErrors({
            form: `El acceso con ${provider} no está habilitado: ms-security no tiene proveedores OAuth configurados.`,
          })
        }
      />
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
        Usuario sembrado por el backend: <code className="font-mono">admin@uc.edu.co</code> /{" "}
        <code className="font-mono">Admin123!</code>
      </p>
    </>
  );
}
