import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

import { requireCustomerSession } from "@/lib/require-customer";
import { requireAdminSession } from "@/lib/require-admin";

/**
 * Chat attachment upload — used by both customers and the admin replying
 * in a conversation, unlike /api/upload (product images, admin only).
 * Same security measures as that route: MIME allowlist, size cap,
 * images re-encoded with sharp (strips metadata, guarantees genuine raster
 * bytes), server-generated filename (rules out path traversal).
 */
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
// Browsers disagree on what MediaRecorder produces for a microphone
// recording — Chrome/Firefox default to webm/opus, Safari to mp4/aac.
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PDF_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB — a few minutes of voice audio

export async function POST(request: NextRequest) {
  const customerSession = await requireCustomerSession();
  const adminSession = customerSession ? null : await requireAdminSession();
  if (!customerSession && !adminSession) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo faltante" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "chat");
  await mkdir(uploadsDir, { recursive: true });

  if (ALLOWED_IMAGE_TYPES.has(file.type)) {
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "La imagen supera los 5 MB" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${randomUUID()}.webp`;
    const optimized = await sharp(buffer)
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    await writeFile(path.join(uploadsDir, filename), optimized);
    return NextResponse.json(
      { url: `/uploads/chat/${filename}`, type: "image" },
      { status: 201 },
    );
  }

  if (file.type === "application/pdf") {
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "El PDF supera los 8 MB" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // %PDF- magic bytes: cheap sanity check that this is genuinely a PDF,
    // not just a file renamed to end in .pdf with a spoofed MIME type.
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json({ error: "El archivo no es un PDF válido" }, { status: 415 });
    }

    const filename = `${randomUUID()}.pdf`;
    await writeFile(path.join(uploadsDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/chat/${filename}`, type: "pdf" }, { status: 201 });
  }

  if (ALLOWED_AUDIO_TYPES.has(file.type)) {
    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "El audio supera los 10 MB" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.type === "audio/mp4" ? "m4a" : file.type.split("/")[1];
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadsDir, filename), buffer);
    return NextResponse.json(
      { url: `/uploads/chat/${filename}`, type: "audio" },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { error: "Formato no permitido. Usá PNG, JPG, WEBP, PDF o un audio." },
    { status: 415 },
  );
}
