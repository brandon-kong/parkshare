"use client";

import { Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Typography } from "../ui/typography";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 border border-border rounded-full py-1.5 pl-3 pr-1.5 hover:shadow-md transition-shadow"
      >
        <Menu size={16} className="text-foreground" />
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
            <User size={16} className="text-background" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background rounded-lg shadow-lg border border-border py-1 z-50">
          <div className="px-4 py-3 border-b border-border">
            <Typography variant="small" className="font-medium">
              {user.name}
            </Typography>
            <Typography variant="muted" className="text-xs">
              {user.email}
            </Typography>
          </div>

          <div className="py-1">
            <MenuLink href="/dashboard">Dashboard</MenuLink>
            <MenuLink href="/dashboard/spots">My spots</MenuLink>
            <MenuLink href="/dashboard/bookings">My bookings</MenuLink>
          </div>

          <div className="py-1 border-t border-border">
            <MenuLink href="/host">List your spot</MenuLink>
            <MenuLink href="/settings">Settings</MenuLink>
          </div>

          <div className="py-1 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full justify-start h-auto py-2 px-4 rounded-none text-sm font-normal"
            >
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
    >
      {children}
    </Link>
  );
}
