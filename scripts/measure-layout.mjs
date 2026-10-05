/**
 * Layout measurement probe.
 *
 * `audit.mjs` answers "is anything broken?". This answers the question the
 * brief actually asks: "is everything aligned?". It reads back real geometry —
 * container gutters, heading metrics, navbar distribution and hero column
 * balance — so alignment fixes are driven by numbers instead of guesses.
 *
 * Usage: node scripts/measure-layout.mjs [route@width @height ...]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 9344;
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ORIGIN = "http://localhost:3000";

const MEASURE = String.raw`
(() => {
  const r = (el) => {
    const b = el.getBoundingClientRect();
    return { l: +b.left.toFixed(1), r: +b.right.toFixed(1), w: +b.width.toFixed(1),
             t: +b.top.toFixed(1), h: +b.height.toFixed(1) };
  };
  const label = (el) => {
    const id = el.id ? "#" + el.id : "";
    const slot = el.getAttribute("data-slot");
    const tag = slot ? "[data-slot=" + slot + "]" : el.tagName.toLowerCase();
    return tag + id;
  };
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return false;
    const b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0;
  };

  const out = { containers: [], sections: [], probes: {}, navbar: null, hero: null, headings: [], cards: {} };

  // Explicit spot-checks for the shared gutter. Every section's heading and grid
  // should resolve to the same content edge as the hero.
  for (const [k, sel] of Object.entries({
    heroH1: '[data-slot="hero"] h1',
    servicesEyebrow: "#services .eyebrow",
    servicesH2: "#services h2",
    servicesGrid: "#services ul",
    aboutH2: "#about h2",
    workH2: "#work h2",
    workGrid: "#work ul",
    skillsH2: "#skills h2",
    stackH2: "#stack h2",
    experienceH2: "#experience h2",
    testimonialsH2: "#testimonials h2",
  })) {
    const el = document.querySelector(sel);
    out.probes[k] = el && vis(el) ? r(el) : null;
  }

  // Left/right content edge of every section, so a section that starts at a
  // different x than its neighbours is obvious.
  for (const sec of document.querySelectorAll("main > section, main > div > section")) {
    // Skip decorative, absolutely-positioned backdrops — they are full-bleed by
    // design and would mask the real content edge.
    const kid = [...sec.children].find((el) => {
      if (!vis(el) || el.getAttribute("aria-hidden") === "true") return false;
      const p = getComputedStyle(el).position;
      return p !== "absolute" && p !== "fixed";
    });
    if (!kid) continue;
    const b = r(kid);
    out.sections.push({ id: sec.id || label(sec), edge: b.l, right: b.r, w: b.w, first: kid.tagName.toLowerCase() });
  }

  // Every shared container, so sections that drift off the grid are visible.
  for (const el of document.querySelectorAll(".container-page")) {
    if (!vis(el)) continue;
    const sec = el.closest("section, header, footer, main > div");
    out.containers.push({ where: label(sec || el), ...r(el) });
  }

  // Navbar: logo / link group / CTA distribution.
  const nav = document.querySelector("nav.container-page");
  if (nav) {
    const logo = nav.querySelector("a.group");
    const list = nav.querySelector("ul");
    const cta = nav.querySelector('a[href="/contact"].inline-flex');
    const burger = nav.querySelector("button");
    out.navbar = {
      nav: r(nav),
      logo: logo && vis(logo) ? r(logo) : null,
      links: list && vis(list) ? { ...r(list), count: list.children.length } : null,
      cta: cta && vis(cta) ? r(cta) : null,
      burger: burger && vis(burger) ? r(burger) : null,
      headerH: +document.querySelector("[data-site-navbar]").getBoundingClientRect().height.toFixed(1),
    };
  }

  // Hero: column geometry plus the vertical rhythm between stacked elements.
  const hero = document.querySelector('[data-slot="hero"]');
  if (hero) {
    const grid = hero.querySelector(".container-page > div.grid");
    const copy = grid && grid.children[0];
    const art = grid && grid.children[1];
    const h1 = hero.querySelector("h1");
    const cs = h1 && getComputedStyle(h1);
    const items = copy
      ? [...copy.children].filter(vis).map(el => ({
          what: el.tagName.toLowerCase() + (el.textContent || "").trim().slice(0, 22),
          ...r(el),
        }))
      : [];
    let gaps = [];
    for (let i = 1; i < items.length; i++) gaps.push(+(items[i].t - (items[i - 1].t + items[i - 1].h)).toFixed(1));
    out.hero = {
      section: r(hero),
      grid: grid && r(grid),
      copy: copy && { ...r(copy), textAlign: getComputedStyle(copy).textAlign },
      art: art && r(art),
      h1: h1 && { ...r(h1), fontSize: cs.fontSize, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing },
      items,
      gaps,
    };
  }

  // Heading scale, to catch a clamp() that never resolves.
  for (const el of document.querySelectorAll("h1,h2,h3")) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el);
    out.headings.push({ tag: el.tagName, text: (el.textContent || "").trim().slice(0, 34),
                        fontSize: s.fontSize, lineHeight: s.lineHeight, ...r(el) });
  }

  // Grid card rows: equal width and equal height is what "aligned" means here.
  for (const sec of document.querySelectorAll("section")) {
    const grid = sec.querySelector('[class*="grid-cols"]');
    if (!grid || !vis(grid)) continue;
    const kids = [...grid.children].filter(vis).map(r);
    if (kids.length < 2) continue;
    const ws = [...new Set(kids.map(k => k.w))];
    const hs = [...new Set(kids.map(k => k.h))];
    if (ws.length > 1 || hs.length > 1) {
      out.cards[sec.id || label(sec)] = { widths: ws, heights: hs, n: kids.length };
    }
  }

  return out;
})()
`;

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.waiters = new Map(); this.handlers = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.waiters.has(m.id)) {
        const { res, rej } = this.waiters.get(m.id); this.waiters.delete(m.id);
        if (m.error) rej(new Error(JSON.stringify(m.error))); else res(m.result);
      } else if (m.method && this.handlers.has(m.method)) {
        this.handlers.get(m.method).forEach((f) => f(m.params));
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.waiters.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  on(method, fn) { if (!this.handlers.has(method)) this.handlers.set(method, []); this.handlers.get(method).push(fn); }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval failed");
    return r.result.value;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "cdp-m-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--window-size=1440,900", "about:blank",
], { stdio: "ignore" });

let ver = null;
for (let i = 0; i < 60; i++) {
  try { ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; }
  catch { await sleep(500); }
}
if (!ver) { chrome.kill(); throw new Error("chrome did not expose a debugging port"); }

const created = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
const target = await created.json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
const cdp = new CDP(ws);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");

async function visit(path, w, h) {
  // Reveal animations park elements at a translated/scaled offset until they
  // enter the viewport, which skews every bounding rect. Reduced motion
  // resolves them to their final state, so geometry is measured at rest — and
  // it doubles as a check that the motion fallback is wired up.
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
  const loaded = new Promise((res) => cdp.on("Page.loadEventFired", res));
  await cdp.send("Page.navigate", { url: ORIGIN + path });
  await loaded;
  await cdp.eval(`(async()=>{
    if (document.fonts) await document.fonts.ready;
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y < max; y += step) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,120)); }
    window.scrollTo(0, 0);
    await new Promise(r=>setTimeout(r,300));
  })()`);
  return cdp.eval(MEASURE);
}

const ROUTES = process.argv[2]
  ? process.argv.slice(2).map((s) => { const [p, ...r] = s.split("@"); return { p, w: +(r[0] || 1440), h: +(r[1] || 900) }; })
  : ["/", "/", "/", "/", "/about", "/services", "/skills", "/projects", "/contact", "/experience"].map((p, i) =>
      ({ p, w: [1440, 1280, 1024, 820, 390][i % 5], h: 900 }));

const out = [];
for (const r of ROUTES) {
  try { out.push({ route: r.p, viewport: `${r.w}x${r.h}`, ...(await visit(r.p, r.w, r.h)) }); }
  catch (e) { out.push({ route: r.p, viewport: `${r.w}x${r.h}`, error: String(e.message).slice(0, 300) }); }
}

console.log(JSON.stringify(out, null, 1));
ws.close();
chrome.kill();
try { rmSync(profile, { recursive: true, force: true }); } catch {}