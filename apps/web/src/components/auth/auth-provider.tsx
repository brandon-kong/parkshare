"use client";

import { useSession } from "next-auth/react";
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
  openAuth: (options?: OpenAuthOptions) => void;
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
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | undefined>();
  const onSuccessRef = useRef<(() => void | Promise<void>) | null>(null);

  const openAuth = useCallback(
    async (options?: OpenAuthOptions) => {
      // If already authenticated, just run the callback
      if (status === "authenticated") {
        if (options?.onSuccess) {
          await options.onSuccess();
        }
        return;
      }

      onSuccessRef.current = options?.onSuccess ?? null;
      setRedirectTo(options?.redirectTo);
      setIsOpen(true);
    },
    [status],
  );

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

  const shouldShowModal = isOpen && status !== "authenticated";

  return (
    <AuthContext.Provider value={{ openAuth, close }}>
      {children}
      <AuthModal
        isOpen={shouldShowModal}
        onClose={close}
        onSuccess={handleSuccess}
        oauthRedirectTo={redirectTo}
      />
    </AuthContext.Provider>
  );
}
