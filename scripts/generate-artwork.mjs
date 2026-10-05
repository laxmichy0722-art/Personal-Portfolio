/**
 * Generates the vector artwork used across the portfolio.
 *
 * These are real, deliberately-designed SVG compositions rather than grey
 * "missing image" boxes, so the layout can be reviewed at full fidelity.
 * Replace the files in `public/images/` with real project imagery — no code
 * changes are required to do so.
 *
 * Usage: node scripts/generate-artwork.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join as joinPath } from "node:path";
import { fileURLToPath } from "node:url";

const root = joinPath(dirname(fileURLToPath(import.meta.url)), "..");

/* -------------------------------------------------------------------------- */
/* Palette + type                                                             */
/* -------------------------------------------------------------------------- */

/* Artwork surface palette.
 *
 * Mirrors the `@theme` tokens in `src/app/globals.css` so the SVG compositions
 * sit at the same tonal values as the site chrome. `PANEL`/`SURFACE` sit just
 * above `INK` so the internal frames read as depth rather than as contrast.
 */
const INK = "#0D0D0D";
const PANEL = "#111111";
const SURFACE = "#1A1A1A";
const LINE = "#3A3A3A";
const LINE_SOFT = "#262626";
const TEXT = "#FFFFFF";
const MUTED = "#A1A1AA";
const SUBTLE = "#888888";
const GREEN_TXT = "#34D399";
const RED_TXT = "#F87171";

const SANS = "Inter, ui-sans-serif, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace";
const SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";

/* -------------------------------------------------------------------------- */
/* Tiny helpers                                                               */
/* -------------------------------------------------------------------------- */

const esc = (v) =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Deterministic PRNG so re-running the script yields byte-identical output. */
function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Join an array of SVG fragments, dropping nulls. */
const join = (parts) => parts.filter(Boolean).join("\n");
const range = (n) => Array.from({ length: n }, (_, i) => i);

function box(x, y, w, h, fill, rx = 0, stroke = null, sw = 1, opacity = 1) {
  const strokeAttrs = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${strokeAttrs} opacity="${opacity}"/>`;
}

function dot(cx, cy, r, fill, opacity = 1, stroke = null, sw = 1) {
  const strokeAttrs = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : "";
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"${strokeAttrs}/>`;
}

function rule(x1, y1, x2, y2, stroke = LINE, sw = 1, cap = null, opacity = 1) {
  const capAttrs = cap ? ` stroke-linecap="${cap}"` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${capAttrs} opacity="${opacity}"/>`;
}

function text(x, y, content, opts = {}) {
  const {
    size = 11,
    fill = SUBTLE,
    family = MONO,
    weight = 500,
    letter = 2,
    anchor = "start",
    style = null,
    opacity = 1,
  } = opts;
  const styleAttrs = style ? ` font-style="${style}"` : "";
  return (
    `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}"` +
    ` font-weight="${weight}" fill="${fill}" letter-spacing="${letter}"` +
    ` text-anchor="${anchor}"${styleAttrs} opacity="${opacity}">${esc(content)}</text>`
  );
}

/** Small uppercase mono label — the default typographic unit. */
const tag = (x, y, content, opts = {}) => text(x, y, content, { letter: 1.6, ...opts });

/** Large display text. */
const heading = (x, y, content, opts = {}) =>
  text(x, y, content, { size: 40, weight: 600, fill: TEXT, family: SANS, letter: -1.4, ...opts });

function gridLines(w, h, step = 72, opacity = 0.4, stroke = LINE_SOFT) {
  return join([
    `<g opacity="${opacity}" stroke="${stroke}" stroke-width="1">`,
    range(Math.ceil(w / step) + 1).map((i) => rule(i * step, 0, i * step, h)),
    range(Math.ceil(h / step) + 1).map((i) => rule(0, i * step, w, i * step)),
    `</g>`,
  ]);
}

/** Placeholder lines that read as body copy. */
const copyLines = (x, y, widths, gap = 12, stroke = LINE, sw = 5) =>
  widths.map((wd, i) => rule(x, y + i * gap, x + wd, y + i * gap, stroke, sw, "round"));

/* -------------------------------------------------------------------------- */
/* Data-visualisation primitives                                              */
/* -------------------------------------------------------------------------- */

function bars(x, y, w, h, values, accent, highlightLast = true) {
  const max = Math.max(...values);
  const gap = w / values.length;
  const barW = Math.max(6, gap * 0.5);
  return range(values.length).map((i) => {
    const bh = (h * values[i]) / max;
    return box(x + i * gap + (gap - barW) / 2, y + h - bh, barW, bh, highlightLast && i === values.length - 1 ? accent : LINE, 3);
  });
}

