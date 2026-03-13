"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Code2, Palette, CheckCircle2 } from "lucide-react";

// ── Mode selection (Step 1) ─────────────────────────────────────────────────
const modes = [
    {
        id: "DEVELOPER",
        icon: <Code2 className="w-8 h-8" />,
        title: "Developer / Engineer",
        desc: "I build web apps and need to protect my projects until clients pay.",
    },
    {
        id: "DESIGNER",
        icon: <Palette className="w-8 h-8" />,
        title: "Designer / Creative",
        desc: "I create design assets and need to share watermarked previews securely with clients.",
    },
];

// ── Developer path data ─────────────────────────────────────────────────────
const stacks = [
    { id: "nextjs", label: "React / Next.js" }, { id: "vue", label: "Vue / Nuxt" },
    { id: "html", label: "Vanilla HTML / JS" }, { id: "wordpress", label: "WordPress / PHP" },
    { id: "nocode", label: "Webflow / Framer" }, { id: "other", label: "Other" },
];
const painPoints = [
    { id: "active-client", label: "I have an active client who is currently refusing to pay." },
    { id: "past-burn", label: "I've been burned in the past and want to protect future projects." },
    { id: "exploring", label: "I'm just exploring the API and testing the waters." },
    { id: "agency-workflow", label: "I want to integrate this into my existing agency workflow." },
];

// ── Designer path data ──────────────────────────────────────────────────────
const designTools = [
    { id: "figma", label: "Figma" }, { id: "adobexd", label: "Adobe XD" },
    { id: "sketch", label: "Sketch" }, { id: "canva", label: "Canva" },
    { id: "photoshop", label: "Photoshop / Illustrator" }, { id: "other", label: "Other" },
];

const variants = { enter: { opacity: 0, x: 80 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -80 } };
const transition = { duration: 0.35, ease: "easeInOut" as const };

