"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewDesignProjectPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !clientEmail.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/design-projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), clientEmail: clientEmail.trim(), description: description.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create project");
            router.push(`/designer/projects/${data.id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            {/* Back */}
            <Link
                href="/designer/projects"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Projects
            </Link>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h1 className="text-2xl font-extrabold text-slate-900 mb-1">New Design Project</h1>
                <p className="text-slate-500 font-medium text-sm mb-8">Create a project to upload your design files and share previews with your client.</p>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Brand Identity for Acme Corp"
                            required
                            maxLength={100}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Client Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="client@example.com"
                            required
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                        />
                        <p className="text-xs text-slate-400 font-medium mt-1.5">We&apos;ll use this for comment attribution when your client reviews the work.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Description <span className="text-slate-400 font-medium">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the project scope..."
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name.trim() || !clientEmail.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl shadow-sm shadow-teal-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <><Loader2 size={16} className="animate-spin" />Creating...</> : "Create Project →"}
                    </button>
                </form>
            </div>
        </div>
    );
}
