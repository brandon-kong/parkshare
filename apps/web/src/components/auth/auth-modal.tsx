"use client";

import { Modal } from "@/components/ui/modal";
import { CloseButton } from "../ui/close-button";
import { Typography } from "../ui/typography";
import { AuthForm } from "./auth-form";
import { ProviderLoginButton } from "./provider-login-button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  oauthRedirectTo?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  oauthRedirectTo,
}: AuthModalProps) {
  const handleSuccess = async () => {
    if (onSuccess) {
      await onSuccess();
    } else {
      onClose();
    }
  };

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

          <AuthForm onSuccess={handleSuccess} />

          <div className="flex items-center gap-4 my-6">
            <hr className="flex-1 border-accent" />
            <Typography variant="small" className="text-xs">
              or
            </Typography>
            <hr className="flex-1 border-accent" />
          </div>

          <div className="space-y-3">
            <ProviderLoginButton
              provider="google"
              redirectTo={oauthRedirectTo}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
