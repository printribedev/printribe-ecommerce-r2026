import type { Lang } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

/** Logo on the left, language switch on the right. Shown at the top of every customer page. */
export function OrderHeader({ lang }: { lang: Lang }) {
  return (
    <header className="mb-5 flex items-center justify-between">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/printribe-logo.png" alt="Printribe" className="h-8 w-auto" />
      <LanguageToggle lang={lang} />
    </header>
  );
}
