import { PrismaClient, type HomepageSectionType } from "@prisma/client";
import bcrypt from "bcryptjs";

import { ensureDatabaseUrlInProcessEnv } from "../lib/database-url";

ensureDatabaseUrlInProcessEnv();

const prisma = new PrismaClient();

type CategorySeed = {
  nameVi: string;
  nameEn: string;
  slug: string;
  imageUrl: string;
  shortDescriptionVi: string;
  shortDescriptionEn: string;
  featured?: boolean;
  sortOrder: number;
};

type ProductDraft = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  woodType: string;
  material: string;
  dimensions: string;
  finish: string;
  featured?: boolean;
  sortOrder: number;
  categorySlug: string;
};

type ProductSeed = ProductDraft & {
  thumbnailUrl: string;
  gallery: string[];
  relatedSlugs: string[];
};

const categories: CategorySeed[] = [
  {
    nameVi: "Gỗ Tự Nhiên",
    nameEn: "Solid Wood",
    slug: "solid-wood",
    imageUrl: "/demo/categories/category-01.webp",
    shortDescriptionVi: "Nguồn gỗ tự nhiên cao cấp cho nội thất và dự án thi công.",
    shortDescriptionEn: "Premium solid timber selections for furniture and architectural projects.",
    featured: true,
    sortOrder: 1,
  },
  {
    nameVi: "Gỗ Óc Chó",
    nameEn: "Walnut",
    slug: "walnut",
    imageUrl: "/demo/categories/category-02.webp",
    shortDescriptionVi: "Vân gỗ óc chó sang trọng cho nội thất điểm nhấn và đồ gỗ theo yêu cầu.",
    shortDescriptionEn: "Rich walnut grain for statement interiors and custom wood furniture.",
    featured: true,
    sortOrder: 2,
  },
  {
    nameVi: "Gỗ Sồi",
    nameEn: "Oak",
    slug: "oak",
    imageUrl: "/demo/categories/category-03.webp",
    shortDescriptionVi: "Vật liệu gỗ sồi bền chắc với đường vân đẹp và độ ổn định cao.",
    shortDescriptionEn: "Durable oak materials with elegant lines and long-term stability.",
    featured: true,
    sortOrder: 3,
  },
  {
    nameVi: "Gỗ Dẻ Gai",
    nameEn: "Beech",
    slug: "beech",
    imageUrl: "/demo/categories/category-04.webp",
    shortDescriptionVi: "Bề mặt gỗ dẻ gai sáng mịn, phù hợp tủ bếp và hệ kệ hiện đại.",
    shortDescriptionEn: "Clean beech textures ideal for modern kitchens and shelving systems.",
    featured: true,
    sortOrder: 4,
  },
  {
    nameVi: "Slab Gỗ Tự Nhiên",
    nameEn: "Wood Slabs",
    slug: "wood-slabs",
    imageUrl: "/demo/categories/category-05.webp",
    shortDescriptionVi: "Slab live-edge và slab đổ keo tuyển chọn cho bàn ăn, đảo bếp cao cấp.",
    shortDescriptionEn: "Live-edge and river slabs selected for premium table and island builds.",
    featured: true,
    sortOrder: 5,
  },
  {
    nameVi: "Thớt Gỗ",
    nameEn: "Cutting Boards",
    slug: "cutting-boards",
    imageUrl: "/demo/categories/category-06.webp",
    shortDescriptionVi: "Thớt gỗ thủ công an toàn thực phẩm, sử dụng bền bỉ mỗi ngày.",
    shortDescriptionEn: "Food-safe handcrafted boards built for daily kitchen performance.",
    featured: true,
    sortOrder: 6,
  },
  {
    nameVi: "Panel Trang Trí Gỗ",
    nameEn: "Decorative Wood Panels",
    slug: "decorative-wood-panels",
    imageUrl: "/demo/categories/category-07.webp",
    shortDescriptionVi: "Bộ sưu tập panel gỗ trang trí cho tường, sảnh và không gian trưng bày.",
    shortDescriptionEn: "Architectural panel collections for walls, lobbies, and display zones.",
    featured: true,
    sortOrder: 7,
  },
  {
    nameVi: "Biển Gỗ Theo Yêu Cầu",
    nameEn: "Custom Wood Signs",
    slug: "custom-wood-signs",
    imageUrl: "/demo/categories/category-08.webp",
    shortDescriptionVi: "Biển gỗ cá nhân hóa cho nhà ở, quán cà phê, studio và không gian dịch vụ.",
    shortDescriptionEn: "Personalized signs for homes, cafés, studios, and hospitality spaces.",
    featured: true,
    sortOrder: 8,
  },
  {
    nameVi: "Trang Trí Nhà Bằng Gỗ",
    nameEn: "Wood Home Decor",
    slug: "wood-home-decor",
    imageUrl: "/demo/categories/category-09.webp",
    shortDescriptionVi: "Phụ kiện trang trí gỗ mang lại sự ấm cúng và cá tính cho không gian sống.",
    shortDescriptionEn: "Decorative wooden accents that bring warmth and character to interiors.",
    sortOrder: 9,
  },
  {
    nameVi: "Đồ Bếp Bằng Gỗ",
    nameEn: "Wood Kitchenware",
    slug: "wood-kitchenware",
    imageUrl: "/demo/categories/category-10.webp",
    shortDescriptionVi: "Bộ phụ kiện bếp bằng gỗ dành cho căn bếp và bàn ăn cao cấp.",
    shortDescriptionEn: "Curated wood kitchen accessories for premium residential dining setups.",
    sortOrder: 10,
  },
  {
    nameVi: "Quà Tặng Gỗ Cá Nhân Hóa",
    nameEn: "Personalized Wood Gifts",
    slug: "personalized-wood-gifts",
    imageUrl: "/demo/categories/category-11.webp",
    shortDescriptionVi: "Quà tặng gỗ khắc tên cho dịp gia đình, sự kiện và doanh nghiệp.",
    shortDescriptionEn: "Custom engraved gift pieces for family events and corporate occasions.",
    sortOrder: 11,
  },
  {
    nameVi: "Vật Liệu Gỗ Nội Thất",
    nameEn: "Interior Wood Materials",
    slug: "interior-wood-materials",
    imageUrl: "/demo/categories/category-12.webp",
    shortDescriptionVi: "Vật liệu gỗ sẵn sàng cho thi công nội thất, tủ kệ và hoàn thiện tường.",
    shortDescriptionEn: "Interior-ready wood components for fit-out, cabinetry, and wall finishes.",
    sortOrder: 12,
  },
];

