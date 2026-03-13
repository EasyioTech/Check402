"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, CheckCircle, Clock, Eye, ArrowRight } from "lucide-react";

type DesignProject = {
    id: string;
    name: string;
    clientEmail: string;
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

export default function DesignerOverview() {
    const router = useRouter();
    const [projects, setProjects] = useState<DesignProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/design-projects")
            .then((r) => r.json())
            .then((data) => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const total = projects.length;
    const inReview = projects.filter((p) => p.status === "IN_REVIEW").length;
    const approved = projects.filter((p) => p.status === "APPROVED").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;

    const stats = [
        { label: "Total Projects", value: total, icon: <FolderOpen size={22} />, color: "text-slate-600", bg: "bg-slate-100" },
        { label: "In Review", value: inReview, icon: <Eye size={22} />, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Approved", value: approved, icon: <CheckCircle size={22} />, color: "text-teal-600", bg: "bg-teal-50" },
        { label: "Completed", value: completed, icon: <Clock size={22} />, color: "text-green-600", bg: "bg-green-50" },
    ];

    const recent = projects.slice(0, 5);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Designer Studio</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your design projects and client previews.</p>
                </div>
                <Link
                    href="/designer/projects/new"
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-teal-200 transition-all text-sm"
                >
                    <Plus size={16} />
                    New Project
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>
                            {s.icon}
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900">{loading ? "—" : s.value}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="font-extrabold text-slate-900">Recent Projects</h2>
                    <Link href="/designer/projects" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                        View all <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : recent.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <FolderOpen size={28} className="text-slate-400" />
                        </div>
                        <p className="text-slate-700 font-bold mb-1">No projects yet</p>
                        <p className="text-slate-500 text-sm font-medium mb-4">Create your first design project to get started.</p>
                        <Link href="/designer/projects/new" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-sm shadow-teal-200 transition-all">
                            <Plus size={14} />
                            New Project
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recent.map((p) => {
                            const cfg = statusConfig[p.status] || { label: p.status, color: "bg-slate-100 text-slate-600" };
                            return (
                                <Link key={p.id} href={`/designer/projects/${p.id}`}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">{p.name}</div>
                                        <div className="text-sm font-medium text-slate-500 truncate">{p.clientEmail}</div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
