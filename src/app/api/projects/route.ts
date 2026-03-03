import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role-based filtering: Admins see all, users see their own
    const whereClause = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const projects = await prisma.project.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, client, description, framework } = body;

    if (!name || !client) {
        return NextResponse.json(
            { error: "Name and client are required" },
            { status: 400 }
        );
    }

    // Check project creation limits for Developer tier
    if (session.user.plan === "DEVELOPER" && session.user.role !== "ADMIN") {
        const projectCount = await prisma.project.count({
            where: { userId: session.user.id },
        });

        if (projectCount >= 2) {
            return NextResponse.json(
                { error: "Project limit reached. Upgrade to Enterprise for unlimited projects." },
                { status: 403 }
            );
        }
    }

    const project = await prisma.project.create({
        data: {
            name,
            client,
            description: description || null,
            framework: framework || "other",
            apiKey: uuidv4(),
            status: "PENDING",
            userId: session.user.id,
        },
    });

    return NextResponse.json(project, { status: 201 });
}
