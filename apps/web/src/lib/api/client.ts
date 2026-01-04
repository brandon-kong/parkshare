'use client'

import { getSession, signOut } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const session = await getSession()

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    }

    if (session?.accessToken) {
        headers["Authorization" as keyof HeadersInit] = `Bearer ${session.accessToken}`
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (res.status === 401) {
        await signOut({ callbackUrl: "/auth/login" })
        throw new Error("Session expired")
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error(error.error || "Request failed")
    }

    return res.json()
}

export const clientApi = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
    post: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
}