const productDrafts: ProductDraft[] = [
  {
    name: "Imperial Solid Wood Table Top",
    slug: "imperial-solid-wood-table-top",
    shortDescription: "Large-format solid timber top for premium dining and showroom tables.",
    description:
      "A moisture-stabilized solid wood top selected for balanced grain and refined edge finishing. Ideal for luxury dining projects and custom hospitality furniture.",
    woodType: "Premium Mixed Hardwood",
    material: "Solid Wood",
    dimensions: "2200 x 950 x 40 mm",
    finish: "Matte hardwax oil",
    featured: true,
    sortOrder: 1,
    categorySlug: "solid-wood",
  },
  {
    name: "Heritage Solid Timber Console Panel",
    slug: "heritage-solid-timber-console-panel",
    shortDescription: "Straight-grain solid panel for console builds and boutique interiors.",
    description:
      "Calibrated panel stock with low movement and clean milling for reliable fabrication. Designed for console tops, shelving, and feature counters.",
    woodType: "Engineered Hardwood Core",
    material: "Solid Wood",
    dimensions: "1800 x 450 x 32 mm",
    finish: "Natural satin seal",
    sortOrder: 2,
    categorySlug: "solid-wood",
  },
  {
    name: "Atelier Solid Stair Tread Set",
    slug: "atelier-solid-stair-tread-set",
    shortDescription: "Workshop-grade stair tread blanks with consistent color and density.",
    description:
      "Precision-machined solid treads prepared for residential and commercial staircase production. Suitable for custom edge profiles and anti-slip detailing.",
    woodType: "Kiln-Dried Hardwood",
    material: "Solid Wood",
    dimensions: "1200 x 300 x 38 mm",
    finish: "Fine sanded",
    sortOrder: 3,
    categorySlug: "solid-wood",
  },
  {
    name: "Signature Walnut Dining Board",
    slug: "signature-walnut-dining-board",
    shortDescription: "Deep-toned walnut board crafted for high-end dining furniture.",
    description:
      "Premium walnut stock selected for elegant figure and stable moisture profile. Recommended for statement dining tops and executive joinery.",
    woodType: "American Walnut",
    material: "Solid Walnut",
    dimensions: "2400 x 850 x 42 mm",
    finish: "Food-safe matte oil",
    featured: true,
    sortOrder: 4,
    categorySlug: "walnut",
  },
  {
    name: "Walnut Luxe Floating Shelf",
    slug: "walnut-luxe-floating-shelf",
    shortDescription: "Minimal floating shelf in rich walnut tone for premium wall displays.",
    description:
      "Prepared walnut shelf blank with concealed bracket channel and smooth edge radius. Built for modern living rooms, boutiques, and reception areas.",
    woodType: "American Walnut",
    material: "Solid Walnut",
    dimensions: "1200 x 260 x 36 mm",
    finish: "Clear oil-wax blend",
    sortOrder: 5,
    categorySlug: "walnut",
  },
  {
    name: "Executive Walnut Desk Slab",
    slug: "executive-walnut-desk-slab",
    shortDescription: "Premium walnut slab for executive desk and meeting room surfaces.",
    description:
      "Bookmatched walnut slab with character grain and refined sanding process. Suitable for custom desks, boardroom tables, and design studios.",
    woodType: "Black Walnut",
    material: "Live Edge Walnut",
    dimensions: "2600 x 900 x 52 mm",
    finish: "Satin urethane topcoat",
    featured: true,
    sortOrder: 6,
    categorySlug: "walnut",
  },
  {
    name: "Natural Oak Frame Board",
    slug: "natural-oak-frame-board",
    shortDescription: "Stable oak board stock for cabinetry frames and wall detailing.",
    description:
      "High-grade oak board with controlled moisture and consistent straight grain. A reliable base for frame systems, paneling, and fine carpentry.",
    woodType: "European Oak",
    material: "Solid Oak",
    dimensions: "2400 x 220 x 30 mm",
    finish: "Raw, ready for topcoat",
    sortOrder: 7,
    categorySlug: "oak",
  },
  {
    name: "Harmony Oak Wall Cladding",
    slug: "harmony-oak-wall-cladding",
    shortDescription: "Warm oak cladding profile for accent walls and hospitality interiors.",
    description:
      "Modular oak strips engineered for quick installation and consistent visual rhythm. Delivers a premium backdrop in residences, cafés, and offices.",
    woodType: "White Oak",
    material: "Decorative Oak Panel",
    dimensions: "600 x 2400 x 20 mm",
    finish: "UV clear coat",
    featured: true,
    sortOrder: 8,
    categorySlug: "oak",
  },
  {
    name: "Oak Atelier Counter Panel",
    slug: "oak-atelier-counter-panel",
    shortDescription: "Counter-ready oak panel with clean geometry and minimal movement.",
    description:
      "Furniture-grade oak panel suited for kitchen counters and service bars. Precision-sanded and pre-calibrated for efficient fabrication.",
    woodType: "Rift Sawn Oak",
    material: "Solid Oak Panel",
    dimensions: "3000 x 650 x 38 mm",
    finish: "Hardwax oil",
    sortOrder: 9,
    categorySlug: "oak",
  },
  {
    name: "Beech Precision Joinery Board",
    slug: "beech-precision-joinery-board",
    shortDescription: "Clean beech board for millwork, shelving, and interior trim packages.",
    description:
      "Reliable beech stock with stable density and smooth machining behavior. Recommended for custom joinery requiring tight tolerances.",
    woodType: "European Beech",
    material: "Solid Beech",
    dimensions: "2100 x 200 x 28 mm",
    finish: "Fine sanded",
    sortOrder: 10,
    categorySlug: "beech",
  },
  {
    name: "Beech Classic Cutting Surface",
    slug: "beech-classic-cutting-surface",
    shortDescription: "Food-safe beech board blank for kitchens and culinary workshops.",
    description:
      "Prepared beech surface with rounded corners and balanced grain alignment. Built for direct food-contact applications and chef counters.",
    woodType: "European Beech",
    material: "Solid Beech",
    dimensions: "520 x 320 x 35 mm",
    finish: "Mineral oil treatment",
    featured: true,
    sortOrder: 11,
    categorySlug: "beech",
  },
  {
    name: "Beech Modular Shelf Blank",
    slug: "beech-modular-shelf-blank",
    shortDescription: "Multipurpose beech shelf blank ready for custom wall systems.",
    description:
      "Uniform beech panel with clean edge profile and stable lamination. Suitable for modular shelves, wardrobes, and retail fixtures.",
    woodType: "Finger-Jointed Beech",
    material: "Solid Laminated Beech",
    dimensions: "1600 x 300 x 28 mm",
    finish: "Natural matte lacquer",
    sortOrder: 12,
    categorySlug: "beech",
  },
  {
    name: "Riverline Walnut Live Edge Slab",
    slug: "riverline-walnut-live-edge-slab",
    shortDescription: "Museum-grade walnut slab preserving natural edge movement.",
    description:
      "One-piece walnut slab kiln-dried and stabilized for premium table fabrication. Ideal for centerpiece dining, feature counters, and custom commissions.",
    woodType: "Walnut",
    material: "Live Edge Slab",
    dimensions: "2750 x 930 x 58 mm",
    finish: "Sanded and sealed",
    featured: true,
    sortOrder: 13,
    categorySlug: "wood-slabs",
  },
  {
    name: "Rustic Suar Conference Slab",
    slug: "rustic-suar-conference-slab",
    shortDescription: "Wide suar slab for boardroom and creative studio statement tables.",
    description:
      "Selected suar slab with bold natural contour and balanced moisture profile. Designed for one-of-a-kind conference and feature table projects.",
    woodType: "Suar",
    material: "Live Edge Slab",
    dimensions: "3200 x 1050 x 65 mm",
    finish: "Natural oil matte",
    featured: true,
    sortOrder: 14,
    categorySlug: "wood-slabs",
  },
  {
    name: "Prime Acacia River Slab",
    slug: "prime-acacia-river-slab",
    shortDescription: "Character-rich acacia slab for river table and island installations.",
    description:
      "A high-contrast acacia slab with controlled drying and precise surfacing. Suitable for resin river projects and luxury interior centerpieces.",
    woodType: "Acacia",
    material: "Live Edge Slab",
    dimensions: "2600 x 880 x 55 mm",
    finish: "Clear resin prep",
    sortOrder: 15,
    categorySlug: "wood-slabs",
  },
  {
    name: "Walnut Chef Cutting Board",
    slug: "walnut-chef-cutting-board",
    shortDescription: "Professional walnut board designed for heavy-use prep stations.",
    description:
      "Dense walnut cutting board with refined edge chamfer and food-safe finishing. Built for chefs, open kitchens, and premium home dining spaces.",
    woodType: "Walnut",
    material: "Solid Cutting Board",
    dimensions: "520 x 320 x 40 mm",
    finish: "Food-grade oil and wax",
    featured: true,
    sortOrder: 16,
    categorySlug: "cutting-boards",
  },
  {
    name: "Oak Family Serving Board",
    slug: "oak-family-serving-board",
    shortDescription: "Large oak serving board with balanced grain and soft rounded corners.",
    description:
      "An elegant oak serving board for family dining and hosted events. Easy to maintain, durable in daily use, and crafted for premium table styling.",
    woodType: "White Oak",
    material: "Solid Serving Board",
    dimensions: "580 x 300 x 24 mm",
    finish: "Food-safe mineral oil",
    sortOrder: 17,
    categorySlug: "cutting-boards",
  },
  {
    name: "Beech End Grain Butcher Block",
    slug: "beech-end-grain-butcher-block",
    shortDescription: "Heavy-duty end-grain block for prep counters and culinary studios.",
    description:
      "Engineered end-grain beech surface built to absorb knife impact and stay stable. A practical premium choice for serious kitchen performance.",
    woodType: "Beech",
    material: "End Grain Board",
    dimensions: "600 x 400 x 60 mm",
    finish: "Food-safe butcher oil",
    sortOrder: 18,
    categorySlug: "cutting-boards",
  },
  {
    name: "Fluted Oak Decorative Panel",
    slug: "fluted-oak-decorative-panel",
    shortDescription: "Architectural fluted panel for premium wall and reception treatments.",
    description:
      "Fluted oak panel module designed for soft shadow play and refined vertical rhythm. Suitable for feature walls, entry zones, and boutique interiors.",
    woodType: "Oak",
    material: "Decorative Wall Panel",
    dimensions: "600 x 2400 x 18 mm",
    finish: "Clear matte topcoat",
    featured: true,
    sortOrder: 19,
    categorySlug: "decorative-wood-panels",
  },
  {
    name: "Walnut Chevron Accent Panel",
    slug: "walnut-chevron-accent-panel",
    shortDescription: "Chevron-pattern walnut panel for high-impact interior highlights.",
    description:
      "Precision-cut walnut veneer panel with geometric chevron composition. Works beautifully in headboards, feature corners, and premium hospitality walls.",
    woodType: "Walnut",
    material: "Decorative Veneer Panel",
    dimensions: "1200 x 2400 x 21 mm",
    finish: "Satin lacquer",
    sortOrder: 20,
    categorySlug: "decorative-wood-panels",
  },
  {
    name: "Beech Acoustic Slat Panel",
    slug: "beech-acoustic-slat-panel",
    shortDescription: "Acoustic beech slat system for quiet and elegant interior spaces.",
    description:
      "Decorative slat panel with acoustic backing to reduce noise while preserving a warm wood feel. Designed for offices, lounges, and studios.",
    woodType: "Beech",
    material: "Acoustic Slat Panel",
    dimensions: "600 x 2400 x 22 mm",
    finish: "Natural UV coat",
    sortOrder: 21,
    categorySlug: "decorative-wood-panels",
  },
  {
    name: "Heritage House Name Sign",
    slug: "heritage-house-name-sign",
    shortDescription: "Custom wood name sign for family homes and private villas.",
    description:
      "Solid wood sign blank ready for carved or laser-engraved lettering. Built to display names, addresses, and custom motifs with a premium finish.",
    woodType: "Cedar",
    material: "Custom Sign Board",
    dimensions: "900 x 300 x 28 mm",
    finish: "Outdoor satin seal",
    featured: true,
    sortOrder: 22,
    categorySlug: "custom-wood-signs",
  },
  {
    name: "Studio Brand Wall Sign",
    slug: "studio-brand-wall-sign",
    shortDescription: "Professional branded wall sign for studios, cafés, and offices.",
    description:
      "Customizable wood signage format designed for logos and corporate lettering. Delivers a handcrafted premium impression in reception and storefront areas.",
    woodType: "Oak",
    material: "Layered Wood Sign",
    dimensions: "1200 x 500 x 24 mm",
    finish: "Matte lacquer",
    sortOrder: 23,
    categorySlug: "custom-wood-signs",
  },
  {
    name: "Wedding Welcome Wood Sign",
    slug: "wedding-welcome-wood-sign",
    shortDescription: "Elegant personalized sign format for wedding and event entrances.",
    description:
      "Smooth wood sign panel designed for engraved names, dates, and welcome text. A refined keepsake option for event planners and families.",
    woodType: "Beech",
    material: "Personalized Sign Panel",
    dimensions: "1000 x 450 x 22 mm",
    finish: "Soft matte clear coat",
    sortOrder: 24,
    categorySlug: "custom-wood-signs",
  },
  {
    name: "Sculpted Walnut Wall Art",
    slug: "sculpted-walnut-wall-art",
    shortDescription: "Hand-finished walnut wall art panel with geometric depth.",
    description:
      "Decorative walnut art piece shaped for modern interiors. Adds warm texture and craftsmanship to living rooms, bedrooms, and offices.",
    woodType: "Walnut",
    material: "Wood Wall Art",
    dimensions: "900 x 900 x 35 mm",
    finish: "Natural wax oil",
    featured: true,
    sortOrder: 25,
    categorySlug: "wood-home-decor",
  },
  {
    name: "Oak Minimal Candle Tray",
    slug: "oak-minimal-candle-tray",
    shortDescription: "Minimal oak tray for candles, fragrances, and table styling.",
    description:
      "Compact decorative tray milled from oak with smooth edge contour. Designed to elevate home styling while maintaining practical daily use.",
    woodType: "Oak",
    material: "Decorative Tray",
    dimensions: "360 x 180 x 24 mm",
    finish: "Natural hardwax oil",
    sortOrder: 26,
    categorySlug: "wood-home-decor",
  },
  {
    name: "Beech Curved Storage Stool",
    slug: "beech-curved-storage-stool",
    shortDescription: "Multi-use beech stool with integrated storage detail.",
    description:
      "A compact home decor piece combining seating and hidden storage. Built from beech for smooth grain appearance and long-term durability.",
    woodType: "Beech",
    material: "Solid Wood Decor Piece",
    dimensions: "420 x 360 x 460 mm",
    finish: "Matte clear coat",
    sortOrder: 27,
    categorySlug: "wood-home-decor",
  },
  {
    name: "Walnut Serving Tray Set",
    slug: "walnut-serving-tray-set",
    shortDescription: "Premium walnut tray duo for tea, coffee, and hosted dining service.",
    description:
      "Pair of handcrafted walnut trays with gentle edge profile and stable grip design. Suitable for both residential hospitality and boutique cafés.",
    woodType: "Walnut",
    material: "Kitchenware Set",
    dimensions: "Large 460 x 300 x 35 mm / Small 380 x 240 x 35 mm",
    finish: "Food-safe wax oil",
    featured: true,
    sortOrder: 28,
    categorySlug: "wood-kitchenware",
  },
  {
    name: "Oak Counter Spice Rail",
    slug: "oak-counter-spice-rail",
    shortDescription: "Elegant oak spice organizer for premium kitchen counters.",
    description:
      "Modular spice rail in oak designed to keep daily cooking essentials accessible and visually clean. A practical upgrade for modern kitchens.",
    woodType: "Oak",
    material: "Kitchen Organizer",
    dimensions: "700 x 120 x 80 mm",
    finish: "Natural matte finish",
    sortOrder: 29,
    categorySlug: "wood-kitchenware",
  },
  {
    name: "Beech Kitchen Utensil Stand",
    slug: "beech-kitchen-utensil-stand",
    shortDescription: "Compact beech utensil stand with premium handcrafted detailing.",
    description:
      "Vertical kitchen stand for spoons, spatulas, and chopsticks with easy-clean interior. Built for daily use while preserving a natural wood look.",
    woodType: "Beech",
    material: "Kitchen Storage Piece",
    dimensions: "160 x 160 x 220 mm",
    finish: "Food-safe clear coat",
    sortOrder: 30,
    categorySlug: "wood-kitchenware",
  },
  {
    name: "Engraved Walnut Keepsake Box",
    slug: "engraved-walnut-keepsake-box",
    shortDescription: "Personalized walnut keepsake box for meaningful gifts and occasions.",
    description:
      "Compact walnut gift box customizable with names, initials, or event dates. A timeless premium gift for weddings, anniversaries, and milestones.",
    woodType: "Walnut",
    material: "Personalized Gift Box",
    dimensions: "280 x 200 x 110 mm",
    finish: "Satin hand oil",
    featured: true,
    sortOrder: 31,
    categorySlug: "personalized-wood-gifts",
  },
  {
    name: "Personalized Oak Photo Frame",
    slug: "personalized-oak-photo-frame",
    shortDescription: "Custom oak frame with engraving-ready border for family photos.",
    description:
      "Solid oak photo frame designed for custom names, messages, or special dates. Suitable for homes, gifts, and ceremonial displays.",
    woodType: "Oak",
    material: "Personalized Frame",
    dimensions: "320 x 270 x 24 mm",
    finish: "Natural matte lacquer",
    sortOrder: 32,
    categorySlug: "personalized-wood-gifts",
  },
  {
    name: "Custom Beech Family Plaque",
    slug: "custom-beech-family-plaque",
    shortDescription: "Custom engraved beech plaque for family rooms and entry walls.",
    description:
      "Refined beech plaque crafted for personalized lettering and decorative motifs. A warm gift item with practical wall-mount flexibility.",
    woodType: "Beech",
    material: "Personalized Plaque",
    dimensions: "500 x 220 x 20 mm",
    finish: "Soft satin coat",
    sortOrder: 33,
    categorySlug: "personalized-wood-gifts",
  },
  {
    name: "Interior Oak Veneer Sheet",
    slug: "interior-oak-veneer-sheet",
    shortDescription: "Furniture-grade oak veneer sheet for cabinets and wall applications.",
    description:
      "High-consistency oak veneer sheet selected for premium interior fit-out packages. Optimized for cabinetry, wall cladding, and door skins.",
    woodType: "Oak",
    material: "Interior Veneer Material",
    dimensions: "1220 x 2440 x 18 mm",
    finish: "Raw veneer face",
    featured: true,
    sortOrder: 34,
    categorySlug: "interior-wood-materials",
  },
  {
    name: "Walnut Cabinet Door Front",
    slug: "walnut-cabinet-door-front",
    shortDescription: "Premium walnut cabinet front for custom kitchen and wardrobe projects.",
    description:
      "Precision-machined walnut door front with consistent grain selection and edge detailing. Designed for high-end interior millwork.",
    woodType: "Walnut",
    material: "Interior Cabinet Component",
    dimensions: "720 x 450 x 22 mm",
    finish: "Matte lacquer",
    sortOrder: 35,
    categorySlug: "interior-wood-materials",
  },
  {
    name: "Beech Door Jamb Material Set",
    slug: "beech-door-jamb-material-set",
    shortDescription: "Calibrated beech components for interior door frames and jamb sets.",
    description:
      "Interior-grade beech jamb material milled for assembly efficiency and structural stability. Suitable for residential and hospitality fit-outs.",
    woodType: "Beech",
    material: "Interior Frame Material",
    dimensions: "2400 x 120 x 30 mm",
    finish: "Primer-ready smooth sand",
    sortOrder: 36,
    categorySlug: "interior-wood-materials",
  },
];

