import { mkdir, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";

import { getUploadDirectory } from "@/lib/upload-storage";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export class UploadValidationError extends Error {}

export function validateImageFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadValidationError("Only JPG, PNG, WEBP, or AVIF files are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new UploadValidationError("Image must be 5MB or smaller.");
  }
}

export async function saveImageFile(file: File) {
  validateImageFile(file);

  const extension = EXTENSION_BY_TYPE[file.type];
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const uploadDirectory = getUploadDirectory();
  const filePath = path.join(uploadDirectory, fileName);

  await mkdir(uploadDirectory, { recursive: true, mode: 0o755 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer, { mode: 0o644 });

  return `/uploads/${fileName}`;
}
