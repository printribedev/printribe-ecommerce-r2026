import type { Metadata } from "next";
import { getLang } from "@/lib/lang";
import { QUICK_PRODUCT as P, productText } from "@/lib/quick-product";
import { ProductView } from "./order/ProductView";

export function generateMetadata(): Metadata {
  const text = productText(getLang());
  const title = `${text.name} · Printribe`;
  return {
    // Needed so the share preview image (WhatsApp, Instagram…) gets a full web address.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://printribe-kannada-rajyotsava.vercel.app"),
    title,
    description: text.tagline,
    openGraph: {
      title,
      description: text.tagline,
      images: P.images[0] ? [{ url: P.images[0].src, alt: P.images[0].alt }] : undefined,
    },
  };
}

export default function Home() {
  return <ProductView />;
}
