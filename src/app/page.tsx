import type { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const metadata: Metadata = {
    title: "Check 402 — Never Chase Client Payments Again",
    description: "Check 402 lets you control access to client web applications based on payment status. Drop in a single script tag and automate enforcement effortlessly.",
    openGraph: {
        title: "Check 402 — Payment Enforcement for Developers",
        description: "The lightweight toolkit to ensure you get paid for your web app development work.",
    },
};

export default function LandingPage() {
    return <LandingPageClient />;
}
