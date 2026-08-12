import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MusicManager } from "@/components/admin/music-manager";
import { getMusicTracksForAdmin } from "@/lib/queries";

export default async function AdminMusicPage() {
  const tracks = await getMusicTracksForAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Quản lý nhạc"
        description="Cập nhật danh sách YouTube hiển thị trong trình phát nhạc nhỏ trên đầu website."
      />
      <MusicManager
        tracks={tracks.map((track) => ({
          id: track.id,
          title: track.title,
          youtubeUrl: track.youtubeUrl,
          active: track.active,
          sortOrder: track.sortOrder,
        }))}
      />
    </div>
  );
}
