export type GalleryCategory =
  | "branding"
  | "logo"
  | "social"
  | "posters"
  | "menus"
  | "packaging"
  | "marketing";

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  description: string;
  image: string;
  imageAlt: string;
  /** `portrait | landscape | tall | wide | square` drives the masonry spans. */
  aspect: "portrait" | "landscape" | "tall" | "wide" | "square";
  tools: string[];
}

export const galleryCategories: {
  slug: GalleryCategory | "all";
  label: string;
}[] = [
  { slug: "all", label: "All Work" },
  { slug: "branding", label: "Branding" },
  { slug: "logo", label: "Logo Design" },
  { slug: "social", label: "Social Media" },
  { slug: "posters", label: "Posters" },
  { slug: "menus", label: "Menus" },
  { slug: "packaging", label: "Packaging" },
  { slug: "marketing", label: "Marketing" },
];

/**
 * Graphic design gallery.
 *
 * Images are generated vector placeholders (see `scripts/generate-artwork.mjs`).
 * Replace the files in `public/images/gallery/` with real work and update these
 * entries — the masonry grid and lightbox read from this array.
 */
export const galleryItems: GalleryItem[] = [
  {
    id: "brand-grid",
    title: "Identity System Overview",
    category: "branding",
    categoryLabel: "Branding",
    description:
      "The full identity laid out on one sheet — mark, colour, type and the rules that hold them together.",
    image: "/images/gallery/brand-system.svg",
    imageAlt: "Brand identity system overview layout",
    aspect: "landscape",
    tools: ["Illustrator", "Figma"],
  },
  {
    id: "logo-construction",
    title: "Logo Construction Grid",
    category: "logo",
    categoryLabel: "Logo Design",
    description:
      "The primary mark drawn on its construction grid, with clear-space and minimum-size rules defined.",
    image: "/images/gallery/logo-construction.svg",
    imageAlt: "Logo drawn on a geometric construction grid",
    aspect: "tall",
    tools: ["Illustrator"],
  },
  {
    id: "monogram-set",
    title: "Monogram & Favicon Set",
    category: "logo",
    categoryLabel: "Logo Design",
    description:
      "Monogram, favicon and app-icon variations, optically corrected at each size rather than scaled blindly.",
    image: "/images/gallery/logo-monogram.svg",
    imageAlt: "Monogram and favicon variations at multiple sizes",
    aspect: "square",
    tools: ["Illustrator", "Photoshop"],
  },
  {
    id: "social-grid",
    title: "Social Campaign Grid",
    category: "social",
    categoryLabel: "Social Media",
    description:
      "Nine posts built from one composition rule, shown as they appear in a feed.",
    image: "/images/gallery/social-grid.svg",
    imageAlt: "Social media feed showing nine consistent posts",
    aspect: "square",
    tools: ["Photoshop", "Figma"],
  },
  {
    id: "social-story",
    title: "Story Format Adaptation",
    category: "social",
    categoryLabel: "Social Media",
    description:
      "The same campaign extended to vertical story format without losing the signature layout.",
    image: "/images/gallery/social-story.svg",
    imageAlt: "Vertical story format adaptation of the campaign",
    aspect: "tall",
    tools: ["Photoshop"],
  },
  {
    id: "poster-series",
    title: "Event Poster Series",
    category: "posters",
    categoryLabel: "Posters",
    description:
      "A three-poster series on one grid — one type system, three compositions, printed at A2.",
    image: "/images/gallery/poster-series.svg",
    imageAlt: "Three poster designs from a single event series",
    aspect: "tall",
    tools: ["Illustrator", "Photoshop"],
  },
  {
    id: "menu-master",
    title: "Restaurant Menu Master",
    category: "menus",
    categoryLabel: "Menus",
    description:
      "A4 double-sided menu restructured around ordering behaviour rather than kitchen station.",
    image: "/images/gallery/menu-master.svg",
    imageAlt: "Restaurant menu layout with clear category hierarchy",
    aspect: "tall",
    tools: ["InDesign"],
  },
  {
    id: "menu-laminated",
    title: "Table Menu Variant",
    category: "menus",
    categoryLabel: "Menus",
    description:
      "Reduced one-page variant for table use, with oversized prices for quick scanning.",
    image: "/images/gallery/menu-table.svg",
    imageAlt: "Single-page laminated table menu variant",
    aspect: "tall",
    tools: ["InDesign"],
  },
  {
    id: "coffee-front",
    title: "Coffee Packaging — Front",
    category: "packaging",
    categoryLabel: "Packaging",
    description:
      "Front face carrying origin and process only, sized to be read from three metres away.",
    image: "/images/gallery/coffee-front.svg",
    imageAlt: "Coffee bag front panel with origin and process labelling",
    aspect: "tall",
    tools: ["Illustrator", "Photoshop"],
  },
  {
    id: "coffee-back",
    title: "Coffee Packaging — Back",
    category: "packaging",
    categoryLabel: "Packaging",
    description:
      "Back panel carrying the detail: tasting notes, altitude, varietal and roast date.",
    image: "/images/gallery/coffee-back.svg",
    imageAlt: "Coffee bag back panel with product detail and tasting notes",
    aspect: "tall",
    tools: ["Illustrator"],
  },
  {
    id: "brand-applications",
    title: "Applications Overview",
    category: "marketing",
    categoryLabel: "Marketing",
    description:
      "The identity system applied across social, print and packaging to prove the rules work.",
    image: "/images/gallery/brand-applications.svg",
    imageAlt: "Identity system applied across print and packaging",
    aspect: "landscape",
    tools: ["Illustrator", "Photoshop", "Figma"],
  },
  {
    id: "flyer-set",
    title: "Promotional Flyer Set",
    category: "marketing",
    categoryLabel: "Marketing",
    description:
      "Print collateral set with a shared grid and one accent colour reserved for the offer.",
    image: "/images/gallery/flyer-set.svg",
    imageAlt: "Set of promotional flyers on a shared layout grid",
    aspect: "square",
    tools: ["Illustrator", "Photoshop"],
  },
];

export function getGalleryItems(category: GalleryCategory | "all") {
  if (category === "all") return galleryItems;
  return galleryItems.filter((item) => item.category === category);
}

export function isGalleryCategory(value: string): value is GalleryCategory {
  return galleryCategories.some((category) => category.slug === value);
}