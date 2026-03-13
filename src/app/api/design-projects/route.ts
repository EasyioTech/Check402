import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/design-projects — list all projects for authenticated user
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const projects = await prisma.designProject.findMany({
            where: { userId: session.user.id },
            include: {
                _count: { select: { files: true, comments: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error("[GET /api/design-projects]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/design-projects — create new project
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();
        const { name, clientEmail, description } = body;

        if (!name || !clientEmail) {
            return NextResponse.json({ error: "name and clientEmail are required" }, { status: 400 });
        }

        // Enforce project limit based on user's plan
        if (session.user.role !== "ADMIN") {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { planId: true },
            });
            const plan = user?.planId
                ? await prisma.plan.findUnique({ where: { id: user.planId } })
                : await prisma.plan.findFirst({ where: { isDefault: true } });

            const limit = plan?.projectLimit ?? 3;
            if (limit !== -1) {
                const count = await prisma.designProject.count({
                    where: { userId: session.user.id },
                });
                if (count >= limit) {
                    return NextResponse.json(
                        { error: `Project limit reached (${limit}). Upgrade your plan for more projects.`, limitReached: true },
                        { status: 403 }
                    );
                }
            }
        }

        const project = await prisma.designProject.create({
            data: {
                name: name.trim(),
                clientEmail: clientEmail.trim().toLowerCase(),
                description: description?.trim() || null,
                userId: session.user.id,
            },
        });
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("[POST /api/design-projects]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
