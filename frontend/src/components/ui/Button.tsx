import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#249fd3] text-white hover:bg-[#167fac] disabled:bg-zinc-300",
  secondary:
    "bg-white text-zinc-950 hover:bg-zinc-100 disabled:text-zinc-400",
  outline:
    "border border-[#dce4ef] bg-transparent text-[#102a4e] hover:border-[#249fd3] hover:bg-[#249fd3] hover:text-white",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
};

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "focus-ring inline-flex items-center justify-center gap-2",
        "rounded-xl px-5 py-3 text-sm font-bold",
        "transition duration-200",
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
