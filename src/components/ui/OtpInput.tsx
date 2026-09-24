"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/utils/cn";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
}

/** Código de N dígitos con auto-avance, retroceso y pegado. */
export function OtpInput({ value, onChange, length = 6, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setDigit = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, length));
  };

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    if (!d) return;
    setDigit(i, d);
    focus(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setDigit(i, "");
      else if (i > 0) {
        setDigit(i - 1, "");
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focus(pasted.length);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d}
          aria-label={`Dígito ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-11 rounded-xl border-2 bg-white text-center text-xl font-bold text-zinc-900 transition-colors focus:outline-none sm:size-13 dark:bg-zinc-950 dark:text-zinc-50",
            i === 2 && "mr-2 sm:mr-3",
            error
              ? "border-co-red"
              : d
                ? "border-co-blue dark:border-co-yellow"
                : "border-zinc-200 focus:border-co-blue dark:border-zinc-800 dark:focus:border-co-yellow",
          )}
        />
      ))}
    </div>
  );
}
