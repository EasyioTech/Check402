import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export const razorpay = new Razorpay({
    key_id: keyId || "PLACEHOLDER",
    key_secret: keySecret || "PLACEHOLDER",
});
