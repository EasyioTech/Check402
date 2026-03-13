"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type PlanData = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    billingType: string;
    isDefault: boolean;
    isPopular: boolean;
    projectLimit: number;
    fileLimit: number;
    features: string[];
};

export default function PricingSection() {
    const [plans, setPlans] = useState<PlanData[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/plans")
            .then(res => res.ok ? res.json() : [])
            .then(data => { setPlans(data); setLoaded(true); })
            .catch(() => setLoaded(true));
    }, []);

    const billingLabel = (billingType: string) => {
        if (billingType === "free") return "/ forever";
        if (billingType === "monthly") return "/ month";
        return "/ lifetime";
    };

    const priceDisplay = (price: number) => {
        if (price === 0) return "$0";
        return `$${(price / 100).toFixed(price % 100 === 0 ? 0 : 2)}`;
    };

    return (
        <section className="py-24 bg-white" id="pricing">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4 leading-tight">Simple, transparent pricing</h2>
                    <p className="text-lg text-slate-600">Start free. Upgrade when you scale.</p>
                </div>

                {!loaded ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className={`grid max-w-4xl mx-auto gap-8 items-start ${plans.length <= 2 ? "md:grid-cols-2" : plans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
                        {plans.map((plan, idx) => (
                            <div key={plan.id}
                                className={`bg-white p-8 relative ${plan.isPopular
                                        ? "rounded-3xl border-2 border-teal-500 shadow-xl shadow-teal-500/10 mt-8 md:mt-0"
                                        : "rounded-2xl border border-slate-200 shadow-sm"
                                    }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-4 sm:right-8 -translate-y-1/2 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm">Most Popular</div>
                                )}
                                <h3 className={`text-2xl mb-2 text-slate-900 ${plan.isPopular ? "font-extrabold" : "font-bold"}`}>{plan.name}</h3>
                                {plan.description && <p className="text-slate-500 text-sm font-medium mb-6">{plan.description}</p>}
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-extrabold text-slate-900">{priceDisplay(plan.price)}</span>
                                    <span className="text-slate-500 font-medium">{billingLabel(plan.billingType)}</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className={`flex items-center gap-3 text-slate-600 text-sm ${plan.isPopular ? "font-medium" : ""}`}>
                                            <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/signup"
                                    className={`block w-full py-3.5 px-4 font-bold text-center rounded-xl transition-all shadow-sm ${plan.isPopular
                                            ? "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/20"
                                            : "bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700"
                                        }`}
                                >
                                    {plan.price === 0 ? "Start Free" : "Upgrade Now"}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
