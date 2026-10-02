# Creative Designer Portfolio

A premium, single-page portfolio for a **graphic designer / web designer / UI-UX designer / creative developer**.

Dark editorial aesthetic (`#0A0A0A` base, `#FF5A1F` accent, `#D7FF64` secondary), asymmetric layouts, oversized display typography, scroll-driven reveals and a working contact form.

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (default <http://localhost:5173>).

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |
| `npm run smoke` | SSR render smoke test (35 assertions on the built markup) |

**Stack:** React 19 + Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide icons. No other runtime dependencies.

---

## Where to edit everything

Two files hold all editable content. You should not need to touch any component to rebrand the site.

### 1. `src/data/site.ts` — identity, copy, services, skills, contact

| Key | What it controls |
| --- | --- |
| `name`, `brand` | Navbar logo, footer, `<title>`-adjacent copy |
| `role`, `tagline`, `description` | Hero label, headline support text |
| `seo` | Meta description, keywords, author |
| `nav`, `cta` | Navbar links and the `LET'S TALK` button |
| `socials` | Email, Behance, Dribbble, LinkedIn, GitHub |
| `about.paragraphs` | About copy |
| `about.portrait` | Path to your photo, e.g. `/portrait.jpg` |
| `about.stats` | Years / projects / clients — **placeholder `—` until you verify them** |
| `services` | The five service cards |
| `process` | The six-step process timeline |
| `skills` | Tools per discipline — **verify before publishing** |
| `contact` | Headline, project types, budget ranges |
| `form.endpoint` | **Where the contact form POSTs** (see below) |

### 2. `src/data/projects.ts` — works, case studies, gallery

Projects carry `category`, `tags` (used by the filters), `year`, `description`, `objective`, `approach`, `tools`, a `palette`, a `size` hint (`tall` / `wide` / `standard`) that drives the asymmetric grid, plus optional `cover`, `detailImages`, `liveUrl`, `caseStudyUrl`, `desktopPreview` and `mobilePreview`.

The same file exports `gallery` (the graphic-design masonry wall) and `webShowcase` (the browser-mockup section).

---

## Images

Drop real files into `public/projects/` and reference them from the data file:

```ts
{
  slug: 'restaurant-brand-identity',
  cover: '/projects/restaurant-identity.jpg',   // card + modal hero
  detailImages: [
    { src: '/projects/restaurant-menu.jpg', caption: 'Menus' },
    { src: '/projects/restaurant-signage.jpg', caption: 'Signage' },
  ],
  // ...
}
```

**Until you supply images**, every project and gallery tile renders `<PlaceholderArt>` — a deterministic generated composition built from that item's `palette` and `mark`. This keeps the layout fully art-directed instead of showing broken images. There are no external stock photos, so nothing is misrepresented as your work.

To replace a portrait, set `about.portrait: '/portrait.jpg'` and drop the file in `public/`.

---

## Sample content vs. real work

The eight projects and twelve gallery tiles that ship with the template are **demonstration content**, not client work. They are marked two ways so they can't be mistaken for real engagements:

- every sample project sets `isPlaceholder: true`, which renders a `Sample` badge on the card and in the case-study modal;
- gallery tiles get a `Sample` badge plus an inline note explaining where to put real files.

The `about.stats` values ship as `—` with `isPlaceholder: true`, so they render muted and are accompanied by a note pointing at `src/data/site.ts`. **No personal achievements or statistics are invented** — fill in your own once verified.

Skills and tools ship as a starting template with a visible disclaimer. Only present tools as your expertise after you have confirmed them.

---

## Contact form

The form performs real client-side validation (name, email format, project type, message length ≥ 20 chars) with `aria-invalid`, `aria-describedby`, per-field error text, and focus moved to the first invalid field on submit. A honeypot field blocks bots.

**It never shows a fake success message.** It reports success only after your endpoint returns a real HTTP 2xx. Three outcomes are possible and all are honest:

1. **Endpoint configured** → POSTs JSON, shows the server's response state.
2. **Endpoint empty** → shows a clear error explaining that nothing was sent, plus your email address. Nothing is lost.
3. **Request fails** → shows the real error.

To make it live, set `form.endpoint` in `src/data/site.ts`:

```ts
form: {
  endpoint: 'https://formspree.io/f/yourId',
}
```

Any endpoint accepting a JSON `POST` works — Formspree, Web3Forms, Basin, or your own `/api/contact` route. Payload shape:

```json
{
  "name": "...",
  "email": "...",
  "projectType": "Brand Identity",
  "budget": "$1,500 – $5,000",
  "message": "..."
}
```

Until then, visitors get a working `mailto:` fallback link.

---

## Motion & accessibility

- **`prefers-reduced-motion` is respected globally.** CSS clamps all animation/transition durations, and components check the media query individually — the loading curtain is skipped, marquees render as static text, custom cursor and magnetic buttons disable, and Framer Motion animates opacity instead of transform.
- **Custom cursor** only mounts on `(hover: hover) and (pointer: fine)` at `lg` and up. Native cursors are untouched on touch.
- **Magnetic buttons** are pointer-fine only and wrap a single child; they don't intercept clicks.
- Semantic HTML throughout: `header`, `nav`, `main`, `section`, `article`, `footer`, real `h1`–`h3` order, `dl` for stat/definition pairs.
- Skip-to-content link, `aria-expanded` / `aria-controls` on the menu toggle, `aria-pressed` on filters, focus-trapped dialogs with `Escape` to close, `←`/`→` in the lightbox.
- Decorative layers are `aria-hidden`; placeholder art is `role="presentation"` unless given an `alt`.
- Hover-only affordances always have a non-hover equivalent (the whole card is a button, so filters and modals are keyboard-reachable).

---

## Responsive behaviour

Fluid `clamp()` type scales rather than fixed breakpoints, so there are no hardcoded widths to maintain. Verified layouts at **1920 / 1440 / 1024 / 768 / 390 / 375 px**.

Overflow is guarded at the root (`body` and `#root` both use `overflow-x: clip`), hero decoration is clipped by its section, the filter row scrolls horizontally inside its own container instead of pushing the page, and the masonry grid collapses 3 → 2 → 1 columns.

---

## Structure

```
├── index.html                  # SEO metadata, OG tags, fonts, JSON-LD
├── public/
│   ├── favicon.svg
│   ├── og-image.svg            # social share card
│   ├── site.webmanifest
│   └── projects/               # ← drop your images here
├── scripts/smoke.tsx           # SSR render assertions
└── src/
    ├── App.tsx                 # section composition
    ├── index.css               # Tailwind v4 @theme, base layer, keyframes
    ├── data/
    │   ├── site.ts             # ← edit: identity, copy, services, skills
    │   └── projects.ts         # ← edit: works, case studies, gallery
    ├── hooks/index.ts          # media queries, active section, scroll lock
    ├── lib/utils.ts            # cn(), smooth scroll
    └── components/
        ├── Navbar.tsx          # sticky nav, scroll progress, mobile menu
        ├── Hero.tsx            # headline reveal, parallax, ticker
        ├── About.tsx
        ├── Services.tsx
        ├── Works.tsx           # filters + asymmetric grid + case-study modal
        ├── GraphicGallery.tsx  # masonry + full-screen viewer
        ├── WebShowcase.tsx     # browser mockups, desktop/mobile toggle
        ├── Process.tsx         # scroll-linked timeline
        ├── Skills.tsx
        ├── Contact.tsx         # validated form, real submission
        ├── Footer.tsx
        ├── Button.tsx          # magnetic wrappers, button/link variants
        ├── Cursor.tsx          # desktop-only custom cursor
        ├── Preloader.tsx       # loading curtain
        ├── PlaceholderArt.tsx  # generated stand-in artwork
        └── ui.tsx              # Reveal, Eyebrow, Section, badges
```

---

## Before you publish

- [ ] Replace `YOUR NAME` / `hello@example.com` / `https://example.com` in `src/data/site.ts`
- [ ] Update the same values in `index.html` (title, meta, OG, canonical, JSON-LD)
- [ ] Set `about.portrait` and add the file
- [ ] Fill in verified `about.stats`; clear `isPlaceholder`
- [ ] Verify each entry in `skills`; delete the disclaimer in `siteConfig.skillsDisclaimer`
- [ ] Replace the sample projects with real case studies and add images
- [ ] Clear `isPlaceholder` on any project that is genuine work
- [ ] Set real social URLs
- [ ] Configure `form.endpoint` and send a real test submission
- [ ] Delete `scripts/smoke.tsx` and the `npm run smoke` script if you don't want it
- [ ] Generate `og-image.png` (1200×630) from `public/og-image.svg` — many social platforms don't render SVG
- [ ] `npm run build` and deploy `dist/`

---

## Accessibility notes

Colour contrast on `#0A0A0A`: body text `#FFFFFF` ≈ 19:1, secondary `#A3A3A3` ≈ 8:1, accent `#FF5A1F` ≈ 5.4:1 — all pass WCAG AA for their usage. Lime `#D7FF64` is only used for small non-essential labels on dark surfaces, never for body copy.