interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-3 w-3 border-[1.5px]",
  md: "h-4 w-4 border-2",
  lg: "h-6 w-6 border-2",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <output
      className={`
        inline-block animate-spin rounded-full
        border-current border-t-transparent
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      aria-label="Loading"
    />
  );
}
