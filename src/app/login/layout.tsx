import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Sign in to your Check 402 dashboard to manage your projects and payment statuses.",
    openGraph: {
        title: "Login | Check 402",
        description: "Access your developer dashboard and take control of your client payments.",
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
