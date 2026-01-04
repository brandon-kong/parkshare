"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { LoginForm } from "./login-form";
import { ProviderLoginButton } from "./provider-login-button";
import { RegisterForm } from "./register-form";

type AuthMode = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
          <h2 className="font-semibold">
            {mode === "login" ? "Log in" : "Sign up"}
          </h2>
          <div className="w-9" />
        </div>

        <hr className="mb-6" />

        <h3 className="text-xl font-semibold mb-6">Welcome to ParkShare</h3>

        {mode === "login" ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <RegisterForm onSuccess={() => setMode("login")} />
        )}

        <div className="flex items-center gap-4 my-6">
          <hr className="flex-1" />
          <span className="text-sm text-gray-500">or</span>
          <hr className="flex-1" />
        </div>

        <OAuthButtons />

        <p className="text-center text-sm mt-6">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-semibold underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
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
