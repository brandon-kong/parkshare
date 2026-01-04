"use client";

import { GoogleIcon } from "brand-logos";
import type { ProviderId } from "next-auth/providers";
import { signIn } from "next-auth/react";
import { twMerge } from "tailwind-merge";
import { capitalize } from "@/utils/string";
import { Typography } from "../ui/typography";

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
    <button
      type="button"
      onClick={handleClick}
      className={twMerge(
        "border border-black rounded-lg",
        "w-full p-4 flex items-center",
        "hover:bg-neutral-50",
      )}
    >
      <GoogleIcon />
      <Typography
        variant={"small"}
        className={"font-semibold absolute left-1/2 -translate-x-1/2"}
      >
        Continue with {capitalize(provider)}
      </Typography>
    </button>
  );
}
