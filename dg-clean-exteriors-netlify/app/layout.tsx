import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "DG Clean Exteriors | Bringing Curb Appeal Back",
    description:
      "A surface-aware exterior cleaning experience for concrete, siding, patios, fences, storefronts, and the details that make a property feel cared for.",
    icons: {
      icon: "/dg-clean-logo.png",
      shortcut: "/dg-clean-logo.png",
      apple: "/dg-clean-logo.png",
    },
    openGraph: {
      type: "website",
      url: origin,
      title: "DG Clean Exteriors | Bringing Curb Appeal Back",
      description:
        "Built on pressure. Guided by God. Exterior cleaning shaped around the surface and the curb appeal you want back.",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1536,
          height: 864,
          alt: "DG Clean Exteriors — Bringing Curb Appeal Back",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "DG Clean Exteriors | Bringing Curb Appeal Back",
      description: "Built on pressure. Guided by God.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
