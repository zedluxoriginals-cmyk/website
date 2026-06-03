import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";

// Self-hosted (no Google Fonts network dependency at build or runtime).
const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    {
      path: "./fonts/inter-variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
});

const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "./fonts/cormorant-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-600.woff2", weight: "600", style: "normal" },
  ],
});

// Resolves OG/Twitter image URLs and silences the metadataBase build warning.
// Set NEXT_PUBLIC_SITE_URL in the Vercel env at deploy (Phase 10); falls back
// to localhost for local builds.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZEDLUXE ORIGINALS — Elevated Essentials",
    template: "%s · ZEDLUXE ORIGINALS",
  },
  description:
    "Premium streetwear for people who stand out without trying too hard. Quality. Culture. Confidence. This is Zedluxe Originals.",
  openGraph: {
    type: "website",
    siteName: "ZEDLUXE ORIGINALS",
    title: "ZEDLUXE ORIGINALS — Elevated Essentials",
    description:
      "Premium streetwear for people who stand out without trying too hard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZEDLUXE ORIGINALS — Elevated Essentials",
    description:
      "Premium streetwear for people who stand out without trying too hard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <CartProvider>
          <WishlistProvider>
            <div id="main-content" className="flex flex-1 flex-col">
              {children}
            </div>
            <Footer />
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
