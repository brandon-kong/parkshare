"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAuth } from "@/components/auth/auth-provider";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Typography } from "../ui/typography";
import { ExpandableSearch } from "./expandable-search";
import { Logo } from "./logo";
import { MobileSearch } from "./mobile-search";
import { UserMenu } from "./user-menu";

export function Navbar() {
  const { data: session, status } = useSession();
  const { openAuth } = useAuth();
  const { isScrolled } = useScroll({ threshold: 50 });

  return (
    <header
      className={`sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ease-out ${isScrolled ? "shadow-sm" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ease-out ${isScrolled ? "h-14" : "h-20"}`}
        >
          <div
            className={`transition-transform duration-300 ease-out ${isScrolled ? "scale-90" : "scale-100"}`}
          >
            <Logo />
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <ExpandableSearch isScrolled={isScrolled} />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/host">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Typography variant="small" className="font-medium">
                  List your spot
                </Typography>
              </Button>
            </Link>

            {status === "loading" ? (
              <div className="w-9 h-9 flex items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : session ? (
              <UserMenu user={session.user} />
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuth()}
                className="transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <MobileSearch />
        </div>
      </div>
    </header>
  );
}
