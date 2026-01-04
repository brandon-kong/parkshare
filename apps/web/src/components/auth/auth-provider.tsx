"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AuthModal } from "./auth-modal";

type AuthMode = "login" | "register";

interface AuthContextType {
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const openLogin = useCallback(() => {
    setMode("login");
    setIsOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setMode("register");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthContext.Provider value={{ openLogin, openRegister, close }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={close} defaultMode={mode} />
    </AuthContext.Provider>
  );
}
