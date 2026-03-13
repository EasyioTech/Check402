"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard, Users, Folder, AlertTriangle, ShieldAlert,
    Search, CheckCircle2, XCircle, Ban, ChevronLeft,
    RefreshCw, ExternalLink, Menu, X, CreditCard, Plus, Pencil, Trash2, ToggleLeft, ToggleRight
} from "lucide-react";
import PlanFormModal from "./PlanFormModal";

type AdminUser = { id: string; name: string | null; email: string | null; plan: string; role: string; isBanned: boolean; onboardingComplete: boolean; createdAt: string; _count: { projects: number }; };
type AdminProject = { id: string; name: string; client: string; status: string; transitionCount: number; framework: string; createdAt: string; };
type AdminDispute = { id: string; clientEmail: string; message: string; proofReference: string | null; status: string; createdAt: string; project: { id: string; name: string; client: string; status: string; transitionCount: number; user: { id: string; name: string | null; email: string | null } }; };
type Metrics = { users: number; projects: number; revenue: number; disputeCount?: number; defaultedCount?: number; };
type AdminPlan = { id: string; slug: string; name: string; description: string | null; price: number; currency: string; billingType: string; isDefault: boolean; isPopular: boolean; isActive: boolean; sortOrder: number; projectLimit: number; fileLimit: number; features: string; _count: { users: number }; };
type Tab = "overview" | "users" | "projects" | "disputes" | "plans";

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        COMPLETED: "bg-teal-50 text-teal-700 border-teal-100",
        PENDING: "bg-amber-50 text-amber-700 border-amber-100",
        DEFAULTED: "bg-red-50 text-red-700 border-red-100",
        open: "bg-orange-50 text-orange-700 border-orange-100",
        resolved: "bg-teal-50 text-teal-700 border-teal-100",
        dismissed: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return `inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${map[status] || "bg-slate-100 text-slate-500 border-slate-200"}`;
};

