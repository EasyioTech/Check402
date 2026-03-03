"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Script from "next/script";
import { Folder, Rocket, CheckCircle2, Clock, AlertTriangle, Plus, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Project {
    id: string;
    name: string;
    client: string;
    status: string;
    apiKey: string;
    createdAt: string;
}

export default function DashboardOverview() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await fetch("/api/projects");
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    setProjects(data);
                } else {
                    console.error("Non-JSON response received", res.status);
                    const text = await res.text();
                    console.error("Response body:", text);
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            } finally {
                setLoading(false);
            }
        };
        loadProjects();
    }, []);

    const stats = {
        total: projects.length,
        completed: projects.filter((p) => p.status === "COMPLETED").length,
        pending: projects.filter((p) => p.status === "PENDING").length,
        defaulted: projects.filter((p) => p.status === "DEFAULTED").length,
    };

    const recentProjects = projects.slice(0, 5);

    const handleUpgrade = async () => {
        setUpgradeLoading(true);
        try {
            const res = await fetch("/api/checkout", { method: "POST" });

            if (!res.ok) {
                let errorMessage = "Failed to initiate checkout";
                try {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const data = await res.json();
                        errorMessage = data.error || errorMessage;
                    } else {
                        const text = await res.text();
                        errorMessage = text || errorMessage;
                    }
                } catch (e) {
                    // Ignore parse error, use default
                }
                alert(errorMessage);
                setUpgradeLoading(false);
                return;
            }

            const data = await res.json();
            if (data.id) {
                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: "402check",
                    description: "Enterprise Plan Upgrade",
                    order_id: data.id,
                    handler: function (response: any) {
                        alert("Upgrade successful! Refreshing...");
                        window.location.reload();
                    },
                    prefill: {
                        name: session?.user?.name || "",
                        email: session?.user?.email || "",
                    },
                    theme: {
                        color: "#14b8a6", // Tailwind teal-500
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
            setUpgradeLoading(false);
        } catch (error) {
            console.error("Upgrade error", error);
            alert("Something went wrong");
            setUpgradeLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4" />
                <p className="font-medium text-sm">Loading dashboard...</p>
            </div>
        );
    }

    const isDeveloper = session?.user?.plan === "DEVELOPER" && session?.user?.role !== "ADMIN";
    const projectLimitReached = isDeveloper && projects.length >= 2;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard overview</h1>
                    <p className="text-slate-500 font-medium mt-1">Monitor your client payment statuses at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isDeveloper && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg shadow-sm">
                            <div className="text-sm font-semibold text-slate-500">
                                <span className={projectLimitReached ? "text-red-500" : "text-slate-900"}>{projects.length}</span> / 2 Projects
                            </div>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-upgrade-modal"))}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md shadow-sm transition-all shadow-slate-900/10"
                            >
                                <Rocket size={14} />
                                Upgrade to unlock ($5)
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            if (projectLimitReached) {
                                window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
                            } else {
                                window.dispatchEvent(new CustomEvent("open-create-project"));
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-teal-500/20 transition-all hover:shadow-teal-500/30 hover:-translate-y-0.5"
                    >
                        <Plus size={16} />
                        New Project
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 border border-slate-200">
                        <Folder size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{stats.total}</div>
                        <div className="text-sm font-semibold text-slate-500">Total Projects</div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0 border border-teal-100">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{stats.completed}</div>
                        <div className="text-sm font-semibold text-slate-500">Completed (Paid)</div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 border border-amber-100">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{stats.pending}</div>
                        <div className="text-sm font-semibold text-slate-500">Pending</div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0 border border-red-100">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{stats.defaulted}</div>
                        <div className="text-sm font-semibold text-slate-500">Defaulted (Blocked)</div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Projects Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Recent Projects</h3>
                    <Link
                        href="/dashboard/projects"
                        className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                    >
                        View all <ChevronRight size={16} />
                    </Link>
                </div>

                {recentProjects.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-400 mb-4">
                            <Folder size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">No projects yet</h4>
                        <p className="text-slate-500 font-medium mb-6 max-w-sm">Create your first client project to generate an API key and start securing payments.</p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-create-project"))}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
                        >
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/dashboard/projects/${project.id}`}
                                                className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors flex items-center gap-2"
                                            >
                                                {project.name}
                                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-teal-500" />
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                            {project.client}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${project.status === "COMPLETED"
                                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                                    : project.status === "PENDING"
                                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : "bg-red-50 text-red-700 border-red-200"
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === "COMPLETED" ? "bg-teal-500" :
                                                    project.status === "PENDING" ? "bg-amber-500" : "bg-red-500"
                                                    }`} />
                                                {project.status.toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                                            {new Date(project.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

        </div>
    );
}
