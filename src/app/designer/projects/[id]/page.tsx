"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Copy, Check, FileImage, FileText, Film,
    Trash2, MessageSquare, Loader2, ExternalLink, Upload
} from "lucide-react";
import DesignFileUpload from "@/components/DesignFileUpload";

type DesignFile = {
    id: string;
    fileName: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
    version: number;
    previewKey: string | null;
    originalKey: string;
    createdAt: string;
    previewUrl?: string;
};

type DesignComment = {
    id: string;
    clientEmail: string;
    message: string;
    isApproval: boolean;
    createdAt: string;
};

type DesignProject = {
    id: string;
    name: string;
    clientEmail: string;
    description: string | null;
    status: string;
    previewToken: string;
    createdAt: string;
    updatedAt: string;
    files: DesignFile[];
    comments: DesignComment[];
};

const statusConfig: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Draft", color: "bg-slate-100 text-slate-600" },
    IN_REVIEW: { label: "Sent for Review", color: "bg-blue-50 text-blue-600" },
    CHANGES_REQUESTED: { label: "Changes Requested", color: "bg-amber-50 text-amber-700" },
    APPROVED: { label: "Approved", color: "bg-teal-50 text-teal-700" },
    COMPLETED: { label: "Completed", color: "bg-green-50 text-green-700" },
};

// Status transitions: what button a designer can press and what it changes to
const statusTransitions: Record<string, { label: string; next: string; style: string }> = {
    DRAFT: { label: "Send for Review →", next: "IN_REVIEW", style: "bg-blue-500 hover:bg-blue-600 text-white" },
    IN_REVIEW: { label: "Mark Changes Requested", next: "CHANGES_REQUESTED", style: "bg-amber-500 hover:bg-amber-600 text-white" },
    CHANGES_REQUESTED: { label: "Re-send for Review →", next: "IN_REVIEW", style: "bg-blue-500 hover:bg-blue-600 text-white" },
    APPROVED: { label: "Mark as Complete & Purge Files →", next: "COMPLETED", style: "bg-red-500 hover:bg-red-600 text-white" },
};

