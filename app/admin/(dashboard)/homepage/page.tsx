import Link from "next/link";
import { HomepageSectionType } from "@prisma/client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomepageSectionForm } from "@/components/admin/homepage-section-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createHomepageSectionAction,
  deleteHomepageSectionAction,
  toggleHomepageSectionVisibilityAction,
  updateHomepageSectionAction,
} from "@/lib/actions/homepage-actions";
import { db } from "@/lib/db";

type AdminHomepagePageProps = {
  searchParams: Promise<{ edit?: string }>;
};

const sectionTypeLabel: Record<HomepageSectionType, string> = {
  FEATURED_PRODUCTS: "Featured products",
  FEATURED_CATEGORIES: "Featured categories",
  CURATED_COLLECTION: "Curated collection",
  PROMOTIONAL: "Promotional",
  CUSTOM: "Custom",
};

export default async function AdminHomepagePage({ searchParams }: AdminHomepagePageProps) {
  const params = await searchParams;

  const [sections, products, categories] = await Promise.all([
    db.homepageSection.findMany({
      include: {
        items: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    db.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  const editingSection = params.edit
    ? sections.find((section) => section.id === params.edit) || null
    : null;

  const formAction = editingSection
    ? updateHomepageSectionAction.bind(null, editingSection.id)
    : createHomepageSectionAction;

  async function handleToggleSectionVisibility(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const visible = String(formData.get("visible") || "") === "true";
    await toggleHomepageSectionVisibilityAction(id, visible);
  }

  async function handleDeleteSection(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    await deleteHomepageSectionAction(id);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage sections"
        description="Manage featured categories, products, and curated homepage blocks."
      />

      <Card>
        <CardHeader>
          <CardTitle>{editingSection ? "Edit section" : "Create section"}</CardTitle>
        </CardHeader>
        <CardContent>
          <HomepageSectionForm
            action={formAction}
            products={products}
            categories={categories}
            initialValues={
              editingSection
                ? {
                    title: editingSection.title,
                    titleEn: editingSection.titleEn,
                    slug: editingSection.slug,
                    description: editingSection.description,
                    descriptionEn: editingSection.descriptionEn,
                    type: editingSection.type,
                    visible: editingSection.visible,
                    sortOrder: editingSection.sortOrder,
                    items: editingSection.items.map((item) => ({
                      id: item.id,
                      productId: item.productId || "",
                      categoryId: item.categoryId || "",
                      customTitle: item.customTitle || "",
                      customTitleEn: item.customTitleEn || "",
                      customDescription: item.customDescription || "",
                      customDescriptionEn: item.customDescriptionEn || "",
                      imageUrl: item.imageUrl || "",
                      linkUrl: item.linkUrl || "",
                      active: item.active,
                      sortOrder: item.sortOrder,
                    })),
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-stone-900">{section.title}</h3>
                  <Badge variant={section.visible ? "success" : "outline"}>
                    {section.visible ? "Visible" : "Hidden"}
                  </Badge>
                  <Badge variant="secondary">{sectionTypeLabel[section.type]}</Badge>
                </div>
                <p className="text-sm text-stone-600">/{section.slug}</p>
                <p className="text-xs text-stone-500">
                  {section.items.length} items • sort {section.sortOrder}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/homepage?edit=${section.id}`}>Edit</Link>
                </Button>
                <form
                  action={handleToggleSectionVisibility}
                >
                  <input type="hidden" name="id" value={section.id} />
                  <input type="hidden" name="visible" value={String(!section.visible)} />
                  <Button size="sm" variant="outline" type="submit">
                    {section.visible ? "Hide" : "Show"}
                  </Button>
                </form>
                <form action={handleDeleteSection}>
                  <input type="hidden" name="id" value={section.id} />
                  <Button size="sm" variant="destructive" type="submit">
                    Delete
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
