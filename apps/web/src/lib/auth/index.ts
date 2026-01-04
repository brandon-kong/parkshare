import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            const res = await fetch(`${process.env.API_URL}/api/v1/auth/oauth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: account?.provider,
                    email: user.email,
                    name: user.name,
                    avatar_url: user.image,
                }),
            })

            if (!res.ok) return false

            const data = await res.json()
            
            user.id = data.user.id
            user.accessToken = data.tokens.access_token
            user.refreshToken = data.tokens.refresh_token

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
            }
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id as string
            session.accessToken = token.accessToken as string
            return session
        },
    },
})