"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function VerifiedBadge({ className = "" }: { className?: string }) {
    return (
        <Link
            href="https://check402.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 hover:bg-teal-100 transition-all shadow-sm group ${className}`}
        >
            <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-tight">
                Verified by <span className="text-teal-800">Check 402</span>
            </span>
        </Link>
    );
}
