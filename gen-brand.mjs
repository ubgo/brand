// ubgo brand kit generator — the single source of truth for the ubgo identity.
// Run: node gen-brand.mjs  → writes every SVG mark, the 3 concept options and the
// design tokens into this folder. Then `node raster.mjs` makes the PNGs + favicon.ico.
//
// All text (wordmark, lockups, social card) is converted to vector paths with
// opentype.js, so the SVGs render the same everywhere and the rasterizer needs no
// installed fonts. Colors, fonts and copy come from brand.json — edit that, re-run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import opentype from "opentype.js"

const OUT = dirname(fileURLToPath(import.meta.url))
const B = JSON.parse(readFileSync(join(OUT, "brand.json"), "utf8"))

// ── Manifest (from brand.json) ───────────────────────────────────────────────
const C = B.colors
const M = {
  name: B.name,
  tile: C.tile, fg: C.fg, accent: C.accent, radius: 112,
  dark: C.darkTile, darkFg: C.darkFg,
  light: C.lightTile, lightFg: C.lightFg, lightAccent: C.lightAccent,
  ink: C.ink,
}

// ── Fonts: outlined to paths (OFL fonts from @fontsource) ────────────────────
const font = (pkg, file) => opentype.loadSync(join(OUT, "node_modules/@fontsource", pkg, "files", file))
const DISPLAY = font("space-grotesk", "space-grotesk-latin-700-normal.woff")
const DISPLAY_MED = font("space-grotesk", "space-grotesk-latin-500-normal.woff")
const MONO = font("jetbrains-mono", "jetbrains-mono-latin-500-normal.woff")

// textPath returns an SVG <path> for `str` with its left edge at x and baseline at y.
// letterSpacing is in font units scaled to px (negative tightens).
function textPath(f, str, x, y, size, fill, letterSpacing = 0) {
  let d = ""
  let cx = x
  for (const ch of str) {
    const g = f.charToGlyph(ch)
    d += g.getPath(cx, y, size).toPathData(2)
    cx += (g.advanceWidth / f.unitsPerEm) * size + letterSpacing
  }
  return { svg: `<path d="${d}" fill="${fill}"/>`, width: cx - x - letterSpacing }
}

// ── The three glyph concepts (512×512 space) ─────────────────────────────────
// Every concept tells the same story: ubgo is a set of parts you drop into a
// service. `fav:true` is the favicon path — thicker, with no fine detail.
const GLYPHS = {
  // A · Socket — a bold "u" that holds one block: the library dropping into place.
  socket: (fg, accent, { fav = false } = {}) => {
    const w = fav ? 76 : 64
    return `<path d="M176 140 V276 a80 80 0 0 0 160 0 V140" stroke="${fg}" stroke-width="${w}" stroke-linecap="round" fill="none"/>
  <rect x="${fav ? 222 : 226}" y="${fav ? 196 : 202}" width="${fav ? 68 : 60}" height="${fav ? 68 : 60}" rx="14" fill="${accent}"/>`
  },
  // B · Grid — a "u" built from module cells, one part sliding into the open slot.
  grid: (fg, accent) => {
    const s = 88, gap = 20, o = 104
    const at = (c, r) => `<rect x="${o + c * (s + gap)}" y="${o + r * (s + gap)}" width="${s}" height="${s}" rx="18"/>`
    const cells = [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2], [1, 2]].map(([c, r]) => at(c, r)).join("")
    return `<g fill="${fg}">${cells}</g>
  <rect x="${o + s + gap + 14}" y="${o + 14}" width="${s - 28}" height="${s - 28}" rx="12" fill="${accent}"/>`
  },
  // C · Brackets — a core plus adapters (three stacked bars) inside code brackets.
  brackets: (fg, accent) =>
    `<g stroke="${fg}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M168 132 H128 V380 H168"/><path d="M344 132 H384 V380 H344"/>
  </g>
  <rect x="196" y="176" width="120" height="40" rx="20" fill="${accent}"/>
  <g fill="${fg}"><rect x="196" y="236" width="120" height="40" rx="20"/><rect x="196" y="296" width="80" height="40" rx="20"/></g>`,
}
const CHOSEN = B.logo.concept // recommended concept, see brand.json → logo
const GLYPH = GLYPHS[CHOSEN]

// ── Generic machinery ────────────────────────────────────────────────────────
const grad = (id, a, b, x2 = 512, y2 = 512) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`
const open = (w, h, label) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">`
const W = (f, s) => writeFileSync(join(OUT, f), s)

const tile = (id, a, b) => `<defs>${grad(id, a, b)}</defs>\n  <rect width="512" height="512" rx="${M.radius}" fill="url(#${id})"/>`
const iconFile = (glyph, id, a, b, fg, accent, opts) =>
  `${open(512, 512, `${M.name} logo`)}\n  ${tile(id, a, b)}\n  ${glyph(fg, accent, opts)}\n</svg>\n`

// ── Concept options (kept until the owner picks; see preview page) ───────────
mkdirSync(join(OUT, "concepts"), { recursive: true })
for (const [key, g] of Object.entries(GLYPHS)) {
  W(`concepts/${key}.svg`, iconFile(g, `c-${key}`, M.tile[0], M.tile[1], M.fg, M.accent))
  W(`concepts/${key}-dark.svg`, iconFile(g, `cd-${key}`, M.dark[0], M.dark[1], M.darkFg, M.accent))
  W(`concepts/${key}-light.svg`, iconFile(g, `cl-${key}`, M.light[0], M.light[1], M.lightFg, M.lightAccent))
}

