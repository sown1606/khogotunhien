import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";

import { LoginForm } from "@/components/admin/login-form";
import { authOptions } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/admin");
  }

  return (
    <div className="pattern-grid flex min-h-screen items-center justify-center bg-[#f6f3ef] px-4">
      <div className="space-y-5">
        <div className="space-y-2 text-center">
          <Image
            src="/brand/logo-horizontal.svg"
            alt="ĐẠI THIÊN PHÚ WOOD"
            width={920}
            height={260}
            className="mx-auto h-14 w-auto max-w-[340px] sm:h-16 sm:max-w-[420px]"
            priority
            unoptimized
          />
          <p className="text-sm text-stone-600">Admin portal for live content management</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
