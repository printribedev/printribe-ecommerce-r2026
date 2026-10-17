"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadToR2 } from "./ImageUploader";

type Rect = { x: number; y: number; w: number };

/**
 * Lets staff upload a photo of the product (one colour, one placement) and drag a rectangle
 * to mark where artwork will print. The rectangle keeps the print area's real-world shape
 * (width mm × height mm), and is stored as fractions (0–1) of the photo so it works at any size.
 */
export function MockupEditor({
  colorName,
  areaLabel,
  heightOverWidth,
  initial,
  save,
  remove,
}: {
  colorName: string;
  areaLabel: string;
  /** printArea.heightMm / printArea.widthMm */
  heightOverWidth: number;
  initial?: { url: string; key: string; x: number; y: number; w: number };
  save: (key: string, rect: { x: number; y: number; w: number; h: number }) => Promise<void>;
  remove?: () => Promise<void>;
}) {
  const router = useRouter();
  const stage = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(initial?.key ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [rect, setRect] = useState<Rect>(initial ?? { x: 0.3, y: 0.25, w: 0.4 });
  const [aspect, setAspect] = useState(0); // photo height / width
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Rectangle height as a fraction of the photo height, keeping the real print shape.
  const h = aspect ? Math.min((rect.w * heightOverWidth) / aspect, 1) : 0;

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setKey(await uploadToR2(file));
      setUrl(URL.createObjectURL(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function startDrag(mode: "move" | "resize") {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const box = stage.current!.getBoundingClientRect();
      const start = { px: e.clientX, py: e.clientY, ...rect };
      const move = (ev: PointerEvent) => {
        const dx = (ev.clientX - start.px) / box.width;
        const dy = (ev.clientY - start.py) / box.height;
        if (mode === "move") {
          setRect({
            ...start,
            x: Math.min(Math.max(0, start.x + dx), 1 - start.w),
            y: Math.min(Math.max(0, start.y + dy), 1 - h),
          });
        } else {
          const w = Math.min(Math.max(0.05, start.w + dx), 1 - start.x);
          if (start.y + (w * heightOverWidth) / aspect <= 1) setRect({ ...start, w });
        }
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
  }

  async function onSave() {
    setBusy(true);
    setError("");
    try {
      await save(key, { x: rect.x, y: rect.y, w: rect.w, h });
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-medium">{colorName}</span>
          <span className="text-neutral-500"> · {areaLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
        >
          {initial ? (open ? "Close" : "Edit") : open ? "Close" : "Add mockup"}
        </button>
      </div>

      {!open && initial && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={initial.url} alt="" className="mt-3 h-24 rounded-md border object-contain" />
      )}

      {open && (
        <div className="mt-3 space-y-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="block w-full text-sm"
          />
          {url && (
            <>
              <p className="text-xs text-neutral-500">
                Drag the red box to where artwork prints. Drag the corner dot to resize. The shape
                is locked to the real print size.
              </p>
              <div ref={stage} className="relative mx-auto max-w-md touch-none select-none overflow-hidden rounded-md border bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  draggable={false}
                  className="block w-full"
                  onLoad={(e) => setAspect(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
                />
                {aspect > 0 && (
                  <div
                    onPointerDown={startDrag("move")}
                    className="absolute cursor-move border-2 border-tribe bg-tribe/15"
                    style={{
                      left: `${rect.x * 100}%`,
                      top: `${rect.y * 100}%`,
                      width: `${rect.w * 100}%`,
                      height: `${h * 100}%`,
                    }}
                  >
                    <span
                      onPointerDown={startDrag("resize")}
                      className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-tribe"
                    />
                  </div>
                )}
              </div>
            </>
          )}
          {error && <p className="text-xs text-tribe-dark">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || !key || !aspect}
              onClick={onSave}
              className="rounded-md bg-tribe px-4 py-2 text-sm font-medium text-white hover:bg-tribe-dark disabled:opacity-60"
            >
              {busy ? "Working…" : "Save mockup"}
            </button>
            {remove && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  await remove();
                  router.refresh();
                  setOpen(false);
                }}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-tribe-dark hover:bg-tribe-light"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
