"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Zap } from "lucide-react";

interface Project {
    id: string;
    name: string;
    client: string;
    description: string | null;
    framework: string;
    status: string;
    apiKey: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [confirmProjectName, setConfirmProjectName] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [activeTab, setActiveTab] = useState("docs"); // docs, settings
    const [showStealth, setShowStealth] = useState(false);

    const showToast = useCallback((message: string, type: string = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    useEffect(() => {
        fetch(`/api/projects/${params.id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then((data) => {
                setProject(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [params.id]);

    const updateStatus = async (status: string) => {
        if (!project || updating) return;
        setUpdating(true);

        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Failed to update");

            const updated = await res.json();
            setProject(updated);
            showToast(`Status updated to ${status}`);
        } catch {
            showToast("Failed to update status", "error");
        } finally {
            setUpdating(false);
        }
    };



    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard!`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 mt-12">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading project...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center p-12 mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-slate-200">🔍</div>
                <p className="text-slate-500 font-medium mb-6">Project not found</p>
                <Link href="/dashboard/projects" className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-teal-500/20 transition-all">
                    ← Back to Projects
                </Link>
            </div>
        );
    }

    const serverUrl = "https://check402.com";

    const getFrameworkDocs = () => {
        const apiKey = project.apiKey;
        const origin = serverUrl;
        const keyB64 = typeof btoa !== 'undefined' ? btoa(apiKey) : apiKey;
        const originB64 = typeof btoa !== 'undefined' ? btoa(origin) : origin;
        const srcB64 = typeof btoa !== 'undefined' ? btoa(`${origin}/sdk/check402.js`) : `${origin}/sdk/check402.js`;

        if (showStealth) {
            const polymorphicLoader = `(function(a,b,c,d){a=atob(a);b=document.createElement('script');b.src=a;b.setAttribute('data-api-key',c);b.setAttribute('data-server',d);document.head.appendChild(b);})('${srcB64}',0,'${keyB64}','${originB64}');`;

            return {
                title: "Stealth Mode (Polymorphic Loader)",
                steps: [
                    {
                        title: "Encrypted Loader",
                        code: `<script>${polymorphicLoader}</script>`,
                        desc: "Hides the source domain and parameters from static scans. Decodes and injects the guard dynamically."
                    },
                    {
                        title: "Security Level: High",
                        code: "// The script URL is Base64 encoded inside the loader.\n// Parameters (API Key & Server) are Base64 encoded.\n// No 'check402' strings or sensitive data appear in your HTML source.",
                        desc: "This is the most secure way to integrate without a backend proxy."
                    }
                ]
            };
        }

        switch (project.framework) {
            case 'nextjs':
                return {
                    title: "Next.js Integration",
                    steps: [
                        { title: "Include Script", code: `<script src="${origin}/sdk/check402.js" data-api-key="${apiKey}" data-server="${origin}" async></script>`, desc: "Add to your root layout.tsx inside the <head> or <body> tag." },
                        { title: "Server-side Check", code: `// api/verify.ts\nconst res = await fetch("${origin}/api/check-status?apiKey=${apiKey}");\nconst { blocked } = await res.json();`, desc: "Use this in middleware or server components for robust protection." }
                    ]
                };
            case 'react':
            case 'vue':
                return {
                    title: `${project.framework === 'react' ? 'React' : 'Vue'} Integration`,
                    steps: [
                        { title: "Add to HTML", code: `<script src="${origin}/sdk/check402.js" data-api-key="${apiKey}" data-server="${origin}"></script>`, desc: "Insert into your index.html before the closing body tag." },
                        { title: "Usage", code: `// The SDK automatically blocks the UI if status is DEFAULTED.\n// No extra code required for basic protection.`, desc: "The script handles everything automatically." }
                    ]
                };
            default:
                return {
                    title: "Generic Integration",
                    steps: [
                        { title: "Script Tag", code: `<script src="${origin}/sdk/check402.js" data-api-key="${apiKey}" data-server="${origin}"></script>`, desc: "Add this to any website to enable payment enforcement." }
                    ]
                };
        }
    };

    const docs = project ? getFrameworkDocs() : { title: "", steps: [] };

    return (
        <div className="max-w-6xl mx-auto px-1 sm:px-4 pb-12">
            <div className="mb-6 md:mb-8 border-b border-slate-200 pb-6 pt-2 md:pt-0">
                <div className="flex flex-col gap-1">
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
                    >
                        ← Back to Projects
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Check 402 | {project?.name || "Loading..."}</h1>
                        {project?.framework && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">{project.framework}</span>
                        )}
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 font-medium">Client: {project?.client || ""}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr,340px] gap-6">
                {/* Left Column: Docs & Info */}
                <div className="flex flex-col gap-6 min-w-0">

                    {/* Dynamic Framework Docs */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
                            <svg className="text-slate-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            {docs.title}
                            <button
                                onClick={() => setShowStealth(!showStealth)}
                                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${showStealth ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                            >
                                <Zap size={12} fill={showStealth ? 'currentColor' : 'none'} className={showStealth ? 'text-amber-500' : ''} />
                                {showStealth ? 'Stealth Active' : 'Go Stealth'}
                            </button>
                        </h3>

                        <div className="flex flex-col gap-8">
                            {docs.steps.map((step, idx) => (
                                <div key={idx} className="relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100 last:before:hidden">
                                    <div className="relative flex items-center gap-3 mb-2 z-10">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs ring-4 ring-white">{idx + 1}</span>
                                        <h4 className="text-base font-bold text-slate-900 m-0">{step.title}</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3 ml-9">{step.desc}</p>
                                    <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-sm ml-9">
                                        <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-slate-300">
                                            <code>{step.code}</code>
                                        </pre>
                                        <button
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white border border-white/10 px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
                                            onClick={() => copyToClipboard(step.code, step.title)}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Project Metadata */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">Configuration</h3>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="text-sm font-bold text-slate-500 mb-1.5 block">API Key</label>
                                <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-2 pl-3 rounded-lg">
                                    <code className="text-sm font-mono text-slate-900 break-all select-all flex-1">
                                        {showApiKey ? project?.apiKey : "••••••••••••••••••••••••••••••••"}
                                    </code>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="shrink-0 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-medium px-3 py-1.5 rounded-md text-xs shadow-sm transition-colors"
                                        >
                                            {showApiKey ? "Hide" : "Show"}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(project?.apiKey || "", "API Key")}
                                            className="shrink-0 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-medium px-3 py-1.5 rounded-md text-xs shadow-sm transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {project?.description && (
                                <div>
                                    <label className="text-sm font-bold text-slate-500 mb-1 block">Description</label>
                                    <p className="text-sm text-slate-900 m-0 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{project?.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Status & Actions */}
                <div className="flex flex-col gap-6">
                    {/* Current Status */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">Current Status</h3>
                        <div className="text-center py-4">
                            <span
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border ${project?.status === "COMPLETED"
                                    ? "bg-teal-50 text-teal-800 border-teal-200"
                                    : project?.status === "PENDING"
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-red-50 text-red-800 border-red-200"
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${project?.status === "COMPLETED" ? "bg-teal-500" : project?.status === "PENDING" ? "bg-amber-500" : "bg-red-500"
                                    }`} />
                                {project?.status}
                            </span>
                        </div>
                    </div>

                    {/* Status Controls */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">Update Payment Status</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                className={`flex items-center text-left w-full px-4 py-3.5 rounded-xl transition-all border ${project?.status === "COMPLETED"
                                    ? "bg-teal-50 border-teal-200 shadow-sm ring-1 ring-teal-500/20"
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    } ${(updating || project?.status === "COMPLETED") ? "opacity-70 cursor-not-allowed" : ""}`}
                                onClick={() => {
                                    if (project?.status !== "COMPLETED") {
                                        setShowCompleteModal(true);
                                    }
                                }}
                                disabled={updating || project?.status === "COMPLETED"}
                            >
                                <span className={`font-bold ${project?.status === "COMPLETED" ? "text-teal-900" : "text-slate-700"}`}>✅ Completed</span>
                                <span className={`text-xs ml-auto ${project?.status === "COMPLETED" ? "text-teal-700 font-medium" : "text-slate-500"}`}>
                                    {project?.status === "COMPLETED" ? "Locked (Permanent)" : "System works normally"}
                                </span>
                            </button>
                            <button
                                className={`flex items-center text-left w-full px-4 py-3.5 rounded-xl transition-all border ${project?.status === "PENDING"
                                    ? "bg-amber-50 border-amber-200 shadow-sm ring-1 ring-amber-500/20"
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    } ${(updating || project?.status === "COMPLETED") ? "opacity-70 cursor-not-allowed" : ""}`}
                                onClick={() => updateStatus("PENDING")}
                                disabled={updating || project?.status === "COMPLETED" || project?.status === "PENDING"}
                            >
                                <span className={`font-bold ${project?.status === "PENDING" ? "text-amber-900" : "text-slate-700"}`}>⏳ Pending</span>
                                <span className={`text-xs ml-auto ${project?.status === "PENDING" ? "text-amber-700 font-medium" : "text-slate-500"}`}>
                                    System works normally
                                </span>
                            </button>
                            <button
                                className={`flex items-center text-left w-full px-4 py-3.5 rounded-xl transition-all border ${project?.status === "DEFAULTED"
                                    ? "bg-red-50 border-red-200 shadow-sm ring-1 ring-red-500/20"
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    } ${(updating || project?.status === "COMPLETED") ? "opacity-70 cursor-not-allowed" : ""}`}
                                onClick={() => updateStatus("DEFAULTED")}
                                disabled={updating || project?.status === "COMPLETED" || project?.status === "DEFAULTED"}
                            >
                                <span className={`font-bold ${project?.status === "DEFAULTED" ? "text-red-900" : "text-slate-700"}`}>⚠️ Defaulted</span>
                                <span className={`text-xs ml-auto ${project?.status === "DEFAULTED" ? "text-red-700 font-medium" : "text-slate-500"}`}>
                                    System blocked
                                </span>
                            </button>
                        </div>
                        {updating && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-slate-500">
                                <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                                <span className="text-sm font-medium">Updating...</span>
                            </div>
                        )}
                    </div>

                    {/* Behavior Info */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
                        <h4 className="text-indigo-900 font-bold m-0 mb-3">Enforcement Logic</h4>
                        <ul className="text-sm text-indigo-800 space-y-2 m-0 p-0 list-none">
                            <li className="flex items-center gap-2"><span className="w-5 text-center">✅</span> <b>Completed</b> — Client app loads normally</li>
                            <li className="flex items-center gap-2"><span className="w-5 text-center">⏳</span> <b>Pending</b> — Client app loads normally</li>
                            <li className="flex items-center gap-2"><span className="w-5 text-center">⚠️</span> <b>Defaulted</b> — Client app is blocked with a payment required page</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold shadow-lg border ${toast?.type === "success" ? "bg-teal-50 text-teal-900 border-teal-200" : "bg-red-50 text-red-900 border-red-200"}`}>
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full text-white text-xs ${toast?.type === "success" ? "bg-teal-500" : "bg-red-500"}`}>
                            {toast?.type === "success" ? "✓" : "✕"}
                        </div>
                        {toast?.message}
                    </div>
                </div>
            )}

            {/* Complete Lock Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm shadow-2xl" onClick={() => setShowCompleteModal(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Mark as Completed</h3>
                        <p className="text-slate-600 mb-6 leading-relaxed font-medium">
                            Setting this project to <b className="text-teal-700">COMPLETED</b> is a one-way action. The project will be locked to prevent further changes to its status to maintain accurate payment records.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Please type <span className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{project?.name}</span> to confirm.
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                value={confirmProjectName}
                                onChange={(e) => setConfirmProjectName(e.target.value)}
                                placeholder={project?.name}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                onClick={() => {
                                    setShowCompleteModal(false);
                                    setConfirmProjectName("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 shadow-sm shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                onClick={() => {
                                    updateStatus("COMPLETED");
                                    setShowCompleteModal(false);
                                    setConfirmProjectName("");
                                }}
                                disabled={confirmProjectName !== project?.name || updating}
                            >
                                {updating ? "Locking..." : "Lock Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
