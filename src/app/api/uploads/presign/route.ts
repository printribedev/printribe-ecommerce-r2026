import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccess, getProfile } from "@/lib/auth";
import { presignUpload, publicUrl } from "@/lib/r2";

const MB = 1024 * 1024;

const KINDS = {
  // Product photos, mockups, banners: staff only, goes to the public bucket.
  catalogue: {
    bucket: "public" as const,
    types: ["image/png", "image/jpeg", "image/webp"],
    maxSize: 8 * MB,
  },
  // Customer artwork: anyone (guests too), goes to the private bucket.
  artwork: {
    bucket: "private" as const,
    types: ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"],
    maxSize: 25 * MB,
  },
};

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

const Body = z.object({
  kind: z.enum(["catalogue", "artwork"]),
  contentType: z.string(),
  size: z.number().int().positive(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { kind, contentType, size } = parsed.data;
  const rule = KINDS[kind];

  if (kind === "catalogue") {
    const profile = await getProfile();
    const allowed =
      profile && (canAccess(profile, "products") || canAccess(profile, "content"));
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!rule.types.includes(contentType))
    return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
  if (size > rule.maxSize)
    return NextResponse.json(
      { error: `File too large (max ${rule.maxSize / MB} MB)` },
      { status: 413 }
    );

  // Random key: we never trust the customer's filename.
  const key = `${kind}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${EXT[contentType]}`;
  const uploadUrl = await presignUpload({ bucket: rule.bucket, key, contentType, size });

  return NextResponse.json({
    uploadUrl,
    key,
    url: rule.bucket === "public" ? publicUrl(key) : null,
  });
}
