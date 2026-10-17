"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Uploads an image straight to the public R2 bucket (via a presigned URL) and either
 *  - puts the resulting key in a hidden input called `name` (for use inside a form), or
 *  - calls `onDone(key)` (a bound server action) and refreshes the page.
 */
export function uploadToR2(file: File, kind: "catalogue" | "artwork" = "catalogue"): Promise<string> {
  return fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, contentType: file.type, size: file.size }),
  })
    .then(async (res) => {
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      const put = await fetch(body.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("Upload to storage failed (check the bucket's CORS rules)");
      return body.key as string;
    });
}

export function ImageUploader({
  name,
  initialKey,
  initialUrl,
  onDone,
  label = "Upload image",
  kind = "catalogue",
}: {
  name?: string;
  initialKey?: string | null;
  initialUrl?: string | null;
  onDone?: (key: string) => Promise<void>;
  label?: string;
  /** "artwork" = private bucket, open to customers (e.g. payment screenshots) */
  kind?: "catalogue" | "artwork";
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [key, setKey] = useState(initialKey ?? "");
  const [preview, setPreview] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const newKey = await uploadToR2(file, kind);
      setKey(newKey);
      setPreview(URL.createObjectURL(file));
      if (onDone) {
        await onDone(newKey);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      {name && <input type="hidden" name={name} value={key} />}
      {preview && !onDone && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-14 w-14 rounded-md border object-cover" />
      )}
      <div>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        >
          {busy ? "Uploading…" : label}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        {error && <p className="mt-1 text-xs text-tribe-dark">{error}</p>}
      </div>
    </div>
  );
}
