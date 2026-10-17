"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadToR2 } from "@/components/admin/ImageUploader";
import { dict, type Lang } from "@/lib/i18n";
import { submitPaymentProof } from "../actions";

/**
 * Payment confirmation. A screenshot of the payment is REQUIRED: the button stays off until one is
 * chosen, and the server refuses to continue without a real uploaded file. The UPI transaction ID is
 * an optional extra that helps match the payment faster.
 */
export function PaymentProof({
  token,
  lang,
  uploadsEnabled,
  whatsappHref,
}: {
  token: string;
  lang: Lang;
  uploadsEnabled: boolean;
  whatsappHref: string | null;
}) {
  const t = dict[lang].pay;
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [utr, setUtr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pick(f?: File) {
    if (!f) return;
    setFile(f);
    setError("");
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const key = await uploadToR2(file, "artwork");
      const result = await submitPaymentProof(token, key, utr);
      if (result.error) throw new Error(result.error);
      router.refresh(); // the page now shows the confirmation step
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // Messages from our own server are already in the visitor's language; anything else is a network problem.
      setError(message && !/fetch|network|storage|upload|Failed/i.test(message) ? message : t.uploadFailed);
      setBusy(false);
    }
  }

  if (!uploadsEnabled) {
    return (
      <div className="space-y-3 text-left">
        <p className="rounded-lg bg-neutral-100 px-3 py-3 text-sm text-neutral-700">{t.proofUnavailable}</p>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-neutral-300 px-4 py-3 text-center text-sm font-medium hover:bg-neutral-50"
          >
            WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <div>
        <p className="text-sm font-semibold">
          {t.proofTitle} <span className="text-tribe-dark">*</span>
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">{t.proofRequired}</p>
        <p className="mt-1 text-xs text-neutral-500">{t.shotHelp}</p>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {preview ? (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="h-20 w-16 rounded-md border object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file?.name}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="text-sm font-medium text-tribe underline"
            >
              {t.changeFile}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-neutral-300 px-4 py-6 text-sm font-medium text-neutral-700 hover:border-tribe hover:text-tribe"
        >
          {t.chooseFile}
        </button>
      )}

      <div>
        <label htmlFor="utr" className="mb-1 block text-sm font-medium">
          {t.utrOptional}
        </label>
        <input
          id="utr"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          autoComplete="off"
          placeholder={t.utrPlaceholder}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base outline-none focus:border-tribe"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-tribe-light px-3 py-2 text-sm text-tribe-dark">
          {error}
        </p>
      )}

      <div>
        <button
          disabled={!file || busy}
          className="w-full rounded-lg bg-tribe px-4 py-4 text-base font-semibold text-white hover:bg-tribe-dark disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {busy ? t.uploading : t.submit}
        </button>
        {!file && <p className="mt-2 text-center text-xs text-neutral-500">{t.needFile}</p>}
      </div>
    </form>
  );
}
