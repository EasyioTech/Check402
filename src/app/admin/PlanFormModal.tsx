"use client";

import { useState } from "react";
import { X } from "lucide-react";

type AdminPlan = { id: string; slug: string; name: string; description: string | null; price: number; currency: string; billingType: string; isDefault: boolean; isPopular: boolean; isActive: boolean; sortOrder: number; projectLimit: number; fileLimit: number; features: string; _count: { users: number }; };

export default function PlanFormModal({ plan, onSave, onClose }: { plan: AdminPlan | null; onSave: (data: Record<string, unknown>) => void; onClose: () => void }) {
    const isEdit = !!plan;
    const [name, setName] = useState(plan?.name || "");
    const [slug, setSlug] = useState(plan?.slug || "");
    const [description, setDescription] = useState(plan?.description || "");
    const [price, setPrice] = useState(plan?.price?.toString() || "0");
    const [billingType, setBillingType] = useState(plan?.billingType || "free");
    const [currency, setCurrency] = useState(plan?.currency || "USD");
    const [projectLimit, setProjectLimit] = useState(plan?.projectLimit?.toString() || "3");
    const [fileLimit, setFileLimit] = useState(plan?.fileLimit?.toString() || "20");
    const [sortOrder, setSortOrder] = useState(plan?.sortOrder?.toString() || "0");
    const [isDefault, setIsDefault] = useState(plan?.isDefault || false);
    const [isPopular, setIsPopular] = useState(plan?.isPopular || false);
    const [isActive, setIsActive] = useState(plan?.isActive !== false);
    const [features, setFeatures] = useState<string[]>(() => {
        try { return plan ? JSON.parse(plan.features) : []; } catch { return []; }
    });
    const [newFeature, setNewFeature] = useState("");
    const [saving, setSaving] = useState(false);

    const addFeature = () => {
        if (newFeature.trim()) { setFeatures(prev => [...prev, newFeature.trim()]); setNewFeature(""); }
    };
    const removeFeature = (idx: number) => setFeatures(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = async () => {
        setSaving(true);
        await onSave({
            name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            description: description || null,
            price: parseInt(price) || 0, currency, billingType,
            projectLimit: parseInt(projectLimit), fileLimit: parseInt(fileLimit),
            sortOrder: parseInt(sortOrder) || 0,
            isDefault, isPopular, isActive,
            features: JSON.stringify(features),
        });
        setSaving(false);
    };

    const labelCls = "block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5";
    const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <h2 className="text-lg font-extrabold text-slate-900">{isEdit ? "Edit Plan" : "Create Plan"}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Plan Name *</label>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enterprise" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Slug</label>
                            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated" className={inputCls} disabled={isEdit} />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Description</label>
                        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="For serious freelancers and agencies." className={inputCls} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>Price (cents)</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Currency</label>
                            <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Billing Type</label>
                            <select value={billingType} onChange={e => setBillingType(e.target.value)} className={inputCls}>
                                <option value="free">Free</option>
                                <option value="one_time">One-Time</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>Project Limit</label>
                            <input type="number" value={projectLimit} onChange={e => setProjectLimit(e.target.value)} className={inputCls} />
                            <p className="text-[10px] text-slate-400 font-medium mt-1">-1 = unlimited</p>
                        </div>
                        <div>
                            <label className={labelCls}>File Limit</label>
                            <input type="number" value={fileLimit} onChange={e => setFileLimit(e.target.value)} className={inputCls} />
                            <p className="text-[10px] text-slate-400 font-medium mt-1">-1 = unlimited</p>
                        </div>
                        <div>
                            <label className={labelCls}>Sort Order</label>
                            <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={inputCls} />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="w-4 h-4 rounded text-teal-500 border-slate-300 focus:ring-teal-500" />
                            <span className="text-sm font-bold text-slate-700">Default plan</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} className="w-4 h-4 rounded text-teal-500 border-slate-300 focus:ring-teal-500" />
                            <span className="text-sm font-bold text-slate-700">Most Popular badge</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded text-teal-500 border-slate-300 focus:ring-teal-500" />
                            <span className="text-sm font-bold text-slate-700">Active</span>
                        </label>
                    </div>

                    <div>
                        <label className={labelCls}>Features</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {features.map((f, i) => (
                                <span key={i} className="flex items-center gap-1 text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded-full">
                                    {f}
                                    <button onClick={() => removeFeature(i)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input value={newFeature} onChange={e => setNewFeature(e.target.value)} placeholder="Add a feature..." className={inputCls}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} />
                            <button onClick={addFeature} type="button" className="px-3 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-200 transition-all flex-shrink-0">Add</button>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                    <button onClick={handleSubmit} disabled={!name.trim() || saving} className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all disabled:opacity-50">
                        {saving ? "Saving..." : isEdit ? "Update Plan" : "Create Plan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