const productImagePool = Array.from(
  { length: 28 },
  (_, index) => `/demo/products/product-${String(index + 1).padStart(3, "0")}.webp`,
);

function pickProductImage(index: number, offset = 0) {
  return productImagePool[(index + offset) % productImagePool.length];
}

function buildGallery(index: number, count = 4) {
  const gallery: string[] = [];
  let offset = 1;

  while (gallery.length < count) {
    const image = pickProductImage(index, offset);
    if (!gallery.includes(image)) {
      gallery.push(image);
    }
    offset += 1;
  }

  return gallery;
}

const products: ProductSeed[] = productDrafts.map((product, index) => ({
  ...product,
  thumbnailUrl: pickProductImage(index),
  gallery: buildGallery(index, 4),
  relatedSlugs: [],
}));

const vietnameseReplacements: Array<[RegExp, string]> = [
  [/Premium/gi, "Cao cấp"],
  [/Solid Wood/gi, "Gỗ tự nhiên"],
  [/Solid Timber/gi, "Gỗ tự nhiên"],
  [/Walnut/gi, "Óc chó"],
  [/Oak/gi, "Sồi"],
  [/Beech/gi, "Beech"],
  [/Wood Slab/gi, "Slab gỗ"],
  [/Live Edge/gi, "Live-edge"],
  [/Cutting Board/gi, "Thớt gỗ"],
  [/Serving Board/gi, "Khay phục vụ gỗ"],
  [/Kitchenware/gi, "Đồ bếp gỗ"],
  [/Decorative/gi, "Trang trí"],
  [/Custom/gi, "Theo yêu cầu"],
  [/Interior/gi, "Nội thất"],
  [/Project/gi, "dự án"],
  [/Projects/gi, "các dự án"],
  [/Finish/gi, "Hoàn thiện"],
  [/Dimensions/gi, "Kích thước"],
  [/Material/gi, "Vật liệu"],
  [/Wood type/gi, "Loại gỗ"],
  [/On request/gi, "Theo yêu cầu"],
  [/Call for consultation/gi, "Gọi tư vấn"],
];

