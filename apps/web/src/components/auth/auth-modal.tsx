"use client";

import { Modal } from "@/components/ui/modal";
import { CloseButton } from "../ui/close-button";
import { Typography } from "../ui/typography";
import { AuthForm } from "./auth-form";
import { ProviderLoginButton } from "./provider-login-button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="auth-modal-title">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <CloseButton onClick={onClose} />
          <Typography variant="h4" id="auth-modal-title">
            Log in or sign up
          </Typography>
          <div className="w-10" aria-hidden="true" />
        </div>

        <hr className="border-accent" />

        <div className="mt-2 p-6 space-y-4">
          <Typography variant="h3">Welcome to ParkShare</Typography>

          <AuthForm onSuccess={onClose} />

          <div className="flex items-center gap-4 my-6">
            <hr className="flex-1 border-accent" />
            <span className="text-xs text-foreground">or</span>
            <hr className="flex-1 border-accent" />
          </div>

          <OAuthButtons />
        </div>
      </div>
    </Modal>
  );
}

function OAuthButtons() {
  return (
    <div className="space-y-3">
      <ProviderLoginButton provider="google" />
    </div>
  );
}
