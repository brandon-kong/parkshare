import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from "react";

type InputVariant = "default" | "accent";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  hideLabel?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: InputVariant;
}

const variantStyles: Record<InputVariant, string> = {
  default: "bg-background border-input",
  accent: "bg-input border-transparent",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      description,
      error,
      hideLabel = false,
      startIcon,
      endIcon,
      variant = "default",
      className = "",
      id: providedId,
      disabled,
      required,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const hasError = Boolean(error);

    const describedByIds = [
      ariaDescribedBy,
      description ? descriptionId : null,
      hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className={`text-sm font-medium leading-none ${
              hideLabel ? "sr-only" : ""
            } ${disabled ? "text-muted-foreground" : ""}`}
          >
            {label}
            {required && (
              <span className="text-destructive ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={describedByIds || undefined}
            aria-required={required}
            className={`
              flex h-btn w-full rounded-lg border px-3 py-2
              text-base transition-colors
              file:border-0 file:bg-transparent file:text-sm file:font-medium
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              ${hasError ? "border-destructive focus:ring-destructive" : variantStyles[variant]}
              ${startIcon ? "pl-10" : ""}
              ${endIcon ? "pr-10" : ""}
              ${className}
            `.trim()}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>

        {description && !hasError && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {hasError && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
