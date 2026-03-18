import { type HomepageSectionType } from "@prisma/client";
import slugify from "slugify";

type DemoCategorySeed = {
  slug: string;
  name: string;
  nameEn: string;
  shortDescription: string;
  shortDescriptionEn: string;
  imageUrl: string;
  featured?: boolean;
  sortOrder: number;
  woodType: string;
  woodTypeEn: string;
  material: string;
  materialEn: string;
  finish: string;
  finishEn: string;
  dimensions: [string, string, string];
};

type DemoProductSeed = {
  name: string;
  nameEn: string;
  featured?: boolean;
};

type DemoProductBaseRecord = {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  shortDescription: string;
  shortDescriptionEn: string;
  description: string;
  descriptionEn: string;
  thumbnailUrl: string;
  woodType: string;
  woodTypeEn: string;
  material: string;
  materialEn: string;
  dimensions: string;
  dimensionsEn: string;
  finish: string;
  finishEn: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

type DemoProductImageRecord = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  createdAt: Date;
};

type DemoBuiltProduct = DemoProductBaseRecord & {
  categorySlug: string;
  galleryUrls: string[];
  relatedSlugs: string[];
};

export type DemoCategoryRecord = {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  imageUrl: string;
  shortDescription: string;
  shortDescriptionEn: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DemoCategoryWithCountRecord = DemoCategoryRecord & {
  _count: {
    products: number;
  };
};

export type DemoProductRecord = DemoProductBaseRecord & {
  category: DemoCategoryRecord | null;
  images: DemoProductImageRecord[];
};

export type DemoProductDetailRecord = DemoProductRecord & {
  relatedProducts: DemoProductRecord[];
};

export type DemoHomepageSectionItemRecord = {
  id: string;
  customTitle: string | null;
  customTitleEn: string | null;
  customDescription: string | null;
  customDescriptionEn: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  active: boolean;
  sortOrder: number;
  product: DemoProductRecord | null;
  category: DemoCategoryRecord | null;
};

export type DemoHomepageSectionRecord = {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  type: HomepageSectionType;
  visible: boolean;
  sortOrder: number;
  items: DemoHomepageSectionItemRecord[];
  createdAt: Date;
  updatedAt: Date;
};

const fallbackSeedTimestamp = new Date("2026-01-01T00:00:00.000Z");

const categorySeeds: DemoCategorySeed[] = [
  {
    slug: "solid-wood",
    name: "Gỗ Tự Nhiên",
    nameEn: "Solid Wood",
    shortDescription: "Nguồn gỗ tự nhiên cao cấp cho nội thất và công trình thực tế.",
    shortDescriptionEn: "Premium solid timber selections for furniture and interior projects.",
    imageUrl: "/demo/categories/category-01.webp",
    featured: true,
    sortOrder: 1,
    woodType: "Gỗ cứng tuyển chọn",
    woodTypeEn: "Selected hardwood",
    material: "Gỗ tự nhiên nguyên tấm",
    materialEn: "Solid timber stock",
    finish: "Dầu cứng mờ",
    finishEn: "Matte hardwax oil",
    dimensions: ["2200 x 900 x 40 mm", "1800 x 480 x 32 mm", "1200 x 320 x 38 mm"],
  },
  {
    slug: "walnut",
    name: "Gỗ Óc Chó",
    nameEn: "Walnut",
    shortDescription: "Vân gỗ óc chó sang trọng cho không gian cao cấp và đồ gỗ đặt riêng.",
    shortDescriptionEn: "Rich walnut grain for luxury interiors and bespoke furniture pieces.",
    imageUrl: "/demo/categories/category-02.webp",
    featured: true,
    sortOrder: 2,
    woodType: "Óc chó Mỹ",
    woodTypeEn: "American walnut",
    material: "Gỗ óc chó tự nhiên",
    materialEn: "Solid walnut",
    finish: "Dầu lau satin",
    finishEn: "Satin oil finish",
    dimensions: ["2400 x 850 x 42 mm", "1200 x 260 x 36 mm", "2600 x 900 x 52 mm"],
  },
  {
    slug: "oak",
    name: "Gỗ Sồi",
    nameEn: "Oak",
    shortDescription: "Gỗ sồi bền chắc, màu sắc ấm và phù hợp nhiều phong cách thiết kế.",
    shortDescriptionEn: "Durable oak with warm tone and versatile design adaptability.",
    imageUrl: "/demo/categories/category-03.webp",
    featured: true,
    sortOrder: 3,
    woodType: "Sồi trắng Châu Âu",
    woodTypeEn: "European white oak",
    material: "Panel và tấm sồi",
    materialEn: "Oak panels and boards",
    finish: "Lớp phủ UV mờ",
    finishEn: "UV matte coating",
    dimensions: ["2400 x 220 x 30 mm", "600 x 2400 x 20 mm", "3000 x 650 x 38 mm"],
  },
  {
    slug: "beech",
    name: "Gỗ Beech",
    nameEn: "Beech",
    shortDescription: "Bề mặt sáng mịn, ổn định và phù hợp cho bếp, tủ kệ và phụ kiện.",
    shortDescriptionEn: "Clean, stable beech surfaces for kitchens, cabinetry, and accessories.",
    imageUrl: "/demo/categories/category-04.webp",
    featured: true,
    sortOrder: 4,
    woodType: "Beech Châu Âu",
    woodTypeEn: "European beech",
    material: "Gỗ beech ghép thanh",
    materialEn: "Laminated beech stock",
    finish: "Sơn mờ tự nhiên",
    finishEn: "Natural matte coat",
    dimensions: ["2100 x 200 x 28 mm", "520 x 320 x 35 mm", "1600 x 300 x 28 mm"],
  },
  {
    slug: "wood-slabs",
    name: "Slab Gỗ Tự Nhiên",
    nameEn: "Wood Slabs",
    shortDescription: "Slab live-edge cao cấp cho bàn ăn, quầy đảo và điểm nhấn nội thất.",
    shortDescriptionEn: "Premium live-edge slabs for dining tables, islands, and statement interiors.",
    imageUrl: "/demo/categories/category-05.webp",
    featured: true,
    sortOrder: 5,
    woodType: "Walnut, me tây, acacia",
    woodTypeEn: "Walnut, suar, acacia",
    material: "Slab nguyên tấm",
    materialEn: "Live-edge slabs",
    finish: "Dầu cứng cao cấp",
    finishEn: "Premium hardwax finish",
    dimensions: ["2750 x 930 x 58 mm", "3200 x 1050 x 65 mm", "2600 x 880 x 55 mm"],
  },
  {
    slug: "cutting-boards",
    name: "Thớt Gỗ",
    nameEn: "Cutting Boards",
    shortDescription: "Thớt gỗ thủ công an toàn thực phẩm cho gian bếp gia đình và nhà hàng.",
    shortDescriptionEn: "Food-safe handcrafted cutting boards for home and professional kitchens.",
    imageUrl: "/demo/categories/category-06.webp",
    featured: true,
    sortOrder: 6,
    woodType: "Óc chó, sồi, beech",
    woodTypeEn: "Walnut, oak, beech",
    material: "Thớt gỗ nguyên khối",
    materialEn: "Solid wood boards",
    finish: "Dầu khoáng thực phẩm",
    finishEn: "Food-safe mineral oil",
    dimensions: ["520 x 320 x 40 mm", "580 x 300 x 24 mm", "600 x 400 x 60 mm"],
  },
  {
    slug: "decorative-wood-panels",
    name: "Panel Trang Trí Gỗ",
    nameEn: "Decorative Wood Panels",
    shortDescription: "Panel trang trí tăng chiều sâu và điểm nhấn cho tường, sảnh và showroom.",
    shortDescriptionEn: "Decorative panel systems for feature walls, lobbies, and showrooms.",
    imageUrl: "/demo/categories/category-07.webp",
    featured: true,
    sortOrder: 7,
    woodType: "Sồi, óc chó, beech",
    woodTypeEn: "Oak, walnut, beech",
    material: "Panel kiến trúc",
    materialEn: "Architectural panel systems",
    finish: "Sơn mờ cao cấp",
    finishEn: "Premium matte lacquer",
    dimensions: ["600 x 2400 x 18 mm", "1200 x 2400 x 21 mm", "600 x 2400 x 22 mm"],
  },
  {
    slug: "custom-wood-signs",
    name: "Biển Gỗ Theo Yêu Cầu",
    nameEn: "Custom Wood Signs",
    shortDescription: "Biển gỗ khắc chữ và nhận diện thương hiệu cho nhà ở và cửa hàng.",
    shortDescriptionEn: "Custom engraved wood signage for homes, cafés, studios, and businesses.",
    imageUrl: "/demo/categories/category-08.webp",
    featured: true,
    sortOrder: 8,
    woodType: "Cedar, sồi, beech",
    woodTypeEn: "Cedar, oak, beech",
    material: "Biển gỗ nhiều lớp",
    materialEn: "Layered wood signage",
    finish: "Satin ngoài trời",
    finishEn: "Outdoor satin seal",
    dimensions: ["900 x 300 x 28 mm", "1200 x 500 x 24 mm", "1000 x 450 x 22 mm"],
  },
  {
    slug: "wood-home-decor",
    name: "Trang Trí Nhà Bằng Gỗ",
    nameEn: "Wood Home Decor",
    shortDescription: "Phụ kiện trang trí gỗ giúp không gian sống ấm cúng và tinh tế hơn.",
    shortDescriptionEn: "Wood decor accents that add warmth and elegance to living spaces.",
    imageUrl: "/demo/categories/category-09.webp",
    sortOrder: 9,
    woodType: "Óc chó, sồi, beech",
    woodTypeEn: "Walnut, oak, beech",
    material: "Đồ trang trí thủ công",
    materialEn: "Handcrafted decor items",
    finish: "Dầu sáp tự nhiên",
    finishEn: "Natural oil-wax finish",
    dimensions: ["900 x 900 x 35 mm", "360 x 180 x 24 mm", "420 x 360 x 460 mm"],
  },
  {
    slug: "wood-kitchenware",
    name: "Đồ Bếp Bằng Gỗ",
    nameEn: "Wood Kitchenware",
    shortDescription: "Phụ kiện bếp gỗ thiết kế tinh gọn cho nấu nướng và bàn ăn hàng ngày.",
    shortDescriptionEn: "Refined wooden kitchenware designed for daily cooking and dining.",
    imageUrl: "/demo/categories/category-10.webp",
    sortOrder: 10,
    woodType: "Óc chó, sồi, beech",
    woodTypeEn: "Walnut, oak, beech",
    material: "Bộ phụ kiện bếp",
    materialEn: "Kitchenware collection",
    finish: "Lớp phủ thực phẩm",
    finishEn: "Food-safe coating",
    dimensions: [
      "460 x 300 x 35 mm",
      "700 x 120 x 80 mm",
      "160 x 160 x 220 mm",
    ],
  },
  {
    slug: "personalized-wood-gifts",
    name: "Quà Tặng Gỗ Cá Nhân Hóa",
    nameEn: "Personalized Wood Gifts",
    shortDescription: "Quà tặng khắc tên cho gia đình, sự kiện và doanh nghiệp.",
    shortDescriptionEn: "Custom engraved gift pieces for family events and corporate occasions.",
    imageUrl: "/demo/categories/category-11.webp",
    sortOrder: 11,
    woodType: "Óc chó, sồi, beech",
    woodTypeEn: "Walnut, oak, beech",
    material: "Sản phẩm quà tặng cá nhân hóa",
    materialEn: "Personalized gift products",
    finish: "Satin thủ công",
    finishEn: "Hand-rubbed satin finish",
    dimensions: ["280 x 200 x 110 mm", "320 x 270 x 24 mm", "500 x 220 x 20 mm"],
  },
  {
    slug: "interior-wood-materials",
    name: "Vật Liệu Gỗ Nội Thất",
    nameEn: "Interior Wood Materials",
    shortDescription: "Vật liệu gỗ sẵn sàng cho thi công nội thất, tủ bếp và vách trang trí.",
    shortDescriptionEn: "Interior-ready wood materials for cabinetry, fit-out, and wall systems.",
    imageUrl: "/demo/categories/category-12.webp",
    sortOrder: 12,
    woodType: "Sồi, óc chó, beech",
    woodTypeEn: "Oak, walnut, beech",
    material: "Veneer và component nội thất",
    materialEn: "Veneer and interior components",
    finish: "Sẵn sàng hoàn thiện",
    finishEn: "Ready for final finish",
    dimensions: ["1220 x 2440 x 18 mm", "720 x 450 x 22 mm", "2400 x 120 x 30 mm"],
  },
];

const productSeedsByCategory: Record<string, DemoProductSeed[]> = {
  "solid-wood": [
    { name: "Mặt Bàn Gỗ Tự Nhiên Imperial", nameEn: "Imperial Solid Wood Table Top", featured: true },
    { name: "Panel Console Gỗ Tự Nhiên Heritage", nameEn: "Heritage Solid Timber Console Panel" },
    { name: "Bộ Bậc Cầu Thang Gỗ Tự Nhiên Atelier", nameEn: "Atelier Solid Stair Tread Set" },
  ],
  walnut: [
    { name: "Mặt Bàn Ăn Gỗ Óc Chó Signature", nameEn: "Signature Walnut Dining Board", featured: true },
    { name: "Kệ Treo Tường Gỗ Óc Chó Luxe", nameEn: "Walnut Luxe Floating Shelf" },
    { name: "Slab Bàn Làm Việc Gỗ Óc Chó Executive", nameEn: "Executive Walnut Desk Slab", featured: true },
  ],
  oak: [
    { name: "Tấm Khung Gỗ Sồi Natural", nameEn: "Natural Oak Frame Board" },
    { name: "Lam Trang Trí Tường Gỗ Sồi Harmony", nameEn: "Harmony Oak Wall Cladding", featured: true },
    { name: "Panel Quầy Bếp Gỗ Sồi Atelier", nameEn: "Oak Atelier Counter Panel" },
  ],
  beech: [
    { name: "Tấm Joinery Gỗ Beech Precision", nameEn: "Beech Precision Joinery Board" },
    { name: "Bề Mặt Cắt Gỗ Beech Classic", nameEn: "Beech Classic Cutting Surface", featured: true },
    { name: "Kệ Mô Đun Gỗ Beech", nameEn: "Beech Modular Shelf Blank" },
  ],
  "wood-slabs": [
    { name: "Slab Live Edge Óc Chó Riverline", nameEn: "Riverline Walnut Live Edge Slab", featured: true },
    { name: "Slab Me Tây Hội Nghị Rustic", nameEn: "Rustic Suar Conference Slab", featured: true },
    { name: "Slab Acacia Dòng Sông Prime", nameEn: "Prime Acacia River Slab" },
  ],
  "cutting-boards": [
    { name: "Thớt Chef Gỗ Óc Chó", nameEn: "Walnut Chef Cutting Board", featured: true },
    { name: "Thớt Phục Vụ Gia Đình Gỗ Sồi", nameEn: "Oak Family Serving Board" },
    { name: "Thớt End-Grain Gỗ Beech", nameEn: "Beech End Grain Butcher Block" },
  ],
  "decorative-wood-panels": [
    { name: "Panel Gỗ Sồi Sóng Fluted", nameEn: "Fluted Oak Decorative Panel", featured: true },
    { name: "Panel Gỗ Óc Chó Chevron", nameEn: "Walnut Chevron Accent Panel" },
    { name: "Panel Nan Tiêu Âm Gỗ Beech", nameEn: "Beech Acoustic Slat Panel" },
  ],
  "custom-wood-signs": [
    { name: "Bảng Tên Nhà Heritage", nameEn: "Heritage House Name Sign", featured: true },
    { name: "Biển Thương Hiệu Studio", nameEn: "Studio Brand Wall Sign" },
    { name: "Biển Đón Khách Wedding", nameEn: "Wedding Welcome Wood Sign" },
  ],
  "wood-home-decor": [
    { name: "Tranh Tường Gỗ Óc Chó Sculpted", nameEn: "Sculpted Walnut Wall Art", featured: true },
    { name: "Khay Nến Tối Giản Gỗ Sồi", nameEn: "Oak Minimal Candle Tray" },
    { name: "Đôn Cong Lưu Trữ Gỗ Beech", nameEn: "Beech Curved Storage Stool" },
  ],
  "wood-kitchenware": [
    { name: "Bộ Khay Phục Vụ Gỗ Óc Chó", nameEn: "Walnut Serving Tray Set", featured: true },
    { name: "Kệ Gia Vị Quầy Bếp Gỗ Sồi", nameEn: "Oak Counter Spice Rail" },
    { name: "Giá Dụng Cụ Bếp Gỗ Beech", nameEn: "Beech Kitchen Utensil Stand" },
  ],
  "personalized-wood-gifts": [
    { name: "Hộp Kỷ Vật Gỗ Óc Chó Khắc Tên", nameEn: "Engraved Walnut Keepsake Box", featured: true },
    { name: "Khung Ảnh Gỗ Sồi Cá Nhân Hóa", nameEn: "Personalized Oak Photo Frame" },
    { name: "Bảng Gia Đình Gỗ Beech Theo Yêu Cầu", nameEn: "Custom Beech Family Plaque" },
  ],
  "interior-wood-materials": [
    { name: "Tấm Veneer Gỗ Sồi Nội Thất", nameEn: "Interior Oak Veneer Sheet", featured: true },
    { name: "Cánh Tủ Gỗ Óc Chó Cabinet", nameEn: "Walnut Cabinet Door Front" },
    { name: "Bộ Khung Cửa Gỗ Beech", nameEn: "Beech Door Jamb Material Set" },
  ],
};

const productImagePool = Array.from(
  { length: 28 },
  (_, index) => `/demo/products/product-${String(index + 1).padStart(3, "0")}.webp`,
);

function pickImage(index: number, offset = 0) {
  return productImagePool[(index + offset) % productImagePool.length];
}

function buildGallery(index: number, count = 4) {
  const gallery: string[] = [];
  let offset = 1;

  while (gallery.length < count) {
    const image = pickImage(index, offset);
    if (!gallery.includes(image)) {
      gallery.push(image);
    }
    offset += 1;
  }

  return gallery;
}

const demoCategories: DemoCategoryRecord[] = categorySeeds.map((seed, index) => ({
  id: `demo-category-${String(index + 1).padStart(2, "0")}`,
  name: seed.name,
  nameEn: seed.nameEn,
  slug: seed.slug,
  imageUrl: seed.imageUrl,
  shortDescription: seed.shortDescription,
  shortDescriptionEn: seed.shortDescriptionEn,
  featured: Boolean(seed.featured),
  active: true,
  sortOrder: seed.sortOrder,
  createdAt: fallbackSeedTimestamp,
  updatedAt: fallbackSeedTimestamp,
}));

const categoriesBySlug = new Map(demoCategories.map((category) => [category.slug, category]));

const builtProducts: DemoBuiltProduct[] = [];
let productOrder = 1;

for (const categorySeed of categorySeeds) {
  const category = categoriesBySlug.get(categorySeed.slug);
  const seededProducts = productSeedsByCategory[categorySeed.slug] ?? [];

  if (!category || seededProducts.length === 0) {
    continue;
  }

  seededProducts.forEach((seedProduct, index) => {
    const imageIndex = builtProducts.length;
    const slug = slugify(`${seedProduct.nameEn}-${categorySeed.slug}`, {
      lower: true,
      strict: true,
      trim: true,
    });
    const dimension = categorySeed.dimensions[index] ?? categorySeed.dimensions[0];

    builtProducts.push({
      id: `demo-product-${String(productOrder).padStart(3, "0")}`,
      name: seedProduct.name,
      nameEn: seedProduct.nameEn,
      slug,
      shortDescription: `${seedProduct.name} dành cho dự án nội thất và gia công theo yêu cầu.`,
      shortDescriptionEn: `${seedProduct.nameEn} crafted for premium interiors and custom projects.`,
      description: `${seedProduct.name} sử dụng ${categorySeed.woodType.toLowerCase()}, hoàn thiện ${categorySeed.finish.toLowerCase()} và phù hợp cho showroom, nhà ở, quán cà phê hoặc công trình thương mại cần chất lượng gỗ cao cấp.`,
      descriptionEn: `${seedProduct.nameEn} is made from ${categorySeed.woodTypeEn.toLowerCase()} with a ${categorySeed.finishEn.toLowerCase()} for premium homes, studios, cafés, and commercial interior projects.`,
      thumbnailUrl: pickImage(imageIndex),
      woodType: categorySeed.woodType,
      woodTypeEn: categorySeed.woodTypeEn,
      material: categorySeed.material,
      materialEn: categorySeed.materialEn,
      dimensions: dimension,
      dimensionsEn: dimension,
      finish: categorySeed.finish,
      finishEn: categorySeed.finishEn,
      featured: Boolean(seedProduct.featured || (category.featured && index === 0)),
      active: true,
      sortOrder: productOrder,
      categoryId: category.id,
      categorySlug: category.slug,
      galleryUrls: buildGallery(imageIndex, 4),
      relatedSlugs: [],
      createdAt: fallbackSeedTimestamp,
      updatedAt: fallbackSeedTimestamp,
    });

    productOrder += 1;
  });
}

const productsByCategory = new Map<string, DemoBuiltProduct[]>();
for (const product of builtProducts) {
  const grouped = productsByCategory.get(product.categorySlug) ?? [];
  grouped.push(product);
  productsByCategory.set(product.categorySlug, grouped);
}

for (const [index, product] of builtProducts.entries()) {
  const sameCategorySlugs = (productsByCategory.get(product.categorySlug) ?? [])
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate) => candidate.slug);

  const nextSlug = builtProducts[(index + 1) % builtProducts.length]?.slug;
  const secondNextSlug = builtProducts[(index + 2) % builtProducts.length]?.slug;

  product.relatedSlugs = [...new Set([...sameCategorySlugs.slice(0, 2), nextSlug, secondNextSlug])]
    .filter((slug): slug is string => Boolean(slug))
    .slice(0, 4);
}

