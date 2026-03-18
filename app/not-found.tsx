import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <p className="text-sm uppercase tracking-[0.14em] text-stone-500">404</p>
      <h1 className="mt-3 text-5xl text-stone-900">Không tìm thấy trang</h1>
      <p className="mt-3 text-sm text-stone-600">
        Trang bạn yêu cầu không tồn tại hoặc đã được chuyển.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </div>
  );
}
