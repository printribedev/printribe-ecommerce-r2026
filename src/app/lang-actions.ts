"use server";

import { cookies } from "next/headers";
import { LANG_COOKIE, isLang } from "@/lib/i18n";

/** Remembers the visitor's language for a year. The page refreshes itself afterwards. */
export async function setLanguage(lang: string) {
  if (!isLang(lang)) return;
  cookies().set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
