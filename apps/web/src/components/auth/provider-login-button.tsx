"use client";

import { GoogleIcon } from "brand-logos";
import type { ProviderId } from "next-auth/providers";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { capitalize } from "@/utils/string";
import { Button } from "../ui/button";
import { Typography } from "../ui/typography";

interface ProviderLoginButtonProps {
  provider: ProviderId;
  redirectTo?: string;
}

export function ProviderLoginButton({
  provider,
  redirectTo = "/dashboard",
}: ProviderLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await signIn(provider, {
      redirectTo,
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      loading={loading}
      className="w-full border border-foreground relative"
    >
      {!loading && (
        <span className="absolute left-4">
          <GoogleIcon />
        </span>
      )}
      <Typography variant="small" className="font-semibold">
        {loading ? "Redirecting..." : `Continue with ${capitalize(provider)}`}
      </Typography>
    </Button>
  );
}
