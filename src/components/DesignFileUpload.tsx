"use client";

import { useState, useRef, useCallback, DragEvent } from "react";
import { Upload, CheckCircle2, XCircle, Loader2, FileImage, FileText, Film, X } from "lucide-react";

type FileStatus = "pending" | "uploading" | "processing" | "done" | "error";

type FileEntry = {
    id: string;
    file: File;
    status: FileStatus;
    error?: string;
};

const ACCEPTED_TYPES = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "image/svg+xml", "application/pdf", "video/mp4", "video/quicktime"
];
const MAX_SIZE = 52_428_800; // 50 MB
const MAX_FILES = 20;

function fileTypeIcon(type: string) {
    if (type.startsWith("video/")) return <Film size={18} className="text-purple-400" />;
    if (type === "application/pdf") return <FileText size={18} className="text-red-400" />;
    return <FileImage size={18} className="text-teal-400" />;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface Props {
    projectId: string;
    existingFileCount?: number;
    onUploadComplete: () => void;
}

export default function DesignFileUpload({ projectId, existingFileCount = 0, onUploadComplete }: Props) {
    const [entries, setEntries] = useState<FileEntry[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateEntry = (id: string, update: Partial<FileEntry>) => {
        setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...update } : e));
    };

    const addFiles = (files: File[]) => {
        const remaining = MAX_FILES - existingFileCount - entries.length;
        const valid: FileEntry[] = [];

        for (const file of files.slice(0, remaining)) {
            const entry: FileEntry = {
                id: `${Date.now()}-${Math.random()}`,
                file,
                status: "pending",
            };
            if (!ACCEPTED_TYPES.includes(file.type)) {
                entry.status = "error";
                entry.error = `Unsupported type: ${file.type}`;
            } else if (file.size > MAX_SIZE) {
                entry.status = "error";
                entry.error = "Exceeds 50 MB limit";
            }
            valid.push(entry);
        }
        setEntries((prev) => [...prev, ...valid]);
    };

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
    }, [entries.length, existingFileCount]);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(Array.from(e.target.files));
        // Reset input so same file can be re-selected after removal
        e.target.value = "";
    };

    const removeEntry = (id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    };

    const uploadAll = async () => {
        const toUpload = entries.filter((e) => e.status === "pending");
        if (toUpload.length === 0) return;
        setIsUploading(true);

        for (const entry of toUpload) {
            // 1. Get presigned URL
            updateEntry(entry.id, { status: "uploading" });
            let uploadUrl: string;
            let objectKey: string;

            try {
                const res = await fetch(`/api/design-projects/${projectId}/upload-url`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileName: entry.file.name,
                        mimeType: entry.file.type,
                        fileSize: entry.file.size,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to get upload URL");
                uploadUrl = data.uploadUrl;
                objectKey = data.objectKey;
            } catch (err: unknown) {
                updateEntry(entry.id, { status: "error", error: err instanceof Error ? err.message : "Upload URL failed" });
                continue;
            }

            // 2. PUT file directly to R2
            try {
                const putRes = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": entry.file.type },
                    body: entry.file,
                });
                if (!putRes.ok) throw new Error(`R2 upload failed: ${putRes.status}`);
            } catch (err: unknown) {
                updateEntry(entry.id, { status: "error", error: err instanceof Error ? err.message : "Upload to R2 failed" });
                continue;
            }

            // 3. Trigger watermark processing
            updateEntry(entry.id, { status: "processing" });
            try {
                const processRes = await fetch(`/api/design-projects/${projectId}/process`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        objectKey,
                        fileName: entry.file.name,
                        mimeType: entry.file.type,
                        fileSize: entry.file.size,
                    }),
                });
                const processData = await processRes.json();
                if (!processRes.ok) throw new Error(processData.error || "Processing failed");
                updateEntry(entry.id, { status: "done" });
            } catch (err: unknown) {
                updateEntry(entry.id, { status: "error", error: err instanceof Error ? err.message : "Processing failed" });
            }
        }

        setIsUploading(false);
        // If any files succeeded, refresh the file list
        const hasDone = entries.some((e) => e.status === "done") || toUpload.some((e) => e.status === "done");
        onUploadComplete();
    };

    const pendingCount = entries.filter((e) => e.status === "pending").length;
    const allDone = entries.length > 0 && entries.every((e) => e.status === "done" || e.status === "error");
    const slotsLeft = MAX_FILES - existingFileCount - entries.length;

    return (
        <div className="space-y-3">
            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 py-8 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragging
                        ? "border-teal-400 bg-teal-50"
                        : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                    }`}
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDragging ? "bg-teal-100" : "bg-slate-100"}`}>
                    <Upload size={22} className={isDragging ? "text-teal-500" : "text-slate-400"} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">
                        {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-1">
                        Images, SVG, PDF, Video · Max 50 MB · {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.svg,video/mp4,video/quicktime"
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>

            {/* File list */}
            {entries.length > 0 && (
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                            <div className="flex-shrink-0">{fileTypeIcon(entry.file.type)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate">{entry.file.name}</div>
                                <div className="text-xs font-medium text-slate-400">{formatBytes(entry.file.size)}</div>
                            </div>

                            {/* Status indicator */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                {entry.status === "pending" && (
                                    <span className="text-xs text-slate-400 font-medium">Queued</span>
                                )}
                                {entry.status === "uploading" && (
                                    <span className="flex items-center gap-1.5 text-xs text-blue-500 font-bold">
                                        <Loader2 size={13} className="animate-spin" />Uploading
                                    </span>
                                )}
                                {entry.status === "processing" && (
                                    <span className="flex items-center gap-1.5 text-xs text-teal-600 font-bold">
                                        <Loader2 size={13} className="animate-spin" />Processing
                                    </span>
                                )}
                                {entry.status === "done" && (
                                    <CheckCircle2 size={18} className="text-teal-500" />
                                )}
                                {entry.status === "error" && (
                                    <span className="flex items-center gap-1.5 text-xs text-red-500 font-bold" title={entry.error}>
                                        <XCircle size={14} />{entry.error?.slice(0, 30) ?? "Error"}
                                    </span>
                                )}

                                {entry.status === "pending" && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                                        className="ml-1 p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action button */}
            {entries.length > 0 && !allDone && (
                <button
                    onClick={uploadAll}
                    disabled={isUploading || pendingCount === 0}
                    className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl shadow-sm shadow-teal-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isUploading
                        ? <><Loader2 size={15} className="animate-spin" />Uploading & Processing...</>
                        : <>Upload {pendingCount} File{pendingCount !== 1 ? "s" : ""}</>
                    }
                </button>
            )}

            {allDone && (
                <div className="text-center text-sm font-bold text-teal-600 py-2">
                    ✓ All uploads complete
                </div>
            )}
        </div>
    );
}
