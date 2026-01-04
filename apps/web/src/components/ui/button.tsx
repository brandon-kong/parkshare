import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { Spinner } from "./spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
  ghost: "bg-transparent hover:bg-accent",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-btn px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-6 text-lg",
  icon: "h-10 w-10 p-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      loading = false,
      disabled,
      startIcon,
      endIcon,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-control font-semibold
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `.trim()}
        {...props}
      >
        {loading ? (
          <Spinner size="md" />
        ) : startIcon ? (
          <span aria-hidden="true">{startIcon}</span>
        ) : null}

        {children && <span>{children}</span>}

        {endIcon && !loading && <span aria-hidden="true">{endIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
