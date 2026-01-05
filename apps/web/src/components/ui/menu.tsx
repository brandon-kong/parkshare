"use client";

import Link from "next/link";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface MenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("Menu components must be used within a Menu");
  }
  return context;
}

interface MenuProps {
  children: ReactNode;
}

export function Menu({ children }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const close = () => setIsOpen(false);

  return (
    <MenuContext.Provider value={{ isOpen, setIsOpen, close }}>
      <div className="relative" ref={menuRef}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

interface MenuTriggerProps {
  children: ReactNode;
  className?: string;
}

export function MenuTrigger({ children, className = "" }: MenuTriggerProps) {
  const { isOpen, setIsOpen } = useMenu();

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={className}
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      {children}
    </button>
  );
}

type MenuContentAlign = "left" | "right";

interface MenuContentProps {
  children: ReactNode;
  align?: MenuContentAlign;
  className?: string;
}

const alignStyles: Record<MenuContentAlign, string> = {
  left: "left-0",
  right: "right-0",
};

export function MenuContent({
  children,
  align = "right",
  className = "",
}: MenuContentProps) {
  const { isOpen } = useMenu();

  if (!isOpen) return null;

  return (
    <div
      role="menu"
      className={`absolute mt-2 w-56 bg-background rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${alignStyles[align]} ${className}`}
    >
      {children}
    </div>
  );
}

interface MenuGroupProps {
  children: ReactNode;
  className?: string;
}

export function MenuGroup({ children, className = "" }: MenuGroupProps) {
  return <div className={`py-1 ${className}`}>{children}</div>;
}

interface MenuItemProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  className?: string;
}

export function MenuItem({
  children,
  href,
  onClick,
  variant = "default",
  className = "",
}: MenuItemProps) {
  const { close } = useMenu();

  const variantStyles = {
    default: "text-foreground hover:bg-accent",
    destructive: "text-destructive hover:bg-destructive/10",
  };

  const baseStyles = `block w-full text-left px-4 py-2 text-sm transition-colors ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseStyles} role="menuitem" onClick={close}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={baseStyles}
      role="menuitem"
      onClick={() => {
        onClick?.();
        close();
      }}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="border-t border-border" />;
}

interface MenuHeaderProps {
  children: ReactNode;
  className?: string;
}

export function MenuHeader({ children, className = "" }: MenuHeaderProps) {
  return (
    <div className={`px-4 py-3 border-b border-border ${className}`}>
      {children}
    </div>
  );
}