function spark(x, y, w, h, values, accent, sw = 2) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => [x + (i / (values.length - 1)) * w, y + h - ((v - min) / span) * h]);
  const path = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const area = `${path} L${x + w} ${y + h} L${x} ${y + h} Z`;
  return join([
    `<path d="${area}" fill="${accent}" opacity="0.1"/>`,
    `<path d="${path}" fill="none" stroke="${accent}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
  ]);
}

function ring(cx, cy, r, thickness, segments) {
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return segments.map((seg) => {
    const len = circumference * seg.value;
    const el =
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}"` +
      ` stroke-width="${thickness}" stroke-dasharray="${len - 4} ${circumference - len + 4}"` +
      ` stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += len;
    return el;
  });
}

function chrome(x, y, w, url, accent) {
  const barH = 34;
  return join([
    box(x, y, w, barH, SURFACE, 12, LINE),
    dot(x + 22, y + barH / 2, 5, LINE),
    dot(x + 40, y + barH / 2, 5, LINE),
    dot(x + 58, y + barH / 2, 5, LINE),
    box(x + 84, y + 9, Math.max(120, Math.min(360, w - 300)), barH - 18, INK, 7, LINE),
    tag(x + 98, y + barH / 2 + 3.5, url, { size: 9, fill: SUBTLE, letter: 1 }),
    box(x + w - 150, y + 10, 60, barH - 20, accent, 6, null, 1, 0.14),
    tag(x + w - 120, y + barH / 2 + 3.5, "LIVE", { size: 9, fill: accent, letter: 1.4, anchor: "middle" }),
  ]);
}

/* -------------------------------------------------------------------------- */
/* Templates                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Admin-surface mock.
 *
 * Parameterised rather than duplicated per project: the layout (sidebar, KPI
 * row, chart, donut, table) is the same skeleton for a restaurant back office, a
 * store admin and an inventory console, so only the labels, numbers and status
 * vocabulary differ. Every parameter has a default that reproduces the original
 * Foodailo output exactly.
 */
function dashboard({
  accent,
  heading: headingText,
  eyebrow,
  seed = "d",
  rows = 5,
  statusLabels,
  brand = "FOODAILO",
  owner = { label: "OWNER", detail: "Imadol, Lalitpur" },
  navItems = ["Overview", "Orders", "Inventory", "Expenses", "Menu"],
  action = "NEW ORDER",
  kpis = [
    { label: "TOTAL REVENUE", value: "Rs. 482,900", delta: "+12.4%", good: true },
    { label: "ORDERS", value: "1,284", delta: "+8.1%", good: true },
    { label: "NET PROFIT", value: "Rs. 96,140", delta: "-2.3%", good: false },
  ],
  chartLabel = "SALES - LAST 9 DAYS",
  chartScope = "ALL OUTLETS",
  donutLabel = "BY CATEGORY",
  donutCenter = "100%",
  donutCategories = ["Starters", "Mains", "Sides", "Drinks"],
  tableHeads = ["ORDER", "CUSTOMER", "ITEMS", "TOTAL", "STATUS"],
  tableOffsets = [0, 0.34, 0.54, 0.7, 0.86],
  people = ["A. Shrestha", "S. Maharjan", "R. Tamang", "N. Gurung", "B. Adhikari"],
  idPrefix = "FD",
  idStart = 4200,
  idStep = 7,
  valuePrefix = "Rs. ",
  valueRange = [340, 2540],
  unitWord = "item",
  goodStatuses = ["PAID", "DELIVERED"],
}) {
  const W = 1440;
  const H = 900;
  const pad = 40;
  const side = 232;
  const headH = 76;
  const kpiW = (W - side - pad * 3) / 3;
  const random = rng(seed);
  const series = range(9).map(() => 0.25 + random() * 0.75);

  const sidebar = join([
    box(0, 0, side, H, PANEL),
    rule(side, 0, side, H),
    box(pad * 0.6, 30, 30, 30, accent, 8, null, 1, 0.9),
    tag(pad * 0.6 + 40, 49, brand, { size: 12, fill: TEXT }),
    range(5).map((i) => {
      const y = 110 + i * 46;
      const active = i === 0;
      return join([
        active ? box(16, y - 14, side - 32, 34, accent, 8, null, 1, 0.1) : null,
        active ? box(16, y - 14, 2.5, 34, accent, 2) : null,
        box(34, y - 5, 14, 14, active ? accent : LINE, 3),
        tag(60, y + 7, navItems[i], { size: 11, fill: active ? TEXT : MUTED, letter: 0.4 }),
      ]);
    }),
    box(16, H - 108, side - 32, 76, SURFACE, 10, LINE),
    tag(34, H - 84, owner.label),
    text(34, H - 66, owner.detail, { size: 10, fill: MUTED, letter: 0.4 }),
  ]);

  const header = join([
    box(side + pad, 0, W - side - pad, headH, INK),
    rule(side + pad, headH, W - pad, headH),
    tag(side + pad, 30, eyebrow),
    heading(side + pad, 58, headingText, { size: 22, letter: -0.6 }),
    box(W - pad - 132, 24, 132, 34, accent, 8),
    tag(W - pad - 66, 45, action, { size: 10, fill: INK, letter: 1.4, anchor: "middle" }),
  ]);

  const kpiRow = join(
    kpis.map((kpi, i) => {
      const x = side + pad + i * (kpiW + 18);
      const y = headH + 26;
      return join([
        box(x, y, kpiW, 118, SURFACE, 12, LINE),
        tag(x + 22, y + 30, kpi.label, { size: 9 }),
        heading(x + 22, y + 70, kpi.value, { size: 28, letter: -1 }),
        tag(x + 22, y + 96, kpi.delta, { size: 10, fill: kpi.good ? GREEN_TXT : RED_TXT, letter: 0.6 }),
        tag(x + kpiW - 22, y + 96, "vs last week", { size: 9, letter: 0.4, anchor: "end" }),
      ]);
    }),
  );

  const chartW = W - side - pad * 2 - 300;
  const chartX = side + pad;
  const chartY = headH + 166;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chart = join([
    box(chartX, chartY, chartW, 300, SURFACE, 12, LINE),
    tag(chartX + 22, chartY + 32, chartLabel),
    tag(chartX + chartW - 22, chartY + 32, chartScope, { anchor: "end" }),
    spark(chartX + 24, chartY + 60, chartW - 48, 120, series, accent),
    join(bars(chartX + 24, chartY + 210, chartW - 48, 62, series, accent)),
    days.map((d, i) => tag(chartX + 28 + i * ((chartW - 48) / 6), chartY + 290, d, { size: 9, letter: 0.4 })),
  ]);

  const ringSegments = [
    { value: 0.42, color: accent },
    { value: 0.26, color: LINE },
    { value: 0.19, color: LINE },
    { value: 0.13, color: LINE_SOFT },
  ];
  const cats = donutCategories;
  const catColors = [accent, LINE, LINE, LINE_SOFT];
  const ringX = W - pad - 282;
  const donut = join([
    box(ringX, chartY, 282, 300, SURFACE, 12, LINE),
    tag(ringX + 22, chartY + 32, donutLabel),
    join(ring(ringX + 92, chartY + 150, 54, 18, ringSegments)),
    text(ringX + 92, chartY + 156, donutCenter, { size: 14, fill: TEXT, letter: 0.5, anchor: "middle", family: SANS }),
    cats.map((c, i) =>
      join([
        box(ringX + 168, chartY + 96 + i * 28, 8, 8, catColors[i], 2),
        text(ringX + 184, chartY + 103 + i * 28, c, { size: 10, fill: MUTED, letter: 0.3 }),
      ]),
    ),
  ]);

  const tableX = side + pad;
  const tableY = headH + 486;
  const tableW = W - side - pad * 2;
  const heads = tableHeads;
  const offsets = tableOffsets;
  const labels = statusLabels ?? ["PAID", "PAID", "PREPARING", "PAID", "DELIVERED"];
  const rowRandom = rng(`${seed}-rows`);
  const table = join([
    box(tableX, tableY, tableW, 46 + rows * 46, SURFACE, 12, LINE),
    heads.map((hd, i) => tag(tableX + 22 + tableW * offsets[i], tableY + 30, hd, { size: 9 })),
    range(rows).map((i) => {
      const ry = tableY + 46 + i * 46;
      const items = 1 + Math.floor(rowRandom() * 5);
      const total = (
        valueRange[0] + Math.floor(rowRandom() * (valueRange[1] - valueRange[0]))
      ).toLocaleString("en-IN");
      const status = labels[i % labels.length];
      const statusColor = goodStatuses.includes(status) ? GREEN_TXT : accent;
      return join([
        i ? rule(tableX + 22, ry, tableX + tableW - 22, ry) : null,
        text(tableX + 22, ry + 30, `#${idPrefix}-${idStart + i * idStep}`, { size: 11, fill: TEXT, letter: 0.3 }),
        text(tableX + 22 + tableW * 0.34, ry + 30, people[i % people.length], { size: 11, fill: MUTED, letter: 0.3 }),
        text(tableX + 22 + tableW * 0.54, ry + 30, `${items} ${unitWord}${items > 1 ? "s" : ""}`, { size: 11, fill: MUTED, letter: 0.3 }),
        text(tableX + 22 + tableW * 0.7, ry + 30, `${valuePrefix}${total}`, { size: 11, fill: TEXT, letter: 0.3 }),
        box(tableX + 22 + tableW * 0.86, ry + 16, 66, 20, statusColor, 5, null, 1, 0.14),
        tag(tableX + 22 + tableW * 0.86 + 33, ry + 30, status, { size: 8.5, fill: statusColor, letter: 1, anchor: "middle" }),
      ]);
    }),
  ]);

  return join([gridLines(W, H, 72, 0.35), sidebar, header, kpiRow, chart, donut, table]);
}