const productsBySlug = new Map(builtProducts.map((product) => [product.slug, product]));

function cloneCategory(category: DemoCategoryRecord | null): DemoCategoryRecord | null {
  return category ? { ...category } : null;
}

function mapProductImages(product: DemoBuiltProduct): DemoProductImageRecord[] {
  return product.galleryUrls.map((url, index) => ({
    id: `${product.id}-image-${index + 1}`,
    productId: product.id,
    url,
    alt: `${product.nameEn} image ${index + 1}`,
    sortOrder: index + 1,
    createdAt: fallbackSeedTimestamp,
  }));
}

function mapProduct(product: DemoBuiltProduct): DemoProductRecord {
  const category = categoriesBySlug.get(product.categorySlug) ?? null;

  return {
    id: product.id,
    name: product.name,
    nameEn: product.nameEn,
    slug: product.slug,
    shortDescription: product.shortDescription,
    shortDescriptionEn: product.shortDescriptionEn,
    description: product.description,
    descriptionEn: product.descriptionEn,
    thumbnailUrl: product.thumbnailUrl,
    woodType: product.woodType,
    woodTypeEn: product.woodTypeEn,
    material: product.material,
    materialEn: product.materialEn,
    dimensions: product.dimensions,
    dimensionsEn: product.dimensionsEn,
    finish: product.finish,
    finishEn: product.finishEn,
    featured: product.featured,
    active: true,
    sortOrder: product.sortOrder,
    categoryId: product.categoryId,
    category: cloneCategory(category),
    images: mapProductImages(product),
    createdAt: fallbackSeedTimestamp,
    updatedAt: fallbackSeedTimestamp,
  };
}

