"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export function AuthGuard({ children }: { children?: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      signOut({ callbackUrl: "/auth/login" });
    }
  }, [session?.error]);

  return <>{children}</>;
}