function phoneMenu({
  accent,
  heading: headingText,
  items,
  eyebrow = "CUSTOMER MENU",
  seed = "m",
  categories = ["All", "Starters", "Mains", "Drinks"],
  activeIndex = 1,
  bannerTitle,
  bannerMeta,
  cartCount = "3 items",
  cartTotal = "Rs. 1,240",
  pricePrefix = "Rs. ",
}) {
  const W = 1440;
  const H = 900;
  const pw = 372;
  const ph = 780;
  const px = (W - pw) / 2;
  const py = (H - ph) / 2;
  const random = rng(seed);

  const cats = categories;
  // Pill widths follow the label lengths, and offsets are the cumulative widths
  // plus a fixed 12px gap. The previous hand-tuned offset array was tuned for a
  // longer gap at the front than the pill widths justified, which made the
  // second, third and fourth pills overlap their neighbours by up to 32px.
  // Deriving the offsets means the row cannot overlap; keep the total
  // (sum of widths + 12px gaps) within the phone's 328px content box.
  const catW = cats.map((c) => 24 + c.length * 8);
  const catOffsets = catW.map((_, i) =>
    catW.slice(0, i).reduce((sum, w) => sum + w + 12, 0),
  );
  // Fail the build rather than emit artwork with a pill hanging off the phone.
  const rowWidth = catW.reduce((sum, w) => sum + w, 0) + 12 * (cats.length - 1);
  if (rowWidth > pw - 44) {
    throw new Error(
      `phoneMenu: category row is ${rowWidth}px but only ${pw - 44}px fits inside the ${pw}px frame. ` +
        `Shorten the labels in "categories" (currently ${JSON.stringify(cats)}).`,
    );
  }

  return join([
    gridLines(W, H, 72, 0.3),
    tag(px, py - 42, eyebrow),
    heading(px, py - 8, headingText, { size: 26, letter: -0.8 }),
    tag(W - px, py - 8, "375 x 812", { anchor: "end" }),

    box(px - 10, py - 10, pw + 20, ph + 20, SURFACE, 44, LINE),
    box(px, py, pw, ph, INK, 36),
    box(px + pw / 2 - 44, py + 12, 88, 20, SURFACE, 10),
    tag(px + pw / 2, py + 26, "21:42", { size: 9, fill: MUTED, letter: 0.4, anchor: "middle" }),
    range(4).map((i) => box(px + pw - 94 + i * 7, py + 25 - i * 3, 4, 6 + i * 3, MUTED, 1, null, 1, 0.7)),
    box(px + pw - 64, py + 20, 22, 11, "none", 3, MUTED, 1, 0.7),
    box(px + pw - 62, py + 22, 10 + Math.round(random() * 8), 7, MUTED, 2, null, 1, 0.9),

    box(px + 22, py + 46, pw - 44, 122, accent, 14, null, 1, 0.16),
    tag(px + 42, py + 78, bannerTitle ?? "TODAY", { size: 9, fill: accent, letter: 1.8 }),
    heading(px + 42, py + 112, bannerMeta ?? "Kitchen open", { size: 24, letter: -0.8 }),
    text(px + 42, py + 140, "Order until 22:30", { size: 11, fill: MUTED, letter: 0.3 }),

    tag(px + 22, py + 200, "CATEGORIES"),
    cats.map((c, i) => {
      const bw = catW[i];
      const bx = px + 22 + catOffsets[i];
      const active = i === activeIndex;
      return join([
        box(bx, py + 214, bw, 30, active ? accent : SURFACE, 15, active ? null : LINE, 1, active ? 0.16 : 1),
        tag(bx + bw / 2, py + 234, c, { size: 10, fill: active ? accent : MUTED, letter: 0.4, anchor: "middle" }),
      ]);
    }),

    items.map((item, i) => {
      const y = py + 262 + i * 96;
      return join([
        box(px + 22, y, pw - 44, 76, SURFACE, 12, LINE),
        box(px + 22, y, 74, 76, LINE, 12, null, 1, 0.55),
        dot(px + 59, y + 38, 15, accent, 0.3),
        heading(px + 112, y + 30, item.name, { size: 14, letter: -0.3 }),
        text(px + 112, y + 50, item.tag, { size: 9.5, fill: SUBTLE, letter: 0.3 }),
        text(px + 112, y + 68, `${pricePrefix}${item.price}`, { size: 12, fill: accent, letter: 0.3 }),
        box(px + pw - 68, y + 28, 32, 24, accent, 7, null, 1, 0.14),
        text(px + pw - 52, y + 45, "+", { size: 13, fill: accent, letter: 0, anchor: "middle", family: SANS, weight: 600 }),
      ]);
    }),

    box(px + 22, py + ph - 76, pw - 44, 54, SURFACE, 12, LINE),
    text(px + 42, py + ph - 44, cartCount, { size: 11, fill: MUTED, letter: 0.3 }),
    text(px + pw - 44, py + ph - 44, cartTotal, { size: 13, fill: TEXT, letter: 0.2, anchor: "end" }),
  ]);
}