function toSearchableText(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

function matchContains(source: string | null | undefined, term: string) {
  return toSearchableText(source).includes(term);
}

const featuredCategorySlugs = [
  "solid-wood",
  "walnut",
  "oak",
  "beech",
  "wood-slabs",
  "cutting-boards",
  "decorative-wood-panels",
  "custom-wood-signs",
];

export function isDemoCatalogFallbackEnabled() {
  return process.env.DEMO_CATALOG_FALLBACK !== "false";
}

export function getDemoNavigationCategories(limit = 10): DemoCategoryRecord[] {
  return demoCategories
    .filter((category) => category.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((category) => ({ ...category }));
}

export function getDemoFeaturedCategories(limit = 10): DemoCategoryRecord[] {
  return demoCategories
    .filter((category) => category.active && featuredCategorySlugs.includes(category.slug))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((category) => ({ ...category }));
}

export function getDemoCategories(): DemoCategoryWithCountRecord[] {
  return demoCategories
    .filter((category) => category.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      ...category,
      _count: {
        products: (productsByCategory.get(category.slug) ?? []).length,
      },
    }));
}

function filterDemoProducts(options: {
  q?: string;
  category?: string;
  material?: string;
  featured?: string;
}) {
  const normalizedTerm = options.q?.trim().toLowerCase() ?? "";
  const normalizedMaterial = options.material?.trim().toLowerCase() ?? "";

  return builtProducts.filter((product) => {
    if (!product.active) return false;
    if (options.category && product.categorySlug !== options.category) return false;
    if (options.featured === "true" && !product.featured) return false;

    if (normalizedMaterial.length > 0) {
      const matchesMaterial =
        matchContains(product.material, normalizedMaterial) ||
        matchContains(product.materialEn, normalizedMaterial) ||
        matchContains(product.woodType, normalizedMaterial) ||
        matchContains(product.woodTypeEn, normalizedMaterial);

      if (!matchesMaterial) return false;
    }

    if (normalizedTerm.length === 0) return true;

    const category = categoriesBySlug.get(product.categorySlug);
    const categoryName = category?.name ?? "";
    const categoryNameEn = category?.nameEn ?? "";

    return (
      matchContains(product.name, normalizedTerm) ||
      matchContains(product.nameEn, normalizedTerm) ||
      matchContains(product.shortDescription, normalizedTerm) ||
      matchContains(product.shortDescriptionEn, normalizedTerm) ||
      matchContains(product.woodType, normalizedTerm) ||
      matchContains(product.woodTypeEn, normalizedTerm) ||
      matchContains(product.material, normalizedTerm) ||
      matchContains(product.materialEn, normalizedTerm) ||
      matchContains(categoryName, normalizedTerm) ||
      matchContains(categoryNameEn, normalizedTerm)
    );
  });
}

