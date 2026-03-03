"use client";

import Link from "next/link";
import { Shield, ArrowLeft, Scale, Lock, ShieldAlert, FileText, Info, Gavel, Handshake, AlertTriangle, CreditCard, Mail } from "lucide-react";

export default function TermsPage() {
    const lastUpdated = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="check402" className="h-6 w-auto group-hover:opacity-80 transition-opacity" />
                        <span className="font-bold text-slate-900 tracking-tight text-lg">Check 402</span>
                    </Link>
                    <Link href="/dashboard" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1.5">
                        <ArrowLeft size={16} />
                        Dashboard
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-16">
                <div className="mb-12 text-center sm:text-left">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-slate-500 font-bold flex items-center justify-center sm:justify-start gap-2">
                        <Info size={18} className="text-teal-500" />
                        Last updated: {lastUpdated}
                    </p>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-8">
                    <p className="text-lg">
                        Welcome to Check 402 ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the Check 402 website, API, and dashboard (collectively, the "Service").
                    </p>
                    <p className="text-lg">
                        By creating an account, generating an API key, or embedding our code, you ("User," "Developer," or "Agency") agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
                    </p>

                    <div className="grid gap-8">
                        {/* 1. Description of Service */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                                    <FileText size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">1. Description of Service</h2>
                            </div>
                            <p>
                                check402 provides technical infrastructure and an API designed to allow web developers and agencies to programmatically verify payment status and manage access to digital projects they have built. The Service acts strictly as a state-management toggle; how the user's application responds to the API status is solely determined by the code implemented by the User.
                            </p>
                        </section>

                        {/* 2. User Obligations */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-teal-400">
                                    <Shield size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">2. User Obligations and Acceptable Use Policy</h2>
                            </div>
                            <p className="mb-4">
                                Because our Service allows you to restrict access to digital assets, you must adhere strictly to the following rules. You agree that you will only use check402 if:
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center text-teal-600 font-bold text-xs">1</div>
                                    <p><strong className="text-slate-900">Explicit Contractual Right:</strong> You possess a legally binding contract, Master Services Agreement (MSA), or clear written consent from your client that explicitly grants you the right to suspend, restrict, or modify access to the delivered project in the event of non-payment or breach of contract.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center text-teal-600 font-bold text-xs">2</div>
                                    <p><strong className="text-slate-900">No Extortion or Ransomware:</strong> You will not use the Service to maliciously lock out clients who have paid their invoices in full, nor will you use it to extort funds outside of a previously agreed-upon contract.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center text-teal-600 font-bold text-xs">3</div>
                                    <p><strong className="text-slate-900">No Unauthorized Access:</strong> You will not embed the check402 API into projects, websites, or applications that you do not own or do not have the authorized right to modify.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center text-teal-600 font-bold text-xs">4</div>
                                    <p><strong className="text-slate-900">Compliance with Laws:</strong> Your use of the Service complies with all applicable local, state, national, and international laws.</p>
                                </li>
                            </ul>
                            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 text-sm font-bold">
                                <AlertTriangle size={20} className="flex-shrink-0" />
                                <p>We reserve the right to instantly terminate your account and revoke all API keys if we suspect you are using the Service maliciously, unethically, or without proper contractual authorization.</p>
                            </div>
                        </section>

                        {/* 3. Role of check402 */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">3. Role of check402 (The "Infrastructure" Clause)</h2>
                            </div>
                            <p className="mb-4">
                                You acknowledge and agree that check402 provides only the technical infrastructure (the API and dashboard) to manage project states.
                            </p>
                            <ul className="list-disc list-inside space-y-2 font-bold text-slate-700">
                                <li>We are not a party to any contract, agreement, or dispute between you and your clients.</li>
                                <li>We do not mediate, arbitrate, or investigate billing disputes between you and your clients.</li>
                                <li>We do not verify the legal validity of your contracts.</li>
                            </ul>
                        </section>

                        {/* 4. Indemnification */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Handshake size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">4. Indemnification</h2>
                            </div>
                            <p className="mb-4">
                                You agree to defend, indemnify, and hold harmless check402, its founders, employees, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses arising from:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 italic">
                                <li>Your use of and access to the Service.</li>
                                <li>Your violation of any term of these Terms of Service.</li>
                                <li>Any dispute, lawsuit, or claim brought against us by your client or any third party resulting from your decision to restrict access to a project using our API.</li>
                                <li>Any financial loss, SEO damage, or data loss experienced by your client due to the implementation of the check402 script.</li>
                            </ul>
                        </section>

                        {/* 5. Disclaimer of Warranties */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">5. Disclaimer of Warranties</h2>
                            </div>
                            <p className="font-bold border-l-4 border-slate-200 pl-4 mb-4">
                                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. check402 MAKES NO WARRANTIES, EXPRESSED OR IMPLIED, AND HEREBY DISCLAIMS AND NEGATES ALL OTHER WARRANTIES, INCLUDING WITHOUT LIMITATION, IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF INTELLECTUAL PROPERTY.
                            </p>
                            <p>
                                Furthermore, check402 does not warrant or make any representations concerning the accuracy, likely results, or reliability of the Service. We do not guarantee 100% uptime of our API. You are strictly advised to code fail-safes (timeouts) into your implementation so that your clients' websites default to a functional state in the event of a check402 server outage.
                            </p>
                        </section>

                        {/* 6. Limitation of Liability */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md bg-slate-900 text-slate-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-black">
                                    <Gavel size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-Black">6. Limitation of Liability</h2>
                            </div>
                            <p className="font-bold text-Black mb-4 italic">
                                IN NO EVENT SHALL check402, ITS DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; OR (III) ANY UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
                            </p>
                            <p>
                                In no event shall our total liability to you for all damages, losses, or causes of action exceed the amount you have paid check402 in the last six (6) months, or one hundred U.S. Dollars ($100), whichever is greater.
                            </p>
                        </section>

                        {/* 7. Fees and Payments */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                                    <CreditCard size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">7. Fees and Payments</h2>
                            </div>
                            <p>
                                Some aspects of the Service may be provided for a fee. If you choose to use paid aspects of the Service, you agree to the pricing and payment terms listed on our website. We reserve the right to update our pricing at any time, with notice provided to active users.
                            </p>
                        </section>

                        {/* 8. Changes to Terms */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                                    <HANDSHAKE_PLACEHOLDER size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">8. Changes to Terms</h2>
                            </div>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </section>

                        {/* 9. Governing Law */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Scale size={24} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">9. Governing Law</h2>
                            </div>
                            <p>
                                These Terms shall be governed and construed in accordance with the laws of the jurisdiction of where the service is operated, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        {/* 10. Contact Us */}
                        <section className="bg-teal-500 rounded-3xl p-8 shadow-xl shadow-teal-500/20 text-white text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
                                <Mail size={32} />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4">10. Contact Us</h2>
                            <p className="mb-8 font-medium text-teal-50">If you have any questions about these Terms, please contact our support team.</p>
                            <a
                                href="mailto:support@check402.com"
                                className="inline-block px-10 py-4 bg-white text-teal-600 font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                support@check402.com
                            </a>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Small helper for icons since I might have missed one or want to be consistent
const HANDSHAKE_PLACEHOLDER = ({ size }: { size: number }) => <Handshake size={size} />;