function website({ accent, nav, heading: headingText, subheading, eyebrow, seed = "w", cards = 3, photoFirst = false }) {
  const W = 1440;
  const H = 900;
  const pad = 72;
  const x = pad + 1;
  const y = 87;
  const cw = W - pad * 2 - 2;
  const ch = H - y - 52;
  const navBar = 62;
  const heroH = photoFirst ? 380 : 300;
  const cardW = (cw - pad * 2 - 24 * (cards - 1)) / cards;
  const random = rng(seed);

  const hero = join([
    box(x, y + navBar, cw, heroH, "#0D0D0D"),
    gridLines(cw, heroH, 56, 0.25),
    range(14).map(() => dot(random() * cw, 30 + random() * (heroH - 60), 1 + random() * 2, LINE, 0.35 + random() * 0.5)),
    tag(x + pad, y + navBar + 76, eyebrow, { size: 10, letter: 2.2 }),
    heading(x + pad, y + navBar + 140, headingText.split("|")[0], { size: 42, letter: -1.8 }),
    headingText.includes("|")
      ? heading(x + pad, y + navBar + 190, headingText.split("|")[1], { size: 42, letter: -1.8, fill: accent })
      : null,
    copyLines(x + pad, y + navBar + 214, [340, 320, 300, 220], 12),
    box(x + pad, y + navBar + heroH - 84, 132, 38, accent, 8),
    tag(x + pad + 66, y + navBar + heroH - 60, "GET STARTED", { size: 9.5, fill: INK, letter: 1.3, anchor: "middle" }),
    photoFirst
      ? join([
          box(x + cw * 0.5, y + navBar + 28, cw * 0.44, heroH - 56, LINE, 12, null, 1, 0.5),
          dot(x + cw * 0.72, y + navBar + heroH / 2, 78, accent, 0.22),
        ])
      : join([
          box(x + cw - pad - 400, y + navBar + 28, 400, heroH - 56, LINE, 12, null, 1, 0.45),
          range(5).map((i) =>
            box(x + cw - pad - 374, y + navBar + 58 + i * 40, 240 - i * 24, 12, LINE, 6, null, 1, 0.7),
          ),
          box(x + cw - pad - 374, y + navBar + heroH - 108, 180, 62, accent, 10, null, 1, 0.18),
        ]),
  ]);

  const cardSection = join([
    tag(x + pad, y + navBar + heroH + 44, "WHAT WE DO", { size: 9.5, letter: 2 }),
    range(cards).map((i) => {
      const cx = x + pad + i * (cardW + 24);
      const cy = y + navBar + heroH + 44;
      return join([
        box(cx, cy + 26, cardW, 210, SURFACE, 12, LINE),
        box(cx, cy + 26, cardW, 96, i === 0 ? accent : LINE, 12, null, 1, i === 0 ? 0.16 : 0.6),
        tag(cx + 20, cy + 52, `0${i + 1}`, { size: 10, fill: i === 0 ? accent : SUBTLE }),
        tag(cx + 20, cy + 92, ["SERVICE", "SUPPORT", "DELIVERY"][i % 3], { size: 12, fill: TEXT, letter: 0.6 }),
        copyLines(cx + 20, cy + 148, [cardW - 40, cardW - 64, cardW - 88], 14),
        tag(cx + 20, cy + 210, "LEARN MORE", { size: 9, fill: i === 0 ? accent : SUBTLE }),
      ]);
    }),
  ]);

  const footerY = y + ch - 96;
  const footer = join([
    box(x, footerY, cw, 96, "#0D0D0D"),
    rule(x, footerY, x + cw, footerY),
    tag(x + pad, footerY + 44, "SITENAME", { size: 12, fill: TEXT }),
    text(x + pad, footerY + 68, subheading, { size: 10, fill: SUBTLE, letter: 0.4 }),
    ["Instagram", "Behance", "GitHub", "LinkedIn"].map((s, i) =>
      tag(x + cw - pad - (3 - i) * 96, footerY + 56, s, { size: 10, fill: MUTED, letter: 0.3, anchor: "middle" }),
    ),
  ]);

  const siteNav = join([
    box(x, y, cw, navBar, INK),
    rule(x, y + navBar, x + cw, y + navBar),
    box(x + pad, y + 20, 24, 24, accent, 7),
    tag(x + pad + 34, y + 36, "SITENAME", { size: 11, fill: TEXT }),
    nav.map((n, i) =>
      tag(x + cw - pad - (nav.length - 1 - i) * 92, y + 36, n, {
        size: 10.5,
        fill: i === 0 ? TEXT : MUTED,
        letter: 0.4,
        anchor: "middle",
      }),
    ),
    box(x + cw - pad - 76, y + 17, 76, 28, accent, 7, null, 1, 0.14),
    tag(x + cw - pad - 38, y + 35, "ENQUIRE", { size: 9, fill: accent, letter: 1.1, anchor: "middle" }),
  ]);

  return join([
    chrome(pad, 52, W - pad * 2, "laxmich.com", accent),
    box(x, y, cw, ch, INK),
    siteNav,
    hero,
    cardSection,
    footer,
  ]);
}

function specimen({ accent = "#F5F5F4", mark = "LC", heading: headingText = "Identity system", w = 1440, h = 900 }) {
  const W = w;
  const H = h;
  const pad = 72;
  const cw = W - pad * 2;

  const markW = cw * 0.42;
  const markX = pad;
  const markY = pad + 60;
  const markH = H - 520;

  const markPanel = join([
    box(markX, markY, markW, markH, "#0D0D0D", 12, LINE),
    `<g stroke="${LINE}" stroke-width="1" opacity="0.75">`,
    range(9).map((i) => rule(markX + (i * markW) / 8, markY, markX + (i * markW) / 8, markY + markH)),
    range(7).map((i) => rule(markX, markY + (i * markH) / 6, markX + markW, markY + (i * markH) / 6)),
    `</g>`,
    `<g stroke="${accent}" stroke-width="1" opacity="0.35">`,
    `<circle cx="${markX + markW / 2}" cy="${markY + markH / 2}" r="${markH / 2.4}" fill="none"/>`,
    rule(markX, markY + markH / 2, markX + markW, markY + markH / 2, accent),
    rule(markX + markW / 2, markY, markX + markW / 2, markY + markH, accent),
    `</g>`,
    heading(markX + markW / 2, markY + markH / 2 + 42, mark, { size: 150, letter: -8, anchor: "middle" }),
    tag(markX + 20, markY + markH - 22, "PRIMARY MARK / CONSTRUCTION GRID", { size: 9 }),
  ]);

  const rightX = pad + cw * 0.44;
  const paletteY = pad + 60;
  const paletteW = cw * 0.56;
  const swatchH = 62;
  const swatchW = (paletteW - 4 * 10) / 5;
  const colors = [
    ["Accent", accent],
    ["Ink", INK],
    ["Surface", "#111111"],
    ["Muted", "#A1A1AA"],
    ["Paper", "#F5F5F4"],
  ];

  const palette = join([
    tag(rightX, paletteY - 14, "COLOUR SYSTEM", { size: 9 }),
    colors.map(([name, hex], i) => {
      const bx = rightX + i * (swatchW + 10);
      return join([
        box(bx, paletteY + 4, swatchW, swatchH, hex, 8, LINE),
        tag(bx, paletteY + swatchH + 22, name.toUpperCase(), { size: 9, fill: MUTED, letter: 1.2 }),
        tag(bx, paletteY + swatchH + 38, hex, { size: 9, fill: SUBTLE, letter: 0.6 }),
      ]);
    }),
  ]);

  const typeY = pad + 60 + 160;
  const typography = join([
    tag(rightX, typeY, "TYPOGRAPHY", { size: 9 }),
    heading(rightX, typeY + 74, "Aa", { size: 68, letter: -3 }),
    heading(rightX + 108, typeY + 52, "Display Grotesk", { size: 22, letter: -0.6 }),
    text(rightX + 108, typeY + 76, "Semibold / -3% tracking / Headlines", { size: 10, fill: MUTED, letter: 0.4 }),
    range(5).map((i) => {
      const lx = rightX + i * 68;
      return join([
        box(lx, typeY + 106, 52, 46, LINE, 6, null, 1, 0.4),
        text(lx + 26, typeY + 140, String(i + 1), { size: 24, fill: MUTED, anchor: "middle", family: SANS, weight: 600, letter: 0 }),
      ]);
    }),
    tag(rightX, typeY + 178, "TYPE SCALE / 5 STEPS", { size: 9, fill: SUBTLE }),
  ]);

  const appY = H - 240;
  const appNames = ["POSTER", "CARD", "MENU", "PACK", "SIGN", "TAG"];
  const applications = join([
    tag(pad, appY - 14, "APPLICATIONS", { size: 9 }),
    appNames.map((a, i) => {
      const bx = pad + i * 164;
      const tall = i % 3 === 0;
      return join([
        box(bx, appY, 150, tall ? 200 : 170, i === 0 ? accent : SURFACE, 8, LINE, 1, i === 0 ? 0.18 : 1),
        dot(bx + 75, appY + 60, 24, i === 0 ? accent : LINE),
        tag(bx + 75, appY + (tall ? 182 : 152), a, { size: 9, fill: i === 0 ? accent : SUBTLE, anchor: "middle" }),
      ]);
    }),
  ]);

  return join([
    gridLines(W, H, 72, 0.3),
    tag(pad, pad - 18, "BRAND IDENTITY SYSTEM", { size: 10, letter: 2.4 }),
    heading(pad, pad + 26, headingText, { size: 34, letter: -1.4 }),
    tag(W - pad, pad - 18, "01 / SPECIMEN", { size: 10, anchor: "end" }),
    markPanel,
    palette,
    typography,
    applications,
  ]);
}

