// app/register/page.tsx
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function RegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrors({})

        // Call Go backend to register
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
            if (data.fields) {
                setErrors(data.fields)
            } else {
                setErrors({ form: data.error })
            }
            return
        }

        // Auto login after registration
        await signIn("credentials", {
            email,
            password,
            callbackUrl: "/dashboard",
        })
    }

    return (
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p>{errors.name}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p>{errors.email}</p>}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p>{errors.password}</p>}

                {errors.form && <p>{errors.form}</p>}

                <button type="submit">Create account</button>
            </form>

            <Link href={'/auth/login'}>
                Login
            </Link>
        </div>
    )
}