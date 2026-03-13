import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/plans — List all plans (admin only)
export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const plans = await prisma.plan.findMany({
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { users: true } } },
        });
        return NextResponse.json(plans);
    } catch (error) {
        console.error("[GET /api/admin/plans]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/admin/plans — Create a new plan (admin only)
export async function POST(req: Request) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const {
            slug, name, description, price, currency,
            billingType, isDefault, isPopular, isActive,
            sortOrder, projectLimit, fileLimit, features,
        } = body;

        if (!slug || !name) {
            return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
        }

        // Check slug uniqueness
        const existing = await prisma.plan.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: `Plan with slug "${slug}" already exists` }, { status: 409 });
        }

        // If this plan is being set as default, unset any existing default
        if (isDefault) {
            await prisma.plan.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        const plan = await prisma.plan.create({
            data: {
                slug: slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
                name: name.trim(),
                description: description?.trim() || null,
                price: typeof price === "number" ? price : 0,
                currency: currency || "USD",
                billingType: billingType || "free",
                isDefault: !!isDefault,
                isPopular: !!isPopular,
                isActive: isActive !== false,
                sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
                projectLimit: typeof projectLimit === "number" ? projectLimit : 3,
                fileLimit: typeof fileLimit === "number" ? fileLimit : 20,
                features: typeof features === "string" ? features : JSON.stringify(features || []),
            },
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error("[POST /api/admin/plans]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
