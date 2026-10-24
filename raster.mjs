// Rasterizes the generated SVGs into png/ and builds favicon.ico.
// Run after gen-brand.mjs. Uses @resvg/resvg-js (no system tools needed); all
// text in the SVGs is already outlined, so no fonts are needed here either.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"

const OUT = dirname(fileURLToPath(import.meta.url))
const PNG = join(OUT, "png")
mkdirSync(PNG, { recursive: true })

function render(svgFile, width, outFile) {
  const svg = readFileSync(join(OUT, svgFile), "utf8")
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng()
  writeFileSync(join(PNG, outFile), png)
  return png
}

// [source svg, width, output] — square icons for the GitHub org avatar and apps.
const jobs = [
  ["favicon.svg", 16, "favicon-16.png"],
  ["favicon.svg", 32, "favicon-32.png"],
  ["favicon.svg", 48, "favicon-48.png"],
  ["icon.svg", 128, "ubgo-icon-128.png"],
  ["icon.svg", 180, "apple-touch-icon.png"],
  ["icon.svg", 256, "ubgo-icon-256.png"],
  ["icon.svg", 512, "ubgo-icon-512.png"],
  ["ubgo-icon-dark.svg", 512, "ubgo-icon-dark-512.png"],
  ["ubgo-icon-light.svg", 512, "ubgo-icon-light-512.png"],
  ["ubgo-glyph.svg", 512, "ubgo-glyph-512.png"],
  ["ubgo-wordmark.svg", 600, "ubgo-wordmark.png"],
  ["ubgo-wordmark-light.svg", 600, "ubgo-wordmark-light.png"],
  ["ubgo-lockup.svg", 620, "ubgo-lockup.png"],
  ["ubgo-lockup-dark.svg", 620, "ubgo-lockup-dark.png"],
  ["og-card.svg", 1280, "og-card.png"],
  ["og-card-light.svg", 1280, "og-card-light.png"],
]
const out = {}
for (const [src, w, dst] of jobs) out[dst] = render(src, w, dst)

// favicon.ico with PNG-encoded 16/32/48 entries (supported by every current browser).
const sizes = [["favicon-16.png", 16], ["favicon-32.png", 32], ["favicon-48.png", 48]]
const header = Buffer.alloc(6 + 16 * sizes.length)
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4)
let offset = header.length
sizes.forEach(([f, s], i) => {
  const e = 6 + i * 16
  header.writeUInt8(s, e); header.writeUInt8(s, e + 1); header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3)
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6)
  header.writeUInt32LE(out[f].length, e + 8); header.writeUInt32LE(offset, e + 12)
  offset += out[f].length
})
writeFileSync(join(OUT, "favicon.ico"), Buffer.concat([header, ...sizes.map(([f]) => out[f])]))
console.log(`wrote ${jobs.length} PNGs + favicon.ico`)
