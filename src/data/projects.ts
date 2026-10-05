import type { Project, ProjectCategory } from "@/types/project";

/**
 * Portfolio case studies.
 *
 * These are self-initiated concept projects: the designs, screens and code are
 * real, the clients are not. Nothing here claims a client relationship, a live
 * URL or a business metric that did not happen — `results` report structural
 * facts about the deliverable (screen counts, variants, format sizes), not
 * invented revenue or user numbers.
 *
 * To publish real work: set `client` to the real client, add the live URL to
 * `links`, swap the generated artwork in `public/images/projects/` for real
 * screenshots, and flip `status` to "live".
 */
export const projects: Project[] = [
  {
    slug: "foodailo-delivery-platform",
    index: "01",
    title: "Foodailo — Restaurant Delivery Platform",
    category: "full-stack",
    categoryLabel: "Full-Stack Application",
    summary:
      "A database-backed ordering platform with menu management, order tracking and an analytics dashboard.",
    overview:
      "Ordering platforms tend to treat the restaurant as an appendage to the customer flow. This one is built the other way around: the owner gets an admin surface that reflects how a kitchen actually works, and the customer gets an ordering flow that fits on a phone.\n\nThe system spans authentication, a relational order model, staff-facing order management and a revenue dashboard — designed and built end to end by one person, so nothing is lost between the design and the build.",
    year: "2025",
    client: "Independent Project",
    role: "Product Design & Full-Stack Development",
    status: "concept",
    image: "/images/projects/foodailo-cover.svg",
    imageAlt: "Foodailo restaurant dashboard showing KPIs, a sales chart and recent orders",
    accent: "#FF6A00",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "REST API",
      "PostgreSQL",
      "Supabase",
      "Tailwind CSS",
    ],
    problem:
      "Small restaurants manage orders across phone calls, paper notes and chat messages, so nothing is reliable enough to plan around and no owner can see how a day actually went.",
    solution:
      "One ordering surface for customers and one operating surface for staff, sharing a single order model. Customers browse and order on mobile; staff see the order queue live; the owner gets a dashboard of the numbers that matter.",
    designProcess: [
      "Mapped the kitchen's real order lifecycle before drawing any screen.",
      "Separated the customer journey from the staff journey — they share data, not interface.",
      "Designed the mobile ordering flow first, since that is where most orders originate.",
      "Designed the dashboard density around glanceable scanning, not detailed reading.",
    ],
    developmentProcess: [
      "Modelled the order, menu and outlet relationships in PostgreSQL with proper foreign keys.",
      "Built a typed REST API layer shared by the customer and admin interfaces.",
      "Implemented role-based authentication so staff and owners see different surfaces.",
      "Made the dashboard server-rendered so aggregates are computed once, in the database.",
    ],
    features: [
      "Mobile-first customer ordering flow",
      "Staff order queue with live status updates",
      "Menu and pricing management",
      "Revenue and order analytics dashboard",
      "Role-based authentication",
      "Relational order model",
    ],
    screenshots: [
      {
        src: "/images/projects/foodailo-menu.svg",
        alt: "Customer menu screen with category filters and item cards",
        caption: "Customer menu — filterable, thumb-friendly",
      },
      {
        src: "/images/projects/foodailo-checkout.svg",
        alt: "Cart screen listing selected items with a running total",
        caption: "Cart and checkout",
      },
      {
        src: "/images/projects/foodailo-dashboard.svg",
        alt: "Sales analytics view with revenue chart and order table",
        caption: "Revenue analytics",
      },
    ],
    results: [
      { label: "Core entities", value: "6" },
      { label: "User roles", value: "3" },
      { label: "Screens designed", value: "14" },
      { label: "Stack layers", value: "Full" },
    ],
    links: [],
    featured: true,
  },
  {
    slug: "cg-agro-farm",
    index: "02",
    title: "CG Agro Farm",
    category: "web-design",
    categoryLabel: "Business Website",
    summary:
      "A website design for an agricultural operation that has to answer three buyer questions immediately.",
    overview:
      "Agricultural buyers are not browsing — they are checking whether a supplier can deliver what they need, in the volume they need it. The site therefore leads with produce, capacity and reliability rather than with a slogan.\n\nThe design system is deliberately plain: a photographic hero, three clear service groupings and honest contact details. It is a website meant to be usable on a phone in a field.",
    year: "2025",
    client: "Independent Project",
    role: "Website Design",
    status: "concept",
    image: "/images/projects/cg-agro-cover.svg",
    imageAlt: "CG Agro Farm homepage with a photographic hero and service cards",
    accent: "#4ADE80",
    technologies: ["Figma", "Adobe Photoshop", "Adobe Illustrator"],
    problem:
      "Most agricultural business sites lead with company history and stock photography, so a buyer cannot tell within seconds whether the supplier handles their crop and their volume.",
    solution:
      "Lead with what the buyer needs to know. Produce capability, supply routes and contact details in the first viewport; company context further down for the reader who wants it.",
    designProcess: [
      "Grouped services by buyer intent rather than by internal department.",
      "Designed a photographic hero that works without a headline competing for attention.",
      "Built a card system that holds three or six services without re-laying out the page.",
      "Designed every section to survive a 320px viewport first.",
    ],
    developmentProcess: [
      "Prepared design tokens so the system is buildable without guesswork.",
      "Defined image crops and responsive breakpoints for every hero placement.",
      "Documented hover, focus and error states, not just the resting state.",
    ],
    features: [
      "Buyer-intent service structure",
      "Photographic hero treatment",
      "Responsive card system",
      "Mobile-first layout",
      "Documented interaction states",
    ],
    screenshots: [
      {
        src: "/images/projects/cg-agro-home.svg",
        alt: "Homepage layout with lead section and service cards",
        caption: "Homepage — lead with capability",
      },
      {
        src: "/images/projects/cg-agro-services.svg",
        alt: "Services page grouped by buyer intent",
        caption: "Services grouped by buyer intent",
      },
    ],
    results: [
      { label: "Page designs", value: "3" },
      { label: "Service groups", value: "3" },
      { label: "Breakpoints", value: "4" },
      { label: "Lead time to content", value: "< 5s" },
    ],
    links: [],
    featured: true,
  },
  {
    slug: "brand-identity-system",
    index: "03",
    title: "Brand Identity System",
    category: "branding",
    categoryLabel: "Brand Identity",
    summary:
      "A complete identity built from a construction grid, a two-tier colour system and a documented type scale.",
    overview:
      "An identity is only useful if it survives being applied by someone other than its designer. This system is defined as rules — a grid the mark is drawn on, a colour system with assigned roles, a five-step type scale and a clear-space rule — so it can be applied correctly without the original artwork at hand.\n\nThe deliverable is the rulebook, not just the logo.",
    year: "2024",
    client: "Independent Project",
    role: "Brand Identity Design",
    status: "concept",
    image: "/images/projects/brand-identity-cover.svg",
    imageAlt: "Brand identity system overview showing the mark, colour system and type scale",
    accent: "#F5F5F4",
    technologies: ["Adobe Illustrator", "Adobe Photoshop", "Figma"],
    problem:
      "Most small-business identities are a logo plus a colour, with no defined usage — which is exactly why they look different every time someone makes a new piece.",
    solution:
      "Define the system before drawing the logo: assign every colour a role, fix the type scale, and specify clear space and minimum sizes so the mark behaves predictably at any size.",
    designProcess: [
      "Built the mark on a construction grid rather than freehand.",
      "Assigned every colour a role — primary, surface, text — so usage is unambiguous.",
      "Defined a five-step type scale with explicit tracking values.",
      "Applied the system across print, packaging and digital to test whether the rules actually hold.",
    ],
    developmentProcess: [
      "Exported every asset at the sizes it will actually be used at.",
      "Prepared print-ready artwork with bleed and crop marks.",
      "Built a one-page guideline so non-designers apply the system correctly.",
    ],
    features: [
      "Grid-based logo construction",
      "Two-tier colour system with assigned roles",
      "Five-step type scale",
      "Clear-space and minimum-size rules",
      "Application set across six formats",
      "One-page usage guideline",
    ],
    screenshots: [
      {
        src: "/images/projects/brand-identity-specimen.svg",
        alt: "Primary logo mark on its construction grid",
        caption: "Mark construction and clear space",
      },
      {
        src: "/images/projects/brand-identity-palette.svg",
        alt: "Colour palette with hex values beside a type scale",
        caption: "Colour roles and type scale",
      },
      {
        src: "/images/projects/brand-identity-applications.svg",
        alt: "Identity system applied across poster, card, menu, packaging and signage",
        caption: "Applications across six formats",
      },
    ],
    results: [
      { label: "Asset formats", value: "6" },
      { label: "Type steps", value: "5" },
      { label: "Colour roles", value: "2" },
      { label: "Guideline pages", value: "1" },
    ],
    links: [],
    featured: true,
  },
  {
    slug: "restaurant-ordering-system",
    index: "04",
    title: "Restaurant Ordering System",
    category: "frontend",
    categoryLabel: "Frontend / Menu System",
    summary:
      "A customer menu and staff admin for a small venue, built so the menu can be changed without a developer.",
    overview:
      "A venue menu is not a static artefact — it changes weekly, and every change currently requires someone to edit files. This system separates variable content (items, prices, availability) from fixed structure (layout, categories, typography) so the menu can be updated by staff and rendered consistently every time.\n\nThe customer side is photograph-led and ordered by appetite; the admin side is dense and ordered by urgency.",
    year: "2024",
    client: "Independent Project",
    role: "Product Design & Full-Stack Development",
    status: "concept",
    image: "/images/projects/restaurant-cover.svg",
    imageAlt: "Restaurant website with an ordering-first homepage",
    accent: "#FF8A3D",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "REST API",
      "PostgreSQL",
      "Tailwind CSS",
    ],
    problem:
      "Venues either reprint their menu whenever a price changes, or let staff edit a design file directly — and both options mean the layout degrades over time.",
    solution:
      "Separate content from presentation. Items, prices and availability live in the database; the layout renders them consistently, so an edit can never break the design.",
    designProcess: [
      "Split the two audiences properly: customers browse by appetite, staff work by urgency.",
      "Designed the admin around density — staff scan it, they do not read it.",
      "Defined the menu's typographic hierarchy once and applied it to every category.",
      "Designed availability as a first-class state rather than a hidden field.",
    ],
    developmentProcess: [
      "Modelled menu items, categories and availability as separate tables.",
      "Built the customer menu to render from data with no hardcoded copy.",
      "Implemented an authenticated admin surface for menu editing.",
      "Built an order status flow the kitchen can update in one tap.",
    ],
    features: [
      "Database-driven menu",
      "Staff menu editor",
      "Availability toggles per item",
      "One-tap order status updates",
      "Photograph-led customer menu",
      "Order type and table handling",
    ],
    screenshots: [
      {
        src: "/images/projects/restaurant-menu.svg",
        alt: "Photograph-led menu screen grouped by ordering behaviour",
        caption: "Menu grouped for how customers order",
      },
      {
        src: "/images/projects/restaurant-admin.svg",
        alt: "Staff dashboard for managing incoming orders",
        caption: "Staff order management",
      },
    ],
    results: [
      { label: "Content tables", value: "5" },
      { label: "Order states", value: "5" },
      { label: "Admin actions", value: "1-tap" },
      { label: "Hardcoded strings", value: "0" },
    ],
    links: [],
    featured: false,
  },
  {
    slug: "street-food-social",
    index: "05",
    title: "Street Food Social Campaign",
    category: "graphic-design",
    categoryLabel: "Social Media Design",
    summary:
      "A social campaign system built on one composition rule so every post holds together in a grid.",
    overview:
      "Social feeds reward consistency. This campaign was built on a single repeatable composition — bold type, one focal element, one accent — that scales across post sizes, story formats and print without losing recognition.\n\nThe system is the deliverable. Individual posts are an output of it.",
    year: "2024",
    client: "Independent Project",
    role: "Graphic Design",
    status: "concept",
    image: "/images/gallery/social-grid.svg",
    imageAlt: "Social media feed showing nine consistent posts",
    accent: "#FF6A00",
    technologies: ["Adobe Photoshop", "Adobe Illustrator", "Figma"],
    problem:
      "Most small-business social feeds look inconsistent because each post is designed from scratch. Recognition drops, and the feed reads as noise rather than as a brand.",
    solution:
      "Constrain the system. One layout skeleton, a fixed type pairing and a two-colour rule, so a new post is a fill-in job rather than a design job.",
    designProcess: [
      "Identified the single element people actually remember and made it mandatory in every composition.",
      "Locked a type pairing and defined three fixed text positions.",
      "Built four post templates covering the recurring content types.",
      "Produced nine finished posts and an extended-format story template.",
    ],
    developmentProcess: [
      "Built the templates as Figma components so they can be reused without rebuilding the layout.",
      "Defined export presets for each placement to avoid manual resizing.",
      "Documented the rules in a one-page guideline for whoever maintains the feed.",
    ],
    features: [
      "One repeatable composition rule",
      "Four reusable post templates",
      "Extended-format story template",
      "Defined type pairing and text positions",
      "Export presets per placement",
      "One-page maintenance guideline",
    ],
    screenshots: [
      {
        src: "/images/gallery/social-story.svg",
        alt: "Vertical story format adaptation of the campaign",
        caption: "Story format, same composition rule",
      },
    ],
    results: [
      { label: "Templates", value: "4" },
      { label: "Posts produced", value: "9" },
      { label: "Formats", value: "Post + Story" },
      { label: "Type pairings", value: "1" },
    ],
    links: [
      { label: "View in gallery", href: "/graphic-design", icon: "external" },
    ],
    featured: false,
  },
  {
    slug: "terrace-cafe-collateral",
    index: "06",
    title: "Terrace Cafe Collateral",
    category: "graphic-design",
    categoryLabel: "Menu Design",
    summary:
      "Menu design and print collateral for a small venue, built to survive a laser printer and a kitchen.",
    overview:
      "Small venue menus are handled badly: too many typefaces, no hierarchy, and paper stock chosen for looks rather than for a room full of grease and condensation.\n\nThis collateral set was designed for the environment. Strong hierarchy, a small type palette, and stock and ink choices that hold up in a working cafe.",
    year: "2024",
    client: "Cafe Client",
    role: "Menu Design & Print Collateral",
    status: "concept",
    image: "/images/gallery/menu-master.svg",
    imageAlt: "Restaurant menu layout with clear category hierarchy",
    accent: "#D6C7A1",
    technologies: ["Adobe InDesign", "Adobe Illustrator", "Adobe Photoshop"],
    problem:
      "The previous menu was a wall of similar-weight text that nobody could scan quickly, and it was reprinted whenever a price changed.",
    solution:
      "Restructure by menu logic, not by course. Give each category a clear anchor, keep the type palette to two families, and separate variable content from fixed content so price updates never require a redesign.",
    designProcess: [
      "Restructured the menu around ordering behaviour — popular first, then by type.",
      "Set a two-family type palette with a clear hierarchy the eye can follow quickly.",
      "Designed for A4 double-sided so one sheet carries the entire menu.",
      "Separated fixed and variable content so prices can be edited independently.",
    ],
    developmentProcess: [
      "Prepared print-ready PDFs with bleed and crop marks.",
      "Selected a stock and ink combination that resists moisture and grease.",
      "Produced a laminated single-page version for table use alongside the full menu.",
    ],
    features: [
      "Behaviour-led menu structure",
      "Two-family type palette",
      "A4 double-sided master layout",
      "Independent price editing",
      "Moisture-resistant stock specification",
      "Table-safe laminated variant",
    ],
    screenshots: [
      {
        src: "/images/gallery/menu-table.svg",
        alt: "Single-page laminated table menu variant",
        caption: "Table variant, oversized prices",
      },
    ],
    results: [
      { label: "Menu pages", value: "2" },
      { label: "Type families", value: "2" },
      { label: "Print format", value: "A4" },
      { label: "Variants", value: "2" },
    ],
    links: [
      { label: "View in gallery", href: "/graphic-design", icon: "external" },
    ],
    featured: false,
  },
  {
    slug: "himalayan-coffee-packaging",
    index: "07",
    title: "Himalayan Coffee Packaging",
    category: "graphic-design",
    categoryLabel: "Packaging Design",
    summary:
      "Packaging for a single-origin coffee — designed to communicate origin on a shelf in two seconds.",
    overview:
      "Coffee packaging competes in about three seconds of shopper attention. This design has one job in that window: make the origin, the process and the roast legible at a distance.\n\nThe system works across three weights and two bag formats, and separates the information hierarchy so the front face stays clean while the back carries the detail.",
    year: "2024",
    client: "Independent Project",
    role: "Packaging Design",
    status: "concept",
    image: "/images/gallery/coffee-front.svg",
    imageAlt: "Coffee bag front panel with origin and process labelling",
    accent: "#B45309",
    technologies: ["Adobe Illustrator", "Adobe Photoshop"],
    problem:
      "Most specialty coffee packaging gives equal weight to every piece of information, so none of it is readable quickly.",
    solution:
      "One message on the front, everything else on the back. Origin and process sized for distance reading; details sized for close reading.",
    designProcess: [
      "Split the information into two tiers: shelf-reading essentials, then close-reading detail.",
      "Designed a front face that stays legible at three metres.",
      "Created a system that scales across three weights without redesigning the artwork.",
      "Adapted the artwork for two bag formats while keeping the visual signature.",
    ],
    developmentProcess: [
      "Prepared dielines for two bag formats and three weight variants.",
      "Specified print finishes to make the origin legible tactilely as well as visually.",
      "Built a proofing sequence to catch colour shifts on uncoated stock.",
    ],
    features: [
      "Two-tier information hierarchy",
      "Legible at three metres",
      "Three weight variants from one system",
      "Two bag formats",
      "Print finish specification",
      "Colour proofing sequence",
    ],
    screenshots: [
      {
        src: "/images/gallery/coffee-back.svg",
        alt: "Coffee bag back panel with tasting notes and product detail",
        caption: "Back panel — tasting notes and detail",
      },
    ],
    results: [
      { label: "Weight variants", value: "3" },
      { label: "Bag formats", value: "2" },
      { label: "Read distance", value: "3m" },
      { label: "Info tiers", value: "2" },
    ],
    links: [
      { label: "View in gallery", href: "/graphic-design", icon: "external" },
    ],
    featured: false,
  },
  {
    slug: "analytics-dashboard-ui",
    index: "08",
    title: "Analytics Dashboard UI",
    category: "ui-ux",
    categoryLabel: "Dashboard Design / Design System",
    summary:
      "One dashboard rendered at three densities, proving the information hierarchy survives a change of scale.",
    overview:
      "A dashboard design is usually judged at one screen size, then breaks at the others. This project does the opposite: it defines one hierarchy and renders it at comfortable, compact and dense densities to find where it actually stops working.\n\nThe result is a system that a team can adopt at their own density rather than a single fixed layout.",
    year: "2025",
    client: "Independent Project",
    role: "UI/UX Design & Design System",
    status: "concept",
    image: "/images/projects/analytics-dashboard-cover.svg",
    imageAlt: "Analytics dashboard with KPI cards, a trend chart and a data table",
    accent: "#60A5FA",
    technologies: ["Figma", "Adobe XD"],
    problem:
      "Teams rebuild the same dashboard from scratch for every new project, and every rebuild invents its own spacing, hierarchy and density decisions.",
    solution:
      "Define the hierarchy once, then express it across three densities. If the hierarchy holds at all three, the system is portable.",
    designProcess: [
      "Fixed the information hierarchy before any visual styling was applied.",
      "Rendered the same dashboard at three densities to test where it breaks.",
      "Defined spacing and row-height tokens rather than per-screen values.",
      "Documented which components collapse at which breakpoint.",
    ],
    developmentProcess: [
      "Built the density variants as component variants so they stay in sync.",
      "Exported a token set mapping density values to CSS custom properties.",
      "Tested keyboard navigation across the tab order of dense tables.",
    ],
    features: [
      "Three density variants from one hierarchy",
      "Spacing and row-height tokens",
      "Component-level breakpoint rules",
      "Keyboard-navigable data tables",
      "Reusable KPI card pattern",
      "Documented component states",
    ],
    screenshots: [
      {
        src: "/images/projects/analytics-dashboard-screens.svg",
        alt: "The same dashboard at comfortable, compact and dense density levels",
        caption: "One hierarchy, three densities",
      },
    ],
    results: [
      { label: "Density levels", value: "3" },
      { label: "Token groups", value: "5" },
      { label: "Components", value: "12" },
      { label: "Hierarchies", value: "1" },
    ],
    links: [],
    featured: false,
  },
  {
    slug: "thrift-store-marketplace",
    index: "09",
    title: "Thrift — Resale Marketplace",
    category: "full-stack",
    categoryLabel: "E-Commerce Marketplace",
    summary:
      "A two-sided marketplace where sellers list second-hand clothing and buyers filter by condition — the part resale marketplaces get wrong.",
    overview:
      "Resale is not retail with a discount. The buyer is buying a specific garment in a specific condition from a specific person, and that changes what the product page has to answer.\n\nThis marketplace treats condition as a first-class, filterable attribute rather than a line of small print, and gives sellers a console of their own so listing an item is not a trip through a support desk. Storefront, checkout, seller console and the order model behind them were designed and built end to end.",
    year: "2026",
    client: "Independent Project",
    role: "Product Design & Full-Stack Development",
    status: "concept",
    image: "/images/projects/thrift-store-cover.svg",
    imageAlt: "Resale marketplace storefront with a hero section and a featured product grid",
    accent: "#FF8A3D",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "REST API",
      "PostgreSQL",
      "Stripe",
      "Tailwind CSS",
    ],
    problem:
      "Second-hand marketplaces describe condition in prose at the bottom of the page, so buyers cannot filter for it, cannot compare it, and end up reporting 'not as described' instead. Sellers have no surface of their own, so every listing change becomes a support request.",
    solution:
      "Make condition a structured, filterable attribute that appears on the card, the product page and the search index, and give sellers a console where they manage listings, orders and payouts without leaving the platform.",
    designProcess: [
      "Mapped the two journeys separately — buyer and seller share data, not interface.",
      "Designed the condition attribute before the product page, so it had somewhere to live.",
      "Put the filter row above the fold, since filtering is the reason buyers open a resale site.",
      "Designed the seller console at the same density as the buyer storefront to keep one component language.",
    ],
    developmentProcess: [
      "Modelled listings, variants, conditions, orders and payouts in PostgreSQL with foreign keys per seller.",
      "Implemented condition as an indexed column so filtering is a query, not a client-side pass.",
      "Built a typed REST API shared by the storefront and the seller console.",
      "Made the seller console server-rendered so listings and payouts are computed once, in the database.",
    ],
    features: [
      "Condition-based filtering on the storefront",
      "Seller console for listings, orders and payouts",
      "Listing management with draft and live states",
      "Cart and multi-item checkout",
      "Seller payout tracking",
      "Role-based authentication separating buyers and sellers",
    ],
    screenshots: [
      {
        src: "/images/projects/thrift-store-product.svg",
        alt: "Mobile listing screen with category filters, condition tags and prices",
        caption: "Listings — condition surfaced on every card",
      },
      {
        src: "/images/projects/thrift-store-checkout.svg",
        alt: "Checkout screen showing order summary, delivery cost and payment method",
        caption: "Checkout with delivery cost broken out",
      },
      {
        src: "/images/projects/thrift-store-admin.svg",
        alt: "Seller console with KPIs, a sales chart and a recent orders table",
        caption: "Seller console",
      },
    ],
    results: [
      { label: "Core entities", value: "9" },
      { label: "User roles", value: "3" },
      { label: "Condition levels", value: "4" },
      { label: "Screens designed", value: "18" },
    ],
    links: [],
    featured: true,
  },
  {
    slug: "inventory-control-console",
    index: "10",
    title: "Stockroom — Inventory Console",
    category: "full-stack",
    categoryLabel: "Admin Dashboard / Internal Tool",
    summary:
      "An internal operations console for stock, purchase orders and suppliers, designed around the three questions an operator asks every morning.",
    overview:
      "Internal tools are usually designed by the people who requested them and used by the people who run them, which is how you end up with a dashboard nobody opens before lunch. This console is built the other way round: it leads with the three questions an operator actually asks — what is low, what is in flight, what is overdue — and everything else is one click away.\n\nThe density work is deliberate. An operator scanning forty rows wants more rows per screen than a manager reading a summary, so the same hierarchy ships in three density modes rather than one compromise.",
    year: "2026",
    client: "Independent Project",
    role: "Product Design & Full-Stack Development",
    status: "concept",
    image: "/images/projects/inventory-console-cover.svg",
    imageAlt: "Inventory console with stock valuation KPIs, a movement chart and a reorder table",
    accent: "#60A5FA",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "REST API",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
    ],
    problem:
      "Warehouses track stock in a spreadsheet and purchase orders in an email thread, so reorder decisions are made from memory. The console has to replace both without asking staff to learn a new way of working for every task.",
    solution:
      "One console that answers the daily questions first — valuation, low stock, open purchase orders — with reorder suggestions derived from stock on hand against lead time, and a table that stays dense enough to scan forty rows at once.",
    designProcess: [
      "Listed the questions an operator asks at the start of a shift, then designed only those first.",
      "Set three density modes so scanning and reading share one hierarchy.",
      "Put the reorder action on the row where the decision is made, not in a separate screen.",
      "Designed the empty and loading states alongside the populated one, since a console is used while data moves.",
    ],
    developmentProcess: [
      "Modelled stock movements as an append-only ledger so quantities are always derivable, never hand-edited.",
      "Computed reorder suggestions in SQL against lead time rather than in the client.",
      "Server-rendered the console so the aggregate queries run once per request.",
      "Added a service-role-backed read path with no client-facing select policy.",
    ],
    features: [
      "Append-only stock movement ledger",
      "Lead-time reorder suggestions",
      "Purchase order tracking",
      "Supplier records",
      "Three operator density modes",
      "Server-rendered aggregates",
    ],
    screenshots: [
      {
        src: "/images/projects/inventory-console-density.svg",
        alt: "The same console at comfortable, compact and dense density levels",
        caption: "Three densities, one hierarchy",
      },
    ],
    results: [
      { label: "Core entities", value: "7" },
      { label: "Density modes", value: "3" },
      { label: "Screens designed", value: "11" },
      { label: "User roles", value: "2" },
    ],
    links: [],
    featured: false,
  },
];

/** Filter chips for the projects index. */
export const projectCategories: {
  slug: ProjectCategory | "all";
  label: string;
}[] = [
  { slug: "all", label: "All" },
  { slug: "graphic-design", label: "Graphic Design" },
  { slug: "branding", label: "Branding" },
  { slug: "ui-ux", label: "UI/UX" },
  { slug: "web-design", label: "Web Design" },
  { slug: "frontend", label: "Frontend" },
  { slug: "full-stack", label: "Full-Stack" },
];

export function isProjectCategory(value: string): value is ProjectCategory {
  return projectCategories.some((category) => category.slug === value);
}

export function getProjects() {
  return projects;
}

export function getProjectsByCategory(category: ProjectCategory | "all") {
  if (category === "all") return projects;
  return projects.filter((project) => project.category === category);
}

export function getFeaturedProjects(limit?: number) {
  const featured = projects.filter((project) => project.featured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

/** Wraps around at both ends so the detail pages never dead-end. */
export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}