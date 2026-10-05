/**
 * Internal link crawler.
 *
 * Walks the site from `/`, following same-origin <a href> targets, and reports
 * any that resolve to a non-200 status. Run against a dev or preview server:
 *
 *   node scripts/links.mjs [origin]
 */

const ORIGIN = process.argv[2] ?? "http://localhost:3000";
const seen = new Set();
const broken = [];
const external = new Set();

const SKIP_PREFIXES = ["mailto:", "tel:", "#", "javascript:"];

function isInternal(href) {
  if (!href) return false;
  if (SKIP_PREFIXES.some((p) => href.startsWith(p))) return false;
  if (/^https?:\/\//i.test(href)) {
    let url;
    try {
      url = new URL(href);
    } catch {
      return false;
    }
    if (url.origin !== ORIGIN) {
      external.add(href);
      return false;
    }
    return url.pathname + url.search;
  }
  return href;
}

/** Extracts hrefs from raw HTML plus any href set by inline scripts. */
function hrefs(html) {
  const found = [];
  for (const match of html.matchAll(/href="([^"]*)"/g)) found.push(match[1]);
  for (const match of html.matchAll(/href='([^']*)'/g)) found.push(match[1]);
  return found;
}

async function crawl(path) {
  if (seen.has(path)) return;
  seen.add(path);

  const response = await fetch(ORIGIN + path, { redirect: "manual" });
  const status = response.status;

  if (status !== 200) {
    broken.push({ path, status });
    return;
  }

  const html = await response.text();
  for (const href of hrefs(html)) {
    const target = isInternal(href);
    if (typeof target === "string" && target) {
      const clean = target.split("#")[0];
      if (clean && clean !== path) await crawl(clean);
    }
  }
}

await crawl("/");

console.log(`Crawled ${seen.size} internal pages from ${ORIGIN}`);
console.log(broken.length ? `BROKEN (${broken.length}):` : "No broken internal links.");
for (const item of broken) console.log(`  ${item.status}  ${item.path}`);
console.log(`\nExternal links (not checked): ${external.size}`);
for (const href of [...external].sort()) console.log(`  ${href}`);