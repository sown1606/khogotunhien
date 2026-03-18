import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { updateSettingsAction } from "@/lib/actions/settings-actions";
import { getSiteSettingsForAdmin } from "@/lib/queries";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsForAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Website settings"
        description="Manage company profile, contact links, branding, and SEO defaults."
      />
      <SettingsForm action={updateSettingsAction} initialValues={settings} />
    </div>
  );
}
