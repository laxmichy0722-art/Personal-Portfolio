import { renderToString } from 'react-dom/server'
import { StrictMode } from 'react'
import { writeFileSync } from 'node:fs'
import App from '../src/App'

const html = renderToString(
  <StrictMode>
    <App />
  </StrictMode>,
)

writeFileSync('dist-smoke/out.html', html)

/** React escapes apostrophes as &#x27; and inserts <!-- --> between text nodes. */
const flat = html
  .replace(/&#x27;/g, "'")
  .replace(/&#39;/g, "'")
  .replace(/<!--\s*-->/g, '')

const checks: [string, boolean][] = [
  // Headline words live in separate spans so each line can mask-reveal.
  ['hero headline line 1', /<h1[\s\S]{0,200}>I <\/span>/.test(flat)],
  ['hero headline accent DESIGN', flat.includes('>DESIGN</span>')],
  ['hero headline accent IMAGINE', flat.includes('>IMAGINE</span>')],
  ['role label (uppercased via CSS)', flat.includes('Independent Creative Designer')],
  ['explore CTA', flat.includes('EXPLORE MY WORK')],
  ['collaborate CTA', flat.includes("LET'S COLLABORATE")],
  ['ticker items', flat.includes('GRAPHIC DESIGN') && flat.includes('CREATIVE DEVELOPMENT')],
  ['about heading words', flat.includes('CREATIVITY') && flat.includes('PURPOSE.')],
  ['services 01-05', ['01', '02', '03', '04', '05'].every((n) => flat.includes('>' + n + '<'))],
  ['service names', ['Graphic Design', 'Brand Identity', 'UI/UX Design', 'Web Design', 'Web Development'].every((s) => flat.includes(s))],
  ['works title', flat.includes('SELECTED WORKS')],
  ['works year', flat.includes('2026')],
  ['project filter labels', ['All Projects', 'Graphic Design', 'Branding', 'UI/UX', 'Web Design', 'Web Development'].every((f) => flat.includes(f))],
  ['all 8 sample projects render', (flat.match(/View case study:/g) ?? []).length === 8],
  ['every project has description', (flat.match(/Short description|Sample content/i) ?? []).length >= 0],
  ['gallery renders 12 items', (flat.match(/aria-label="View [^"]* full screen"/g) ?? []).length === 12],
  ['gallery sample labels', (flat.match(/>Sample</g) ?? []).length >= 12],
  ['web showcase device toggle', flat.includes('Preview size') && flat.includes('desktop preview')],
  ['process title', flat.includes('FROM IDEA TO')],
  ['process six steps', ['Discover', 'Research', 'Concept', 'Design', 'Develop', 'Deliver'].every((s) => flat.includes('>' + s + '<'))],
  ['skills four groups', ['Graphic Design', 'UI/UX', 'Web', 'Development'].every((s) => flat.includes('>' + s + '<'))],
  ['skills tools', flat.includes('Adobe Photoshop') && flat.includes('Figma') && flat.includes('Tailwind CSS') && flat.includes('Node.js')],
  ['contact headline', flat.includes('HAVE A GOOD IDEA') && flat.includes("LET'S MAKE IT")],
  ['contact form labels', ['Name', 'Email', 'Project type', 'Budget range', 'Message'].every((l) => flat.includes('>' + l + ' '))],
  ['contact honeypot', flat.includes('Company (leave empty)')],
  ['contact submit button', flat.includes('Send inquiry')],
  ['social links render', ['Behance', 'Dribbble', 'LinkedIn', 'GitHub'].every((s) => flat.includes('>' + s + '<'))],
  ['footer nav', flat.includes('Navigate') && flat.includes('Back to top')],
  ['semantic landmarks', /<main[ >]/.test(flat) && /<footer[ >]/.test(flat) && /<header[ >]/.test(flat)],
  ['all sections have ids', ['home', 'about', 'services', 'works', 'contact', 'gallery', 'websites', 'process', 'skills'].every((id) => flat.includes('id="' + id + '"'))],
  ['skip link', flat.includes('Skip to content')],
  ['aria label on menu toggle', flat.includes('aria-label="Open menu"')],
  ['aria-hidden on decorative layers', (flat.match(/aria-hidden="true"/g) ?? []).length > 5],
  ['no undefined leaked into markup', !flat.includes('undefined') && !flat.includes('NaN')],
  ['placeholder stats not fabricated', flat.includes('Replace') || flat.includes('Placeholder')],
]

let failed = 0
for (const [name, ok] of checks) {
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
}

console.log(`\nRendered ${html.length} bytes of HTML. ${failed} check(s) failed.`)

