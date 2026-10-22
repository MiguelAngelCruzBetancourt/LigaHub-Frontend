"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Smartphone, TriangleAlert } from "lucide-react";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";
import { AuthHeader } from "./OAuthButtons";

const DEMO_CODE = "123456";
const RESEND_SECONDS = 30;

/** Segundo factor de autenticación (código de 6 dígitos, simulado). */
export function TwoFactorForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = (value: string) => {
    setLoading(true);
    setError(undefined);
    setTimeout(() => {
      setLoading(false);
      if (value === DEMO_CODE) {
        setVerified(true);
        setTimeout(() => router.push("/dashboard"), 900);
      } else {
        setError("Código incorrecto. El árbitro no validó la jugada, inténtalo de nuevo.");
        setCode("");
      }
    }, 800);
  };

  const handleChange = (value: string) => {
    setCode(value);
    setError(undefined);
    if (value.length === 6) verify(value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.length === 6) verify(code);
  };

  return (
    <>
      <AuthHeader
        icon={verified ? <ShieldCheck /> : <Smartphone />}
        title={verified ? "¡Gol! Identidad verificada" : "Verificación en dos pasos"}
        subtitle={
          verified
            ? "Redirigiendo al camerino…"
            : "Ingresa el código de 6 dígitos de tu app autenticadora o el que enviamos por SMS al +57 ••• ••• 4567."
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <OtpInput value={code} onChange={handleChange} error={Boolean(error)} />

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-co-red/30 bg-co-red/10 px-3 py-2.5 text-sm text-co-red">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={code.length < 6 || verified}>
          {verified ? "Verificado" : "Verificar código"}
        </Button>

        <div className="text-center text-sm text-zinc-500">
          ¿No recibiste el código?{" "}
          {seconds > 0 ? (
            <span className="tabular-nums">Reenviar en 0:{String(seconds).padStart(2, "0")}</span>
          ) : (
            <button
              type="button"
              onClick={() => setSeconds(RESEND_SECONDS)}
              className="font-semibold text-co-blue hover:underline dark:text-co-yellow"
            >
              Reenviar código
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950">
        Demo: el código válido es <code className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{DEMO_CODE}</code>
      </div>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="size-4" /> Usar otra cuenta
      </Link>
    </>
  );
}
