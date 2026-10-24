# ubgo brand

The ubgo logo, icons, social card and design tokens. Everything here is generated from `brand.json` by `gen-brand.mjs` (SVG) and `raster.mjs` (PNG). Edit `brand.json` or the generator, then run `task all`. Do not edit the output files by hand.

## The mark

The recommended mark is **socket**: a bold lowercase "u" that holds one amber block. It stands for what ubgo is, a set of small parts you drop into your own service. It is two simple shapes, so it stays readable at 16 and 32 pixels and on light or dark backgrounds.

The two other options, **grid** and **brackets**, are in `concepts/` until the owner picks one. To switch, set `logo.concept` in `brand.json` and run `task all`.

## Files

| File | Use |
| --- | --- |
| `icon.svg` | Main icon, color tile, 512 master |
| `ubgo-icon-dark.svg` | Dark tile, for bright backgrounds |
| `ubgo-icon-light.svg` | Light tile, for dark backgrounds |
| `ubgo-glyph.svg` | Mark only, no tile |
| `ubgo-mono.svg` | One color via `currentColor` (terminals, print) |
| `favicon.svg`, `favicon.ico` | Browser tab icon, thicker strokes for 16px |
| `ubgo-wordmark.svg`, `ubgo-wordmark-light.svg` | The name, outlined Space Grotesk Bold |
| `ubgo-lockup.svg`, `ubgo-lockup-dark.svg` | Icon and name side by side |
| `og-card.svg`, `og-card-light.svg` | 1280x640 social card (GitHub social preview and og:image) |
| `png/ubgo-icon-512.png` (also 256, 128) | GitHub org avatar and app icons |
| `png/favicon-16/32/48.png`, `png/apple-touch-icon.png` | Favicons |
| `png/og-card.png`, `png/og-card-light.png` | Social card PNGs |
| `tokens.css`, `tokens.json`, `palette.json` | Colors and fonts for the site and other tools |
| `concepts/` | The three logo options (color, dark, light tiles) |

## Colors

| Token | Value | Use |
| --- | --- | --- |
| Tile | `#0891B2` to `#155E75` | Icon background gradient |
| Accent | `#FBBF24` | The block, highlights |
| Ink | `#0B1220` | Text on light backgrounds |
| Primary | `#0891B2` (light) / `#22D3EE` (dark) | Links and buttons on the site |

## Type

Display: Space Grotesk. Body: Inter. Code: JetBrains Mono. All three are open-source (OFL). Text in the SVGs is converted to paths, so it renders the same without the fonts installed.

## Rules

- Do not recolor the mark outside the palette. Add a tile variant instead.
- Do not stretch, rotate or add shadows. The mark is flat.
- Use `favicon.svg` below about 24px, not the full icon.
- Keep clear space of at least a quarter of the icon width around it.

## Regenerate

```sh
task all        # install pinned deps, write SVGs and tokens, rasterize
```
