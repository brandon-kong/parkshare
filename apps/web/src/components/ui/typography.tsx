import type { ElementType, HTMLAttributes, ReactNode } from "react";

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "lead"
  | "body"
  | "small"
  | "muted"
  | "label";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: ElementType;
  children: ReactNode;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: "text-4xl font-bold tracking-tight sm:text-6xl",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold tracking-tight",
  h4: "text-xl font-semibold tracking-tight",
  lead: "text-xl text-muted-foreground",
  body: "text-base leading-7",
  small: "text-sm leading-6",
  muted: "text-sm text-muted-foreground",
  label: "text-sm font-medium leading-none",
};

const defaultElements: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  lead: "p",
  body: "p",
  small: "p",
  muted: "p",
  label: "span",
};

export function Typography({
  variant = "body",
  as,
  className = "",
  children,
  ...props
}: TypographyProps) {
  const Component = as ?? defaultElements[variant];
  const styles = variantStyles[variant];

  return (
    <Component className={`${styles} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function H1({
  className = "",
  children,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h1" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function H2({
  className = "",
  children,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h2" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function H3({
  className = "",
  children,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h3" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function H4({
  className = "",
  children,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="h4" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function Lead({
  className = "",
  children,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="lead" className={className} {...props}>
      {children}
    </Typography>
  );
}

export function Muted({
  className = "",
  children,
  ...props
}: Omit<TypographyProps, "variant">) {
  return (
    <Typography variant="muted" className={className} {...props}>
      {children}
    </Typography>
  );
}