function toVietnameseText(value: string) {
  return vietnameseReplacements.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value,
  );
}

for (const [index, product] of products.entries()) {
  const sameCategory = products
    .filter((candidate) => candidate.categorySlug === product.categorySlug && candidate.slug !== product.slug)
    .map((candidate) => candidate.slug);

  const nextProduct = products[(index + 1) % products.length]?.slug;
  const secondNextProduct = products[(index + 2) % products.length]?.slug;

  product.relatedSlugs = [...new Set([...sameCategory.slice(0, 2), nextProduct, secondNextProduct])]
    .filter((slug): slug is string => Boolean(slug))
    .slice(0, 4);
}

async function upsertHomepageSection(section: {
  titleVi: string;
  titleEn: string;
  slug: string;
  descriptionVi: string;
  descriptionEn: string;
  type: HomepageSectionType;
  sortOrder: number;
}) {
  const savedSection = await prisma.homepageSection.upsert({
    where: { slug: section.slug },
    update: {
      title: section.titleVi,
      titleEn: section.titleEn,
      description: section.descriptionVi,
      descriptionEn: section.descriptionEn,
      type: section.type,
      visible: true,
      sortOrder: section.sortOrder,
    },
    create: {
      title: section.titleVi,
      titleEn: section.titleEn,
      slug: section.slug,
      description: section.descriptionVi,
      descriptionEn: section.descriptionEn,
      type: section.type,
      visible: true,
      sortOrder: section.sortOrder,
    },
  });

  await prisma.homepageSectionItem.deleteMany({
    where: { sectionId: savedSection.id },
  });

  return savedSection;
}

