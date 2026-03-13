import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { planSlug } = body;

        // Look up the target plan
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plan = planSlug
            ? await (prisma.plan as any).findUnique({ where: { slug: planSlug } })
            : await (prisma.plan as any).findFirst({
                where: { isActive: true, billingType: { not: "free" } },
                orderBy: { sortOrder: "asc" },
            });

        if (!plan || plan.price <= 0) {
            return NextResponse.json({ error: "No valid paid plan found" }, { status: 400 });
        }

        const options = {
            amount: plan.price, // Already in cents
            currency: plan.currency || "USD",
            receipt: `receipt_${session.user.id}_${Date.now()}`,
            notes: {
                userId: session.user.id,
                userEmail: session.user.email,
                planId: plan.id,
                planSlug: plan.slug,
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
            planName: plan.name,
        });
    } catch (error) {
        console.log("[RAZORPAY_CHECKOUT]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

