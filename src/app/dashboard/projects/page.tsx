"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Project {
    id: string;
    name: string;
    client: string;
    description: string | null;
    status: string;
    apiKey: string;
    createdAt: string;
}

export default function ProjectsListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetch("/api/projects")
            .then((res) => res.json())
            .then((data) => {
                setProjects(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredProjects = projects.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.client.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "ALL" || p.status === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 mt-12">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading projects...</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">Projects</h1>
                    <p className="text-sm sm:text-base text-slate-500 font-medium">Manage your client web app projects</p>
                </div>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-create-project"))}
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-sm shadow-teal-500/20 transition-all hover:shadow-teal-500/30 hover:-translate-y-0.5"
                >
                    + New Project
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-6">
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                    <input
                        type="text"
                        className="w-full lg:max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-sm shadow-sm"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                        {["ALL", "COMPLETED", "PENDING", "DEFAULTED"].map((status) => (
                            <button
                                key={status}
                                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm whitespace-nowrap ${filter === status
                                    ? "bg-slate-800 text-white shadow-slate-800/20"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                                onClick={() => setFilter(status)}
                            >
                                {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-slate-200">📁</div>
                        <p className="text-slate-500 font-medium mb-6">
                            {projects.length === 0
                                ? "No projects yet. Create your first project to get started."
                                : "No projects match your search or filter."}
                        </p>
                        {projects.length === 0 && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-create-project"))}
                                className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-teal-500/20 transition-all"
                            >
                                + Create Project
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80">
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Project</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Client</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">API Key</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Created</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-5 py-4 font-bold text-slate-900">{project.name}</td>
                                            <td className="px-5 py-4 font-medium text-slate-600">{project.client}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${project.status === "COMPLETED" ? "bg-teal-100 text-teal-800 border-teal-200" : project.status === "PENDING" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${project.status === "COMPLETED" ? "bg-teal-500" : project.status === "PENDING" ? "bg-amber-500" : "bg-red-500"}`} />
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <code className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md font-mono">{project.apiKey.substring(0, 8)}...</code>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-slate-500">{new Date(project.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 text-right">
                                                <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold py-1.5 px-3 rounded-lg text-sm transition-all shadow-sm">View</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden divide-y divide-slate-100">
                            {filteredProjects.map((project) => (
                                <div key={project.id} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="min-w-0">
                                            <div className="font-bold text-slate-900 truncate">{project.name}</div>
                                            <div className="text-sm text-slate-500 font-medium truncate">{project.client}</div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border flex-shrink-0 ${project.status === "COMPLETED" ? "bg-teal-100 text-teal-800 border-teal-200" : project.status === "PENDING" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${project.status === "COMPLETED" ? "bg-teal-500" : project.status === "PENDING" ? "bg-amber-500" : "bg-red-500"}`} />
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <code className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md font-mono">{project.apiKey.substring(0, 8)}…</code>
                                        <Link href={`/dashboard/projects/${project.id}`} className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">View →</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
