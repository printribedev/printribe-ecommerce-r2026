import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Kannada } from "next/font/google";
import { getLang } from "@/lib/lang";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Kannada script isn't in Inter, so text like ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ falls through to this font.
const kannada = Noto_Sans_Kannada({ subsets: ["kannada"], variable: "--font-kannada" });

export const metadata: Metadata = {
  title: "Printribe",
  description: "Custom print & apparel, designed by you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EE3C30",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={getLang()}>
      <body className={`${inter.variable} ${kannada.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
