import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Two buckets:
 *  - public:  catalogue/mockup images, served from R2_PUBLIC_URL (custom domain or r2.dev)
 *  - private: customer artwork, only reachable through short-lived signed URLs
 */
export type Bucket = "public" | "private";

const BUCKETS: Record<Bucket, () => string> = {
  public: () => process.env.R2_PUBLIC_BUCKET!,
  private: () => process.env.R2_PRIVATE_BUCKET!,
};

let client: S3Client | undefined;
function r2() {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

/** URL the browser PUTs the file to. Content type and exact size are part of the signature. */
export function presignUpload(opts: {
  bucket: Bucket;
  key: string;
  contentType: string;
  size: number;
}) {
  return getSignedUrl(
    r2(),
    new PutObjectCommand({
      Bucket: BUCKETS[opts.bucket](),
      Key: opts.key,
      ContentType: opts.contentType,
      ContentLength: opts.size,
    }),
    { expiresIn: 300 }
  );
}

/** Short-lived download link for private files (e.g. artwork shown in admin or sent to the CRM). */
export function presignDownload(key: string, expiresIn = 3600) {
  return getSignedUrl(
    r2(),
    new GetObjectCommand({ Bucket: BUCKETS.private(), Key: key }),
    { expiresIn }
  );
}

/** True only if a file really exists in the private bucket under this key. */
export async function privateObjectExists(key: string): Promise<boolean> {
  try {
    const head = await r2().send(new HeadObjectCommand({ Bucket: BUCKETS.private(), Key: key }));
    return (head.ContentLength ?? 0) > 0;
  } catch {
    return false;
  }
}

export function publicUrl(key: string) {
  return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
}