function screens({ accent, heading: headingText, seed = "sc" }) {
  const W = 1440;
  const H = 900;
  const pad = 72;
  const random = rng(seed);
  const total = W - pad * 2 - 48;
  const densities = [
    { name: "COMFORTABLE", width: total * 0.4, rowH: 56, barH: 10, kpis: 4, chartH: 190, rows: 5 },
    { name: "COMPACT", width: total * 0.32, rowH: 42, barH: 8, kpis: 5, chartH: 150, rows: 8 },
    { name: "DENSE", width: total * 0.24, rowH: 32, barH: 6, kpis: 6, chartH: 150, rows: 10 },
  ];
  const top = pad + 60;
  const panelH = H - 72 - top;

  const panels = densities.map((d, idx) => {
    const x = pad + idx * (d.width + 24);
    const kw = (d.width - 36 - (d.kpis - 1) * 10) / d.kpis;
    const chartY = top + 122;
    const tableY = chartY + d.chartH + 16;
    const values = range(10).map(() => 0.2 + random() * 0.8);

    return join([
      box(x, top, d.width, panelH, PANEL, 12, LINE),
      tag(x + 18, top + 26, d.name, { size: 9 }),

      range(d.kpis).map((k) => {
        const kx = x + 18 + k * (kw + 10);
        return join([
          box(kx, top + 42, kw, 64, SURFACE, 8, LINE),
          rule(kx + 12, top + 62, kx + kw * 0.6, top + 62, LINE, 5, "round"),
          rule(kx + 12, top + 84, kx + kw * 0.42, top + 84, k === 0 ? accent : LINE, d.barH, "round"),
        ]);
      }),

      box(x + 18, chartY, d.width - 36, d.chartH, SURFACE, 8, LINE),
      spark(x + 30, chartY + 22, d.width - 60, d.chartH - 56, values, accent),

      box(x + 18, tableY, d.width - 36, d.rowH * d.rows + 34, SURFACE, 8, LINE),
      rule(x + 18, tableY + 34, x + d.width - 18, tableY + 34),
      tag(x + 30, tableY + 22, "ENTITY", { size: 8, letter: 1.2 }),
      range(d.rows).map((r) => {
        const ry = tableY + 34 + r * d.rowH;
        const mid = ry + d.rowH / 2;
        return join([
          r ? rule(x + 18, ry, x + d.width - 18, ry, LINE_SOFT) : null,
          rule(x + 30, mid, x + 30 + (d.width - 60) * 0.34, mid, LINE, d.barH, "round"),
          rule(x + 30 + (d.width - 60) * 0.44, mid, x + 30 + (d.width - 60) * 0.62, mid, LINE, d.barH, "round"),
          box(
            x + d.width - 70,
            mid - 7,
            40,
            14,
            r % 3 === 0 ? accent : LINE,
            4,
            null,
            1,
            r % 3 === 0 ? 0.24 : 1,
          ),
        ]);
      }),
    ]);
  });

  return join([
    gridLines(W, H, 72, 0.3),
    tag(pad, pad - 18, "DESIGN SYSTEM / REFERENCE SCREENS", { size: 10, letter: 2.4 }),
    heading(pad, pad + 26, headingText, { size: 34, letter: -1.4 }),
    tag(W - pad, pad - 18, "3 DENSITIES", { size: 10, anchor: "end" }),
    panels,
  ]);
}

function poster({ accent, heading: headingText, subheading, footer, variant = 0, seed = "p" }) {
  const W = 900;
  const H = 1200;
  const pad = 72;
  const random = rng(seed);

  const backdrops = [
    join([
      box(0, 0, W, H, PANEL),
      range(26).map((i) => box(0, i * 46, W, 1, LINE_SOFT)),
      range(160).map(() => dot(random() * W, random() * H, 1 + random() * 1.6, accent, 0.05 + random() * 0.16)),
      dot(W - 150, H * 0.42, 230, accent, 0.14),
      dot(W - 150, H * 0.42, 230, "none", 1, accent, 1.5),
      dot(W - 150, H * 0.42, 150, "none", 1, accent, 1),
    ]),
    join([
      box(0, 0, W, H, PANEL),
      `<path d="M0 ${H * 0.55} L${W * 0.6} ${H * 0.34} L${W} ${H * 0.62} L${W} ${H} L0 ${H} Z" fill="${accent}" opacity="0.14"/>`,
      `<path d="M0 ${H * 0.62} L${W * 0.5} ${H * 0.44} L${W} ${H * 0.7} L${W} ${H} L0 ${H} Z" fill="${accent}" opacity="0.1"/>`,
    ]),
    join([
      box(0, 0, W, H, PANEL),
      range(9).map((i) =>
        box(pad + i * 78, H * 0.2, 34, H * 0.6, accent, 0, null, 1, 0.05 + i * 0.012),
      ),
    ]),
  ];

  const lines = headingText.split("|");
  const typeSize = lines.length > 1 ? 104 : 124;
  const subY = H * 0.42 + (subheading ? (lines.length > 1 ? 2 : 1) * (lines.length > 1 ? 96 : 112) : 0);

  return join([
    backdrops[variant % backdrops.length],
    box(pad, pad - 34, 44, 2, accent),
    tag(pad, pad, footer.toUpperCase(), { size: 10, letter: 2.6 }),
    lines.map((line, i) => heading(pad, H * 0.42 + i * typeSize * 0.92, line, { size: typeSize, letter: -4.5 })),
    subheading ? text(pad, subY, subheading, { size: 72, fill: accent, family: SERIF, style: "italic", letter: -1 }) : null,
    rule(pad, H - pad - 96, W - pad, H - pad - 96),
    tag(pad, H - pad - 58, "DESIGNED BY LAXMI CHAUDHARY", { size: 10 }),
    tag(W - pad, H - pad - 58, `${String(variant + 1).padStart(2, "0")} / 03`, { size: 10, anchor: "end" }),
    range(24).map((i) =>
      box(pad + i * ((W - pad * 2) / 24), H - pad - 30, 2, 18, i % 6 === 0 ? accent : LINE),
    ),
  ]);
}

