"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { dict, type Lang } from "@/lib/i18n";
import { PaymentForm } from "./PaymentForm";

/**
 * After paying, the customer confirms in either of two ways: type the UPI transaction ID,
 * or upload a screenshot of the payment. Either one is enough.
 */
export function PaymentOptions({
  token,
  lang,
  uploadsEnabled,
  onScreenshot,
}: {
  token: string;
  lang: Lang;
  uploadsEnabled: boolean;
  /** Server action (already bound to this order) that saves the uploaded file. */
  onScreenshot: (key: string) => Promise<void>;
}) {
  const t = dict[lang].pay;
  const [mode, setMode] = useState<"utr" | "shot">("utr");

  const tab = (value: "utr" | "shot", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => setMode(value)}
      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium ${
        mode === value ? "bg-white text-tribe shadow-sm" : "text-neutral-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <p className="mb-2 text-left text-sm text-neutral-600">{t.chooseOne}</p>
      <div role="tablist" className="mb-4 flex gap-1 rounded-xl bg-neutral-100 p-1">
        {tab("utr", t.optionUtr)}
        {tab("shot", t.optionShot)}
      </div>

      {mode === "utr" ? (
        <PaymentForm token={token} lang={lang} />
      ) : uploadsEnabled ? (
        <div className="space-y-3 text-left">
          <p className="text-sm text-neutral-600">{t.shotHelp}</p>
          <ImageUploader kind="artwork" label={t.upload} onDone={onScreenshot} />
        </div>
      ) : (
        <p className="rounded-lg bg-neutral-100 px-3 py-3 text-left text-sm text-neutral-600">{t.shotUnavailable}</p>
      )}
    </div>
  );
}
