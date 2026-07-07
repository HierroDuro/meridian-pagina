import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

import { requireAdminSession } from "@/lib/require-admin";

/**
 * Admin-only image upload for product photos.
 *
 * Security measures:
 * - Session check (also covered by middleware, checked again here).
 * - MIME type allowlist + file size cap.
 * - The file is re-encoded with `sharp` rather than written as-is: this
 *   strips EXIF/metadata and guarantees the bytes we save are a genuine
 *   raster image, not a disguised script or polyglot file.
 * - A fresh random filename is generated server-side — the client's
 *   original filename is never used for the path, which rules out path
 *   traversal (e.g. "../../etc/passwd.png").
 */
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo faltante" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usá PNG, JPG o WEBP." },
      { status: 415 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La imagen supera los 5 MB" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const destination = path.join(uploadsDir, filename);

  // Re-encoding to webp also normalizes format/size and drops any embedded
  // metadata or malformed chunks the original file might have carried.
  const optimized = await sharp(buffer)
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await writeFile(destination, optimized);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