export default function OnboardingClient() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState<"DEVELOPER" | "DESIGNER" | "">("");
    const [persona, setPersona] = useState("");      // design tool for designers; kept as persona DB field
    const [techStack, setTechStack] = useState("");
    const [painPoint, setPainPoint] = useState("");
    const [legalChecked, setLegalChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Total steps depends on mode:
    // Developer: 1 (mode) → 2 (stack) → 3 (painpoint) → 4 (legal)  = 4 steps
    // Designer:  1 (mode) → 2 (tool)  → 3 (legal)                  = 3 steps
    const totalSteps = mode === "DESIGNER" ? 3 : 4;

    const canNext = () => {
        if (step === 1) return !!mode;
        if (step === 2) return mode === "DESIGNER" ? !!persona : !!techStack;
        if (step === 3) return mode === "DESIGNER" ? legalChecked : !!painPoint;
        return false; // step 4 logic handled by handleFinish button state
    };

    const handleFinish = async () => {
        if (!legalChecked) return;
        setLoading(true); setError("");
        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode, persona, techStack, painPoint }),
            });
            if (!res.ok) throw new Error("Failed");
            // Redirect based on mode
            router.push(mode === "DESIGNER" ? "/designer" : "/dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const progress = (step / totalSteps) * 100;

    // Step labels for display
    const stepLabel = `Step ${step} of ${totalSteps}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
            <div className="fixed top-6 left-6 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="check402" className="h-6 w-auto group-hover:opacity-80 transition-opacity" />
                    <span className="text-lg font-extrabold tracking-tight"><span className="text-teal-500">Check</span>{" "}<span className="text-slate-900">402</span></span>
                </Link>
            </div>
            <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
                <motion.div className="h-full bg-teal-500 rounded-full" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeInOut" }} />
            </div>
            <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">{stepLabel}</span>
                    </div>
                    <AnimatePresence mode="wait">

                        {/* ── Step 1: Mode selection (Developer / Designer) ── */}
                        {step === 1 && (
                            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Welcome to Check 402.<br />What best describes you?</h1>
                                    <p className="text-slate-500 font-medium">We&apos;ll tailor your dashboard and features to your workflow.</p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    {modes.map((m) => (
                                        <button key={m.id} onClick={() => setMode(m.id as "DEVELOPER" | "DESIGNER")}
                                            className={`group relative flex flex-col items-center text-center p-8 bg-white rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${mode === m.id ? "border-teal-500 shadow-teal-100" : "border-slate-200 hover:border-slate-300"}`}>
                                            <div className={`mb-4 p-3 rounded-xl transition-colors ${mode === m.id ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"}`}>{m.icon}</div>
                                            <div className="font-extrabold text-slate-900 mb-1.5 text-lg">{m.title}</div>
                                            <div className="text-sm text-slate-500 font-medium">{m.desc}</div>
                                            {mode === m.id && <div className="absolute top-3 right-3 text-teal-500"><CheckCircle2 size={18} fill="currentColor" /></div>}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Step 2: Developer → Tech Stack | Designer → Primary Tool ── */}
                        {step === 2 && mode === "DEVELOPER" && (
                            <motion.div key="step2-dev" variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">What is your primary development stack?</h1>
                                    <p className="text-slate-500 font-medium">Select the environment where you will embed the Check 402 API.</p>
                                </div>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {stacks.map((s) => (
                                        <button key={s.id} onClick={() => setTechStack(s.id)} className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 border-2 ${techStack === s.id ? "bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-200" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"}`}>{s.label}</button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && mode === "DESIGNER" && (
                            <motion.div key="step2-des" variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">What tools do you primarily use?</h1>
                                    <p className="text-slate-500 font-medium">We&apos;ll optimise your project workflow based on your tool chain.</p>
                                </div>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {designTools.map((t) => (
                                        <button key={t.id} onClick={() => setPersona(t.id)} className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 border-2 ${persona === t.id ? "bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-200" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"}`}>{t.label}</button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Step 3 (Developer only): Pain point ── */}
                        {step === 3 && mode === "DEVELOPER" && (
                            <motion.div key="step3-dev" variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">What brings you to Check 402 today?</h1>
                                    <p className="text-slate-500 font-medium">Your answer helps us improve our enforcement features.</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {painPoints.map((pp) => (
                                        <button key={pp.id} onClick={() => setPainPoint(pp.id)} className={`w-full flex items-center gap-4 p-5 bg-white rounded-2xl border-2 text-left font-medium transition-all duration-200 ${painPoint === pp.id ? "border-teal-500 text-teal-700 shadow-sm" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${painPoint === pp.id ? "border-teal-500 bg-teal-500" : "border-slate-300"}`}>
                                                {painPoint === pp.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            {pp.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Legal: Step 4 for Developer, Step 3 for Designer ── */}
                        {((mode === "DEVELOPER" && step === 4) || (mode === "DESIGNER" && step === 3)) && (
                            <motion.div key="step-legal" variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Final Step: Liability &amp; Acceptable Use</h1>
                                    <p className="text-slate-500 font-medium">Please confirm you understand the terms of using Check 402.</p>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6 text-sm text-slate-600 font-medium leading-relaxed space-y-4">
                                    <p>Check 402 is an <strong>enforcement tool</strong> that restricts client access to projects and previews. By using this service, you agree to the following:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>You have a valid, written contract with your client that either explicitly grants you, or does not prohibit you from, restricting access to the deliverable in cases of non-payment.</li>
                                        <li>You will not use Check 402 to target consumers, private individuals, or in any jurisdiction where such enforcement is prohibited by law.</li>
                                        <li>Check 402 is not a legal firm and provides no legal advice. <strong>You are solely responsible</strong> for ensuring your usage complies with applicable laws and your client agreements.</li>
                                        <li>You agree to hold Check 402 harmless from any disputes, damages, or legal claims arising from your use of the platform.</li>
                                    </ul>
                                </div>
                                {error && <div className="mb-4 bg-red-50 text-red-600 py-3 px-4 rounded-xl text-sm border border-red-100 text-center font-medium">{error}</div>}
                                <label className="flex items-start gap-4 cursor-pointer group p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-teal-300 transition-colors">
                                    <input type="checkbox" checked={legalChecked} onChange={(e) => setLegalChecked(e.target.checked)} className="mt-0.5 w-5 h-5 rounded accent-teal-500 cursor-pointer flex-shrink-0" />
                                    <span className="text-sm font-semibold text-slate-700 leading-relaxed">I confirm that I have a valid agreement with my clients, and I agree to hold Check 402 harmless from any disputes.</span>
                                </label>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-10">
                        <button onClick={() => setStep((s) => s - 1)} disabled={step === 1} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-all">← Back</button>
                        {step < totalSteps ? (
                            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Continue →</button>
                        ) : (
                            <button onClick={handleFinish} disabled={!legalChecked || loading} className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={16} />Enter Dashboard</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
