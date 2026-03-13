import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, client, description, status } = body;

    const validStatuses = ["COMPLETED", "PENDING", "DEFAULTED"];
    if (status && !validStatuses.includes(status)) {
        return NextResponse.json(
            { error: "Invalid status. Must be COMPLETED, PENDING, or DEFAULTED" },
            { status: 400 }
        );
    }

    try {
        // Fetch the current project to check the transition count
        const current = await prisma.project.findUnique({ where: { id } });
        if (!current) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // ── Transition Limit Guard ──────────────────────────────────────────
        // Each time a project is moved to DEFAULTED, it counts as one enforcement
        // cycle. After 2 cycles, further DEFAULTED transitions from non-admin users
        // are blocked to prevent abuse of the enforcement API.
        if (status === "DEFAULTED" && session.user.role !== "ADMIN") {
            if (current.transitionCount >= 2) {
                return NextResponse.json(
                    {
                        error: "Maximum enforcement cycles reached. This project has been moved to DEFAULTED twice. You must resolve the dispute externally or mark the project as COMPLETED.",
                        code: "TRANSITION_LIMIT_REACHED",
                    },
                    { status: 403 }
                );
            }
        }

        // ── Update Logic ────────────────────────────────────────────────────
        const updateData: Record<string, unknown> = {
            ...(name && { name }),
            ...(client && { client }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
        };

        // Increment transitionCount only when moving to DEFAULTED
        if (status === "DEFAULTED") {
            updateData.transitionCount = current.transitionCount + 1;
        }

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(project);
    } catch {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        await prisma.project.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
}