export function getDemoProducts(options: {
  q?: string;
  category?: string;
  material?: string;
  featured?: string;
} = {}): DemoProductRecord[] {
  return filterDemoProducts(options)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((product) => mapProduct(product));
}

export function getDemoFeaturedProducts(limit = 12): DemoProductRecord[] {
  return builtProducts
    .filter((product) => product.active && product.featured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((product) => mapProduct(product));
}

export function getDemoProductBySlug(slug: string): DemoProductDetailRecord | null {
  const product = productsBySlug.get(slug);
  if (!product || !product.active) return null;

  const relatedProducts = product.relatedSlugs
    .map((relatedSlug) => productsBySlug.get(relatedSlug))
    .filter((related): related is DemoBuiltProduct => Boolean(related))
    .slice(0, 8)
    .map((related) => mapProduct(related));

  return {
    ...mapProduct(product),
    relatedProducts,
  };
}

export function getDemoCategoryBySlug(slug: string) {
  const category = categoriesBySlug.get(slug);
  if (!category || !category.active) return null;

  const categoryProducts = (productsByCategory.get(slug) ?? [])
    .filter((product) => product.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((product) => mapProduct(product));

  return {
    ...category,
    _count: { products: categoryProducts.length },
    products: categoryProducts,
  };
}

type SectionSeed = {
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  type: HomepageSectionType;
  sortOrder: number;
  productSlugs?: string[];
  categorySlugs?: string[];
};

const homepageSectionSeeds: SectionSeed[] = [
  {
    slug: "featured-categories",
    title: "Danh mục nổi bật",
    titleEn: "Featured Categories",
    description: "Khám phá các nhóm vật liệu được lựa chọn nhiều nhất cho nhà ở và công trình cao cấp.",
    descriptionEn: "Explore the most requested material groups for premium homes and projects.",
    type: "FEATURED_CATEGORIES",
    sortOrder: 1,
    categorySlugs: featuredCategorySlugs,
  },
  {
    slug: "featured-products",
    title: "Sản phẩm nổi bật",
    titleEn: "Featured Products",
    description: "Bộ sưu tập sản phẩm gỗ cao cấp được hoàn thiện tại xưởng.",
    descriptionEn: "Signature workshop pieces crafted from premium timber.",
    type: "FEATURED_PRODUCTS",
    sortOrder: 2,
    productSlugs: builtProducts.filter((product) => product.featured).slice(0, 12).map((product) => product.slug),
  },
  {
    slug: "premium-wood-slabs",
    title: "Slab gỗ cao cấp",
    titleEn: "Premium Wood Slabs",
    description: "Slab live-edge dành cho bàn ăn, quầy bar và không gian trưng bày sang trọng.",
    descriptionEn: "Live-edge slabs for luxury dining, counters, and statement displays.",
    type: "CURATED_COLLECTION",
    sortOrder: 3,
    productSlugs: [
      "riverline-walnut-live-edge-slab-wood-slabs",
      "rustic-suar-conference-slab-wood-slabs",
      "prime-acacia-river-slab-wood-slabs",
    ],
  },
  {
    slug: "kitchen-dining",
    title: "Bếp & Bàn ăn",
    titleEn: "Kitchen & Dining",
    description: "Thớt và phụ kiện gỗ tinh gọn cho không gian bếp gia đình hiện đại.",
    descriptionEn: "Refined cutting boards and accessories for modern kitchen spaces.",
    type: "CURATED_COLLECTION",
    sortOrder: 4,
    productSlugs: [
      "walnut-chef-cutting-board-cutting-boards",
      "oak-family-serving-board-cutting-boards",
      "walnut-serving-tray-set-wood-kitchenware",
      "beech-kitchen-utensil-stand-wood-kitchenware",
    ],
  },
  {
    slug: "decorative-wood-signs",
    title: "Biển gỗ trang trí",
    titleEn: "Decorative Wood Signs",
    description: "Giải pháp biển gỗ cá nhân hóa cho nhà ở, quán cà phê và thương hiệu.",
    descriptionEn: "Personalized wood signage for homes, cafés, and brand spaces.",
    type: "CURATED_COLLECTION",
    sortOrder: 5,
    productSlugs: [
      "heritage-house-name-sign-custom-wood-signs",
      "studio-brand-wall-sign-custom-wood-signs",
      "wedding-welcome-wood-sign-custom-wood-signs",
      "custom-beech-family-plaque-personalized-wood-gifts",
    ],
  },
  {
    slug: "custom-wood-work",
    title: "Gia công gỗ theo yêu cầu",
    titleEn: "Custom Wood Work",
    description: "Thiết kế và gia công theo kích thước thực tế cho dự án nội thất cao cấp.",
    descriptionEn: "Tailored design-and-build service for premium interior projects.",
    type: "PROMOTIONAL",
    sortOrder: 6,
    productSlugs: [
      "imperial-solid-wood-table-top-solid-wood",
      "studio-brand-wall-sign-custom-wood-signs",
      "fluted-oak-decorative-panel-decorative-wood-panels",
    ],
  },
  {
    slug: "new-arrivals",
    title: "Sản phẩm mới",
    titleEn: "New Arrivals",
    description: "Các mẫu mới nhất từ xưởng gia công gỗ Đại Thiên Phú.",
    descriptionEn: "Latest workshop arrivals from Đại Thiên Phú Wood.",
    type: "FEATURED_PRODUCTS",
    sortOrder: 7,
    productSlugs: builtProducts.slice(-10).map((product) => product.slug),
  },
];

export function getDemoHomepageSections(): DemoHomepageSectionRecord[] {
  return homepageSectionSeeds.map((seed, sectionIndex) => {
    const items: DemoHomepageSectionItemRecord[] = [];

    if (seed.type === "FEATURED_CATEGORIES") {
      (seed.categorySlugs ?? []).forEach((categorySlug, itemIndex) => {
        const category = categoriesBySlug.get(categorySlug);
        if (!category) return;

        items.push({
          id: `demo-section-${sectionIndex + 1}-item-${itemIndex + 1}`,
          customTitle: null,
          customTitleEn: null,
          customDescription: null,
          customDescriptionEn: null,
          imageUrl: null,
          linkUrl: null,
          active: true,
          sortOrder: itemIndex + 1,
          product: null,
          category: cloneCategory(category),
        });
      });
    } else {
      (seed.productSlugs ?? []).forEach((productSlug, itemIndex) => {
        const product = productsBySlug.get(productSlug);
        if (!product) return;

        items.push({
          id: `demo-section-${sectionIndex + 1}-item-${itemIndex + 1}`,
          customTitle: null,
          customTitleEn: null,
          customDescription: null,
          customDescriptionEn: null,
          imageUrl: null,
          linkUrl: null,
          active: true,
          sortOrder: itemIndex + 1,
          product: mapProduct(product),
          category: null,
        });
      });
    }

    return {
      id: `demo-home-section-${sectionIndex + 1}`,
      title: seed.title,
      titleEn: seed.titleEn,
      slug: seed.slug,
      description: seed.description,
      descriptionEn: seed.descriptionEn,
      type: seed.type,
      visible: true,
      sortOrder: seed.sortOrder,
      items,
      createdAt: fallbackSeedTimestamp,
      updatedAt: fallbackSeedTimestamp,
    };
  });
}

export function getDemoSearchResults(term: string) {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) {
    return { products: [] as DemoProductRecord[], categories: [] as DemoCategoryWithCountRecord[] };
  }

  const products = getDemoProducts({ q: normalizedTerm }).slice(0, 24);
  const categories = getDemoCategories()
    .filter(
      (category) =>
        matchContains(category.name, normalizedTerm) ||
        matchContains(category.nameEn, normalizedTerm) ||
        matchContains(category.shortDescription, normalizedTerm) ||
        matchContains(category.shortDescriptionEn, normalizedTerm),
    )
    .slice(0, 12);

  return { products, categories };
}

