"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLanguage } from "../lang-actions";
import { dict, type Lang } from "@/lib/i18n";

/** Small switch between English and ಕನ್ನಡ. Shows the language you would switch TO. */
export function LanguageToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Lang = lang === "en" ? "kn" : "en";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setLanguage(next);
          router.refresh();
        })
      }
      aria-label={next === "kn" ? "Switch to Kannada" : "Switch to English"}
      className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-tribe hover:text-tribe disabled:opacity-60"
    >
      {dict[lang].switchTo}
    </button>
  );
}
