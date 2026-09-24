"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleCheck, TriangleAlert, X } from "lucide-react";
import { cn } from "@/utils/cn";

type ToastVariant = "success" | "error";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId++;
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-lg animate-in dark:border-zinc-800 dark:bg-zinc-900"
          >
            {t.variant === "success" ? (
              <CircleCheck className="size-5 shrink-0 text-co-blue dark:text-co-yellow" />
            ) : (
              <TriangleAlert className="size-5 shrink-0 text-co-red" />
            )}
            <span className="flex-1 text-zinc-800 dark:text-zinc-100">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className={cn("rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200")}
              aria-label="Cerrar notificación"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
