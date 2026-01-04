import NextAuth, { type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const API_URL = process.env.API_URL || "http://localhost:5000";

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) throw new Error("Failed to refresh");

  return res.json();
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing required Google OAuth environment variables");
}

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${API_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          image: data.user.avatar_url,
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
      }

      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      try {
        const data = await refreshAccessToken(token.refreshToken as string);
        return {
          ...token,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + 15 * 60 * 1000,
        };
      } catch {
        return {
          ...token,
          error: "RefreshTokenError",
        };
      }
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      const res = await fetch(`${API_URL}/api/v1/auth/oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: account?.provider,
          email: user.email,
          name: user.name,
          avatar_url: user.image,
        }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      user.id = data.user.id;
      user.accessToken = data.tokens.access_token;
      user.refreshToken = data.tokens.refresh_token;

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});

const { handlers, signIn, signOut } = handler;
const auth: NextAuthResult["auth"] = handler.auth;

export { handlers, signIn, signOut, auth };
