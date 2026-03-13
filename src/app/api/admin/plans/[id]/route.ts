import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/plans/[id] — Get a single plan
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const plan = await prisma.plan.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } },
        });
        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }
        return NextResponse.json(plan);
    } catch (error) {
        console.error("[GET /api/admin/plans/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/admin/plans/[id] — Update a plan
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.plan.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const body = await req.json();
        const {
            name, description, price, currency, billingType,
            isDefault, isPopular, isActive, sortOrder,
            projectLimit, fileLimit, features,
        } = body;

        // If setting this plan as default, unset any other defaults
        if (isDefault && !existing.isDefault) {
            await prisma.plan.updateMany({
                where: { isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        const plan = await prisma.plan.update({
            where: { id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
                ...(typeof price === "number" && { price }),
                ...(currency !== undefined && { currency }),
                ...(billingType !== undefined && { billingType }),
                ...(isDefault !== undefined && { isDefault: !!isDefault }),
                ...(isPopular !== undefined && { isPopular: !!isPopular }),
                ...(isActive !== undefined && { isActive: !!isActive }),
                ...(typeof sortOrder === "number" && { sortOrder }),
                ...(typeof projectLimit === "number" && { projectLimit }),
                ...(typeof fileLimit === "number" && { fileLimit }),
                ...(features !== undefined && {
                    features: typeof features === "string" ? features : JSON.stringify(features),
                }),
            },
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error("[PUT /api/admin/plans/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/plans/[id] — Delete a plan
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const plan = await prisma.plan.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } },
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        if (plan._count.users > 0) {
            return NextResponse.json(
                { error: `Cannot delete: ${plan._count.users} user(s) are on this plan. Reassign them first.` },
                { status: 409 }
            );
        }

        if (plan.isDefault) {
            return NextResponse.json(
                { error: "Cannot delete the default plan. Set another plan as default first." },
                { status: 400 }
            );
        }

        await prisma.plan.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/admin/plans/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
