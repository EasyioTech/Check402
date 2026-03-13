import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { mode, persona, techStack, painPoint } = body;

        const isDesigner = mode === "DESIGNER";

        // Validate: all modes require at least mode + persona (design tool selection)
        if (!mode) {
            return NextResponse.json({ error: "Mode is required." }, { status: 400 });
        }

        // Developer requires all three; Designer only requires persona (tool)
        if (!isDesigner && (!persona || !techStack || !painPoint)) {
            return NextResponse.json({ error: "All onboarding fields are required for developer mode." }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                mode: isDesigner ? "DESIGNER" : "DEVELOPER",
                persona: persona || null,
                techStack: isDesigner ? null : (techStack || null),
                painPoint: isDesigner ? null : (painPoint || null),
                legalAccepted: true,
                onboardingComplete: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[onboarding]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
