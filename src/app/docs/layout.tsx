import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation",
    description: "Learn how to integrate Check 402 into your web applications with our comprehensive guides for React, Next.js, Vue, and more.",
    openGraph: {
        title: "Check 402 Documentation — Integration Guides",
        description: "Step-by-step guides to help you enforce payments in any web app.",
    },
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
