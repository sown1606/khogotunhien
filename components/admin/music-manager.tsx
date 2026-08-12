"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MusicTrackRow = {
  id: string;
  title: string;
  youtubeUrl: string;
  active: boolean;
  sortOrder: number;
};

type MusicManagerProps = {
  tracks: MusicTrackRow[];
};

async function readError(response: Response, fallback: string) {
  try {
    const json = (await response.json()) as { error?: string };
    return json.error || fallback;
  } catch {
    return fallback;
  }
}

export function MusicManager({ tracks }: MusicManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const createTrack = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/music", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            youtubeUrl,
            sortOrder,
            active: true,
          }),
        });

        if (!response.ok) {
          throw new Error(await readError(response, "Failed to add music track."));
        }

        toast.success("Đã thêm bài nhạc.");
        setTitle("");
        setYoutubeUrl("");
        setSortOrder(0);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to add music track.");
      }
    });
  };

  const updateTrack = (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/music/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.get("title"),
            youtubeUrl: formData.get("youtubeUrl"),
            sortOrder: formData.get("sortOrder"),
            active: formData.get("active") === "on",
          }),
        });

        if (!response.ok) {
          throw new Error(await readError(response, "Failed to save music track."));
        }

        toast.success("Đã lưu bài nhạc.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to save music track.");
      }
    });
  };

  const deleteTrack = (id: string) => {
    if (!window.confirm("Xóa bài nhạc này khỏi danh sách?")) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/music/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(await readError(response, "Failed to delete music track."));
        }

        toast.success("Đã xóa bài nhạc.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to delete music track.");
      }
    });
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Thêm nhạc YouTube</CardTitle>
          <CardDescription>Dán link video hoặc playlist YouTube để thêm vào trình phát.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createTrack} className="grid gap-4 md:grid-cols-12">
            <div className="space-y-2 md:col-span-4">
              <Label htmlFor="new-title">Tên bài nhạc</Label>
              <Input
                id="new-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Nhạc gỗ thư giãn"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-6">
              <Label htmlFor="new-youtube-url">YouTube URL</Label>
              <Input
                id="new-youtube-url"
                type="url"
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-sort-order">Thứ tự</Label>
              <Input
                id="new-sort-order"
                type="number"
                min={0}
                max={9999}
                value={sortOrder}
                onChange={(event) => setSortOrder(Number(event.target.value))}
              />
            </div>
            <div className="md:col-span-12">
              <Button type="submit" disabled={isPending}>
                <Plus className="size-4" />
                {isPending ? "Đang thêm..." : "Thêm vào danh sách"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhạc</CardTitle>
          <CardDescription>Bài đang bật sẽ xuất hiện trong trình phát ở đầu website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tracks.length ? (
            tracks.map((track) => (
              <form
                key={track.id}
                onSubmit={(event) => updateTrack(event, track.id)}
                className="grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 md:grid-cols-12 md:items-end"
              >
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor={`title-${track.id}`}>Tên bài nhạc</Label>
                  <Input id={`title-${track.id}`} name="title" defaultValue={track.title} required />
                </div>
                <div className="space-y-2 md:col-span-4">
                  <Label htmlFor={`youtube-url-${track.id}`}>YouTube URL</Label>
                  <Input
                    id={`youtube-url-${track.id}`}
                    name="youtubeUrl"
                    type="url"
                    defaultValue={track.youtubeUrl}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor={`sort-order-${track.id}`}>Thứ tự</Label>
                  <Input
                    id={`sort-order-${track.id}`}
                    name="sortOrder"
                    type="number"
                    min={0}
                    max={9999}
                    defaultValue={track.sortOrder}
                  />
                </div>
                <label className="flex h-10 items-center gap-2 text-sm font-medium text-stone-800 md:col-span-1">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={track.active}
                    className="size-4 rounded border-stone-300"
                  />
                  Hiển thị
                </label>
                <div className="flex items-center gap-2 md:col-span-3 md:justify-end">
                  <Badge variant={track.active ? "success" : "outline"}>
                    {track.active ? "Đang hiện" : "Đã ẩn"}
                  </Badge>
                  <Button asChild type="button" size="icon" variant="ghost" aria-label="Open YouTube link">
                    <Link href={track.youtubeUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                  <Button type="submit" size="icon" variant="secondary" disabled={isPending} aria-label="Save track">
                    <Save className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteTrack(track.id)}
                    disabled={isPending}
                    aria-label="Delete track"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </form>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-600">
              Chưa có bài nhạc. Hãy thêm một link YouTube để bật trình phát trên website.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
