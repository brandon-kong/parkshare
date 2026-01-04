"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "../ui/button";
import { Typography } from "../ui/typography";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";

export function Navbar() {
  const { data: session } = useSession();
  const { openAuth } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <Logo />

          {/* Center - Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <Link href="/host">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Typography variant="small" className="font-medium">
                  List your spot
                </Typography>
              </Button>
            </Link>

            {session ? (
              <UserMenu user={session.user} />
            ) : (
              <Button variant="primary" size="sm" onClick={() => openAuth()}>
                Sign in
              </Button>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
