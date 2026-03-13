import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { key, clientEmail, message, proofReference } = body;

        if (!key || !clientEmail || !message) {
            return NextResponse.json(
                { error: "API key, client email, and message are required." },
                { status: 400 }
            );
        }

        // Find the project by API key
        const project = await prisma.project.findUnique({
            where: { apiKey: key },
        });

        if (!project) {
            return NextResponse.json({ error: "Invalid project key." }, { status: 404 });
        }

        // Check if an open dispute already exists for this project
        const existing = await prisma.dispute.findFirst({
            where: { projectId: project.id, status: "open" },
        });

        if (existing) {
            return NextResponse.json(
                { error: "A dispute for this project is already open and under review." },
                { status: 409 }
            );
        }

        await prisma.dispute.create({
            data: {
                projectId: project.id,
                clientEmail,
                message,
                proofReference: proofReference || null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[dispute]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
