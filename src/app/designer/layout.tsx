"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard, Folder, LogOut, Menu, X
} from "lucide-react";

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const links = [
        { href: "/designer", label: "Overview", icon: <LayoutDashboard size={20} />, exact: true },
        { href: "/designer/projects", label: "Projects", icon: <Folder size={20} /> },
    ];

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    const userName = session?.user?.name || "Designer";
    const userEmail = session?.user?.email || "";

    return (
        <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-slate-200 mb-2 justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="check402" className="h-8 w-auto group-hover:opacity-80 transition-opacity" />
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-extrabold tracking-tight">
                            <span className="text-teal-500">Check</span> <span className="text-slate-900">402</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designer Studio</span>
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-900">
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
                {links.map((link) => {
                    const active = isActive(link.href, link.exact);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${active
                                ? "bg-white text-teal-600 shadow-sm border border-slate-200"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                                }`}
                        >
                            <span className={active ? "text-teal-500" : "text-slate-400"}>{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}

            </nav>

            {/* User */}
            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-3 px-2 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center flex-shrink-0 border border-teal-200">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-sm font-bold text-slate-900 truncate">{userName}</div>
                        <div className="text-xs font-semibold text-slate-500 truncate">{userEmail}</div>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all shadow-sm"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

export default function DesignerLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    // Auth guard: strict — only DESIGNER mode allowed
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && (session?.user as { mode?: string })?.mode !== "DESIGNER") {
            // Developer or admin landed here — send them to their console
            router.push("/dashboard");
        }
    }, [status, session, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (status === "loading" || (status === "authenticated" && (session?.user as { mode?: string })?.mode !== "DESIGNER")) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed h-screen top-0 left-0">
                <SidebarContent />
            </div>

            {/* Mobile Header */}
            <header className="lg:hidden h-16 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-4 sticky top-0 z-40">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="check402" className="h-7 w-auto" />
                    <span className="text-lg font-extrabold tracking-tight">
                        <span className="text-teal-500">Check</span> <span className="text-slate-900">402</span>
                    </span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-slate-600 border border-slate-200 rounded-lg bg-white"
                >
                    <Menu size={22} />
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="absolute top-0 left-0 h-full animate-in slide-in-from-left duration-300">
                        <SidebarContent onClose={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main content */}
            <main className="flex-1 lg:ml-64 min-h-screen">
                <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
