"use client";

import type { ProviderId } from "next-auth/providers";
import { signIn } from "next-auth/react";
import { capitalize } from "@/utils/string";

interface ProviderLoginButtonProps {
  provider: ProviderId;
}

export function ProviderLoginButton({ provider }: ProviderLoginButtonProps) {
  const handleClick = () => {
    signIn(provider, {
      redirectTo: "/dashboard",
    });
  };

  return (
    <button type="button" onClick={handleClick}>
      Continue with {capitalize(provider)}
    </button>
  );
}
