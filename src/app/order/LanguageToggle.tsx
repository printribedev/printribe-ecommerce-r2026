"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { setLanguage } from "../lang-actions";
import { dict, type Lang } from "@/lib/i18n";

/**
 * Small switch between English and ಕನ್ನಡ. Shows the language you would switch TO.
 * While the page reloads in the new language, a full-page overlay with a spinner covers the screen.
 */
export function LanguageToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [switching, setSwitching] = useState(false);
  const next: Lang = lang === "en" ? "kn" : "en";

  // The page re-renders with the new `lang` once it has loaded: that's when the overlay goes away.
  useEffect(() => setSwitching(false), [lang]);

  // Safety net: never leave the overlay up if something goes wrong.
  useEffect(() => {
    if (!switching) return;
    const timer = setTimeout(() => setSwitching(false), 10000);
    return () => clearTimeout(timer);
  }, [switching]);

  function onClick() {
    setSwitching(true);
    start(async () => {
      try {
        await setLanguage(next);
        router.refresh();
      } catch {
        setSwitching(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={switching}
        onClick={onClick}
        aria-label={next === "kn" ? "Switch to Kannada" : "Switch to English"}
        className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-tribe hover:text-tribe disabled:opacity-60"
      >
        {dict[lang].switchTo}
      </button>

      {switching && (
        <div
          role="status"
          aria-live="polite"
          data-testid="language-loader"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-paper/80 backdrop-blur-sm"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-tribe/25 border-t-tribe" />
          <p className="text-sm font-medium text-neutral-700">{dict[next].switching}</p>
        </div>
      )}
    </>
  );
}
