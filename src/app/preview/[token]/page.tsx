"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, Film, CheckCircle2, Loader2, MessageSquare, Send, ThumbsUp } from "lucide-react";

type PreviewFile = {
    id: string;
    fileName: string;
    fileType: string;
    version: number;
    previewUrl: string | null;
};

type Comment = {
    id: string;
    clientEmail: string;
    message: string;
    isApproval: boolean;
    createdAt: string;
};

type PreviewProject = {
    id: string;
    name: string;
    clientEmail: string;
    status: string;
    description: string | null;
};

type PreviewData = {
    project: PreviewProject;
    files: PreviewFile[];
    comments: Comment[];
};

const statusLabel: Record<string, string> = {
    DRAFT: "Draft",
    IN_REVIEW: "Awaiting Review",
    CHANGES_REQUESTED: "Changes Requested",
    APPROVED: "Approved ✓",
    COMPLETED: "Completed",
};

const statusColor: Record<string, string> = {
    DRAFT: "text-slate-400 bg-slate-800",
    IN_REVIEW: "text-blue-300 bg-blue-900/50",
    CHANGES_REQUESTED: "text-amber-300 bg-amber-900/40",
    APPROVED: "text-teal-300 bg-teal-900/50",
    COMPLETED: "text-green-300 bg-green-900/50",
};

function FilePlaceholder({ fileType, fileName }: { fileType: string; fileName: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 bg-slate-800 rounded-xl border border-slate-700 aspect-[4/3] px-4 text-center">
            {fileType === "video" ? (
                <Film size={36} className="text-purple-400" />
            ) : (
                <FileText size={36} className="text-red-400" />
            )}
            <div className="text-xs font-bold text-slate-300 truncate max-w-full">{fileName}</div>
            <div className="text-xs text-slate-500 font-medium">
                {fileType === "video" ? "Video preview unavailable" : "PDF preview unavailable"}
            </div>
        </div>
    );
}

