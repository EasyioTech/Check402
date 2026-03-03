import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || session?.user?.role !== "ADMIN") {
        redirect("/login");
    }

    return (
        <div className="dashboard-layout">
            {/* 
        Re-using the standard dashboard sidebar spacing constraints, 
        or alternatively, we can define a unique Admin sidebar.
        For Phase 9, we focus strictly on the main content overview.
      */}
            <main className="main-content" style={{ marginLeft: 0 }}>
                {children}
            </main>
        </div>
    );
}