// ── Full kit for the chosen concept ──────────────────────────────────────────
const n = M.name
W("icon.svg",            iconFile(GLYPH, "g-color", M.tile[0], M.tile[1], M.fg, M.accent))
W(`${n}-icon-dark.svg`,  iconFile(GLYPH, "g-dark",  M.dark[0], M.dark[1], M.darkFg, M.accent))
W(`${n}-icon-light.svg`, iconFile(GLYPH, "g-light", M.light[0], M.light[1], M.lightFg, M.lightAccent))
W("favicon.svg",         iconFile(GLYPH, "g-fav",   M.tile[0], M.tile[1], M.fg, M.accent, { fav: true }))
W(`${n}-glyph.svg`,      `${open(512, 512, `${n} glyph`)}\n  ${GLYPH(M.lightFg, M.lightAccent)}\n</svg>\n`)
W(`${n}-mono.svg`,       `${open(512, 512, n)}\n  ${GLYPH("currentColor", "currentColor")}\n</svg>\n`)

// Wordmark: "ubgo" in Space Grotesk Bold, outlined.
const wm = (fill) => textPath(DISPLAY, n, 0, 104, 132, fill, -4)
const wmW = Math.ceil(wm("#000").width) + 4
W(`${n}-wordmark.svg`,       `${open(wmW, 140, n)}\n  ${wm(M.ink).svg}\n</svg>\n`)
W(`${n}-wordmark-light.svg`, `${open(wmW, 140, n)}\n  ${wm("#FFFFFF").svg}\n</svg>\n`)

// Lockup: icon + wordmark, horizontal.
const lockup = (id, textFill) => {
  const t = textPath(DISPLAY, n, 176, 140, 124, textFill, -4)
  const w = Math.ceil(176 + t.width + 24)
  return `${open(w, 200, n)}
  <g transform="translate(20,36) scale(0.25)">
    ${tile(id, M.tile[0], M.tile[1])}
    ${GLYPH(M.fg, M.accent)}
  </g>
  ${t.svg}
</svg>
`
}
W(`${n}-lockup.svg`,      lockup("l-color", M.ink))
W(`${n}-lockup-dark.svg`, lockup("l-dark", "#FFFFFF"))

// Social card, 1280×640 (GitHub social preview size; also used as og:image).
const og = (file, bgA, bgB, main, sub1, sub2, rule, chipBg, chipFg) => {
  const title = textPath(DISPLAY, n, 448, 282, 140, main, -5)
  const tag = textPath(DISPLAY_MED, B.tagline, 452, 404, 32, sub1)
  const areas = textPath(MONO, B.areasLine, 452, 456, 20, sub2)
  const url = textPath(MONO, B.org.replace("https://", ""), 468, 535, 22, chipFg)
  W(file, `${open(1280, 640, `${n} — ${B.tagline}`)}
  <defs>${grad("og-bg", bgA, bgB, 1280, 640)}${grad("og-ic", M.tile[0], M.tile[1])}</defs>
  <rect width="1280" height="640" fill="url(#og-bg)"/>
  <g transform="translate(96,172) scale(0.58)"><rect width="512" height="512" rx="${M.radius}" fill="url(#og-ic)"/>${GLYPH(M.fg, M.accent)}</g>
  ${title.svg}
  <rect x="454" y="350" width="96" height="8" rx="4" fill="${rule}"/>
  ${tag.svg}
  ${areas.svg}
  <rect x="452" y="504" width="${Math.ceil(url.width) + 32}" height="46" rx="10" fill="${chipBg}"/>
  ${url.svg}
</svg>
`)
}
og("og-card.svg",       M.dark[0], M.dark[1], "#FFFFFF", "#E2E8F0", "#94A3B8", M.accent, "#1E293B", "#67E8F9")
og("og-card-light.svg", "#FFFFFF", M.light[0], M.ink, "#1E293B", "#475569", M.tile[0], "#CFFAFE", M.lightFg)

// ── Tokens ───────────────────────────────────────────────────────────────────
const F = B.fonts
const stack = {
  display: `'${F.display}', ui-sans-serif, system-ui, sans-serif`,
  sans: `'${F.sans}', ui-sans-serif, system-ui, sans-serif`,
  mono: `'${F.mono}', ui-monospace, SFMono-Regular, Menlo, monospace`,
}
W("tokens.css",
`/* Generated by gen-brand.mjs from brand.json — do not edit by hand. */
:root{
  --${n}-tile-a:${M.tile[0]}; --${n}-tile-b:${M.tile[1]};
  --${n}-accent:${M.accent}; --${n}-ink:${M.ink};
  --${n}-font-display:${stack.display};
  --${n}-font-sans:${stack.sans};
  --${n}-font-mono:${stack.mono};
}
`)
W("palette.json", `${JSON.stringify({ name: n, ...C }, null, 2)}\n`)
W("tokens.json", `${JSON.stringify({ name: n, color: C, font: { ...F, stack }, radius: { tile: `${M.radius}@512` }, icon: { png: [16, 32, 48, 128, 180, 256, 512], social: [1280, 640] } }, null, 2)}\n`)

console.log(`ubgo brand kit written (concept: ${CHOSEN})`)
