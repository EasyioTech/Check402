import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Check 402 — Payment Enforcement",
    description: "Manage client web app payment statuses with API key verification",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
