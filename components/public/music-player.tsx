"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Music2,
  Pause,
  Play,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { type Locale, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type PublicMusicTrack = {
  id: string;
  title: string;
  youtubeUrl: string;
};

type MusicPlayerProps = {
  tracks: PublicMusicTrack[];
  locale?: Locale;
  className?: string;
};

function cleanPathId(value?: string) {
  return value?.replace(/[^a-zA-Z0-9_-]/g, "") || "";
}

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = cleanPathId(segments[0]);
    } else {
      videoId = cleanPathId(url.searchParams.get("v") || undefined);

      if (!videoId && ["embed", "shorts", "live"].includes(segments[0])) {
        videoId = cleanPathId(segments[1]);
      }
    }

    const playlistId = cleanPathId(url.searchParams.get("list") || undefined);
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
    });

    if (playlistId) params.set("list", playlistId);

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
    }

    if (playlistId) {
      return `https://www.youtube-nocookie.com/embed/videoseries?${params.toString()}`;
    }
  } catch {
    return null;
  }

  return null;
}

export function MusicPlayer({ tracks, locale = "vi", className }: MusicPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const currentTrack = tracks[currentIndex];
  const embedUrl = useMemo(
    () => (currentTrack ? getYouTubeEmbedUrl(currentTrack.youtubeUrl) : null),
    [currentTrack],
  );

  useEffect(() => {
    const closePlayer = (event: MouseEvent) => {
      if (!playerRef.current?.contains(event.target as Node)) setExpanded(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };

    document.addEventListener("mousedown", closePlayer);
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.removeEventListener("mousedown", closePlayer);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  if (!tracks.length || !currentTrack) return null;

  const moveTrack = (direction: -1 | 1) => {
    setCurrentIndex((previous) => {
      const next = previous + direction;
      if (next < 0) return tracks.length - 1;
      if (next >= tracks.length) return 0;
      return next;
    });
  };

  return (
    <div ref={playerRef} className={cn("relative z-[60] shrink-0", className)}>
      <div className="flex h-10 items-center rounded-full border border-stone-300/80 bg-white/95 p-0.5 shadow-sm backdrop-blur-md">
        <Button
          type="button"
          size="icon"
          variant={playing ? "default" : "ghost"}
          className="size-9 rounded-full"
          onClick={() => {
            if (!playing) setExpanded(true);
            setPlaying((previous) => !previous);
          }}
          aria-label={
            playing
              ? t(locale, "Dừng nhạc", "Stop music")
              : t(locale, "Phát nhạc", "Play music")
          }
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>

        <button
          type="button"
          className="hidden min-w-0 items-center gap-2 rounded-full px-2 py-1 text-left hover:bg-stone-100 2xl:flex"
          onClick={() => setExpanded((previous) => !previous)}
          aria-label={t(locale, "Mở danh sách nhạc", "Open music playlist")}
        >
          <Music2 className="size-4 shrink-0 text-amber-700" />
          <span className="max-w-36 truncate text-xs font-semibold text-stone-800">
            {currentTrack.title}
          </span>
        </button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-9 rounded-full"
          onClick={() => setExpanded((previous) => !previous)}
          aria-expanded={expanded}
          aria-label={t(locale, "Mở danh sách nhạc", "Open music playlist")}
        >
          <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
        </Button>
      </div>

      <aside
        aria-label={t(locale, "Trình phát nhạc", "Music player")}
        className={cn(
          "fixed left-4 right-4 top-32 z-[70] overflow-hidden rounded-2xl border border-stone-200 bg-white/98 p-2 shadow-2xl backdrop-blur-xl transition duration-150 lg:absolute lg:left-auto lg:right-0 lg:top-[calc(100%+0.7rem)] lg:w-[22rem]",
          expanded
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5 px-1 pb-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-800">
              <Music2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">{currentTrack.title}</p>
              <p className="text-xs text-stone-500">
                {currentIndex + 1}/{tracks.length} · {t(locale, "Danh sách nhạc", "Playlist")}
              </p>
            </div>
          </div>

          {tracks.length > 1 ? (
            <>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full"
                onClick={() => moveTrack(-1)}
                aria-label={t(locale, "Bài trước", "Previous track")}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full"
                onClick={() => moveTrack(1)}
                aria-label={t(locale, "Bài tiếp theo", "Next track")}
              >
                <ChevronRight className="size-4" />
              </Button>
            </>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
          {playing && embedUrl ? (
            <iframe
              key={`${currentTrack.id}-${embedUrl}`}
              src={embedUrl}
              title={currentTrack.title}
              className="aspect-video w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-[16/8] items-center justify-center bg-stone-100">
              <Button type="button" size="sm" onClick={() => setPlaying(true)}>
                <Play className="size-4" />
                {t(locale, "Phát nhạc", "Play")}
              </Button>
            </div>
          )}
        </div>

        {tracks.length > 1 ? (
          <div className="mt-2 max-h-32 space-y-1 overflow-y-auto pr-1">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                  index === currentIndex
                    ? "bg-stone-900 text-white"
                    : "text-stone-700 hover:bg-stone-100",
                )}
                onClick={() => {
                  setCurrentIndex(index);
                  setPlaying(true);
                }}
              >
                <span className="w-5 shrink-0 text-center text-[10px] opacity-70">{index + 1}</span>
                <span className="truncate font-medium">{track.title}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-1 flex justify-end">
          <Button asChild size="sm" variant="ghost">
            <Link href={currentTrack.youtubeUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              YouTube
            </Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
