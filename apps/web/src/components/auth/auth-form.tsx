"use client";

import { ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type AuthStep = "email" | "password" | "register" | "oauth-conflict";

interface AuthFormProps {
  onSuccess: () => void;
}

interface CheckEmailResponse {
  exists: boolean;
  provider?: string;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/check-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data: CheckEmailResponse = await res.json();

      if (data.exists) {
        if (data.provider === "credentials") {
          setStep("password");
        } else {
          setOauthProvider(data.provider ?? null);
          setStep("oauth-conflict");
        }
      } else {
        setStep("register");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid password");
    } else {
      onSuccess();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) {
          const firstError = Object.values(data.fields)[0] as string;
          setError(firstError);
        } else {
          setError(data.error || "Registration failed");
        }
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Account created but login failed. Please try logging in.");
      } else {
        onSuccess();
      }
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  function handleBack() {
    setStep("email");
    setPassword("");
    setName("");
    setError("");
    setOauthProvider(null);
  }

  function formatProvider(provider: string) {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }

  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <Input
          variant="accent"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Checking..." : "Continue"}
        </Button>
      </form>
    );
  }

  if (step === "password") {
    return (
      <form onSubmit={handleLogin} className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          startIcon={<ArrowLeft size={16} />}
          className="text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>

        <div className="text-sm text-muted-foreground">
          Logging in as{" "}
          <span className="font-medium text-foreground">{email}</span>
        </div>

        <Input
          variant="accent"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>
    );
  }

  if (step === "register") {
    return (
      <form onSubmit={handleRegister} className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          startIcon={<ArrowLeft size={16} />}
          className="text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>

        <div className="text-sm text-muted-foreground">
          Creating account for{" "}
          <span className="font-medium text-foreground">{email}</span>
        </div>

        <Input
          variant="accent"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Input
          variant="accent"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-xs text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    );
  }

  if (step === "oauth-conflict") {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          startIcon={<ArrowLeft size={16} />}
          className="text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm">
            The email <span className="font-medium">{email}</span> is already
            associated with a{" "}
            <span className="font-medium">
              {formatProvider(oauthProvider ?? "")}
            </span>{" "}
            account.
          </p>
          <p className="text-sm text-muted-foreground">
            Please sign in using {formatProvider(oauthProvider ?? "")} below.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
