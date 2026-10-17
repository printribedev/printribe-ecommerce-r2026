import type { Metadata } from "next";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";
import { ProductView } from "./order/ProductView";

const title = `${P.name} · Printribe`;

export const metadata: Metadata = {
  // Needed so the share preview image (WhatsApp, Instagram…) gets a full web address.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://printribe-ecommerce-r2026.vercel.app"),
  title,
  description: P.tagline,
  openGraph: {
    title,
    description: P.tagline,
    images: P.images[0] ? [{ url: P.images[0].src, alt: P.images[0].alt }] : undefined,
  },
};

export default function Home() {
  return <ProductView />;
}
