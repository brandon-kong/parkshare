"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        setIsLoading(false)

        if (result?.error) {
            setError("Invalid email or password")
        } else {
            router.push("/dashboard")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-6 text-center">
                        <h1 className="text-lg font-semibold text-gray-900">Log in</h1>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Welcome to ParkShare
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div>
                                <div className="relative">
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        placeholder="Email"
                                        required
                                    />
                                    <label
                                        htmlFor="email"
                                        className="absolute left-4 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs"
                                    >
                                        Email
                                    </label>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        placeholder="Password"
                                        required
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-4 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs"
                                    >
                                        Password
                                    </label>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white font-semibold rounded-lg hover:from-[#D31C47] hover:to-[#C2045E] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Logging in..." : "Continue"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => signIn("google", { redirectTo: "/dashboard" })}
                                className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-900"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                href="/auth/register"
                                className="text-[#E61E4D] font-semibold hover:underline"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-500">
                    By continuing, you agree to our{" "}
                    <a href="#" className="underline hover:text-gray-700">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>.
                </p>
            </div>
        </div>
    )
}