function fileIcon(fileType: string) {
    if (fileType === "video") return <Film size={20} className="text-purple-400" />;
    if (fileType === "pdf") return <FileText size={20} className="text-red-400" />;
    return <FileImage size={20} className="text-teal-400" />;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DesignProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [project, setProject] = useState<DesignProject | null>(null);
    const [files, setFiles] = useState<DesignFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [completionConfirm, setCompletionConfirm] = useState(false);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);
    const [completionResult, setCompletionResult] = useState<{ purgedCount: number; completedAt: string } | null>(null);

    const fetchProject = useCallback(async () => {
        try {
            const res = await fetch(`/api/design-projects/${id}`);
            if (!res.ok) {
                if (res.status === 404) { router.push("/designer/projects"); return; }
                throw new Error("Failed to load project");
            }
            const data = await res.json();
            setProject(data);
        } catch {
            setError("Failed to load project.");
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    const refreshFiles = useCallback(async () => {
        try {
            const res = await fetch(`/api/design-projects/${id}/files`);
            if (res.ok) {
                const data = await res.json();
                setFiles(Array.isArray(data) ? data : []);
            }
        } catch { }
    }, [id]);

    useEffect(() => {
        fetchProject();
        refreshFiles();
    }, [fetchProject, refreshFiles]);

    const previewUrl = project
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/preview/${project.previewToken}`
        : "";

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(previewUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStatusChange = async (nextStatus: string) => {
        if (nextStatus === "COMPLETED") {
            setCompletionConfirm(true);
            return;
        }
        setStatusLoading(true);
        try {
            const res = await fetch(`/api/design-projects/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            if (!res.ok) throw new Error("Update failed");
            await fetchProject();
        } catch { }
        setStatusLoading(false);
    };

    const handleComplete = async () => {
        setStatusLoading(true);
        try {
            const res = await fetch(`/api/design-projects/${id}/complete`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Completion failed");
            setCompletionResult({ purgedCount: data.purgedCount, completedAt: data.completedAt });
            await fetchProject();
        } catch { }
        setCompletionConfirm(false);
        setStatusLoading(false);
    };

    const handleDeleteProject = async () => {
        try {
            await fetch(`/api/design-projects/${id}`, { method: "DELETE" });
            router.push("/designer/projects");
        } catch { }
    };

    const handleDeleteFile = async (fileId: string) => {
        setDeletingFile(fileId);
        try {
            await fetch(`/api/design-projects/${id}/files/${fileId}`, { method: "DELETE" });
            await refreshFiles();
        } catch { }
        setDeletingFile(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="text-center py-24">
                <p className="text-slate-500 font-medium">{error || "Project not found."}</p>
                <Link href="/designer/projects" className="mt-4 inline-block font-bold text-teal-600 hover:text-teal-700">← Back to projects</Link>
            </div>
        );
    }

    // Completed project view
    if (project.status === "COMPLETED") {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center mb-5 border border-teal-200">
                    <Check size={36} className="text-teal-500" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Project Completed</h1>
                <p className="text-slate-700 font-bold mb-1">{project.name}</p>
                {completionResult ? (
                    <>
                        <p className="text-slate-500 text-sm font-medium mb-1">
                            {completionResult.purgedCount} file{completionResult.purgedCount !== 1 ? "s" : ""} permanently deleted from our servers.
                        </p>
                        <p className="text-slate-400 text-xs font-medium mb-8">
                            Completed at {new Date(completionResult.completedAt).toLocaleString()}
                        </p>
                    </>
                ) : (
                    <p className="text-slate-500 text-sm font-medium mb-8">All files have been purged from our servers.</p>
                )}
                <Link href="/designer/projects" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-teal-200 transition-all text-sm">
                    ← Back to Projects
                </Link>
            </div>
        );
    }

    const statusCfg = statusConfig[project.status] || { label: project.status, color: "bg-slate-100 text-slate-600" };
    const transition = statusTransitions[project.status];

    return (
        <div>
            {/* Back */}
            <Link href="/designer/projects" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft size={16} />
                Back to Projects
            </Link>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">{project.name}</h1>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.color}`}>{statusCfg.label}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{project.clientEmail}</p>
                        {project.description && (
                            <p className="text-sm text-slate-400 font-medium mt-2">{project.description}</p>
                        )}
                    </div>

                    {/* Share Button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleCopyLink}
                            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
                        >
                            {copied ? <><Check size={14} className="text-teal-500" />Copied!</> : <><Copy size={14} />Copy Preview Link</>}
                        </button>
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-teal-600 transition-all shadow-sm">
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>


            </div>

            {/* Completion Confirm Modal */}
            {completionConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-extrabold text-slate-900 mb-2">Permanently delete all project files?</h2>
                        <p className="text-sm text-slate-600 font-medium mb-6">
                            This will permanently delete all {files.length} file{files.length !== 1 ? "s" : ""} from our servers.
                            This action <strong>cannot be undone</strong>. Only do this after you have delivered the final designs to your client.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setCompletionConfirm(false)} className="flex-1 py-2.5 font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm">
                                Cancel
                            </button>
                            <button onClick={handleComplete} disabled={statusLoading} className="flex-1 py-2.5 font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                {statusLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                Confirm & Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-extrabold text-slate-900 mb-2">Delete this project?</h2>
                        <p className="text-sm text-slate-600 font-medium mb-6">
                            This will permanently delete &ldquo;{project.name}&rdquo; and all its data. Any uploaded R2 files should be purged first using the completion flow.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm">
                                Cancel
                            </button>
                            <button onClick={handleDeleteProject} className="flex-1 py-2.5 font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm transition-all text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Files Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="font-extrabold text-slate-900">Files</h2>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{files.length} / 20</span>
                        </div>

                        {files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center pt-6 pb-2 text-center px-4">
                                <FileImage size={28} className="text-slate-300 mb-2" />
                                <p className="text-slate-500 font-bold text-sm mb-0.5">No files uploaded yet</p>
                                <p className="text-slate-400 text-xs font-medium mb-4">Drag and drop or click below to upload.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {files.map((file) => (
                                    <div key={file.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                                        {/* Thumbnail if preview available, otherwise icon */}
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {file.previewUrl ? (
                                                <img src={file.previewUrl} alt={file.fileName} className="w-full h-full object-cover" />
                                            ) : (
                                                fileIcon(file.fileType)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-slate-900 truncate">{file.fileName}</div>
                                            <div className="text-xs font-medium text-slate-400 mt-0.5">
                                                v{file.version} · {formatBytes(file.fileSize)} · {file.fileType.toUpperCase()}
                                                {!file.previewKey && file.fileType !== "video" && (
                                                    <span className="ml-1 text-amber-500">(preview unavailable)</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFile(file.id)}
                                            disabled={deletingFile === file.id}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {deletingFile === file.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Live upload component */}
                        {files.length < 20 && project.status !== "COMPLETED" && (
                            <div className="px-6 py-4 border-t border-slate-100">
                                <DesignFileUpload
                                    projectId={id}
                                    existingFileCount={files.length}
                                    onUploadComplete={refreshFiles}
                                />
                            </div>
                        )}
                    </div>

                    {/* Version Control Timeline */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="font-extrabold text-slate-900">Version History</h2>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                                {files.length} upload{files.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                                <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-2">
                                    <Upload size={14} className="text-slate-300" />
                                </div>
                                <p className="text-slate-400 text-xs font-medium">No uploads yet.<br />Files will appear here once uploaded.</p>
                            </div>
                        ) : (
                            <div className="px-6 py-4">
                                {/* Group files by version number */}
                                {(() => {
                                    const grouped = files.reduce<Record<number, typeof files>>((acc, f) => {
                                        (acc[f.version] = acc[f.version] || []).push(f);
                                        return acc;
                                    }, {});
                                    const versions = Object.keys(grouped)
                                        .map(Number)
                                        .sort((a, b) => b - a); // newest first
                                    return versions.map((ver, vIdx) => (
                                        <div key={ver} className="relative">
                                            {/* Connector line */}
                                            {vIdx < versions.length - 1 && (
                                                <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-100" />
                                            )}
                                            <div className="flex gap-4 mb-5">
                                                {/* Version dot */}
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs z-10 border-2 ${ver === Math.max(...versions)
                                                    ? "bg-teal-500 border-teal-500 text-white"
                                                    : "bg-white border-slate-200 text-slate-600"
                                                    }`}>
                                                    v{ver}
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-xs font-extrabold ${ver === Math.max(...versions) ? "text-teal-700" : "text-slate-700"
                                                            }`}>
                                                            Version {ver}
                                                        </span>
                                                        {ver === Math.max(...versions) && (
                                                            <span className="text-[10px] font-bold bg-teal-50 text-teal-600 border border-teal-100 px-1.5 py-0.5 rounded-full">Latest</span>
                                                        )}
                                                        <span className="text-[10px] text-slate-400 font-medium ml-auto">
                                                            {new Date(grouped[ver][0].createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {grouped[ver].map((f) => (
                                                            <div key={f.id} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                                                                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                    {f.previewUrl
                                                                        ? <img src={f.previewUrl} alt={f.fileName} className="w-full h-full object-cover rounded-lg" />
                                                                        : fileIcon(f.fileType)
                                                                    }
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-xs font-bold text-slate-800 truncate">{f.fileName}</div>
                                                                    <div className="text-[10px] text-slate-400 font-medium">{formatBytes(f.fileSize)} · {f.fileType.toUpperCase()}</div>
                                                                </div>
                                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.previewKey ? "bg-teal-400" : "bg-slate-300"
                                                                    }`} title={f.previewKey ? "Preview ready" : "No preview"} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Client Feedback */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="font-extrabold text-slate-900">Client Feedback</h2>
                            <div className="flex items-center gap-2">
                                {project.comments.some(c => c.isApproval) && (
                                    <span className="text-[10px] font-bold bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full">✓ Approved</span>
                                )}
                                <MessageSquare size={16} className="text-slate-400" />
                            </div>
                        </div>

                        {project.comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                                <MessageSquare size={24} className="text-slate-300 mb-2" />
                                <p className="text-slate-400 text-xs font-medium">No feedback yet.<br />Share the preview link with your client to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {project.comments.slice().reverse().map((c) => (
                                    <div key={c.id} className={`px-6 py-4 ${c.isApproval ? "bg-teal-50/50" : ""
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                {c.clientEmail.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 truncate">{c.clientEmail}</span>
                                            <span className="text-[10px] text-slate-400 font-medium ml-auto flex-shrink-0">
                                                {new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                                {" "}{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed ml-8">{c.message}</p>
                                        {c.isApproval && (
                                            <div className="ml-8 mt-1.5">
                                                <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">✓ Design Approved</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    {/* Status Control Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="font-extrabold text-slate-900 text-sm">Update Project Status</h2>
                            {statusLoading && <Loader2 size={14} className="animate-spin text-teal-500" />}
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                            {/* DRAFT */}
                            <button
                                onClick={() => project.status !== "DRAFT" && handleStatusChange("DRAFT")}
                                disabled={statusLoading || project.status === "DRAFT" || project.status === "COMPLETED"}
                                className={`flex items-center text-left w-full px-4 py-3 rounded-xl transition-all border text-sm ${project.status === "DRAFT"
                                    ? "bg-slate-50 border-slate-300 ring-1 ring-slate-400/20 cursor-default"
                                    : project.status === "COMPLETED"
                                        ? "opacity-40 cursor-not-allowed bg-white border-slate-100"
                                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                                    }`}
                            >
                                <span className={`font-bold ${project.status === "DRAFT" ? "text-slate-800" : "text-slate-500"}`}>✏️ Draft</span>
                                <span className={`text-xs ml-auto ${project.status === "DRAFT" ? "text-slate-600 font-semibold" : "text-slate-400"}`}>
                                    {project.status === "DRAFT" ? "Current" : "Work in progress"}
                                </span>
                            </button>

                            {/* IN_REVIEW */}
                            <button
                                onClick={() => project.status !== "IN_REVIEW" && project.status !== "COMPLETED" && handleStatusChange("IN_REVIEW")}
                                disabled={statusLoading || project.status === "IN_REVIEW" || project.status === "COMPLETED"}
                                className={`flex items-center text-left w-full px-4 py-3 rounded-xl transition-all border text-sm ${project.status === "IN_REVIEW"
                                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-500/20 cursor-default"
                                    : project.status === "COMPLETED"
                                        ? "opacity-40 cursor-not-allowed bg-white border-slate-100"
                                        : "bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer"
                                    }`}
                            >
                                <span className={`font-bold ${project.status === "IN_REVIEW" ? "text-blue-900" : "text-slate-500"}`}>🔍 In Review</span>
                                <span className={`text-xs ml-auto ${project.status === "IN_REVIEW" ? "text-blue-700 font-semibold" : "text-slate-400"}`}>
                                    {project.status === "IN_REVIEW" ? "Sent to client" : "Awaiting approval"}
                                </span>
                            </button>

                            {/* CHANGES_REQUESTED */}
                            <button
                                onClick={() => project.status !== "CHANGES_REQUESTED" && project.status !== "COMPLETED" && handleStatusChange("CHANGES_REQUESTED")}
                                disabled={statusLoading || project.status === "CHANGES_REQUESTED" || project.status === "COMPLETED"}
                                className={`flex items-center text-left w-full px-4 py-3 rounded-xl transition-all border text-sm ${project.status === "CHANGES_REQUESTED"
                                    ? "bg-amber-50 border-amber-200 ring-1 ring-amber-500/20 cursor-default"
                                    : project.status === "COMPLETED"
                                        ? "opacity-40 cursor-not-allowed bg-white border-slate-100"
                                        : "bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/50 cursor-pointer"
                                    }`}
                            >
                                <span className={`font-bold ${project.status === "CHANGES_REQUESTED" ? "text-amber-900" : "text-slate-500"}`}>🔄 Changes Requested</span>
                                <span className={`text-xs ml-auto ${project.status === "CHANGES_REQUESTED" ? "text-amber-700 font-semibold" : "text-slate-400"}`}>
                                    {project.status === "CHANGES_REQUESTED" ? "Revision needed" : "Client revision"}
                                </span>
                            </button>

                            {/* APPROVED */}
                            <button
                                onClick={() => project.status !== "APPROVED" && project.status !== "COMPLETED" && handleStatusChange("APPROVED")}
                                disabled={statusLoading || project.status === "APPROVED" || project.status === "COMPLETED"}
                                className={`flex items-center text-left w-full px-4 py-3 rounded-xl transition-all border text-sm ${project.status === "APPROVED"
                                    ? "bg-teal-50 border-teal-200 ring-1 ring-teal-500/20 cursor-default"
                                    : project.status === "COMPLETED"
                                        ? "opacity-40 cursor-not-allowed bg-white border-slate-100"
                                        : "bg-white border-slate-200 hover:border-teal-200 hover:bg-teal-50/50 cursor-pointer"
                                    }`}
                            >
                                <span className={`font-bold ${project.status === "APPROVED" ? "text-teal-900" : "text-slate-500"}`}>✅ Approved</span>
                                <span className={`text-xs ml-auto ${project.status === "APPROVED" ? "text-teal-700 font-semibold" : "text-slate-400"}`}>
                                    {project.status === "APPROVED" ? "Payment confirmed" : "Ready to complete"}
                                </span>
                            </button>

                            {/* COMPLETED — purge trigger */}
                            <button
                                onClick={() => {
                                    if (project.status === "APPROVED") setCompletionConfirm(true);
                                }}
                                disabled={statusLoading || project.status !== "APPROVED"}
                                className={`flex items-center text-left w-full px-4 py-3 rounded-xl transition-all border text-sm ${project.status === "COMPLETED"
                                    ? "bg-green-50 border-green-200 ring-1 ring-green-500/20 cursor-default opacity-80"
                                    : project.status === "APPROVED"
                                        ? "bg-white border-red-200 hover:border-red-300 hover:bg-red-50/50 cursor-pointer"
                                        : "opacity-40 cursor-not-allowed bg-white border-slate-100"
                                    }`}
                            >
                                <span className={`font-bold ${project.status === "COMPLETED" ? "text-green-900" :
                                    project.status === "APPROVED" ? "text-red-700" : "text-slate-500"
                                    }`}>🗑️ Complete &amp; Purge</span>
                                <span className={`text-xs ml-auto ${project.status === "COMPLETED" ? "text-green-700 font-semibold" :
                                    project.status === "APPROVED" ? "text-red-500 font-semibold" : "text-slate-400"
                                    }`}>
                                    {project.status === "COMPLETED" ? "Locked" : project.status === "APPROVED" ? "Deletes all files" : "Requires Approved"}
                                </span>
                            </button>
                        </div>

                        {/* Enforcement Info */}
                        <div className="mx-4 mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                            <h4 className="text-indigo-900 font-bold text-xs mb-2">Status Logic</h4>
                            <ul className="text-xs text-indigo-800 space-y-1.5">
                                <li className="flex items-start gap-1.5"><span>✏️</span><span><b>Draft</b> — Files visible to you only</span></li>
                                <li className="flex items-start gap-1.5"><span>🔍</span><span><b>In Review</b> — Watermarked previews shared with client</span></li>
                                <li className="flex items-start gap-1.5"><span>🔄</span><span><b>Changes Requested</b> — Client has requested revisions</span></li>
                                <li className="flex items-start gap-1.5"><span>✅</span><span><b>Approved</b> — Client approved, awaiting payment</span></li>
                                <li className="flex items-start gap-1.5"><span>🗑️</span><span><b>Complete &amp; Purge</b> — Deletes all files from servers permanently</span></li>
                            </ul>
                        </div>

                        {/* Auto-purge notice — shown when project is APPROVED */}
                        {project.status === "APPROVED" && (
                            <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-amber-500 text-base mt-0.5">⏳</span>
                                    <div>
                                        <p className="text-amber-900 font-extrabold text-xs mb-1">Auto-Purge Scheduled</p>
                                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                            This project is <b>Approved</b>. All uploaded files will be permanently deleted from our servers <b>24 hours after approval</b> unless you complete it manually first.
                                        </p>
                                        {(project as unknown as { approvedAt?: string }).approvedAt && (
                                            <p className="text-xs text-amber-600 font-bold mt-1.5">
                                                Auto-purge at:{" "}
                                                {new Date(
                                                    new Date((project as unknown as { approvedAt: string }).approvedAt).getTime() + 24 * 60 * 60 * 1000
                                                ).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview link card */}
                    <div className="bg-slate-900 rounded-2xl p-5 text-white">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Client Preview Link</p>
                        <p className="text-xs font-mono text-slate-300 break-all mb-4 leading-relaxed">{previewUrl}</p>
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-400 font-bold text-white rounded-xl text-sm transition-all"
                        >
                            {copied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Copy Link</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
