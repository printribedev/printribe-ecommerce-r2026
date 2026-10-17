import type { Metadata } from "next";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";
import { ProductView } from "./order/ProductView";

export const metadata: Metadata = {
  title: `${P.name} · Printribe`,
  description: P.tagline,
};

export default function Home() {
  return <ProductView />;
}
