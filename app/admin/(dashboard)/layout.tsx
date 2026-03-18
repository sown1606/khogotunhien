import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AdminShell } from "@/components/admin/admin-shell";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, settings] = await Promise.all([
    getServerSession(authOptions),
    getSiteSettings(),
  ]);

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  return (
    <AdminShell companyName={settings.companyName} userName={session.user.name}>
      {children}
    </AdminShell>
  );
}
