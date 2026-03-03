import type { Metadata } from "next";
import "./globals.css";

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Check 402",
    "operatingSystem": "Web",
    "applicationCategory": "DeveloperApplication",
    "description": "Manage client web app payment statuses with API key verification. Prevent scope creep and ensure you get paid for your work.",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "author": {
        "@type": "Organization",
        "name": "Check 402",
        "url": "https://check402.com"
    }
};

export const metadata: Metadata = {
    title: {
        default: "Check 402 — Payment Enforcement",
        template: "%s | Check 402"
    },
    description: "Manage client web app payment statuses with API key verification. Prevent scope creep and ensure you get paid for your work.",
    keywords: ["payment enforcement", "micro-saas", "api key verification", "developer tools", "payment tracker"],
    authors: [{ name: "Check 402 Team" }],
    creator: "Check 402",
    publisher: "Check 402",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://check402.com'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "Check 402 — Payment Enforcement",
        description: "Manage client web app payment statuses with API key verification.",
        url: 'https://check402.com',
        siteName: 'Check 402',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Check 402 — Payment Enforcement for Developers',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Check 402 — Payment Enforcement",
        description: "Manage client web app payment statuses with API key verification.",
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