function socialGrid({ accent, heading: headingText }) {
  const W = 900;
  const H = 900;
  const gap = 14;
  const top = 96;
  const bottom = 56;
  const cell = (H - top - bottom - gap * 2) / 3;
  const gridW = cell * 3 + gap * 2;
  const ox = (W - gridW) / 2;

  const cells = range(9).map((i) => {
    const cx = ox + (i % 3) * (cell + gap);
    const cy = top + Math.floor(i / 3) * (cell + gap);
    const v = i % 4;
    const art =
      v === 0
        ? dot(cell / 2, cell / 2, cell * 0.28, accent, 0.85)
        : v === 1
          ? box(cell * 0.18, cell * 0.34, cell * 0.64, cell * 0.32, accent, 6, null, 1, 0.8)
          : v === 2
            ? join([
                box(cell * 0.22, cell * 0.22, cell * 0.56, cell * 0.56, "none", 0, accent, 2),
                rule(cell * 0.22, cell * 0.22, cell * 0.78, cell * 0.78, accent, 2),
              ])
            : range(5).map((k) =>
                rule(cell * 0.24, cell * 0.28 + k * 14, cell * 0.76, cell * 0.28 + k * 14, accent, 6, "round", 0.9 - k * 0.14),
              );

    return join([
      box(cx, cy, cell, cell, PANEL, 8, LINE),
      art,
      box(cx + 12, cy + cell - 40, cell - 24, 3, accent, 2, null, 1, 0.5),
      tag(cx + 12, cy + cell - 16, `POST 0${i + 1}`, { size: 8.5, letter: 1.3 }),
    ]);
  });

  return join([
    box(0, 0, W, H, INK),
    tag(ox, 56, "FEED GRID", { size: 10, letter: 2.4 }),
    heading(ox, 84, headingText, { size: 22, letter: -0.8 }),
    cells,
  ]);
}

function packaging({ accent, heading: headingText, subheading, meta }) {
  const W = 900;
  const H = 1200;
  const bw = 460;
  const bh = 700;
  const bx = (W - bw) / 2;
  const by = 150;

  return join([
    box(0, 0, W, H, INK),
    dot(W / 2, H / 2, 320, accent, 0.06),
    tag(72, 84, "PACKAGING", { size: 10, letter: 2.4 }),
    heading(72, 116, headingText, { size: 26, letter: -1 }),

    box(bx - 6, by - 6, bw + 12, bh + 12, "#000000", 6),
    box(bx, by, bw, bh, PANEL, 4, LINE),
    box(bx, by, bw, 54, SURFACE, 4, LINE),
    tag(bx + 24, by + 34, "VALVE", { size: 9 }),
    dot(bx + bw - 28, by + 27, 6, LINE),

    box(bx + 36, by + 96, bw - 72, 420, INK, 4, LINE),
    box(bx + 36, by + 96, bw - 72, 6, accent),
    tag(bx + 60, by + 146, "SINGLE ORIGIN", { size: 9.5, letter: 2 }),
    heading(bx + 60, by + 208, "HIMALAYA", { size: 42, letter: -1.8 }),
    heading(bx + 60, by + 252, "ESTATE", { size: 42, letter: -1.8, fill: accent }),
    rule(bx + 60, by + 292, bx + bw - 60, by + 292),
    meta.map((_entry, i) =>
      join([
        rule(bx + 60, by + 326 + i * 34, bx + 152, by + 326 + i * 34, LINE, 5, "round"),
        rule(bx + bw - 168, by + 326 + i * 34, bx + bw - 60, by + 326 + i * 34, accent, 5, "round", 0.8 - i * 0.16),
      ]),
    ),
    meta.map(([key], i) => tag(bx + 60, by + 318 + i * 34, key, { size: 8, fill: SUBTLE })),
    text(bx + 60, by + 486, subheading, { size: 10, fill: SUBTLE, letter: 0.6 }),

    dot(W - 176, by + bh - 96, 68, "none", 1, accent, 1.5),
    heading(W - 176, by + bh - 100, "250", { size: 26, anchor: "middle" }),
    tag(W - 176, by + bh - 78, "GRAMS", { size: 8, anchor: "middle" }),

    tag(72, H - 84, "DIELINE / CMYK / UNCOATED", { size: 10 }),
    tag(W - 72, H - 84, "PRINT READY", { size: 10, fill: accent, anchor: "end" }),
  ]);
}


/* -------------------------------------------------------------------------- */
/* Output                                                                     */
/* -------------------------------------------------------------------------- */