async function main() {
  const isProduction = process.env.NODE_ENV === "production";
  const allowProductionSeed = process.env.ALLOW_PRODUCTION_SEED === "true";

  if (isProduction && !allowProductionSeed) {
    throw new Error(
      "Seeding is blocked in production by default. Set ALLOW_PRODUCTION_SEED=true only if you explicitly need it.",
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for seeding.");
  }

  const companyPhone = process.env.COMPANY_PHONE || "0786531966";
  const zaloUrl = process.env.ZALO_URL || "https://zalo.me/0786531966";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: "ĐẠI THIÊN PHÚ WOOD Admin",
      passwordHash,
      active: true,
      role: "ADMIN",
    },
    create: {
      name: "ĐẠI THIÊN PHÚ WOOD Admin",
      email: adminEmail,
      passwordHash,
      active: true,
      role: "ADMIN",
    },
  });

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.nameVi,
          nameEn: category.nameEn,
          imageUrl: category.imageUrl,
          shortDescription: category.shortDescriptionVi,
          shortDescriptionEn: category.shortDescriptionEn,
          featured: Boolean(category.featured),
          active: true,
          sortOrder: category.sortOrder,
        },
        create: {
          name: category.nameVi,
          nameEn: category.nameEn,
          slug: category.slug,
          imageUrl: category.imageUrl,
          shortDescription: category.shortDescriptionVi,
          shortDescriptionEn: category.shortDescriptionEn,
          featured: Boolean(category.featured),
          active: true,
          sortOrder: category.sortOrder,
        },
      }),
    ),
  );

  const categoryBySlug = new Map(createdCategories.map((item) => [item.slug, item]));

  const createdProducts = [];
  for (const product of products) {
    const category = categoryBySlug.get(product.categorySlug);
    if (!category) {
      throw new Error(`Category not found for slug ${product.categorySlug}`);
    }

    const nameVi = toVietnameseText(product.name);
    const shortDescriptionVi = toVietnameseText(product.shortDescription);
    const descriptionVi = toVietnameseText(product.description);
    const woodTypeVi = toVietnameseText(product.woodType);
    const materialVi = toVietnameseText(product.material);
    const finishVi = toVietnameseText(product.finish);

    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: nameVi,
        nameEn: product.name,
        shortDescription: shortDescriptionVi,
        shortDescriptionEn: product.shortDescription,
        description: descriptionVi,
        descriptionEn: product.description,
        thumbnailUrl: product.thumbnailUrl,
        woodType: woodTypeVi,
        woodTypeEn: product.woodType,
        material: materialVi,
        materialEn: product.material,
        dimensions: product.dimensions,
        dimensionsEn: product.dimensions,
        finish: finishVi,
        finishEn: product.finish,
        featured: Boolean(product.featured),
        active: true,
        sortOrder: product.sortOrder,
        categoryId: category.id,
      },
      create: {
        name: nameVi,
        nameEn: product.name,
        slug: product.slug,
        shortDescription: shortDescriptionVi,
        shortDescriptionEn: product.shortDescription,
        description: descriptionVi,
        descriptionEn: product.description,
        thumbnailUrl: product.thumbnailUrl,
        woodType: woodTypeVi,
        woodTypeEn: product.woodType,
        material: materialVi,
        materialEn: product.material,
        dimensions: product.dimensions,
        dimensionsEn: product.dimensions,
        finish: finishVi,
        finishEn: product.finish,
        featured: Boolean(product.featured),
        active: true,
        sortOrder: product.sortOrder,
        categoryId: category.id,
      },
    });

    await prisma.productImage.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prisma.productImage.createMany({
      data: product.gallery.map((url, imageIndex) => ({
        productId: savedProduct.id,
        url,
        alt: `${product.name} image ${imageIndex + 1}`,
        sortOrder: imageIndex + 1,
      })),
    });

    createdProducts.push(savedProduct);
  }

  const productBySlug = new Map(createdProducts.map((item) => [item.slug, item]));

  for (const product of products) {
    const sourceProduct = productBySlug.get(product.slug);
    if (!sourceProduct) continue;

    const relatedIds = product.relatedSlugs
      .map((relatedSlug) => productBySlug.get(relatedSlug)?.id)
      .filter((id): id is string => Boolean(id));

    await prisma.product.update({
      where: { id: sourceProduct.id },
      data: {
        relatedProducts: {
          set: relatedIds.map((id) => ({ id })),
        },
      },
    });
  }

  const featuredCategoriesSection = await upsertHomepageSection({
    titleVi: "Danh mục nổi bật",
    titleEn: "Featured Categories",
    slug: "featured-categories",
    descriptionVi: "Khám phá các nhóm vật liệu được tin dùng cho nhà ở và công trình thương mại cao cấp.",
    descriptionEn: "Explore the material groups trusted for premium residential and commercial projects.",
    type: "FEATURED_CATEGORIES",
    sortOrder: 1,
  });

  for (const [index, category] of categories.filter((item) => item.featured).slice(0, 8).entries()) {
    const categoryId = categoryBySlug.get(category.slug)?.id;
    if (!categoryId) continue;

    await prisma.homepageSectionItem.create({
      data: {
        sectionId: featuredCategoriesSection.id,
        categoryId,
        sortOrder: index + 1,
      },
    });
  }

  const featuredProductsSection = await upsertHomepageSection({
    titleVi: "Sản phẩm nổi bật",
    titleEn: "Featured Products",
    slug: "featured-products",
    descriptionVi: "Những sản phẩm tiêu biểu và vật liệu cao cấp sẵn sàng tư vấn theo nhu cầu thực tế.",
    descriptionEn: "Signature workshop pieces and premium materials available for direct consultation.",
    type: "FEATURED_PRODUCTS",
    sortOrder: 2,
  });

  for (const [index, product] of products.filter((item) => item.featured).slice(0, 12).entries()) {
    const productId = productBySlug.get(product.slug)?.id;
    if (!productId) continue;

    await prisma.homepageSectionItem.create({
      data: {
        sectionId: featuredProductsSection.id,
        productId,
        sortOrder: index + 1,
      },
    });
  }

  const premiumWoodSlabsSection = await upsertHomepageSection({
    titleVi: "Slab gỗ cao cấp",
    titleEn: "Premium Wood Slabs",
    slug: "premium-wood-slabs",
    descriptionVi: "Bộ sưu tập slab live-edge cho bàn ăn, quầy bếp và không gian nội thất cá nhân hóa.",
    descriptionEn: "Live-edge slab selections for statement dining, counters, and bespoke interiors.",
    type: "CURATED_COLLECTION",
    sortOrder: 3,
  });

  for (const [index, slug] of [
    "riverline-walnut-live-edge-slab",
    "rustic-suar-conference-slab",
    "prime-acacia-river-slab",
  ].entries()) {
    const productId = productBySlug.get(slug)?.id;
    if (!productId) continue;

    await prisma.homepageSectionItem.create({
      data: {
        sectionId: premiumWoodSlabsSection.id,
        productId,
        sortOrder: index + 1,
      },
    });
  }

  const kitchenDiningSection = await upsertHomepageSection({
    titleVi: "Bếp & Bàn ăn",
    titleEn: "Kitchen & Dining",
    slug: "kitchen-and-dining",
    descriptionVi: "Thớt và phụ kiện bếp cao cấp được chế tác cho nhu cầu sử dụng hằng ngày.",
    descriptionEn: "Premium cutting boards and kitchenware crafted for daily use with lasting elegance.",
    type: "CURATED_COLLECTION",
    sortOrder: 4,
  });

  for (const [index, slug] of [
    "walnut-chef-cutting-board",
    "oak-family-serving-board",
    "walnut-serving-tray-set",
    "beech-kitchen-utensil-stand",
  ].entries()) {
    const productId = productBySlug.get(slug)?.id;
    if (!productId) continue;

    await prisma.homepageSectionItem.create({
      data: {
        sectionId: kitchenDiningSection.id,
        productId,
        sortOrder: index + 1,
      },
    });
  }

  const decorativeSignsSection = await upsertHomepageSection({
    titleVi: "Biển gỗ trang trí",
    titleEn: "Decorative Wood Signs",
    slug: "decorative-wood-signs",
    descriptionVi: "Các mẫu biển gỗ và khắc cá nhân hóa cho nhà ở, cửa hàng và không gian thương hiệu.",
    descriptionEn: "Custom signage and personalized engraving formats for homes and business spaces.",
    type: "CURATED_COLLECTION",
    sortOrder: 5,
  });

  for (const [index, slug] of [
    "heritage-house-name-sign",
    "studio-brand-wall-sign",
    "wedding-welcome-wood-sign",
    "custom-beech-family-plaque",
  ].entries()) {
    const productId = productBySlug.get(slug)?.id;
    if (!productId) continue;

    await prisma.homepageSectionItem.create({
      data: {
        sectionId: decorativeSignsSection.id,
        productId,
        sortOrder: index + 1,
      },
    });
  }

  const customWoodWorkSection = await upsertHomepageSection({
    titleVi: "Gia công gỗ theo yêu cầu",
    titleEn: "Custom Wood Work",
    slug: "custom-wood-work",
    descriptionVi: "Dịch vụ thiết kế và gia công cho bếp, biển thương hiệu và hạng mục nội thất cao cấp.",
    descriptionEn: "Tailored design-and-build services for kitchens, brand signage, and premium interiors.",
    type: "PROMOTIONAL",
    sortOrder: 6,
  });

  await prisma.homepageSectionItem.createMany({
    data: [
      {
        sectionId: customWoodWorkSection.id,
        customTitle: "Mặt bếp gỗ theo yêu cầu",
        customTitleEn: "Custom Kitchen Countertops",
        customDescription: "Gia công mặt bếp gỗ tự nhiên và slab theo kích thước thực tế.",
        customDescriptionEn: "Made-to-measure solid wood and slab countertops for premium kitchens.",
        imageUrl: "/demo/products/product-014.webp",
        linkUrl: "/categories/solid-wood",
        sortOrder: 1,
      },
      {
        sectionId: customWoodWorkSection.id,
        customTitle: "Gói biển gỗ thương hiệu",
        customTitleEn: "Brand Signage Packages",
        customDescription: "Biển gỗ nhiều lớp với tùy chọn khắc, ghép và hoàn thiện theo nhận diện.",
        customDescriptionEn: "Layered wood signage with engraving, inlay, and finishing options.",
        imageUrl: "/demo/products/product-023.webp",
        linkUrl: "/categories/custom-wood-signs",
        sortOrder: 2,
      },
      {
        sectionId: customWoodWorkSection.id,
        customTitle: "Thi công panel nội thất",
        customTitleEn: "Interior Panel Execution",
        customDescription: "Giải pháp panel tường theo thiết kế cho nhà ở, quán cà phê và văn phòng.",
        customDescriptionEn: "Design-driven wall panel packages for residences, cafés, and offices.",
        imageUrl: "/demo/products/product-019.webp",
        linkUrl: "/categories/decorative-wood-panels",
        sortOrder: 3,
      },
    ],
  });

  const newArrivalsSection = await upsertHomepageSection({
    titleVi: "Sản phẩm mới",
    titleEn: "New Arrivals",
    slug: "new-arrivals",
    descriptionVi: "Những sản phẩm và vật liệu vừa được bổ sung từ xưởng sản xuất.",
    descriptionEn: "Recently added products and materials from our latest workshop releases.",
    type: "FEATURED_PRODUCTS",
    sortOrder: 7,
  });

  for (const [index, product] of [...products].sort((a, b) => b.sortOrder - a.sortOrder).slice(0, 10).entries()) {
    const productId = productBySlug.get(product.slug)?.id;
    if (!productId) continue;

    await prisma.homepageSectionItem.create({
      data: {
        sectionId: newArrivalsSection.id,
        productId,
        sortOrder: index + 1,
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {
      companyName: "ĐẠI THIÊN PHÚ WOOD",
      companyDescription:
        "Tinh hoa của gia đình Việt. Sản phẩm gỗ cao cấp, vật liệu hoàn thiện và giải pháp gia công theo yêu cầu cho nhà ở và công trình thực tế.",
      companyDescriptionEn:
        "The essence of Vietnamese family craftsmanship. Premium wood products and custom wood services for homes and businesses.",
      address: "Showroom và xưởng sản xuất, TP. Hồ Chí Minh, Việt Nam",
      addressEn: "Showroom and Workshop, Ho Chi Minh City, Vietnam",
      phoneNumber: companyPhone,
      email: "maithihongsang79@gmail.com",
      zaloLink: zaloUrl,
      facebookLink: "https://facebook.com/daithienphuwood",
      tiktokLink: null,
      logoUrl: "/brand/logo-horizontal.svg",
      faviconUrl: "/favicon.svg",
      seoTitle: "ĐẠI THIÊN PHÚ WOOD | Tinh hoa của gia đình Việt",
      seoTitleEn: "ĐẠI THIÊN PHÚ WOOD | The essence of Vietnamese family craftsmanship",
      seoDescription:
        "Khám phá gỗ óc chó, gỗ sồi, gỗ dẻ gai, slab gỗ tự nhiên, thớt cao cấp và vật liệu nội thất từ ĐẠI THIÊN PHÚ WOOD.",
      seoDescriptionEn:
        "Discover premium walnut, oak, beech, wood slabs, kitchenware, and personalized wood products from Đại Thiên Phú Wood.",
      seoKeywords:
        "dai thien phu wood, premium wood products, walnut boards, oak panels, cutting boards, custom wood signs",
      footerContent:
        "Từ khâu tuyển chọn gỗ đến hoàn thiện theo yêu cầu, chúng tôi cung cấp giải pháp đáng tin cậy cho nhà ở, nội thất và đơn vị thi công.",
      footerContentEn:
        "From premium timber sourcing to custom finishing, we deliver reliable wood solutions for homes, interiors, and project contractors.",
      openingHours: "Thứ 2 - Thứ 7: 08:00 - 18:00",
      openingHoursEn: "Mon - Sat: 8:00 AM - 6:00 PM",
      contactPrimaryLabel: "Nhắn Zalo",
      contactPrimaryLabelEn: "Chat on Zalo",
      contactSecondaryLabel: "Gọi tư vấn",
      contactSecondaryLabelEn: "Call for consultation",
    },
    create: {
      id: "default",
      companyName: "ĐẠI THIÊN PHÚ WOOD",
      companyDescription:
        "Tinh hoa của gia đình Việt. Sản phẩm gỗ cao cấp, vật liệu hoàn thiện và giải pháp gia công theo yêu cầu cho nhà ở và công trình thực tế.",
      companyDescriptionEn:
        "The essence of Vietnamese family craftsmanship. Premium wood products and custom wood services for homes and businesses.",
      address: "Showroom và xưởng sản xuất, TP. Hồ Chí Minh, Việt Nam",
      addressEn: "Showroom and Workshop, Ho Chi Minh City, Vietnam",
      phoneNumber: companyPhone,
      email: "maithihongsang79@gmail.com",
      zaloLink: zaloUrl,
      facebookLink: "https://facebook.com/daithienphuwood",
      tiktokLink: null,
      logoUrl: "/brand/logo-horizontal.svg",
      faviconUrl: "/favicon.svg",
      seoTitle: "ĐẠI THIÊN PHÚ WOOD | Tinh hoa của gia đình Việt",
      seoTitleEn: "ĐẠI THIÊN PHÚ WOOD | The essence of Vietnamese family craftsmanship",
      seoDescription:
        "Khám phá gỗ óc chó, gỗ sồi, gỗ dẻ gai, slab gỗ tự nhiên, thớt cao cấp và vật liệu nội thất từ ĐẠI THIÊN PHÚ WOOD.",
      seoDescriptionEn:
        "Discover premium walnut, oak, beech, wood slabs, kitchenware, and personalized wood products from Đại Thiên Phú Wood.",
      seoKeywords:
        "dai thien phu wood, premium wood products, walnut boards, oak panels, cutting boards, custom wood signs",
      footerContent:
        "Từ khâu tuyển chọn gỗ đến hoàn thiện theo yêu cầu, chúng tôi cung cấp giải pháp đáng tin cậy cho nhà ở, nội thất và đơn vị thi công.",
      footerContentEn:
        "From premium timber sourcing to custom finishing, we deliver reliable wood solutions for homes, interiors, and project contractors.",
      openingHours: "Thứ 2 - Thứ 7: 08:00 - 18:00",
      openingHoursEn: "Mon - Sat: 8:00 AM - 6:00 PM",
      contactPrimaryLabel: "Nhắn Zalo",
      contactPrimaryLabelEn: "Chat on Zalo",
      contactSecondaryLabel: "Gọi tư vấn",
      contactSecondaryLabelEn: "Call for consultation",
    },
  });

  console.log("Seed completed successfully.");
  console.log(`Categories ensured: ${categories.length}`);
  console.log(`Products ensured: ${products.length}`);
  console.log(`Admin login email: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
