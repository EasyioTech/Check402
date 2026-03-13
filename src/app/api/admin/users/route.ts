import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all users (admin only)
export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true, name: true, email: true, plan: true,
            role: true, isBanned: true, onboardingComplete: true,
            createdAt: true, _count: { select: { projects: true } },
        },
    });

    return NextResponse.json(users);
}

// PATCH - ban/unban a user (admin only)
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, isBanned } = await req.json();

    if (!userId || typeof isBanned !== "boolean") {
        return NextResponse.json({ error: "userId and isBanned are required." }, { status: 400 });
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: { isBanned },
    });

    return NextResponse.json({ success: true, user });
}
