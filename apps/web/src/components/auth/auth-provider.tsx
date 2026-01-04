"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AuthModal } from "./auth-modal";

interface OpenAuthOptions {
  onSuccess?: () => void | Promise<void>;
  redirectTo?: string; // For OAuth flows that redirect away
}

interface AuthContextType {
  openLogin: (options?: OpenAuthOptions) => void;
  openRegister: (options?: OpenAuthOptions) => void;
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
  const [redirectTo, setRedirectTo] = useState<string | undefined>();
  const onSuccessRef = useRef<(() => void | Promise<void>) | null>(null);

  const openLogin = useCallback((options?: OpenAuthOptions) => {
    onSuccessRef.current = options?.onSuccess ?? null;
    setRedirectTo(options?.redirectTo);
    setIsOpen(true);
  }, []);

  const openRegister = useCallback((options?: OpenAuthOptions) => {
    onSuccessRef.current = options?.onSuccess ?? null;
    setRedirectTo(options?.redirectTo);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setRedirectTo(undefined);
    onSuccessRef.current = null;
  }, []);

  const handleSuccess = useCallback(async () => {
    const callback = onSuccessRef.current;
    setIsOpen(false);
    setRedirectTo(undefined);
    onSuccessRef.current = null;

    if (callback) {
      await callback();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ openLogin, openRegister, close }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={close}
        onSuccess={handleSuccess}
        oauthRedirectTo={redirectTo}
      />
    </AuthContext.Provider>
  );
}
