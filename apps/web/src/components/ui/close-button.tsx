import { X } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ size = 20, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Close"
        className={`
          p-2 rounded-full
          text-foreground
          hover:bg-accent
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          transition-colors
          ${className}
        `.trim()}
        {...props}
      >
        <X size={size} aria-hidden="true" />
      </button>
    );
  },
);

CloseButton.displayName = "CloseButton";
