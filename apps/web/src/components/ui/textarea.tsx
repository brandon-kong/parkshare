import { forwardRef, type TextareaHTMLAttributes, useId } from "react";

type TextareaVariant = "default" | "accent";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  hideLabel?: boolean;
  variant?: TextareaVariant;
}

const variantStyles: Record<TextareaVariant, string> = {
  default: "bg-background border-input",
  accent: "bg-input border-transparent",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      description,
      error,
      hideLabel = false,
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

        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={describedByIds || undefined}
          aria-required={required}
          className={`
            flex min-h-[120px] w-full rounded-2xl border px-5 py-4
            text-base transition-colors resize-none
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${hasError ? "border-destructive focus:ring-destructive" : variantStyles[variant]}
            ${className}
          `.trim()}
          {...props}
        />

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

Textarea.displayName = "Textarea";
