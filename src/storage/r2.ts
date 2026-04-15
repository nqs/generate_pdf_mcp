export interface UploadResult {
  key: string;
  downloadUrl: string;
  expiresIn: number; // seconds
  sizeBytes: number;
}

export interface StorageOptions {
  ttlSeconds?: number; // default 3600 (1 hour)
  baseUrl?: string; // worker URL for constructing download paths
}

const DEFAULT_TTL_SECONDS = 3600;

/**
 * Generate a unique R2 object key for a PDF file.
 */
export function generateKey(filename: string): string {
  const id = crypto.randomUUID();
  return `pdfs/${id}/${filename}`;
}

/**
 * Upload a PDF to R2 and return metadata including the download URL.
 */
export async function uploadPdf(
  bucket: R2Bucket,
  filename: string,
  pdfBytes: Uint8Array,
  options?: StorageOptions
): Promise<UploadResult> {
  const ttl = options?.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const key = generateKey(filename);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl * 1000);

  await bucket.put(key, pdfBytes, {
    httpMetadata: {
      contentType: "application/pdf",
      contentDisposition: `attachment; filename="${filename}"`,
    },
    customMetadata: {
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    },
  });

  const baseUrl = options?.baseUrl ?? "";
  const downloadUrl = `${baseUrl}/download/${key}`;

  return {
    key,
    downloadUrl,
    expiresIn: ttl,
    sizeBytes: pdfBytes.byteLength,
  };
}

/**
 * Handle a download request by fetching the object from R2.
 */
export async function handleDownload(
  bucket: R2Bucket,
  key: string
): Promise<Response> {
  const object = await bucket.get(key);

  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  // Check TTL expiration via custom metadata
  const expiresAt = object.customMetadata?.expiresAt;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    // Clean up expired object in the background
    await bucket.delete(key);
    return new Response("Link expired", { status: 410 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("content-length", String(object.size));

  return new Response(object.body, { headers });
}

const DEFAULT_INLINE_THRESHOLD = 102400; // 100KB

/**
 * Returns true if the PDF is small enough to return inline as base64.
 */
export function shouldReturnInline(
  sizeBytes: number,
  threshold?: number
): boolean {
  return sizeBytes < (threshold ?? DEFAULT_INLINE_THRESHOLD);
}

/**
 * Convert a Uint8Array to a base64 string.
 */
export function toBase64(pdfBytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < pdfBytes.byteLength; i++) {
    binary += String.fromCharCode(pdfBytes[i]);
  }
  return btoa(binary);
}

