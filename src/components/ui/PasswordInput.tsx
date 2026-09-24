"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input, type InputProps } from "./Field";

/** Input de contraseña con botón para mostrar/ocultar. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "rightSlot">>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        icon={<Lock />}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        {...props}
      />
    );
  },
);
