import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all disputes (admin only)
export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const disputes = await prisma.dispute.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            project: {
                select: {
                    id: true, name: true, client: true, status: true,
                    transitionCount: true, apiKey: true,
                    user: { select: { id: true, name: true, email: true } }
                }
            }
        }
    });

    return NextResponse.json(disputes);
}

// PATCH - resolve/dismiss a dispute, optionally ban developer & force project state
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { disputeId, action } = await req.json();
    // action: "resolve" | "dismiss"

    if (!disputeId || !["resolve", "dismiss"].includes(action)) {
        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const dispute = await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: { project: { include: { user: true } } }
    });

    if (!dispute) {
        return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
    }

    if (action === "resolve") {
        // Force project to COMPLETED and mark dispute resolved
        await prisma.$transaction([
            prisma.project.update({
                where: { id: dispute.projectId },
                data: { status: "COMPLETED" },
            }),
            prisma.dispute.update({
                where: { id: disputeId },
                data: { status: "resolved" },
            }),
        ]);
    } else {
        await prisma.dispute.update({
            where: { id: disputeId },
            data: { status: "dismissed" },
        });
    }

    return NextResponse.json({ success: true });
}
