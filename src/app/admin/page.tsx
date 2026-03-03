import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Folder, DollarSign, ShieldAlert, ChevronLeft, Activity } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";

async function getMetrics() {
    // Need absolute URL for server-side fetch in RSC
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/admin/metrics`, {
        cache: 'no-store', // Always fetch fresh metrics for Admin
        headers: {
            Cookie: headersList.get("cookie") || ""
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch metrics");
    }

    return res.json();
}

export default async function AdminDashboard() {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    let metrics = { users: 0, projects: 0, revenue: 0 };
    let errorMsg = null;

    try {
        metrics = await getMetrics();
    } catch (e) {
        errorMsg = "Data currently unavailable.";
        console.error(e);
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans selection:bg-teal-100 selection:text-teal-900">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 flex-shrink-0">
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Command Center</h1>
                                <span className="px-2.5 py-0.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full">Root</span>
                            </div>
                            <p className="text-slate-500 font-medium">System health, platform statistics, and global metrics overview.</p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm"
                    >
                        <ChevronLeft size={16} />
                        Exit to Dashboard
                    </Link>
                </div>

                {errorMsg ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm">
                            <Activity size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-red-800 mb-2">Metrics Connection Error</h3>
                        <p className="text-red-600 font-medium">{errorMsg}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Users Metric */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 mb-6">
                                    <Users size={28} />
                                </div>
                                <div className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                                    {metrics.users.toLocaleString()}
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registered Users</div>
                            </div>
                        </div>

                        {/* Revenue Metric */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center border border-teal-100 mb-6">
                                    <DollarSign size={28} />
                                </div>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-bold text-slate-300">$</span>
                                    <div className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-teal-600 transition-colors">
                                        {metrics.revenue.toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Estimated Lifetime Revenue</div>
                            </div>
                        </div>

                        {/* Projects Metric */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 mb-6">
                                    <Folder size={28} />
                                </div>
                                <div className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-amber-600 transition-colors">
                                    {metrics.projects.toLocaleString()}
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Client Projects</div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
