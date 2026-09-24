import { forwardRef, type ButtonHTMLAttributes, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "accent" | "danger" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-co-blue text-white hover:bg-co-blue/90 shadow-sm",
  accent: "bg-co-yellow text-zinc-950 hover:bg-co-yellow/90 shadow-sm",
  danger: "bg-co-red text-white hover:bg-co-red/90 shadow-sm",
  secondary:
    "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "size-9 justify-center",
};

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, leftIcon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonStyles(variant, size, className)}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : leftIcon}
      {children}
    </button>
  );
});

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
}

/** Enlace de navegación con apariencia de botón. */
export function LinkButton({ variant, size, leftIcon, className, children, ...props }: LinkButtonProps) {
  return (
    <Link className={buttonStyles(variant, size, className)} {...props}>
      {leftIcon}
      {children}
    </Link>
  );
}
