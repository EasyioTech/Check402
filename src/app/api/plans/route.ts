import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/plans — Public endpoint returning all active plans
// No auth required — used by landing page pricing section and upgrade modals
export async function GET() {
    try {
        const plans = await prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                price: true,
                currency: true,
                billingType: true,
                isDefault: true,
                isPopular: true,
                sortOrder: true,
                projectLimit: true,
                fileLimit: true,
                features: true,
            },
        });

        // Parse features JSON for convenience
        const parsed = plans.map((p) => ({
            ...p,
            features: JSON.parse(p.features) as string[],
        }));

        return NextResponse.json(parsed);
    } catch (error) {
        console.error("[GET /api/plans]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
