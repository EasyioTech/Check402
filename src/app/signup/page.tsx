"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Github, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push("/login?signup=success");
            } else {
                const data = await res.text();
                setError(data || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-teal-100 selection:text-teal-900 pb-10">
            <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 group z-50">
                <img src="/logo.png" alt="check402" className="h-7 w-auto group-hover:opacity-80 transition-opacity" />
                <span className="text-xl font-extrabold tracking-tight">
                    <span className="text-teal-500 font-sans">Check</span> <span className="text-slate-900">402</span>
                </span>
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
                <div className="p-8 pb-6 text-center">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-teal-500">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Create an account</h1>
                    <p className="text-slate-500 text-sm font-medium">Join us and secure your payments today.</p>
                </div>

                <div className="px-8 pb-8">
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm mb-6 disabled:opacity-50"
                    >
                        <Github className="w-5 h-5" />
                        Sign up with GitHub
                    </button>

                    <div className="relative flex items-center py-2 mb-6">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink-0 px-4 text-xs font-bold text-slate-300 uppercase tracking-widest">or</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 py-3 px-4 rounded-lg text-sm border border-red-100 flex items-center justify-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

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
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium font-mono"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
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
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Already have an account?{" "}
                            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-bold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
