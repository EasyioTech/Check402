"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Search, FolderOpen, ArrowRight, Zap, Lock } from "lucide-react";

const FREE_LIMIT = 3;

type DesignProject = {
    id: string;
    name: string;
    clientEmail: string;
    description: string | null;
    status: string;
    createdAt: string;
    _count?: { files: number; comments: number };
};

const statusConfig: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Draft", color: "bg-slate-100 text-slate-600" },
    IN_REVIEW: { label: "In Review", color: "bg-blue-50 text-blue-600" },
    CHANGES_REQUESTED: { label: "Changes Requested", color: "bg-amber-50 text-amber-700" },
    APPROVED: { label: "Approved", color: "bg-teal-50 text-teal-700" },
    COMPLETED: { label: "Completed", color: "bg-green-50 text-green-700" },
};

const FILTERS = ["ALL", "DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "COMPLETED"];

export default function DesignerProjectsPage() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<DesignProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetch("/api/design-projects")
            .then((r) => r.json())
            .then((data) => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const isFreePlan = (session?.user as { plan?: string })?.plan === "DEVELOPER";
    const atLimit = isFreePlan && projects.length >= FREE_LIMIT;

    const filtered = projects.filter((p) => {
        const matchSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.clientEmail.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "ALL" || p.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Projects</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-500 font-medium">{projects.length} design project{projects.length !== 1 ? "s" : ""} total</p>
                        {isFreePlan && (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${atLimit
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                {projects.length}/{FREE_LIMIT} projects used
                            </span>
                        )}
                    </div>
                </div>
                {atLimit ? (
                    <button
                        disabled
                        className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 font-bold px-5 py-2.5 rounded-xl text-sm cursor-not-allowed border border-slate-200"
                    >
                        <Lock size={16} />
                        Limit Reached
                    </button>
                ) : (
                    <Link
                        href="/designer/projects/new"
                        className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-teal-200 transition-all text-sm"
                    >
                        <Plus size={16} />
                        New Project
                    </Link>
                )}
            </div>

            {/* Upgrade banner — shown when free user hits limit */}
            {atLimit && (
                <div className="bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Zap size={18} className="text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-extrabold text-indigo-900 text-sm">Free plan limit reached</p>
                            <p className="text-xs text-indigo-700 font-medium mt-0.5">
                                Upgrade to Enterprise for unlimited designer projects.
                            </p>
                        </div>
                    </div>
                    <div className="sm:ml-auto flex gap-2 flex-shrink-0">
                        <div className="text-center px-4 py-2 bg-white border border-indigo-200 rounded-xl">
                            <p className="text-xs font-bold text-indigo-900">$5<span className="text-indigo-500 font-medium">/mo</span></p>
                            <p className="text-[10px] text-indigo-600 font-medium">Monthly</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-indigo-600 text-white rounded-xl">
                            <p className="text-xs font-bold">$25</p>
                            <p className="text-[10px] font-medium opacity-80">Lifetime</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition cursor-pointer"
                >
                    {FILTERS.map((f) => (
                        <option key={f} value={f}>
                            {f === "ALL" ? "All Statuses" : statusConfig[f]?.label || f}
                        </option>
                    ))}
                </select>
            </div>

            {/* Project List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <FolderOpen size={28} className="text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-700 mb-1">
                        {search || filter !== "ALL" ? "No matching projects" : "No projects yet"}
                    </p>
                    <p className="text-slate-500 text-sm font-medium mb-4">
                        {search || filter !== "ALL" ? "Try adjusting your search or filter." : "Create your first design project to get started."}
                    </p>
                    {!search && filter === "ALL" && !atLimit && (
                        <Link href="/designer/projects/new" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-sm shadow-teal-200 transition-all">
                            <Plus size={14} />
                            New Project
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((p) => {
                        const cfg = statusConfig[p.status] || { label: p.status, color: "bg-slate-100 text-slate-600" };
                        return (
                            <Link key={p.id} href={`/designer/projects/${p.id}`}
                                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group">
                                <div className="flex-1 min-w-0">
                                    <div className="font-extrabold text-slate-900 truncate group-hover:text-teal-600 transition-colors">{p.name}</div>
                                    <div className="text-sm text-slate-500 font-medium truncate mt-0.5">{p.clientEmail}</div>
                                    {p.description && (
                                        <div className="text-xs text-slate-400 font-medium truncate mt-1">{p.description}</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                    <div className="hidden md:flex flex-col items-end text-xs text-slate-400 font-medium">
                                        <span>{p._count?.files ?? 0} file{p._count?.files !== 1 ? "s" : ""}</span>
                                        <span>{p._count?.comments ?? 0} comment{p._count?.comments !== 1 ? "s" : ""}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