export default function AdminClient() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [metrics, setMetrics] = useState<Metrics>({ users: 0, projects: 0, revenue: 0 });
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [projects, setProjects] = useState<AdminProject[]>([]);
    const [disputes, setDisputes] = useState<AdminDispute[]>([]);
    const [plans, setPlans] = useState<AdminPlan[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (status === "authenticated" && (session?.user as unknown as { role?: string })?.role !== "ADMIN") router.push("/dashboard");
    }, [session, status, router]);

    const fetchMetrics = useCallback(async () => {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) setMetrics(await res.json());
    }, []);
    const fetchUsers = useCallback(async () => { setLoading(true); const res = await fetch("/api/admin/users"); if (res.ok) setUsers(await res.json()); setLoading(false); }, []);
    const fetchProjects = useCallback(async () => { setLoading(true); const res = await fetch("/api/projects"); if (res.ok) setProjects(await res.json()); setLoading(false); }, []);
    const fetchDisputes = useCallback(async () => { setLoading(true); const res = await fetch("/api/admin/disputes"); if (res.ok) setDisputes(await res.json()); setLoading(false); }, []);
    const fetchPlans = useCallback(async () => { setLoading(true); const res = await fetch("/api/admin/plans"); if (res.ok) setPlans(await res.json()); setLoading(false); }, []);

    useEffect(() => { fetchMetrics(); }, [fetchMetrics]);
    useEffect(() => {
        setSearch("");
        if (tab === "users") fetchUsers();
        if (tab === "projects") fetchProjects();
        if (tab === "disputes") fetchDisputes();
        if (tab === "plans") fetchPlans();
    }, [tab, fetchUsers, fetchProjects, fetchDisputes, fetchPlans]);

    const banUser = async (userId: string, isBanned: boolean) => {
        const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, isBanned }) });
        if (res.ok) { fetchUsers(); fetchMetrics(); showToast(isBanned ? "User banned." : "User unbanned."); }
    };
    const forceProject = async (id: string, newStatus: string) => {
        const res = await fetch(`/api/projects/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
        if (res.ok) { fetchProjects(); fetchMetrics(); showToast(`Project set to ${newStatus}.`); }
    };
    const resolveDispute = async (disputeId: string, action: "resolve" | "dismiss") => {
        const res = await fetch("/api/admin/disputes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ disputeId, action }) });
        if (res.ok) { fetchDisputes(); fetchMetrics(); showToast(action === "resolve" ? "Dispute resolved." : "Dispute dismissed."); }
    };
    const banDeveloper = async (userId: string) => { await banUser(userId, true); };

    const savePlan = async (formData: Record<string, unknown>) => {
        const isEdit = !!editingPlan;
        const url = isEdit ? `/api/admin/plans/${editingPlan!.id}` : "/api/admin/plans";
        const method = isEdit ? "PUT" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
        if (res.ok) { fetchPlans(); setPlanModalOpen(false); setEditingPlan(null); showToast(isEdit ? "Plan updated." : "Plan created."); }
        else { const err = await res.json().catch(() => ({})); showToast(err.error || "Failed to save plan."); }
    };
    const deletePlan = async (planId: string) => {
        if (!confirm("Delete this plan? This cannot be undone.")) return;
        const res = await fetch(`/api/admin/plans/${planId}`, { method: "DELETE" });
        if (res.ok) { fetchPlans(); showToast("Plan deleted."); }
        else { const err = await res.json().catch(() => ({})); showToast(err.error || "Failed to delete plan."); }
    };
    const togglePlanActive = async (plan: AdminPlan) => {
        const res = await fetch(`/api/admin/plans/${plan.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !plan.isActive }) });
        if (res.ok) { fetchPlans(); showToast(plan.isActive ? "Plan deactivated." : "Plan activated."); }
    };

    if (status === "loading") return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const filteredUsers = users.filter(u => (u.name || u.email || "").toLowerCase().includes(search.toLowerCase()));
    const filteredProjects = projects.filter(p => (p.name + p.client).toLowerCase().includes(search.toLowerCase()));
    const filteredDisputes = disputes.filter(d => d.status === "open");

    const navItems: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
        { id: "users", label: "Users", icon: <Users size={16} />, count: metrics.users },
        { id: "projects", label: "Projects", icon: <Folder size={16} />, count: metrics.projects },
        { id: "disputes", label: "Disputes", icon: <AlertTriangle size={16} />, count: metrics.disputeCount },
        { id: "plans", label: "Plans", icon: <CreditCard size={16} />, count: plans.length || undefined },
    ];

    const SidebarNav = ({ onClose }: { onClose?: () => void }) => (
        <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="check402" className="h-6 w-auto" />
                    <span className="text-lg font-extrabold tracking-tight"><span className="text-teal-500">Check</span> <span className="text-slate-900">402</span></span>
                </Link>
                {onClose && <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>}
            </div>
            <div className="px-4 py-3">
                <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Admin Console</span>
                </div>
            </div>
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => { setTab(item.id); onClose?.(); }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === item.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>
                        <div className="flex items-center gap-3">{item.icon}{item.label}</div>
                        {item.count !== undefined && item.count > 0 && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === item.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{item.count}</span>}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
                <Link href="/dashboard" onClick={onClose} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-sm transition-all">
                    <ChevronLeft size={16} /> Back to Dashboard
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Toast */}
            {toast && <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg">{toast}</div>}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
                <SidebarNav />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute top-0 left-0 h-full w-72 bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                        <SidebarNav onClose={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile top bar */}
                <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 flex items-center justify-between px-4 h-16">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors">
                        <Menu size={20} />
                    </button>
                    <span className="text-base font-extrabold tracking-tight">
                        <span className="text-teal-500">Check</span> <span className="text-slate-900">402</span>
                        <span className="ml-2 text-xs font-bold text-red-500 uppercase tracking-wider">Admin</span>
                    </span>
                    <div className="w-10" /> {/* spacer */}
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">

                        {/* ─ Overview ─ */}
                        {tab === "overview" && (
                            <div>
                                <div className="flex items-center justify-between mb-6 sm:mb-8">
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Platform Overview</h1>
                                        <p className="text-slate-500 font-medium mt-1 text-sm hidden sm:block">Real-time platform health and metrics.</p>
                                    </div>
                                    <button onClick={fetchMetrics} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
                                        <RefreshCw size={14} /> <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                    {[
                                        { label: "Users", value: metrics.users, cls: "bg-indigo-50 text-indigo-600 border-indigo-100", icon: <Users size={20} /> },
                                        { label: "Active Disputes", value: metrics.disputeCount ?? 0, cls: "bg-orange-50 text-orange-600 border-orange-100", icon: <AlertTriangle size={20} /> },
                                        { label: "Defaulted", value: metrics.defaultedCount ?? 0, cls: "bg-red-50 text-red-600 border-red-100", icon: <ShieldAlert size={20} /> },
                                        { label: "Total Projects", value: metrics.projects, cls: "bg-teal-50 text-teal-600 border-teal-100", icon: <Folder size={20} /> },
                                    ].map(card => (
                                        <div key={card.label} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-5 border ${card.cls}`}>{card.icon}</div>
                                            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-0.5 sm:mb-1">{card.value.toLocaleString()}</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─ Users ─ */}
                        {tab === "users" && (
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Users</h1>
                                    <button onClick={fetchUsers} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50">
                                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                                <div className="relative mb-4">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white" />
                                </div>

                                {/* Desktop table */}
                                <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b border-slate-100 bg-slate-50">
                                                <th className="text-left px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">User</th>
                                                <th className="text-left px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Plan</th>
                                                <th className="text-left px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Projects</th>
                                                <th className="text-left px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                                                <th className="text-right px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                                            </tr></thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredUsers.map(u => (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-5 py-3.5"><div className="font-bold text-slate-900">{u.name || "—"}</div><div className="text-xs text-slate-400 font-medium">{u.email}</div></td>
                                                        <td className="px-5 py-3.5"><span className="font-bold text-slate-600 text-xs">{u.plan}</span></td>
                                                        <td className="px-5 py-3.5"><span className="font-bold text-slate-700">{u._count.projects}</span></td>
                                                        <td className="px-5 py-3.5">{u.isBanned ? <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full border border-red-100">Banned</span> : <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full border border-teal-100">Active</span>}</td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <button onClick={() => banUser(u.id, !u.isBanned)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${u.isBanned ? "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100" : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"}`}>
                                                                {u.isBanned ? "Unban" : "Ban"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredUsers.length === 0 && !loading && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium">No users found</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mobile cards */}
                                <div className="sm:hidden space-y-3">
                                    {filteredUsers.length === 0 && !loading && <div className="text-center py-10 text-slate-400 font-medium text-sm">No users found</div>}
                                    {filteredUsers.map(u => (
                                        <div key={u.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                                                        {(u.name || u.email || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 text-sm truncate">{u.name || "—"}</div>
                                                        <div className="text-xs text-slate-400 font-medium truncate">{u.email}</div>
                                                    </div>
                                                </div>
                                                {u.isBanned ? <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full border border-red-100 flex-shrink-0">Banned</span> : <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full border border-teal-100 flex-shrink-0">Active</span>}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                    <span>{u.plan}</span>
                                                    <span>·</span>
                                                    <span>{u._count.projects} project{u._count.projects !== 1 ? "s" : ""}</span>
                                                </div>
                                                <button onClick={() => banUser(u.id, !u.isBanned)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${u.isBanned ? "bg-teal-50 text-teal-700 border-teal-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                                                    {u.isBanned ? "Unban" : "Ban"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─ Projects ─ */}
                        {tab === "projects" && (
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Projects</h1>
                                    <button onClick={fetchProjects} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50">
                                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                                <div className="relative mb-4">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white" />
                                </div>

                                {/* Desktop table */}
                                <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b border-slate-100 bg-slate-50">
                                                <th className="text-left px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Project</th>
                                                <th className="text-left px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                                                <th className="text-left px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Cycles</th>
                                                <th className="text-right px-5 py-3 font-extrabold text-slate-500 text-xs uppercase tracking-wider">Override</th>
                                            </tr></thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredProjects.map(p => (
                                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-5 py-3.5"><div className="font-bold text-slate-900">{p.name}</div><div className="text-xs text-slate-400 font-medium">{p.client}</div></td>
                                                        <td className="px-5 py-3.5"><span className={statusBadge(p.status)}>{p.status}</span></td>
                                                        <td className="px-5 py-3.5"><span className={`font-bold text-xs ${p.transitionCount >= 2 ? "text-red-500" : "text-slate-500"}`}>{p.transitionCount} / 2</span></td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => forceProject(p.id, "COMPLETED")} disabled={p.status === "COMPLETED"} className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-xs font-bold hover:bg-teal-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Complete</button>
                                                                <button onClick={() => forceProject(p.id, "PENDING")} disabled={p.status === "PENDING"} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-bold hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Pending</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredProjects.length === 0 && !loading && <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400 font-medium">No projects found</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mobile cards */}
                                <div className="sm:hidden space-y-3">
                                    {filteredProjects.length === 0 && !loading && <div className="text-center py-10 text-slate-400 font-medium text-sm">No projects found</div>}
                                    {filteredProjects.map(p => (
                                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{p.client}</div>
                                                </div>
                                                <span className={statusBadge(p.status)}>{p.status}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`font-bold text-xs ${p.transitionCount >= 2 ? "text-red-500" : "text-slate-500"}`}>{p.transitionCount}/2 cycles</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => forceProject(p.id, "COMPLETED")} disabled={p.status === "COMPLETED"} className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-xs font-bold disabled:opacity-40">✓ Done</button>
                                                    <button onClick={() => forceProject(p.id, "PENDING")} disabled={p.status === "PENDING"} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-bold disabled:opacity-40">Reset</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─ Disputes ─ */}
                        {tab === "disputes" && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Disputes</h1>
                                        <p className="text-slate-500 font-medium text-sm mt-1">{filteredDisputes.length} open</p>
                                    </div>
                                    <button onClick={fetchDisputes} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50">
                                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {filteredDisputes.map(d => (
                                        <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                        <span className={statusBadge(d.status)}>{d.status}</span>
                                                        <span className="text-xs text-slate-400 font-medium">{new Date(d.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="font-bold text-slate-900 text-sm">{d.project.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{d.clientEmail}</div>
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium sm:text-right">
                                                    <div>{d.project.user.name || d.project.user.email}</div>
                                                    <div className="text-orange-600 font-bold mt-0.5">{d.project.transitionCount} cycles</div>
                                                </div>
                                            </div>
                                            <div className="px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-100">
                                                <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Message</div>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{d.message}</p>
                                                {d.proofReference && <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-600 font-bold"><ExternalLink size={11} />Proof: <span className="font-mono text-slate-600">{d.proofReference}</span></div>}
                                            </div>
                                            <div className="px-4 sm:px-6 py-4 flex flex-wrap items-center gap-2">
                                                <button onClick={() => resolveDispute(d.id, "resolve")} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"><CheckCircle2 size={13} /> Resolve</button>
                                                <button onClick={() => banDeveloper(d.project.user.id)} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-sm rounded-xl border border-red-100 transition-all"><Ban size={13} /> Ban Dev</button>
                                                <button onClick={() => resolveDispute(d.id, "dismiss")} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs sm:text-sm rounded-xl transition-all"><XCircle size={13} /> Dismiss</button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredDisputes.length === 0 && !loading && (
                                        <div className="bg-white rounded-2xl border border-slate-200 p-12 sm:p-16 text-center">
                                            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-teal-300 mx-auto mb-4" />
                                            <div className="font-bold text-slate-900 mb-2">No open disputes</div>
                                            <p className="text-slate-500 font-medium text-sm">All clear. No active disputes to review.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─ Plans ─ */}
                        {tab === "plans" && (
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Plan Builder</h1>
                                    <div className="flex items-center gap-2">
                                        <button onClick={fetchPlans} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50">
                                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                                        </button>
                                        <button onClick={() => { setEditingPlan(null); setPlanModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all">
                                            <Plus size={14} /> New Plan
                                        </button>
                                    </div>
                                </div>

                                {/* Plans list */}
                                <div className="space-y-3">
                                    {plans.map(p => {
                                        const featuresList: string[] = (() => { try { return JSON.parse(p.features); } catch { return []; } })();
                                        return (
                                            <div key={p.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${p.isActive ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
                                                <div className="p-4 sm:p-6">
                                                    <div className="flex items-start justify-between gap-4 mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${p.isPopular ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                                                                {p.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-extrabold text-slate-900">{p.name}</span>
                                                                    {p.isDefault && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">DEFAULT</span>}
                                                                    {p.isPopular && <span className="text-[10px] font-bold bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full border border-teal-100">POPULAR</span>}
                                                                    {!p.isActive && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">INACTIVE</span>}
                                                                </div>
                                                                <div className="text-xs text-slate-400 font-medium mt-0.5">slug: {p.slug} · {p._count.users} user{p._count.users !== 1 ? "s" : ""}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-extrabold text-slate-900">
                                                                {p.price === 0 ? "Free" : `$${(p.price / 100).toFixed(2)}`}
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-bold">
                                                                {p.billingType === "free" ? "forever" : p.billingType === "monthly" ? "/ month" : "one-time"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 mb-3">
                                                        <span>Projects: {p.projectLimit === -1 ? "Unlimited" : p.projectLimit}</span>
                                                        <span>Files/project: {p.fileLimit === -1 ? "Unlimited" : p.fileLimit}</span>
                                                        <span>Order: {p.sortOrder}</span>
                                                    </div>

                                                    {featuresList.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                                            {featuresList.map((f, i) => (
                                                                <span key={i} className="text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-full">{f}</span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                                        <button onClick={() => { setEditingPlan(p); setPlanModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">
                                                            <Pencil size={12} /> Edit
                                                        </button>
                                                        <button onClick={() => togglePlanActive(p)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">
                                                            {p.isActive ? <><ToggleRight size={12} /> Deactivate</> : <><ToggleLeft size={12} /> Activate</>}
                                                        </button>
                                                        <button onClick={() => deletePlan(p.id)} disabled={p._count.users > 0 || p.isDefault} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto" title={p._count.users > 0 ? "Has active users" : p.isDefault ? "Default plan" : "Delete plan"}>
                                                            <Trash2 size={12} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {plans.length === 0 && !loading && (
                                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                            <div className="font-bold text-slate-900 mb-2">No plans yet</div>
                                            <p className="text-slate-500 font-medium text-sm">Create your first pricing plan to get started.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Plan Create/Edit Modal */}
                                {planModalOpen && <PlanFormModal plan={editingPlan} onSave={savePlan} onClose={() => { setPlanModalOpen(false); setEditingPlan(null); }} />}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
