import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create a free Check 402 account and start enforcing client payments in minutes.",
    openGraph: {
        title: "Sign Up | Check 402",
        description: "Join developers worldwide using Check 402 to ensure they get paid for their work.",
    },
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
