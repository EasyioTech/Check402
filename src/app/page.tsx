"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield, Zap, BarChart3, Key, Globe, ShieldCheck, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200" : "bg-transparent"}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="402check" className="h-8 w-auto group-hover:opacity-80 transition-opacity" />
                        <span className="text-xl font-extrabold tracking-tight">
                            <span className="text-teal-500">402</span><span className="text-slate-900">check</span>
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
                        <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
                        <Link href="/docs" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Docs</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                            Sign in
                        </Link>
                        <Link href="/signup" className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-white -z-10" />
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-6"
                        >
                            <Shield size={14} className="text-teal-500" />
                            Protection for Developers
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
                        >
                            Never chase client payments again.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl"
                        >
                            402check lets you control access to client web applications based on payment status. Drop in a single script tag and automate enforcement effortlessly.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link href="/signup" className="px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white text-base font-bold rounded-xl shadow-sm shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
                                Start for free
                            </Link>
                            <Link href="/docs" className="px-8 py-3.5 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-base font-bold rounded-xl shadow-sm transition-all text-center">
                                Read the docs
                            </Link>
                        </motion.div>
                        <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-500" /> No credit card required</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-500" /> 2 projects free</span>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative lg:ml-auto w-full max-w-lg"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-blue-500/10 rounded-2xl blur-3xl -z-10" />
                        <div className="bg-[#0f172a] rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden relative">
                            <div className="flex items-center px-4 py-3 bg-[#1e293b] border-b border-slate-700/50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="mx-auto text-xs font-medium text-slate-400 font-mono tracking-wide">index.html</div>
                            </div>
                            <div className="p-6 text-sm font-mono leading-relaxed overflow-x-auto">
                                <span className="text-pink-400">&lt;script</span> <span className="text-blue-300">src=</span><span className="text-green-300">"https://check402.com/sdk.js"</span><br />
                                &nbsp;&nbsp;<span className="text-blue-300">data-api-key=</span><span className="text-green-300">"pk_live_12345"</span><br />
                                <span className="text-pink-400">&gt;&lt;/script&gt;</span>
                                <br /><br />
                                <span className="text-slate-500 italic">&lt;!-- That's it. You're protected. --&gt;</span>
                                <br />
                                <span className="text-pink-400">&lt;div</span> <span className="text-blue-300">id=</span><span className="text-green-300">"app"</span><span className="text-pink-400">&gt;&lt;/div&gt;</span>
                            </div>
                            <div className="absolute bottom-4 right-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-2 backdrop-blur-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                Active
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trusted By */}
            <section className="border-y border-slate-100 bg-slate-50/50 py-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                    <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8 text-center">Trusted by indie hackers & agencies</p>
                    <div className="flex flex-wrap justify-center gap-12 sm:gap-20 opacity-40 grayscale">
                        {/* Fake logos for design proof */}
                        <div className="flex items-center gap-2 font-bold text-xl"><Globe className="w-6 h-6" /> Vertex</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Package className="w-6 h-6" /> Nexus UI</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Zap className="w-6 h-6" /> Flash APIs</div>
                    </div>
                </div>
            </section>

            {/* Features Bento */}
            <section className="py-24" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">Everything you need to enforce payments</h2>
                        <p className="text-lg text-slate-600">A complete, lightweight toolkit designed to stay out of your way until you need it.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Large Feature */}
                        <div className="md:col-span-2 bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-slate-300 transition-colors relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6">
                                    <BarChart3 className="text-slate-700 w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Central Dashboard</h3>
                                <p className="text-slate-600 max-w-md leading-relaxed">Manage all your client projects from a single, clean interface. Toggle statuses instantly without redeploying the client site.</p>
                            </div>
                            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                <BarChart3 className="w-64 h-64 text-slate-900" />
                            </div>
                        </div>

                        {/* Standard Features */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                                <Package className="text-teal-500 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">2KB Vanilla SDK</h3>
                            <p className="text-slate-600 leading-relaxed">No npm packages, no heavy dependencies. Just pure, fast JS.</p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                                <Zap className="text-amber-500 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Enforcement</h3>
                            <p className="text-slate-600 leading-relaxed">Toggle payment status and the client&apos;s app responds globally in milliseconds via edge network caching.</p>
                        </div>

                        <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                                <ShieldCheck className="text-blue-500 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Fail-Open Architecture</h3>
                            <p className="text-slate-600 max-w-md leading-relaxed">If 402check is unreachable or blocked by ad-blockers, client apps simply continue working. Zero risk to production reliability.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works (Side by Side) */}
            <section className="py-24 bg-slate-50 border-y border-slate-200 overflow-hidden relative" id="how-it-works">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl font-extrabold sm:text-4xl mb-4 text-slate-900">How it fundamentally works</h2>
                        <p className="text-lg text-slate-500 font-medium">The difference between hoping you get paid, and ensuring you get paid.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="space-y-12">
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center font-bold text-lg text-slate-700 shadow-sm">1</div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">Create your Project</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">Add the client to your 402check dashboard. We instantly generate a unique, secure API edge key for that specific project.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center font-bold text-lg text-slate-700 shadow-sm">2</div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">Embed the Script</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">Drop the 2KB script tag into the `&lt;head&gt;` of your client's application before you hand it over. It works universally.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl border border-teal-200 bg-teal-50 flex items-center justify-center font-bold text-lg text-teal-600 shadow-sm ring-4 ring-teal-500/10">3</div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">Flip the Switch</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">If the invoice goes unpaid, flip the status in your dashboard. The script intercepts the next page load and renders a professional payment-required notice.</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 h-1/2 bottom-0 pointer-events-none" />
                            {/* Mockup comparing unlocked vs locked */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client View</span>
                                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">402 Payment Required</span>
                                </div>
                                <div className="p-8 pb-32 flex flex-col items-center justify-center text-center bg-white min-h-[400px]">
                                    <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Service Suspended</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mb-8">This application has been temporarily suspended due to an outstanding payment balance.</p>
                                    <div className="w-full max-w-xs h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse mb-3" />
                                    <div className="w-full max-w-xs h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 bg-slate-50" id="pricing">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">Simple, transparent pricing</h2>
                        <p className="text-lg text-slate-600">Start for free. Upgrade once your agency scales.</p>
                    </div>

                    <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-8 items-start">
                        {/* Free Tier */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Developer</h3>
                            <p className="text-slate-500 text-sm mb-6">Perfect for trying it out on small gigs.</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                                <span className="text-slate-500 font-medium">/ forever</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-slate-600 text-sm"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Up to 2 active projects</li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Standard dashboard</li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Community support</li>
                            </ul>
                            <Link href="/signup" className="block w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-center rounded-xl shadow-sm transition-all">
                                Start Free
                            </Link>
                        </div>

                        {/* Pro Tier */}
                        <div className="bg-white rounded-3xl p-8 border-2 border-teal-500 shadow-xl shadow-teal-500/10 relative">
                            <div className="absolute top-0 right-8 -translate-y-1/2 bg-teal-500 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm">Most Popular</div>
                            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Enterprise</h3>
                            <p className="text-slate-500 text-sm font-medium mb-6">For serious freelancers and agencies.</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-extrabold text-slate-900">$5</span>
                                <span className="text-slate-500 font-medium">/ lifetime</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-teal-500" /> <b>Unlimited</b> active projects</li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Remove 402check branding (Coming soon)</li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-teal-500" /> Priority support</li>
                            </ul>
                            <Link href="/signup" className="block w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold text-center rounded-xl transition-all shadow-sm shadow-teal-500/20">
                                Upgrade Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Ready to regain control?</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">Join developers worldwide using 402check to ensure they get paid for their hard work.</p>
                    <Link href="/signup" className="inline-flex items-center justify-center px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:-translate-y-1">
                        Get Started for Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <Link href="/" className="flex items-center gap-2 group grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                        <img src="/logo.png" alt="402check" className="h-6 w-auto" />
                        <span className="text-lg font-extrabold tracking-tight">
                            <span className="text-teal-500">402</span><span className="text-slate-900">check</span>
                        </span>
                    </Link>
                    <div className="flex gap-8 text-sm font-medium text-slate-500">
                        <Link href="/docs" className="hover:text-slate-900 transition-colors">Documentation</Link>
                        <Link href="/login" className="hover:text-slate-900 transition-colors">Dashboard</Link>
                        <a href="mailto:support@check402.com" className="hover:text-slate-900 transition-colors">Support</a>
                    </div>
                    <p className="text-sm text-slate-400">© {new Date().getFullYear()} 402check. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
