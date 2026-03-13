"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

function DisputeForm() {
    const searchParams = useSearchParams();
    const key = searchParams.get("key") || "";

    const [clientEmail, setClientEmail] = useState("");
    const [message, setMessage] = useState("");
    const [proofReference, setProofReference] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/dispute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, clientEmail, message, proofReference }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong.");
            } else {
                setSuccess(true);
            }
        } catch {
            setError("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    if (!key) {
        return (
            <div className="text-center py-20">
                <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Dispute Link</h2>
                <p className="text-slate-500 font-medium">This link is missing a valid project identifier. Please use the link from the lockout screen.</p>
            </div>
        );
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
            >
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-teal-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Dispute Submitted</h2>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                    Your dispute has been logged and is now under review. Our admin team will investigate within 1–2 business days.
                </p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 py-3 px-4 rounded-xl text-sm border border-red-100 font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700" htmlFor="email">Your Email Address</label>
                <input
                    id="email"
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700" htmlFor="message">Dispute Message</label>
                <textarea
                    id="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Explain why you believe this lock is unjust. Include payment history and any relevant context."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium resize-none"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700" htmlFor="proof">
                    Proof of Payment Reference <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                    id="proof"
                    type="text"
                    value={proofReference}
                    onChange={(e) => setProofReference(e.target.value)}
                    placeholder="Transaction ID, invoice number, or payment URL"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 h-12"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "Submit Dispute"
                )}
            </button>
        </form>
    );
}

export default function DisputePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-teal-100 selection:text-teal-900">
            {/* Logo */}
            <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 group">
                <img src="/logo.png" alt="check402" className="h-6 w-auto group-hover:opacity-80 transition-opacity" />
                <span className="text-lg font-extrabold tracking-tight">
                    <span className="text-teal-500">Check</span>{" "}
                    <span className="text-slate-900">402</span>
                </span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
                <div className="p-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 flex-shrink-0">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900">Dispute a Site Lock</h1>
                            <p className="text-slate-500 text-sm font-medium mt-0.5">
                                If you believe this enforcement is unjust, submit your evidence below.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}>
                        <DisputeForm />
                    </Suspense>
                </div>
                <div className="px-8 pb-8 pt-0">
                    <p className="text-xs text-slate-400 font-medium text-center">
                        All disputes are reviewed by a human admin within 1–2 business days. False disputes will be dismissed.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
