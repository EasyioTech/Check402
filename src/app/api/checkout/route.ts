import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const options = {
            amount: 1500, // $15.00 in cents
            currency: "USD",
            receipt: `receipt_${session.user.id}_${Date.now()}`,
            notes: {
                userId: session.user.id,
                userEmail: session.user.email,
            },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.log("[RAZORPAY_CHECKOUT]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
