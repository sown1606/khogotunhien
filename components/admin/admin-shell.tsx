import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

type AdminShellProps = {
  children: React.ReactNode;
  companyName: string;
  userName?: string | null;
};

export function AdminShell({ children, companyName, userName }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-[#f6f3ef]">
      <AdminSidebar companyName={companyName} />
      <div className="flex min-h-screen w-full flex-col">
        <AdminTopbar userName={userName} />
        <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
