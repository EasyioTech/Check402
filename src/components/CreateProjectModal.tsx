import { useState, useEffect } from "react";
import { X, Layout, Globe, Server, Code, Layers, ShieldAlert, ArrowRight, ExternalLink, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (project: any) => void;
}

const frameworks = [
    { id: "nextjs", name: "Next.js", icon: <Globe size={16} /> },
    { id: "react", name: "React / Vite", icon: <Layout size={16} /> },
    { id: "vue", name: "Vue.js", icon: <Layers size={16} /> },
    { id: "angular", name: "Angular", icon: <Code size={16} /> },
    { id: "laravel", name: "Laravel", icon: <Server size={16} /> },
    { id: "django", name: "Django / Python", icon: <Server size={16} /> },
    { id: "other", name: "Other / Static", icon: <Globe size={16} /> },
];

const LEGAL_PHRASE = "I understand the risks, possess the right to restrict this project, and release check402.com from all liability.";

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
    const [step, setStep] = useState(0); // 0: Details, 1: Legal
    const [name, setName] = useState("");
    const [client, setClient] = useState("");
    const [description, setDescription] = useState("");
    const [framework, setFramework] = useState("nextjs");
    const [confirmationInput, setConfirmationInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmationInput !== LEGAL_PHRASE) return;

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    client,
                    description: description,
                    framework: framework,
                }),
            });

            if (!res.ok) {
                let errorMessage = "Failed to create project";
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
                    console.error("Error parsing response:", e);
                }
                throw new Error(errorMessage);
            }

            const project = await res.json();
            onSuccess(project);
            resetForm();
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Something went wrong";
            setError(errorMessage);

            if (errorMessage.toLowerCase().includes("limit reached")) {
                onClose();
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("open-upgrade-modal"));
                }, 300);
            } else {
                setStep(0);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(0);
        setName("");
        setClient("");
        setDescription("");
        setFramework("nextjs");
        setConfirmationInput("");
        setError("");
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(resetForm, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const isPhraseCorrect = confirmationInput === LEGAL_PHRASE;
    const selectedFramework = frameworks.find(f => f.id === framework) || frameworks[0];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm shadow-2xl overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-100 my-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                                {step === 0 ? "Create New Project" : "Important Legal Notice"}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {step === 0
                                    ? "Protect your work with Check 402 enforcement."
                                    : "Please review the enforcement terms below."}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 0 ? (
                                <motion.form
                                    key="step0"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    onSubmit={handleContinue}
                                    className="space-y-5"
                                >
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">Project Name</label>
                                        <input
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                            placeholder="e.g. Acme Dashboard"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">Client Name</label>
                                        <input
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                            placeholder="e.g. Acme Corp"
                                            value={client}
                                            onChange={e => setClient(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5 relative">
                                        <label className="text-sm font-bold text-slate-700">Technology Framework</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-slate-400 group-hover:text-teal-500 transition-colors">
                                                        {selectedFramework.icon}
                                                    </span>
                                                    {selectedFramework.name}
                                                </div>
                                                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-[60]" onClick={() => setIsDropdownOpen(false)} />
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 z-[70] overflow-hidden p-1.5"
                                                        >
                                                            {frameworks.map(f => (
                                                                <button
                                                                    key={f.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFramework(f.id);
                                                                        setIsDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${framework === f.id
                                                                        ? "bg-teal-50 text-teal-600"
                                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                                        }`}
                                                                >
                                                                    <span className={framework === f.id ? "text-teal-500" : "text-slate-400"}>
                                                                        {f.icon}
                                                                    </span>
                                                                    {f.name}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">Description (Optional)</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                            placeholder="Brief project summary..."
                                            rows={2}
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-500/20 transition-all hover:shadow-teal-500/30 hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-2"
                                    >
                                        Continue to Legal Notice
                                        <ArrowRight size={18} />
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative overflow-hidden">
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="mt-1 p-2 bg-amber-100 text-amber-700 rounded-lg flex-shrink-0">
                                                <ShieldAlert size={20} />
                                            </div>
                                            <div className="space-y-3">
                                                <blockquote className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                                    "Check 402 is an enforcement tool. You must ensure your client contracts legally permit you to suspend their website for non-payment. check402.com acts only as the infrastructure provider and accepts zero liability for any damages, disputes, or legal action arising between you and your client."
                                                </blockquote>
                                                <Link
                                                    href="/terms"
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                                                >
                                                    Read full Terms of Service
                                                    <ExternalLink size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Type the following to confirm:
                                        </label>
                                        <p className="p-3 bg-slate-900 rounded-xl text-teal-400 font-mono text-xs leading-relaxed select-all">
                                            {LEGAL_PHRASE}
                                        </p>
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-sm"
                                            placeholder="Paste or type phrase here..."
                                            rows={3}
                                            value={confirmationInput}
                                            onChange={e => setConfirmationInput(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            type="submit"
                                            disabled={loading || !isPhraseCorrect}
                                            className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm shadow-teal-500/20 transition-all hover:shadow-teal-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0"
                                        >
                                            {loading ? "Creating Project..." : "I Agree & Create Project"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(0)}
                                            className="w-full py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                        >
                                            Back to details
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
