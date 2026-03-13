import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized access" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const [totalUsers, totalProjects, enterpriseUsers, disputeCount, defaultedCount] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.user.count({ where: { plan: "ENTERPRISE" } }),
            prisma.dispute.count({ where: { status: "open" } }),
            prisma.project.count({ where: { status: "DEFAULTED" } }),
        ]);

        const estimatedRevenue = enterpriseUsers * 5;

        return NextResponse.json({
            users: totalUsers,
            projects: totalProjects,
            revenue: estimatedRevenue,
            disputeCount,
            defaultedCount,
        });
    } catch (error) {
        console.error("Admin Metrics Error:", error);
        return new NextResponse(
            JSON.stringify({ error: "Failed to fetch metrics" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
