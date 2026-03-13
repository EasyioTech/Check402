"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PricingSection from "@/components/PricingSection";
import {
    Shield, Zap, BarChart3, Key, Globe, ShieldCheck, Package,
    CheckCircle2, AlertCircle, Menu, X, Palette, Image, FileText,
    MessageSquare, Lock, Upload, ThumbsUp, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPageClient() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMode, setActiveMode] = useState<"developer" | "designer">("developer");

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "#modes", label: "Features" },
        { href: "#how-it-works", label: "How It Works" },
        { href: "#pricing", label: "Pricing" },
        { href: "/docs", label: "Docs" },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200" : "bg-transparent"}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="check402" className="h-8 w-auto group-hover:opacity-80 transition-opacity" />
                        <span className="text-xl font-extrabold tracking-tight">
                            <span className="text-teal-500 font-sans">Check</span> <span className="text-slate-900">402</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link key={link.label} href={link.href} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                            Sign in
                        </Link>
                        <Link href="/signup" className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:-translate-y-0.5">
                            Get Started
                        </Link>
                        <button className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-white lg:hidden">
                        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
                            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                <img src="/logo.png" alt="check402" className="h-8 w-auto" />
                                <span className="text-xl font-extrabold tracking-tight">
                                    <span className="text-teal-500">Check</span> <span className="text-slate-900">402</span>
                                </span>
                            </Link>
                            <button className="p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link key={link.label} href={link.href} className="text-2xl font-bold text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="border-slate-100" />
                            <Link href="/login" className="text-2xl font-bold text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Sign in</Link>
                            <Link href="/signup" className="w-full py-4 bg-teal-500 text-white text-center font-bold rounded-xl shadow-lg shadow-teal-500/20" onClick={() => setIsMobileMenuOpen(false)}>
                                Get Started Free
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-white -z-10" />
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="max-w-2xl text-center lg:text-left">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-6">
                            <Shield size={14} className="text-teal-500" />
                            Payment Enforcement for Freelancers
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                            Never chase client payments again.
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            One platform. Two powerful modes. Enforce payment on web apps with a script tag, or share watermarked design previews and lock originals until you&apos;re paid.
                        </motion.p>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/signup" className="px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white text-base font-bold rounded-xl shadow-sm shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:-translate-y-0.5 text-center">
                                Start for free
                            </Link>
                            <Link href="/docs" className="px-8 py-3.5 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-base font-bold rounded-xl shadow-sm transition-all text-center">
                                Read the docs
                            </Link>
                        </motion.div>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-500" /> No credit card required</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-500" /> 3 projects free</span>
                        </div>
                    </div>

                    {/* Dual Mode Preview Cards */}
                    <motion.div initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative lg:ml-auto w-full max-w-lg mx-auto lg:mx-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-blue-500/10 rounded-2xl blur-3xl -z-10" />
                        {/* Developer card */}
                        <div className="bg-[#0f172a] rounded-xl shadow-xl border border-slate-700/50 overflow-hidden mb-4">
                            <div className="flex items-center px-4 py-3 bg-[#1e293b] border-b border-slate-700/50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="mx-auto text-xs font-medium text-slate-400 font-mono">Developer Mode — index.html</div>
                            </div>
                            <div className="p-5 text-xs font-mono leading-relaxed">
                                <span className="text-pink-400">&lt;script</span> <span className="text-blue-300">src=</span><span className="text-green-300">&quot;https://check402.com/sdk.js&quot;</span><br />
                                &nbsp;&nbsp;<span className="text-blue-300">data-api-key=</span><span className="text-green-300">&quot;pk_live_12345&quot;</span><br />
                                <span className="text-pink-400">&gt;&lt;/script&gt;</span>
                                <br /><span className="text-slate-500 italic">&lt;!-- That&apos;s it. You&apos;re protected. --&gt;</span>
                            </div>
                        </div>
                        {/* Designer card */}
                        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                    <Palette size={13} className="text-teal-500" /> Designer Studio — Logo_v3.jpg
                                </div>
                                <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">Awaiting Approval</span>
                            </div>
                            <div className="p-4 flex gap-3">
                                <div className="w-20 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                    <Image size={20} className="text-slate-300" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[7px] font-bold text-slate-400 rotate-[-20deg] tracking-tight">PREVIEW ONLY</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 mb-1">Client feedback received</p>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">&quot;Love the direction! Can we try a darker shade?&quot;</p>
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <div className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <ThumbsUp size={8} />Approve
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Two Modes Section */}
            <section className="py-24 bg-slate-50 border-y border-slate-200" id="modes">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4 leading-tight">One platform, built for every freelancer</h2>
                        <p className="text-lg text-slate-600">Whether you ship code or craft visuals, Check 402 keeps your work protected and payment guaranteed.</p>
                    </div>

                    {/* Mode toggle */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm gap-1">
                            <button
                                onClick={() => setActiveMode("developer")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMode === "developer" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                            >
                                👨‍💻 Developer Mode
                            </button>
                            <button
                                onClick={() => setActiveMode("designer")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMode === "designer" ? "bg-teal-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                            >
                                🎨 Designer Mode
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeMode === "developer" ? (
                            <motion.div key="dev" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                                className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-slate-900 rounded-2xl p-8 border border-slate-700 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                                            <BarChart3 className="text-teal-400 w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Central Dashboard</h3>
                                        <p className="text-slate-400 max-w-md leading-relaxed">Manage all your client projects from one clean interface. Toggle statuses instantly without redeploying anything.</p>
                                    </div>
                                    <BarChart3 className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-5 w-64 h-64 text-white" />
                                </div>
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                                        <Package className="text-teal-500 w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">2KB Vanilla SDK</h3>
                                    <p className="text-slate-600 leading-relaxed">No npm installs, no dependencies. One script tag in the client&apos;s HTML. Done.</p>
                                </div>
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                                        <Zap className="text-amber-500 w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Enforcement</h3>
                                    <p className="text-slate-600 leading-relaxed">Flip the switch and the client&apos;s app goes into payment-required mode globally within milliseconds.</p>
                                </div>
                                <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                                        <ShieldCheck className="text-blue-500 w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Fail-Open Architecture</h3>
                                    <p className="text-slate-600 max-w-md leading-relaxed">If Check 402 is unreachable or blocked, client apps continue working. Zero risk to production reliability.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="des" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                                className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-slate-900 rounded-2xl p-8 border border-slate-700 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                                            <Image className="text-teal-400 w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Watermarked Design Previews</h3>
                                        <p className="text-slate-400 max-w-md leading-relaxed">Upload your designs — images, SVGs, PDFs. We automatically generate a tiled &ldquo;PREVIEW ONLY&rdquo; watermark and give you a secure shareable link. Originals stay locked on our servers.</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-6">
                                        <Upload className="text-teal-500 w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Drag &amp; Drop Upload</h3>
                                    <p className="text-slate-600 leading-relaxed">Upload images, SVGs, PDFs and videos directly. Version tracking built in — upload revisions seamlessly.</p>
                                </div>
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                                        <MessageSquare className="text-blue-500 w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Client Feedback &amp; Approval</h3>
                                    <p className="text-slate-600 leading-relaxed">Clients view the preview, leave comments, and click &ldquo;Approve This Design&rdquo; — no login required. All feedback is tracked in your Studio.</p>
                                </div>
                                <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6">
                                        <Trash2 className="text-red-500 w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Purge on Completion</h3>
                                    <p className="text-slate-600 max-w-md leading-relaxed">Once payment is confirmed, mark the project complete. All original files are permanently deleted from our servers in a single click — previews too. Nothing stored after delivery.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-white overflow-hidden relative" id="how-it-works">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl font-extrabold sm:text-4xl mb-4 text-slate-900 leading-tight">How Designer Studio works</h2>
                        <p className="text-lg text-slate-500 font-medium">Share protected previews. Collect approval. Get paid. Delete everything.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="space-y-10">
                            {[
                                { n: 1, title: "Create a design project", desc: "Open Designer Studio, create a project, add your client's email. A unique shareable preview link is instantly generated.", color: "" },
                                { n: 2, title: "Upload your files", desc: "Drag and drop images, SVGs, PDFs or videos. We generate tiled watermarked previews server-side — originals are never exposed.", color: "" },
                                { n: 3, title: "Share the preview link", desc: "Send the link to your client. They can view watermarked previews, leave comments, or click Approve. No login required.", color: "" },
                                { n: 4, title: "Get paid, then purge", desc: "Once payment is confirmed, mark the project complete. All files are permanently deleted from our servers. Done.", color: "teal" },
                            ].map(({ n, title, desc, color }) => (
                                <div key={n} className="flex gap-6 text-left">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-lg shadow-sm ${color === "teal" ? "border-teal-200 bg-teal-50 text-teal-600 ring-4 ring-teal-500/10" : "border-slate-200 bg-white text-slate-700"}`}>{n}</div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
                                        <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Preview mockup */}
                        <div className="relative">
                            <div className="bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
                                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
                                    <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5"><Lock size={10} />check402.com/preview/…</span>
                                    <span className="text-[10px] font-bold text-amber-300 bg-amber-900/40 border border-amber-700/50 px-2 py-0.5 rounded-full">Awaiting Review</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-white font-extrabold text-base mb-1">Logo Redesign — Acme Corp</h3>
                                    <p className="text-slate-500 text-xs font-medium mb-5">Prepared for: client@acmecorp.com</p>
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="rounded-xl bg-slate-800 border border-slate-700 aspect-[4/3] flex items-center justify-center relative overflow-hidden">
                                                <Image size={22} className="text-slate-600" />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="text-[8px] font-bold text-white/20 rotate-[-25deg] tracking-wide select-none">PREVIEW ONLY · check402.com</span>
                                                </div>
                                                <span className="absolute top-2 right-2 text-[9px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full">v{i}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-3">
                                        <p className="text-xs text-slate-400 font-medium mb-3">Leave Feedback</p>
                                        <div className="h-7 bg-slate-800 rounded-lg mb-2 border border-slate-700" />
                                        <div className="h-14 bg-slate-800 rounded-lg mb-3 border border-slate-700" />
                                        <div className="flex gap-2">
                                            <div className="flex-1 h-8 rounded-lg bg-slate-700 border border-slate-600" />
                                            <div className="flex-1 h-8 rounded-lg bg-teal-600 border border-teal-500" />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-600 text-center font-medium">🔒 Watermarked previews only. Originals released upon completion.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developer How It Works strip */}
            <section className="py-16 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                            <Key size={14} className="text-white" />
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900">Developer Mode — How it works</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-8">
                        {[
                            { n: 1, title: "Create your Project", desc: "Add the client to your dashboard. We instantly generate a unique, secure API edge key." },
                            { n: 2, title: "Embed the Script", desc: "Drop the 2KB script into the <head> of your client's site before handoff. That's the only integration." },
                            { n: 3, title: "Flip the Switch", desc: "If unpaid, flip the status. The script intercepts page loads and renders a professional payment notice." },
                        ].map(({ n, title, desc }) => (
                            <div key={n} className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm">{n}</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <PricingSection />

            {/* CTA */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">Ready to protect your work?</h2>
                    <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto">Whether you build software or craft visuals, Check 402 ensures you get paid — every time.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup" className="inline-flex items-center justify-center px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white text-base font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:-translate-y-1">
                            Get Started for Free
                        </Link>
                        <Link href="/docs" className="inline-flex items-center justify-center px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-base font-bold rounded-xl shadow-sm transition-all">
                            Read the Docs
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-2 lg:col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-6 group">
                                <img src="/logo.png" alt="check402" className="h-8 w-auto transition-opacity group-hover:opacity-80" />
                                <span className="text-xl font-extrabold tracking-tight">
                                    <span className="text-teal-500 font-sans">Check</span> <span className="text-slate-900">402</span>
                                </span>
                            </Link>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mb-6">
                                Payment enforcement for developers and designers. Protect your work and guarantee fair compensation — automatically.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-500 transition-colors shadow-sm"><Globe size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-500 transition-colors shadow-sm"><Shield size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-500 transition-colors shadow-sm"><Zap size={18} /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-6">Product</h4>
                            <ul className="space-y-4 text-sm font-medium text-slate-500">
                                <li><Link href="#modes" className="hover:text-teal-500 transition-colors">Developer Mode</Link></li>
                                <li><Link href="#modes" className="hover:text-teal-500 transition-colors">Designer Studio</Link></li>
                                <li><Link href="#pricing" className="hover:text-teal-500 transition-colors">Pricing</Link></li>
                                <li><Link href="/docs" className="hover:text-teal-500 transition-colors">API Reference</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-6">Resources</h4>
                            <ul className="space-y-4 text-sm font-medium text-slate-500">
                                <li><Link href="/docs" className="hover:text-teal-500 transition-colors">Documentation</Link></li>
                                <li><Link href="/login" className="hover:text-teal-500 transition-colors">Developer Portal</Link></li>
                                <li><Link href="/designer" className="hover:text-teal-500 transition-colors">Designer Studio</Link></li>
                                <li><Link href="/#faq" className="hover:text-teal-500 transition-colors">Help Center</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm font-medium text-slate-500">
                                <li><Link href="/terms" className="hover:text-teal-500 transition-colors">Terms of Service</Link></li>
                                <li><Link href="/privacy" className="hover:text-teal-500 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/security" className="hover:text-teal-500 transition-colors">Security Ethics</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            © {new Date().getFullYear()} Check 402. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                                Systems Operational
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
