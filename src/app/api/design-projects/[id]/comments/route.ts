import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET /api/design-projects/[id]/comments — public access (used by preview page)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const project = await prisma.designProject.findUnique({ where: { id } });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const comments = await prisma.designComment.findMany({
            where: { designProjectId: id },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(comments);
    } catch (error) {
        console.error("[GET /api/design-projects/[id]/comments]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/design-projects/[id]/comments — no auth required (client-facing)
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { clientEmail, message, isApproval } = body;

        if (!clientEmail || !isValidEmail(clientEmail)) {
            return NextResponse.json({ error: "Valid clientEmail is required" }, { status: 400 });
        }
        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        const project = await prisma.designProject.findUnique({ where: { id } });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (project.status === "COMPLETED") {
            return NextResponse.json({ error: "Project is completed" }, { status: 400 });
        }

        const comment = await prisma.designComment.create({
            data: {
                designProjectId: id,
                clientEmail: clientEmail.trim().toLowerCase(),
                message: message.trim(),
                isApproval: Boolean(isApproval),
            },
        });

        // Auto-approve: if client approves and project is IN_REVIEW, advance status
        if (isApproval && project.status === "IN_REVIEW") {
            await prisma.designProject.update({
                where: { id },
                data: { status: "APPROVED" },
            });
        }

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("[POST /api/design-projects/[id]/comments]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
