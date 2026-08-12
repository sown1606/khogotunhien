import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { getUploadReadDirectories, resolveUploadPath } from "@/lib/upload-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

async function findUpload(uploadPath: string[]) {
  const uploadDirectories = getUploadReadDirectories();

  for (const uploadDirectory of uploadDirectories) {
    const filePath = resolveUploadPath(uploadDirectory, uploadPath);

    if (!filePath) {
      continue;
    }

    try {
      const fileStat = await stat(filePath);

      if (!fileStat.isFile()) {
        continue;
      }

      return {
        contentLength: fileStat.size,
        contentType:
          contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        filePath,
      };
    } catch {
      continue;
    }
  }

  return null;
}

function getResponseHeaders(upload: NonNullable<Awaited<ReturnType<typeof findUpload>>>) {
  return {
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(upload.contentLength),
    "Content-Type": upload.contentType,
    "X-Content-Type-Options": "nosniff",
  };
}

function notFoundResponse() {
  return NextResponse.json(
    { error: "Not found." },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: uploadPath } = await context.params;
  const upload = await findUpload(uploadPath);

  if (!upload) {
    return notFoundResponse();
  }

  const file = await readFile(upload.filePath);

  return new NextResponse(file, { headers: getResponseHeaders(upload) });
}

export async function HEAD(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: uploadPath } = await context.params;
  const upload = await findUpload(uploadPath);

  if (!upload) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new NextResponse(null, { headers: getResponseHeaders(upload) });
}
