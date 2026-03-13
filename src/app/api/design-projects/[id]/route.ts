import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = ["DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED"];

// GET /api/design-projects/[id]
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const project = await prisma.designProject.findUnique({
            where: { id },
            include: {
                files: { orderBy: { createdAt: "desc" } },
                comments: { orderBy: { createdAt: "asc" } },
            },
        });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (project.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.json(project);
    } catch (error) {
        console.error("[GET /api/design-projects/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/design-projects/[id] — update status or metadata
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const project = await prisma.designProject.findUnique({ where: { id } });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (project.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { status, name, description } = body;

        if (status && !ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Use one of: ${ALLOWED_STATUSES.join(", ")}` },
                { status: 400 }
            );
        }

        const updated = await prisma.designProject.update({
            where: { id },
            data: {
                ...(status && { status }),
                // Stamp approvedAt the first time we enter APPROVED
                ...(status === "APPROVED" && !project.approvedAt && { approvedAt: new Date() }),
                // Clear approvedAt if designer moves back out of APPROVED
                ...(status && status !== "APPROVED" && project.approvedAt && { approvedAt: null }),
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PUT /api/design-projects/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/design-projects/[id] — permanently disabled
// Designer projects are permanent records; only files are purged on completion.
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await params; // satisfy Next.js param requirement
    return NextResponse.json(
        { error: "Designer projects cannot be deleted. Complete the project to purge its files." },
        { status: 403 }
    );
}