function svg(width, height, body, titleText, description) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="art-title art-desc">`,
    `<title id="art-title">${esc(titleText)}</title>`,
    `<desc id="art-desc">${esc(description)}</desc>`,
    `<rect width="${width}" height="${height}" fill="${INK}"/>`,
    body,
    `</svg>`,
    ``,
  ].join("\n");
}

/* Accent palette.
 *
 * These must match the `@theme` tokens in `src/app/globals.css`. The artwork is
 * rendered as images next to accent-coloured UI, so a drift between the two is
 * immediately visible as "the project thumbnail is a slightly different orange
 * from the buttons".
 */
const ORANGE = "#FF6A00";
const WARM = "#FF8A3D";
const GREEN = "#4ADE80";
const PAPER = "#F5F5F4";
const SAND = "#D6C7A1";
const BROWN = "#B45309";
const BLUE = "#60A5FA";

const files = [];
const emit = (path, content) => files.push({ path, content });

/* --- Projects ------------------------------------------------------------- */

emit(
  "public/images/projects/foodailo-cover.svg",
  svg(1440, 900, dashboard({ accent: ORANGE, heading: "Operations Overview", eyebrow: "FOODAILO / DASHBOARD", seed: "fd-1", rows: 5 }),
    "Foodailo dashboard",
    "Restaurant management dashboard with KPI cards, a nine-day sales chart, a category breakdown and an order table."),
);

emit(
  "public/images/projects/foodailo-dashboard.svg",
  svg(1440, 900, dashboard({ accent: ORANGE, heading: "Sales & Revenue", eyebrow: "FOODAILO / ANALYTICS", seed: "fd-2", rows: 6 }),
    "Foodailo sales analytics",
    "Revenue analytics with a sales chart, category breakdown and a longer order table."),
);

emit(
  "public/images/projects/foodailo-menu.svg",
  svg(1440, 900, phoneMenu({
    accent: ORANGE,
    heading: "Customer menu",
    seed: "fdm",
    items: [
      { name: "Starters", tag: "4 items", price: "320" },
      { name: "Main courses", tag: "9 items", price: "640" },
      { name: "Sides & salads", tag: "5 items", price: "280" },
      { name: "Desserts", tag: "3 items", price: "340" },
    ],
  }), "Foodailo customer menu", "Mobile menu screen with category filters and item cards."),
);

emit(
  "public/images/projects/foodailo-checkout.svg",
  svg(1440, 900, phoneMenu({
    accent: ORANGE,
    heading: "Cart & checkout",
    seed: "fdc",
    items: [
      { name: "Thukpa noodle", tag: "Spicy / veg", price: "520" },
      { name: "Chilli garlic momo", tag: "10 pcs", price: "380" },
      { name: "Masala chai", tag: "Hot", price: "120" },
    ],
  }), "Foodailo cart and checkout", "Cart screen listing selected items with a running total."),
);

emit(
  "public/images/projects/cg-agro-cover.svg",
  svg(1440, 900, website({
    accent: GREEN,
    nav: ["Home", "Services", "About", "Contact"],
    heading: "Fresh produce,|straight from the farm",
    subheading: "Sustainable farming, honest supply",
    eyebrow: "CG AGRO FARM",
    seed: "cg1",
    photoFirst: true,
  }), "CG Agro Farm website", "Agricultural business homepage with a photographic hero, service cards and a footer."),
);

emit(
  "public/images/projects/cg-agro-home.svg",
  svg(1440, 900, website({
    accent: GREEN,
    nav: ["Home", "Services", "About", "Contact"],
    heading: "Grown here,|delivered fresh",
    subheading: "Imadol / Lalitpur",
    eyebrow: "CG AGRO FARM",
    seed: "cg2",
    photoFirst: true,
  }), "CG Agro Farm homepage", "Homepage layout with a lead section and service cards."),
);

emit(
  "public/images/projects/cg-agro-services.svg",
  svg(1440, 900, website({
    accent: GREEN,
    nav: ["Home", "Services", "About", "Contact"],
    heading: "What we|do best",
    subheading: "Produce / Contract / Processing",
    eyebrow: "SERVICES",
    seed: "cg3",
    cards: 3,
  }), "CG Agro Farm services", "Services page grouped by buyer intent."),
);

emit(
  "public/images/projects/brand-identity-cover.svg",
  svg(1440, 900, specimen({ accent: PAPER, mark: "LC", heading: "Identity system overview" }),
    "Brand identity system", "Identity specimen showing the primary mark on a construction grid, a colour system, a type scale and applications."),
);

emit(
  "public/images/projects/brand-identity-specimen.svg",
  svg(1440, 900, specimen({ accent: PAPER, mark: "LC", heading: "Mark construction" }),
    "Logo construction grid", "Primary mark drawn on its construction grid with clear-space rules."),
);

emit(
  "public/images/projects/brand-identity-palette.svg",
  svg(1440, 900, specimen({ accent: ORANGE, mark: "+", heading: "Colour & type system" }),
    "Brand colour and type system", "Colour palette with hex values alongside a five-step type scale."),
);

emit(
  "public/images/projects/brand-identity-applications.svg",
  svg(1440, 900, specimen({ accent: GREEN, mark: "A", heading: "Applications" }),
    "Brand applications", "Identity system applied across poster, card, menu, packaging, signage and tag."),
);

emit(
  "public/images/projects/restaurant-cover.svg",
  svg(1440, 900, website({
    accent: WARM,
    nav: ["Menu", "Our story", "Reserve"],
    heading: "Order from|the table",
    subheading: "Kitchen open till 22:30",
    eyebrow: "TERRACE CAFE",
    seed: "rs1",
  }), "Restaurant website", "Restaurant website with an ordering-first homepage."),
);

emit(
  "public/images/projects/restaurant-menu.svg",
  svg(1440, 900, phoneMenu({
    accent: WARM,
    heading: "The menu",
    seed: "rsm",
    items: [
      { name: "Small plates", tag: "6 items", price: "420" },
      { name: "Grill", tag: "7 items", price: "780" },
      { name: "Mains", tag: "8 items", price: "620" },
      { name: "Drinks", tag: "9 items", price: "240" },
    ],
  }), "Restaurant menu screen", "Photograph-led menu screen grouped for how customers order."),
);

emit(
  "public/images/projects/restaurant-admin.svg",
  svg(1440, 900, dashboard({
    accent: WARM,
    heading: "Order management",
    eyebrow: "TERRACE CAFE / ADMIN",
    seed: "rs2",
    rows: 6,
    statusLabels: ["NEW", "PREPARING", "PAID", "DELIVERED", "NEW", "PREPARING"],
  }), "Restaurant admin dashboard", "Staff dashboard for managing orders and editing the menu."),
);

emit(
  "public/images/projects/analytics-dashboard-cover.svg",
  svg(1440, 900, dashboard({
    accent: BLUE,
    heading: "Analytics overview",
    eyebrow: "SYSTEM / REFERENCE",
    seed: "an1",
    rows: 5,
  }), "Analytics dashboard", "Analytics dashboard with KPI cards, a trend chart, a donut breakdown and a data table."),
);

emit(
  "public/images/projects/analytics-dashboard-screens.svg",
  svg(1440, 900, screens({ accent: BLUE, heading: "Three density levels", seed: "an2" }),
    "Dashboard density levels", "The same dashboard rendered at comfortable, compact and dense density levels."),
);

/* --- E-commerce storefront -------------------------------------------------- */

emit(
  "public/images/projects/thrift-store-cover.svg",
  svg(1440, 900, website({
    accent: WARM,
    nav: ["Shop", "New in", "Sellers", "About"],
    heading: "Pre-loved,|not pre-owned",
    subheading: "Resale marketplace for everyday clothing",
    eyebrow: "THRIFT / COMMERCE",
    seed: "th1",
    cards: 4,
  }), "Thrift storefront", "Resale storefront homepage with a hero, a featured grid and a footer."),
);

emit(
  "public/images/projects/thrift-store-product.svg",
  svg(1440, 900, phoneMenu({
    accent: WARM,
    heading: "Shop listings",
    seed: "thm",
    eyebrow: "MOBILE SHOPPING",
    categories: ["All", "Outerwear", "Knits", "Shoes"],
    activeIndex: 2,
    bannerTitle: "NEW IN",
    bannerMeta: "Autumn drop",
    cartCount: "2 items",
    cartTotal: "Rs. 2,380",
    items: [
      { name: "Wool overcoat", tag: "Size M · Like new", price: "2,400" },
      { name: "Cable knit sweater", tag: "Size L · Good", price: "1,250" },
      { name: "Leather chelsea boots", tag: "Size 42 · Very good", price: "3,100" },
      { name: "Denim work jacket", tag: "Size S · Good", price: "1,800" },
    ],
  }), "Storefront listings", "Mobile product listing with filter pills, condition tags, prices and an add-to-bag action."),
);

emit(
  "public/images/projects/thrift-store-checkout.svg",
  svg(1440, 900, phoneMenu({
    accent: WARM,
    heading: "Checkout",
    seed: "thc",
    eyebrow: "MOBILE CHECKOUT",
    categories: ["Address", "Payment", "Review"],
    activeIndex: 2,
    bannerTitle: "ORDER TOTAL",
    bannerMeta: "Rs. 2,380",
    cartCount: "2 items · Free delivery",
    cartTotal: "Rs. 2,380",
    items: [
      { name: "Wool overcoat", tag: "Cash on delivery", price: "2,400" },
      { name: "Seller protection", tag: "Included", price: "0" },
      { name: "Delivery", tag: "Kathmandu valley", price: "0" },
      { name: "Payment method", tag: "Cash on delivery", price: "—" },
    ],
  }), "Checkout screen", "Mobile checkout showing the order summary, delivery cost and payment method."),
);

emit(
  "public/images/projects/thrift-store-admin.svg",
  svg(1440, 900, dashboard({
    accent: WARM,
    brand: "THRIFT ADMIN",
    heading: "Seller centre",
    eyebrow: "THRIFT / SELLER CONSOLE",
    seed: "th2",
    rows: 6,
    navItems: ["Overview", "Listings", "Orders", "Payouts", "Settings"],
    action: "NEW LISTING",
    owner: { label: "SELLER", detail: "Verified seller" },
    kpis: [
      { label: "GROSS SALES", value: "Rs. 318,400", delta: "+9.8%", good: true },
      { label: "LISTINGS LIVE", value: "148", delta: "+6", good: true },
      { label: "PENDING", value: "12", delta: "-3", good: true },
    ],
    chartLabel: "SALES - LAST 9 DAYS",
    chartScope: "ALL SELLERS",
    donutLabel: "BY CATEGORY",
    donutCategories: ["Outerwear", "Knitwear", "Footwear", "Accessories"],
    tableHeads: ["ORDER", "BUYER", "ITEMS", "TOTAL", "STATUS"],
    people: ["S. Rai", "A. Karki", "D. Lama", "R. Joshi", "M. Shrestha"],
    idPrefix: "TH",
    idStart: 9100,
    idStep: 11,
    statusLabels: ["PAID", "PAID", "SHIPPED", "PAID", "SHIPPED", "PAID"],
    goodStatuses: ["PAID", "SHIPPED"],
  }), "Seller console", "Seller dashboard listing live inventory, recent orders and payout totals."),
);

/* --- Business admin dashboard ----------------------------------------------- */

emit(
  "public/images/projects/inventory-console-cover.svg",
  svg(1440, 900, dashboard({
    accent: BLUE,
    brand: "STOCKROOM",
    heading: "Inventory control",
    eyebrow: "SYSTEM / INVENTORY",
    seed: "iv1",
    rows: 6,
    navItems: ["Overview", "Stock", "Suppliers", "Orders", "Reports"],
    action: "NEW PO",
    owner: { label: "WAREHOUSE", detail: "Imadol, Lalitpur" },
    kpis: [
      { label: "STOCK VALUE", value: "Rs. 1,240,600", delta: "+4.1%", good: true },
      { label: "LOW STOCK", value: "23", delta: "-7", good: true },
      { label: "OPEN POs", value: "9", delta: "+2", good: false },
    ],
    chartLabel: "MOVEMENT - LAST 9 DAYS",
    chartScope: "ALL WAREHOUSES",
    donutLabel: "BY CATEGORY",
    donutCategories: ["Raw material", "Components", "Finished", "Returns"],
    tableHeads: ["SKU", "ITEM", "UNITS", "VALUE", "STATUS"],
    people: ["RM-114", "RM-208", "RM-331", "RM-447", "RM-502"],
    idPrefix: "SKU",
    idStart: 100,
    idStep: 13,
    valuePrefix: "Rs. ",
    valueRange: [8000, 96000],
    unitWord: "unit",
    statusLabels: ["IN STOCK", "LOW STOCK", "IN STOCK", "REORDER", "IN STOCK", "LOW STOCK"],
    goodStatuses: ["IN STOCK"],
  }), "Inventory console", "Inventory control dashboard with stock valuation, low-stock alerts and a reorder table."),
);

emit(
  "public/images/projects/inventory-console-density.svg",
  svg(1440, 900, screens({ accent: BLUE, heading: "Operator density modes", seed: "iv2" }),
    "Console density modes", "The same inventory console rendered at comfortable, compact and dense density levels."),
);

/* --- Gallery -------------------------------------------------------------- */

emit(
  "public/images/gallery/brand-system.svg",
  svg(1200, 800, specimen({ accent: PAPER, mark: "LC", heading: "Identity system", w: 1200, h: 800 }),
    "Brand identity system", "Identity system overview sheet with mark, colour, type and applications."),
);

emit(
  "public/images/gallery/logo-construction.svg",
  svg(900, 1200, poster({ accent: PAPER, heading: "Logo|construction", subheading: "grid, ratio, redraw", footer: "Logo design", variant: 0 }),
    "Logo construction poster", "Poster showing a logo drawn on its construction grid."),
);

emit(
  "public/images/gallery/logo-monogram.svg",
  svg(900, 900, socialGrid({ accent: PAPER, heading: "Monogram & favicon set" }),
    "Monogram and favicon set", "Grid of monogram, favicon and app-icon variations."),
);

emit(
  "public/images/gallery/social-grid.svg",
  svg(900, 900, socialGrid({ accent: ORANGE, heading: "Social campaign grid" }),
    "Social campaign grid", "Nine social posts built from one composition rule, shown as a feed."),
);

emit(
  "public/images/gallery/social-story.svg",
  svg(900, 1200, poster({ accent: ORANGE, heading: "Story|format", subheading: "9:16", footer: "Social media", variant: 1 }),
    "Story format adaptation", "Vertical story adaptation of a social campaign."),
);

emit(
  "public/images/gallery/poster-series.svg",
  svg(900, 1200, poster({ accent: WARM, heading: "Poster|series", subheading: "three prints, one grid", footer: "Posters", variant: 2 }),
    "Poster series", "Poster composition from a three-part event series."),
);

emit(
  "public/images/gallery/menu-master.svg",
  svg(900, 1200, poster({ accent: SAND, heading: "Menu|master", subheading: "A4 double-sided", footer: "Menu design", variant: 0 }),
    "Menu master layout", "Restaurant menu master layout."),
);

emit(
  "public/images/gallery/menu-table.svg",
  svg(900, 1200, poster({ accent: SAND, heading: "Table|variant", subheading: "one page, large prices", footer: "Menu design", variant: 2 }),
    "Table menu variant", "Single-page laminated table menu variant."),
);

emit(
  "public/images/gallery/coffee-front.svg",
  svg(900, 1200, packaging({
    accent: BROWN,
    heading: "Coffee front",
    subheading: "Front panel - read at three metres",
    meta: [["ALTITUDE", "1,400 MASL"], ["PROCESS", "WASHED"], ["VARIETAL", "GOLDEN HONEY"]],
  }), "Coffee packaging front", "Coffee bag front panel with origin and process information."),
);

emit(
  "public/images/gallery/coffee-back.svg",
  svg(900, 1200, packaging({
    accent: BROWN,
    heading: "Coffee back",
    subheading: "Back panel - tasting notes and detail",
    meta: [["NOTES", "PLUM / HONEY"], ["ROAST", "MEDIUM"], ["ROASTED", "THIS MONTH"]],
  }), "Coffee packaging back", "Coffee bag back panel with tasting notes and product detail."),
);

emit(
  "public/images/gallery/brand-applications.svg",
  svg(1440, 900, screens({ accent: GREEN, heading: "System in application", seed: "ga" }),
    "Brand applications overview", "Identity system applied across print and packaging formats."),
);

emit(
  "public/images/gallery/flyer-set.svg",
  svg(900, 900, socialGrid({ accent: ORANGE, heading: "Promotional flyer set" }),
    "Promotional flyer set", "Set of promotional flyers sharing one grid and accent colour."),
);

/* -------------------------------------------------------------------------- */

let written = 0;
for (const file of files) {
  const target = joinPath(root, file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, file.content, "utf8");
  written += 1;
}

console.log(`Generated ${written} artwork files under public/images/`);
