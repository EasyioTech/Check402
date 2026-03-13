"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";

import { useRouter, useSearchParams } from "next/navigation";
import { Github, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const signupSuccess = searchParams.get("signup") === "success";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            // Force-fetch the fresh session from the server rather than using the
            // potentially-stale client-side cache that getSession() may return.
            const res = await fetch("/api/auth/session");
            const freshSession = await res.json();
            const role = freshSession?.user?.role;
            const mode = freshSession?.user?.mode;
            const onboardingComplete = freshSession?.user?.onboardingComplete;

            if (role === "ADMIN") {
                router.push("/admin");
            } else if (!onboardingComplete) {
                router.push("/onboarding");
            } else if (mode === "DESIGNER") {
                router.push("/designer");
            } else {
                router.push("/dashboard");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {signupSuccess && (
                <div className="bg-teal-50 text-teal-700 py-3 px-4 rounded-lg text-sm border border-teal-100 flex items-center justify-center font-medium">
                    Account created! Please sign in below.
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 py-3 px-4 rounded-lg text-sm border border-red-100 flex items-center justify-center font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                        Password
                    </label>
                    <Link href="#" className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                        Forgot password?
                    </Link>
                </div>
                <input
                    id="password"
                    type="password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium font-mono"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-500/20 transition-all flex justify-center items-center mt-6 h-12"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "Sign In"
                )}
            </button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
            {/* Top bar — always visible, not fixed/overlapping */}
            <div className="flex items-center px-6 py-5">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="check402" className="h-7 w-auto group-hover:opacity-80 transition-opacity" />
                    <span className="text-xl font-extrabold tracking-tight">
                        <span className="text-teal-500">Check</span> <span className="text-slate-900">402</span>
                    </span>
                </Link>
            </div>

            {/* Card — centred in remaining space */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                >
                    <div className="p-6 sm:p-8 pb-5 sm:pb-6 text-center">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 text-teal-500">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1.5">Welcome back</h1>
                        <p className="text-slate-500 text-sm font-medium">Please enter your details to sign in.</p>
                    </div>

                    <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                        <button
                            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm mb-5"
                        >
                            <Github className="w-5 h-5" />
                            Continue with GitHub
                        </button>

                        <div className="relative flex items-center py-2 mb-5">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="flex-shrink-0 px-4 text-xs font-bold text-slate-300 uppercase tracking-widest">or</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                        </div>

                        <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" /></div>}>
                            <LoginForm />
                        </Suspense>

                        <div className="mt-6 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-teal-600 hover:text-teal-700 font-bold transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
