"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, description, icon, children, footer, size = "md" }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl animate-pop sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950",
          sizes[size],
        )}
      >
        <div className="flex h-1 w-full shrink-0">
          <span className="flex-[2] bg-co-yellow" />
          <span className="flex-1 bg-co-blue" />
          <span className="flex-1 bg-co-red" />
        </div>
        <div className="flex items-start gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          {icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-co-blue dark:bg-zinc-900 dark:text-co-yellow [&>svg]:size-5">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3 sm:flex-row sm:justify-end dark:border-zinc-800 dark:bg-zinc-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