export default function PreviewPage() {
    const { token } = useParams<{ token: string }>();
    const [data, setData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/preview/${token}`);
            if (res.status === 404) { setNotFound(true); setLoading(false); return; }
            if (!res.ok) throw new Error("Failed to load");
            const json = await res.json();
            setData(json);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const submitComment = async (isApproval: boolean) => {
        if (!email.trim() || !message.trim()) {
            setSubmitError("Email and message are required.");
            return;
        }
        setSubmitting(true);
        setSubmitError("");
        try {
            const res = await fetch(`/api/design-projects/${data!.project.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientEmail: email.trim(), message: message.trim(), isApproval }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to submit");
            setMessage("");
            await fetchData(); // refresh comments + status
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not found / completed
    if (notFound || !data) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-5">
                    <FileText size={28} className="text-slate-500" />
                </div>
                <h1 className="text-2xl font-extrabold text-white mb-2">Preview Not Available</h1>
                <p className="text-slate-400 font-medium text-sm max-w-sm mb-6">
                    This preview link is no longer active. The project may have been completed or the link may be invalid.
                </p>
                <Link href="/" className="text-teal-400 hover:text-teal-300 font-bold text-sm transition-colors">
                    ← Return to Check 402
                </Link>
            </div>
        );
    }

    const { project, files, comments } = data;
    const isApproved = project.status === "APPROVED" || project.status === "COMPLETED";
    const statusCfg = statusColor[project.status] || "text-slate-400 bg-slate-800";

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-400/30">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-lg font-extrabold tracking-tight">
                            <span className="text-teal-400">Check</span>
                            <span className="text-white">402</span>
                        </span>
                    </Link>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusCfg}`}>
                        {statusLabel[project.status] || project.status}
                    </span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">

                {/* Project Info */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">{project.name}</h1>
                    {project.description && (
                        <p className="text-slate-400 font-medium text-sm mb-2">{project.description}</p>
                    )}
                    <p className="text-slate-500 text-sm font-medium">Prepared for: <span className="text-slate-300">{project.clientEmail}</span></p>
                </div>

                {/* Approval Banner */}
                {isApproved && (
                    <div className="flex items-center gap-3 bg-teal-900/30 border border-teal-700/50 rounded-2xl p-5">
                        <CheckCircle2 size={22} className="text-teal-400 flex-shrink-0" />
                        <div>
                            <p className="font-extrabold text-teal-300">This design has been approved.</p>
                            <p className="text-teal-400/70 text-sm font-medium">Thank you for your approval. The designer will process your final delivery.</p>
                        </div>
                    </div>
                )}

                {/* File Gallery */}
                {files.length > 0 ? (
                    <section>
                        <h2 className="text-lg font-extrabold text-white mb-4">Design Files</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {files.map((file) => (
                                <div key={file.id} className="relative group">
                                    {/* Version badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="text-xs font-bold bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm">v{file.version}</span>
                                    </div>

                                    {file.previewUrl ? (
                                        <div className="overflow-hidden rounded-xl border border-slate-700/60 group-hover:border-teal-500/40 transition-colors">
                                            <img
                                                src={file.previewUrl}
                                                alt={file.fileName}
                                                className="w-full object-contain bg-slate-900 max-h-[480px]"
                                            />
                                        </div>
                                    ) : (
                                        <FilePlaceholder fileType={file.fileType} fileName={file.fileName} />
                                    )}

                                    <p className="mt-2 text-xs font-medium text-slate-400 truncate px-1">{file.fileName}</p>
                                </div>
                            ))}
                        </div>

                        {/* Watermark disclaimer */}
                        <p className="text-xs text-slate-600 font-medium text-center mt-6">
                            🔒 These are watermarked previews. Original high-resolution files are delivered upon project completion.
                        </p>
                    </section>
                ) : (
                    <section className="flex flex-col items-center justify-center py-16 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                        <FileText size={36} className="text-slate-600 mb-3" />
                        <p className="text-slate-400 font-bold">No files have been uploaded yet.</p>
                        <p className="text-slate-600 text-sm font-medium mt-1">Check back soon.</p>
                    </section>
                )}

                {/* Comments / Feedback Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <MessageSquare size={18} className="text-teal-400" />
                        <h2 className="text-lg font-extrabold text-white">Leave Feedback</h2>
                    </div>

                    {/* Comment thread */}
                    {comments.length > 0 && (
                        <div className="space-y-3">
                            {comments.map((c) => (
                                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <div className="w-7 h-7 rounded-full bg-teal-800 text-teal-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                            {c.clientEmail.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-slate-200">{c.clientEmail}</span>
                                        {c.isApproval && (
                                            <span className="flex items-center gap-1 text-xs font-bold bg-teal-900/60 text-teal-300 px-2.5 py-0.5 rounded-full ml-auto">
                                                <CheckCircle2 size={11} />Approved
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{c.message}</p>
                                    <p className="text-xs text-slate-600 font-medium mt-2">
                                        {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Comment form — hidden if approved/completed */}
                    {!isApproved ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                            {submitError && (
                                <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm font-medium px-4 py-3 rounded-xl">
                                    {submitError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Your Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Share your feedback or revision requests..."
                                    rows={4}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => submitComment(false)}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                    Submit Feedback
                                </button>
                                <button
                                    onClick={() => submitComment(true)}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm shadow-teal-900 transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <ThumbsUp size={15} />}
                                    Approve This Design
                                </button>
                            </div>
                            <p className="text-xs text-slate-600 font-medium text-center">
                                By approving, you confirm the design meets your requirements and authorise the designer to proceed.
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 text-sm font-medium">
                            Comments are closed — design has been approved.
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800 mt-12 py-6 text-center">
                <p className="text-xs text-slate-600 font-medium">
                    Powered by{" "}
                    <Link href="/" className="text-teal-500 hover:text-teal-400 font-bold transition-colors">
                        Check 402
                    </Link>{" "}
                    — Secure design delivery with payment enforcement
                </p>
            </footer>
        </div>
    );
}
