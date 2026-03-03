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
        const project = await prisma.project.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(client && { client }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
            },
        });

        return NextResponse.json(project);
    } catch {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
}


