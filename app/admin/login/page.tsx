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
            src="/brand/logo-primary.svg"
            alt="ĐẠI THIÊN PHÚ WOOD"
            width={520}
            height={640}
            className="mx-auto h-28 w-auto"
            priority
          />
          <p className="text-sm text-stone-600">Admin portal for live content management</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
