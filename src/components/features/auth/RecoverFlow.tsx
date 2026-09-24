"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CircleCheck, KeyRound, Mail, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Button, LinkButton } from "@/components/ui/Button";
import { getPasswordStrength } from "@/utils/password";
import { cn } from "@/utils/cn";
import { AuthHeader } from "./OAuthButtons";

type Step = "email" | "sent" | "reset" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "email", label: "Correo" },
  { id: "sent", label: "Enlace" },
  { id: "reset", label: "Nueva clave" },
];

function Stepper({ current }: { current: Step }) {
  const idx = current === "done" ? STEPS.length : STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="mb-8 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex flex-1 flex-col gap-1.5">
          <span
            className={cn(
              "h-1.5 rounded-full transition-colors",
              i < idx ? "bg-co-blue dark:bg-co-yellow" : i === idx ? "bg-co-red" : "bg-zinc-200 dark:bg-zinc-800",
            )}
          />
          <span className={cn("text-xs", i <= idx ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400")}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

/** HU-SE-09 · Recuperación de contraseña en pasos (simulado). */
export function RecoverFlow() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const simulate = (next: Step) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(next);
    }, 800);
  };

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Ingresa un correo válido.");
    setError(undefined);
    simulate("sent");
  };

  const submitReset = (e: FormEvent) => {
    e.preventDefault();
    if (getPasswordStrength(password).score < 3) return setError("La nueva contraseña es muy débil.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");
    setError(undefined);
    simulate("done");
  };

  return (
    <>
      <Stepper current={step} />

      {step === "email" && (
        <>
          <AuthHeader
            icon={<KeyRound />}
            title="¿Perdiste la contraseña?"
            subtitle="Calma: hasta los mejores fallan un penal. Te enviaremos un enlace para restablecerla."
          />
          <form onSubmit={submitEmail} className="space-y-4" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="capitan@futbolapp.co"
              icon={<Mail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              autoFocus
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Enviar enlace de recuperación
            </Button>
          </form>
        </>
      )}

      {step === "sent" && (
        <>
          <AuthHeader
            icon={<MailCheck />}
            title="Revisa tu bandeja"
            subtitle={`Si ${email} está registrado, recibirás un enlace válido por 15 minutos.`}
          />
          <div className="space-y-3">
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
              <p className="font-medium text-zinc-800 dark:text-zinc-200">Modo demostración</p>
              <p className="mt-1">No se envía ningún correo. Simula que abriste el enlace:</p>
            </div>
            <Button size="lg" className="w-full" onClick={() => setStep("reset")}>
              Simular clic en el enlace del correo
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => simulate("sent")} loading={loading}>
              Reenviar correo
            </Button>
          </div>
        </>
      )}

      {step === "reset" && (
        <>
          <AuthHeader
            icon={<KeyRound />}
            title="Ingresa tu nueva contraseña"
            subtitle="Elige una contraseña fuerte que no hayas usado antes."
          />
          <form onSubmit={submitReset} className="space-y-4" noValidate>
            <PasswordInput
              label="Nueva contraseña"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <PasswordStrength password={password} />
            <PasswordInput
              label="Confirmar nueva contraseña"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={error}
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Restablecer contraseña
            </Button>
          </form>
        </>
      )}

      {step === "done" && (
        <div className="text-center">
          <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-co-yellow text-zinc-950">
            <CircleCheck className="size-8" />
          </span>
          <h1 className="text-2xl font-bold">¡Contraseña actualizada!</h1>
          <p className="mt-2 text-sm text-zinc-500">Ya puedes volver a la cancha con tu nueva contraseña.</p>
          <LinkButton href="/login" size="lg" className="mt-8 w-full">
            Iniciar sesión
          </LinkButton>
        </div>
      )}

      {step !== "done" && (
        <Link
          href="/login"
          className="mt-8 flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="size-4" /> Volver al inicio de sesión
        </Link>
      )}
    </>
  );
}
