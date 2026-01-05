"use client";

import { useId } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          ${checked ? "bg-primary" : "bg-input"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
      <div className="flex-1">
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}
