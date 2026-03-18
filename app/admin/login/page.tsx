import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LoginForm } from "@/components/admin/login-form";
import { authOptions } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/admin");
  }

  return (
    <div className="pattern-grid flex min-h-screen items-center justify-center bg-[#f6f3ef] px-4">
      <LoginForm />
    </div>
  );
}
