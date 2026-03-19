import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { VisualEditor } from "@/components/admin/visual-editor";
import { saveVisualEditorSettingsAction } from "@/lib/actions/visual-editor-actions";
import { db } from "@/lib/db";
import { getSiteSettingsForAdmin } from "@/lib/queries";

export default async function AdminVisualEditorPage() {
  const [settings, sections] = await Promise.all([
    getSiteSettingsForAdmin(),
    db.homepageSection.findMany({
      select: {
        id: true,
        title: true,
        titleEn: true,
        type: true,
        visible: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
  ]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Visual editor"
        description="Edit storefront content with live preview and AI-assisted copywriting."
      />
      <VisualEditor
        action={saveVisualEditorSettingsAction}
        initialValues={{
          companyName: settings.companyName || "",
          companyDescription: settings.companyDescription || "",
          companyDescriptionEn: settings.companyDescriptionEn || "",
          phoneNumber: settings.phoneNumber || "",
          email: settings.email || "",
          zaloLink: settings.zaloLink || "",
          logoUrl: settings.logoUrl || "",
          contactPrimaryLabel: settings.contactPrimaryLabel || "",
          contactSecondaryLabel: settings.contactSecondaryLabel || "",
          leadPopupEnabled: settings.leadPopupEnabled,
          leadPopupDelaySeconds: settings.leadPopupDelaySeconds || 25,
          leadPopupTitle: settings.leadPopupTitle || "",
          leadPopupTitleEn: settings.leadPopupTitleEn || "",
          leadPopupDescription: settings.leadPopupDescription || "",
          leadPopupDescriptionEn: settings.leadPopupDescriptionEn || "",
        }}
        sections={sections.map((section) => ({
          id: section.id,
          title: section.title,
          titleEn: section.titleEn,
          type: section.type,
          visible: section.visible,
          sortOrder: section.sortOrder,
        }))}
      />
    </div>
  );
}

