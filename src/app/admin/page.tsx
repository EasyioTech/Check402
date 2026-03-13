"use client";

import dynamic from "next/dynamic";


// Disable SSR — this page uses useSession which requires browser context.
const AdminClient = dynamic(() => import("./AdminClient"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

export default function AdminPage() {
    return <AdminClient />;
}
