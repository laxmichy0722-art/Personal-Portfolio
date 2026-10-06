import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 9333;
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ORIGIN = "http://localhost:3000";

const AUDIT_FN = String.raw`
(() => {
  const R = {};
  const de = document.documentElement;
  const W = window.innerWidth;

  const rgb = (str) => {
    const c = document.createElement("canvas"); c.width = c.height = 1;
    const x = c.getContext("2d"); x.fillStyle = "#000"; x.fillStyle = str;
    x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const over = (f, b) => { const a = f[3]; return [0,1,2].map(i => f[i]*a + b[i]*(1-a)); };
  const lum = (c) => { const f = c.slice(0,3).map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*f[0]+0.7152*f[1]+0.0722*f[2]; };
  const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return +((x+0.05)/(y+0.05)).toFixed(2); };
  const effBg = (el) => {
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== "none") return null;
      const c = s.backgroundColor;
      if (c && c !== "transparent") {
        // Alpha has to come from the parsed colour, not a regex. The previous
        // check matched any "...,0)" string, which also matches rgb(255,106,0)
        // -- so every zero-blue brand colour (the whole #FF6A00 accent family)
        // looked transparent and got scored against the page background instead
        // of its own fill, reporting 6.8:1 as 1:1.
        const r = rgb(c);
        if (r[3] === 0) continue;
        acc = acc === null ? r : over(r, acc);
        if (r[3] === 1) return acc;
      }
    }
    return acc || [255,255,255,1];
  };
  const txt = (el) => (el.innerText || el.textContent || "").replace(/\s+/g," ").trim().slice(0,50);
  const sel = (el) => {
    const p = [];
    for (let n = el; n && n.tagName !== "BODY"; n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) { p.unshift(s+"#"+n.id); break; }
      const c = (n.className||"").toString().trim().split(/\s+/).filter(Boolean)[0];
      if (c) s += "."+c;
      p.unshift(s);
    }
    return p.slice(-3).join(" > ");
  };

  R.viewport = window.innerWidth + "x" + window.innerHeight;
  R.horizontalOverflow = de.scrollWidth > W + 1
    ? { scrollWidth: de.scrollWidth, viewport: W, overflowBy: de.scrollWidth - W } : null;

  const offscreen = [], tall = [];
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.right > W + 2 || r.left < -2) offscreen.push({ el: sel(el), left: Math.round(r.left), right: Math.round(r.right), text: txt(el) });
    if (r.height > 2500) tall.push({ el: sel(el), h: Math.round(r.height) });
  }
  R.offscreen = offscreen.slice(0, 10);
  R.tall = tall.sort((a,b)=>b.h-a.h).slice(0,5);

  R.brokenImages = [...document.querySelectorAll("img")]
    .filter(i => !i.complete || i.naturalWidth === 0)
    .map(i => ({ el: sel(i), src: (i.currentSrc||i.src||"").split("/").pop() })).slice(0,10);

  const noName = [];
  for (const i of document.querySelectorAll("img")) if (i.getAttribute("alt") === null) noName.push({ el: sel(i), src: (i.currentSrc||i.src||"").split("/").pop() });
  for (const s of document.querySelectorAll("svg")) {
    const hidden = s.getAttribute("aria-hidden")==="true" || s.getAttribute("role")==="presentation" || s.getAttribute("focusable")==="false";
    const named = s.getAttribute("aria-label") || s.getAttribute("aria-labelledby") || s.querySelector("title");
    if (!hidden && !named) noName.push({ el: sel(s), svgUnnamed: true });
  }
  R.unnamedGraphics = noName.slice(0,12);

  const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(h => h.getBoundingClientRect().height > 0);
  R.h1Count = hs.filter(h => h.tagName === "H1").length;
  R.firstH1 = txt(hs.find(h => h.tagName==="H1") || document.body);
  const jumps = []; let prev = 0;
  for (const h of hs) { const l = +h.tagName[1]; if (prev && l > prev+1) jumps.push({ from:"h"+prev, to:"h"+l, text: txt(h) }); prev = l; }
  R.headingJumps = jumps.slice(0,6);

  const small = [];
  for (const el of document.querySelectorAll("a[href],button,[role=button],summary,input:not([type=hidden]),select,textarea")) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    // Visually-hidden helpers and the native <select> a Radix trigger hides
    // behind itself are 1x1 by design -- they are never the thing a finger
    // or a pointer lands on, so they cannot fail a target-size check.
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (el.closest(".sr-only") || cs.clipPath === "inset(50%)" || cs.position === "absolute" && r.width <= 1) continue;
    if (r.height < 44 || r.width < 24) small.push({ el: sel(el), text: txt(el), w: Math.round(r.width), h: Math.round(r.height) });
  }
  // 44x44 is WCAG 2.1 SC 2.5.5 Target Size (Enhanced), level AAA. The AA bar
  // is SC 2.5.8 at 24x24. This reports against the stricter AAA figure so it
  // stays useful as a ceiling -- read a hit against 24 before treating it as
  // an accessibility failure.
  R.smallTapTargets = small.slice(0,40);
  R.smallTapTargetsCount = small.length;
  R.smallTapTargetsNote = "measured against WCAG AAA 44x44; AA minimum is 24x24";

  const low = [], seen = new Set(); let skipped = 0;
  for (const el of document.querySelectorAll("p,a,span,li,h1,h2,h3,h4,label,button,td,th,dt,dd,figcaption,strong,em,blockquote")) {
    if (![...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim().length>1)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility==="hidden" || cs.opacity==="0") continue;
    const bg = effBg(el);
    if (!bg) { skipped++; continue; }
    const cr = ratio(over(rgb(cs.color), bg), bg);
    const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const need = (px >= 24 || (px >= 18.66 && bold)) ? 3 : 4.5;
    if (cr < need) {
      const k = cs.color+"|"+Math.round(px)+"|"+bg.slice(0,3).join(",");
      if (seen.has(k)) continue; seen.add(k);
      low.push({ text: txt(el), color: cs.color, px: Math.round(px), ratio: cr, need });
    }
  }
  R.lowContrast = low.sort((a,b)=>a.ratio-b.ratio).slice(0,15);
  R.contrastSkippedForGradient = skipped;

  const col = document.querySelector('[class*="columns-"]');
  if (col && col.children.length > 1) {
    const kids = [...col.children];
    R.masonry = { columnCount: getComputedStyle(col).columnCount,
                  columnFill: getComputedStyle(col).columnFill,
                  childCount: kids.length,
                  heights: kids.map(k => Math.round(k.getBoundingClientRect().height)) };
  }

  /* ---- Layout / alignment instrumentation -------------------------------
     Measured, not assumed. Each check suppresses cases that are benign by
     design (visually-hidden helpers, decorative layers that are deliberately
     clipped by an ancestor) so that a reported hit is a genuine defect. */
  const shown = el => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return false;
    return !el.closest(".sr-only");
  };
  const L = (R.layout = {});
  const vpMeta = document.querySelector('meta[name="viewport"]');
  L.viewportMeta = vpMeta ? vpMeta.content : null;

  /* Container rhythm. Sections must share one horizontal inset; a straggler
     here is exactly the "one section starts further left than the rest"
     symptom. Nested containers are skipped so intentional prose columns and
     cards inside a section do not register as drift. */
  const conts = [...document.querySelectorAll(".container-page")]
    .filter(c => shown(c) && !c.parentElement?.closest(".container-page"))
    .map(c => { const r = c.getBoundingClientRect();
      return { el: sel(c), left: Math.round(r.left), right: Math.round(W - r.right), width: Math.round(r.width) }; });
  L.containers = conts;
  if (conts.length) {
    const tally = new Map();
    for (const c of conts) { const k = c.left + "/" + c.right; tally.set(k, (tally.get(k) || 0) + 1); }
    const [modal, count] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
    L.modalInset = modal;
    const modalWidth = conts.find(c => c.left + "/" + c.right === modal)?.width ?? 0;
    L.containerOutliers = {
      against: count + " of " + conts.length,
      // A deliberately narrower centred block (the admin login card sits in a
      // 672px column inside the full-width shell) is correct design, not drift.
      // What actually breaks alignment is an ASYMMETRIC inset, or a container
      // wider than the shared rhythm, so only those two cases are reported.
      list: conts.filter(c => c.left !== c.right || c.width > modalWidth),
    };
  }

  /* Real horizontal overflow. An element wider than the viewport is only a bug
     if nothing above it clips -- the tech marquee runs wider than the screen on
     purpose and is masked by its own overflow-hidden track, so reporting it
     would bury genuine offenders in noise. */
  const clipped = el => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (/hidden|clip|auto|scroll/.test(getComputedStyle(p).overflowX)) return true;
    }
    return false;
  };
  const bleed = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!shown(el) || getComputedStyle(el).position === "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.right <= W + 2 && r.left >= -2) continue;
    if (clipped(el)) continue;
    // The contact form parks a "Website" honeypot input at left:-9999px to bait
    // bots. It is parked off the LEFT edge, so it cannot widen the document and is
    // not a layout fault -- flagging it every run only trains us to ignore the
    // check. Report it once as a known artefact instead of as bleed.
    if (r.left < -1000) continue;
    bleed.push({ el: sel(el), left: Math.round(r.left), right: Math.round(r.right), text: txt(el) });
  }
  L.unclippedBleed = bleed.slice(0, 12);
  L.honeypotParkedOffscreen = !!document.querySelector('input[tabindex="-1"][aria-hidden="true"], .honeypot');

  /* Vertical rhythm: sections should open and close with the same breathing
     room. Compare each section's resolved padding rather than its class string,
     since components mix Tailwind py-* utilities with arbitrary values. */
  L.sectionRhythm = [...document.querySelectorAll("main > section")]
    .filter(shown)
    .map(s => { const cs = getComputedStyle(s);
      return { el: sel(s), padTop: Math.round(parseFloat(cs.paddingTop)),
               padBottom: Math.round(parseFloat(cs.paddingBottom)) }; });

  /* Grid ladder: how many columns each multi-card grid actually resolves to.
     Catches cards silently dropping to 4-up on a tablet or 3-up on a phone. */
  L.gridLadders = [...document.querySelectorAll(".container-page *")]
    .filter(el => { const cs = getComputedStyle(el);
      return cs.display === "grid" && cs.gridTemplateColumns.split(" ").length > 1; })
    .slice(0, 12)
    .map(el => ({ el: sel(el), cols: getComputedStyle(el).gridTemplateColumns.split(" ").length,
                  gap: getComputedStyle(el).gap }));

  /* Navbar: children must share a vertical centre and must not overlap. */
  const nav = document.querySelector("header nav") || document.querySelector("header > div");
  if (nav && shown(nav)) {
    const kids = [...nav.children].filter(shown).map(k => { const r = k.getBoundingClientRect();
      return { el: sel(k), text: txt(k), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right),
               centre: Math.round(r.top + r.height / 2) }; });
    const centres = kids.map(k => k.centre);
    const overlaps = [];
    for (let i = 0; i < kids.length - 1; i++)
      if (kids[i].right > kids[i + 1].left + 1) overlaps.push(kids[i].el + " | " + kids[i + 1].el);
    L.navbar = { childCount: kids.length,
                 centreSpread: centres.length ? Math.round(Math.max(...centres) - Math.min(...centres)) : 0,
                 overlaps, kids };
  }

  /* Hero column balance: compare the two grid tracks' heights and report how
     far off centre alignment leaves them. */
  const hero = document.querySelector("main section");
  const grid = hero && [...hero.querySelectorAll("*")].find(el =>
    getComputedStyle(el).display === "grid" &&
    el.children.length === 2 &&
    el.getBoundingClientRect().height > 150);
  if (grid) {
    const cols = [...grid.children].filter(shown).map(c => { const b = c.getBoundingClientRect();
      return { el: sel(c), w: Math.round(b.width), h: Math.round(b.height) }; });
    if (cols.length === 2) {
      const tallest = Math.max(cols[0].h, cols[1].h);
      L.heroGrid = { cols, columnGap: getComputedStyle(grid).columnGap, alignItems: getComputedStyle(grid).alignItems,
                     heightDelta: Math.round(Math.abs(cols[0].h - cols[1].h)),
                     heightDeltaPct: tallest ? Math.round(Math.abs(cols[0].h - cols[1].h) / tallest * 100) : 0 };
    }
  }

  /* Button geometry: every Button renders data-slot="button", so compare the
     heights actually shipped rather than guessing from class names. */
  const btns = [...document.querySelectorAll('[data-slot="button"]')]
    .filter(shown)
    .map(b => { const r = b.getBoundingClientRect();
      return { text: txt(b), size: b.getAttribute("data-size"), variant: b.getAttribute("data-variant"),
               h: Math.round(r.height), w: Math.round(r.width) }; });
  if (btns.length) {
    const hs = btns.map(b => b.h);
    // Heights are compared per declared size; lg next to xs is intentional, so a
    // spread across different sizes is not a defect. Only same-size rows matter.
    const bySize = new Map();
    for (const b of btns) { const k = b.size || "default";
      if (!bySize.has(k)) bySize.set(k, []); bySize.get(k).push(b.h); }
    L.buttons = { count: btns.length, bySize: [...bySize.entries()].map(([size, heights]) => ({
      size, distinct: [...new Set(heights)].sort((a, b) => a - b), n: heights.length })) };
  }

  const style = getComputedStyle(document.body);
  R.theme = { bodyBg: style.backgroundColor, bodyColor: style.color,
              htmlClass: document.documentElement.className,
              colorScheme: getComputedStyle(document.documentElement).colorScheme };
  return R;
})()`;

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.waiters = new Map(); this.handlers = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data);
      if (m.id && this.waiters.has(m.id)) { const { res, rej } = this.waiters.get(m.id); this.waiters.delete(m.id);
        if (m.error) rej(new Error(JSON.stringify(m.error))); else res(m.result); }
      else if (m.method && this.handlers.has(m.method)) this.handlers.get(m.method).forEach(f => f(m.params)); }; }
  send(method, params = {}) { const id = ++this.id;
    return new Promise((res, rej) => { this.waiters.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(method, fn) { if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn); }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval failed");
    return r.result.value;
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "cdp-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--window-size=1440,900", "about:blank"
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
const logs = [];
cdp.on("Runtime.exceptionThrown", p => logs.push({ type: "exception", text: p.exceptionDetails?.exception?.description?.split("\n")[0] || "?" }));
cdp.on("Runtime.consoleAPICalled", p => { if (["error","warning"].includes(p.type))
  logs.push({ type: p.type, text: (p.args || []).map(a => a.value ?? a.description ?? a.type).join(" ").slice(0, 160) }); });

async function visit(path, w, h) {
  logs.length = 0;
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
  const loaded = new Promise(res => cdp.on("Page.loadEventFired", res));
  await cdp.send("Page.navigate", { url: ORIGIN + path });
  await loaded;
  await cdp.eval(`(async()=>{
    if (document.fonts) await document.fonts.ready;
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 140));
    }
    window.scrollTo(0, max);
    await new Promise(r => setTimeout(r, 500));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 500));
    // Native lazy-loading only starts a request once the image nears the
    // viewport, so measuring straight after the scroll pass reports
    // not-yet-requested images as broken. Drain every pending image first
    // (bounded, so a genuinely hung request cannot stall the run).
    const pending = [...document.images].filter(i => !i.complete);
    await Promise.all(pending.map(i => new Promise(r => {
      const done = () => r();
      i.addEventListener("load", done, { once: true });
      i.addEventListener("error", done, { once: true });
      setTimeout(done, 3000);
    })));
  })()`);
  const audit = await cdp.eval(AUDIT_FN);
  return { audit, logs: [...logs] };
}

const ROUTES = process.argv[2]
  ? process.argv.slice(2).map(s => { const [p, ...r] = s.split("@"); return { p, w: +(r[0] || 1440), h: +(r[1] || 900) }; })
  : ["/","/about","/skills","/services","/projects","/graphic-design","/web-design",
     "/full-stack-development","/experience","/contact","/resume","/admin",
     "/","/projects","/graphic-design","/contact"].map((p, i) =>
     ({ p, w: i >= 12 ? 390 : 1440, h: i >= 12 ? 844 : 900 }));

const out = [];
for (const r of ROUTES) {
  try {
    const { audit, logs } = await visit(r.p, r.w, r.h);
    out.push({ route: r.p, viewport: `${r.w}x${r.h}`, ...audit, console: logs });
  } catch (e) { out.push({ route: r.p, viewport: `${r.w}x${r.h}`, error: String(e.message).slice(0, 300) }); }
}

console.log(JSON.stringify(out, null, 1));
ws.close();
chrome.kill();
try { rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);