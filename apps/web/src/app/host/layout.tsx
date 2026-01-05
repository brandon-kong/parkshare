"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Close"
        >
          <X size={20} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          Save & exit
        </Button>
      </header>

      {/* Content */}
      {children}
    </div>
  );
}
