"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Typography } from "@/components/ui/typography";

export default function Home() {
  const { openAuth } = useAuth();

  return (
    <div className="">
      <Typography variant={"h1"} className={"p-20 text-center"}>
        Life doesn't need to be hard
      </Typography>
      <button type="button" onClick={() => openAuth()}>
        Login
      </button>
    </div>
  );
}
