import { z } from "zod";

function isYouTubeUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    return (
      hostname === "youtu.be" ||
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtube-nocookie.com" ||
      hostname.endsWith(".youtube-nocookie.com")
    );
  } catch {
    return false;
  }
}

function cleanPathId(value?: string | null) {
  return value?.replace(/[^a-zA-Z0-9_-]/g, "") || "";
}

function hasPlayableYouTubeTarget(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);
    const playlistId = cleanPathId(url.searchParams.get("list"));
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = cleanPathId(segments[0]);
    } else {
      videoId = cleanPathId(url.searchParams.get("v"));

      if (!videoId && ["embed", "shorts", "live"].includes(segments[0])) {
        videoId = cleanPathId(segments[1]);
      }
    }

    return Boolean(videoId || playlistId);
  } catch {
    return false;
  }
}

export const musicTrackSchema = z.object({
  title: z.string().trim().min(2).max(160),
  youtubeUrl: z
    .string()
    .trim()
    .url()
    .max(500)
    .refine(isYouTubeUrl, "Please enter a valid YouTube link.")
    .refine(hasPlayableYouTubeTarget, "Please enter a YouTube video or playlist link."),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const musicTrackPatchSchema = musicTrackSchema.partial().refine(
  (value) =>
    value.title !== undefined ||
    value.youtubeUrl !== undefined ||
    value.active !== undefined ||
    value.sortOrder !== undefined,
  {
    message: "Nothing to update.",
  },
);

export function normalizeMusicTrackPayload(payload: Partial<Record<string, unknown>>) {
  const sortOrderRaw = Number(payload.sortOrder ?? 0);

  return {
    title: String(payload.title ?? "").trim(),
    youtubeUrl: String(payload.youtubeUrl ?? "").trim(),
    active:
      payload.active === undefined
        ? true
        : payload.active === true ||
          payload.active === "true" ||
          payload.active === "on",
    sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0,
  };
}
