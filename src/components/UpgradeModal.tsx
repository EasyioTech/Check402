"use client";

import { useState } from "react";
import { X, Rocket, CheckCircle2, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/checkout", { method: "POST" });

            if (!res.ok) {
                let errorMessage = "Failed to initiate checkout";
                try {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const data = await res.json();
                        errorMessage = data.error || errorMessage;
                    } else {
                        const text = await res.text();
                        errorMessage = text || errorMessage;
                    }
                } catch (e) {
                    // Ignore parse error
                }
                alert(errorMessage);
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (data.id) {
                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Check 402",
                    description: "Enterprise Plan Upgrade",
                    order_id: data.id,
                    handler: function (response: any) {
                        alert("Upgrade successful! Refreshing...");
                        window.location.reload();
                    },
                    prefill: {
                        name: session?.user?.name || "",
                        email: session?.user?.email || "",
                    },
                    theme: {
                        color: "#14b8a6", // Tailwind teal-500
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
                onClose(); // Close modal after opening Razorpay
            }
        } catch (error) {
            console.error("Upgrade error", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        "Unlimited project monitoring",
        "Higher API rate limits",
        "Priority integration support",
        "Early access to new features",
        "Enterprise-grade security",
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-60" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-60" />

                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative p-8 sm:p-10">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-16 h-16 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/20 mb-5 rotate-3">
                                    <Rocket size={30} />
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                                    Upgrade to Enterprise
                                </h2>
                                <p className="text-slate-500 text-base font-medium max-w-xs">
                                    Unlock unlimited potential for your business with our lifetime plan.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-8">
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl"
                                    >
                                        <div className="p-1 bg-teal-100 text-teal-600 rounded-lg">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-end justify-between px-2 mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">One-time payment</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-900">$5</span>
                                            <span className="text-slate-500 font-bold">USD</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-teal-600 font-bold bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
                                        <Zap size={16} fill="currentColor" />
                                        <span>Lifetime Access</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                    className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-base rounded-2xl shadow-xl shadow-slate-900/10 transition-all hover:shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Upgrade Now"}
                                    {!loading && <ArrowRight size={18} />}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-bold mt-2">
                                    <ShieldCheck size={16} />
                                    Secure payment via Razorpay
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
