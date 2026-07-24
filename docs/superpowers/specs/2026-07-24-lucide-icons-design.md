# Replace emoji/glyph stand-ins with self-hosted Lucide icons

## Problem

The mock UI previews (`mocks.js`) and page chrome (`index.html`) use a mix of
colorful emoji (📅 🛜 🔔 🔋 🗑 🔍 🌐 🖼️ ☝) and plain Unicode symbols (← → ↑ ↓ ✓ ✕
☰ ⋮ ▾ › ◻ ◉) as stand-ins for icons. Emoji render inconsistently across
platforms/fonts and don't match either platform's visual language. The plain
symbols are more consistent but still look like typography, not icons.

The site has **no build step** — per `README.md`, "Still no build step — just
plain static files served as-is." Any solution must work as a plain
`<script src>` with no bundler, package manager, or CDN dependency beyond what
already exists (Google Fonts).

## Goals

- Replace every icon-standing-in glyph (emoji and Unicode symbol alike) with a
  real icon from a single, free, neutral icon library.
- No new runtime/network dependency — icons are self-hosted, vendored as
  inline SVG.
- Icons inherit color via `currentColor` so they keep working with existing
  per-platform accent colors, dark mode, etc., the same way the monochrome
  glyphs did.
- Fix incidental inaccuracies noticed along the way (e.g. the tab-bar
  "Profile" tab currently shows a hamburger-menu glyph ☰ instead of a
  person/profile icon).

## Non-goals

- Not switching to per-platform-accurate icon sets (SF Symbols vs Material
  Symbols) — a single neutral set is enough, per user direction ("doesn't
  have to be 100% accurate, being better than emojis is enough").
- Not adding a build step, package.json, or bundler.
- Not touching the decorative `↔` in the page `<h1>` ("iOS ↔ Android") — this
  is branding/typography, not a mock-UI icon.
- Not touching typographic punctuation: `·` `—` `–` `…`.

## Approach

### New file: `icons.js`

A small vendored module, loaded via `<script src="icons.js">` in
`index.html`, before `mocks.js` (which is the only consumer). Structure:

```js
const ICONS = {
  menu: '<path d="..."/>',
  'chevron-left': '<path d="..."/>',
  // ... one entry per icon name, inner SVG markup only
};

function icon(name, opts = {}) {
  // returns a string: <svg class="m-icon ..." viewBox="0 0 24 24" ...>{ICONS[name]}</svg>
}
```

Each entry's path data is copied verbatim from Lucide's published SVG source
(MIT licensed) — not reconstructed from memory — so the icons render
correctly. Only the icons actually used are vendored (~20), not the whole
library.

### Styling: `.m-icon` in `styles.css`

```css
.m-icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: -0.15em;
  stroke: currentColor;
  fill: none;
  flex-shrink: 0;
}
```

This mirrors how the emoji/glyphs scaled with surrounding `font-size` and
inherited `color`. Call sites that need a different size (e.g. status bar
icons, the badge icon) pass a size override via `opts` to `icon()` or get a
small modifier class; this is decided per call site during implementation,
not enumerated exhaustively here.

### Call-site changes: `mocks.js` and `index.html`

Every template-string occurrence of a stand-in glyph is replaced with a call
to `icon('name')`, e.g.:

```js
// before
`<div><span>⋮</span></div>`
// after
`<div>${icon('more-vertical')}</div>`
```

### Full replacement map

| Current glyph | Where | Lucide icon |
|---|---|---|
| ☰ | drawer toggle button (`index.html`) | `menu` |
| ☰ | tab-bar "Profile" tab (was mislabeled) | `user` |
| ‹ Back | iOS navbar / back-row mock | `chevron-left` (+ "Back" text kept) |
| ← | Android navbar / back-row / constraints diagram | `arrow-left` |
| → | constraints diagram | `arrow-right` |
| ↑ | constraints diagram | `arrow-up` |
| ↓ | constraints diagram | `arrow-down` |
| ⋮ | Android overflow menu anchor | `more-vertical` |
| ••• | iOS overflow menu anchor | `more-horizontal` |
| ◻ | tab-bar "Home" tab | `home` |
| ◉ | tab-bar "Search" tab | `search` |
| ☝︎ | "long-press item" caption (context menu mock) | `pointer` |
| 📅 | Android date-dropdown mock | `calendar` |
| ▾ | dropdown caret (date picker, picker mocks) | `chevron-down` |
| ✓ | checkbox mock | `check` |
| ✓ | iOS radio-list selected row | `check` |
| 🔍 | search bar mocks (iOS + Android) | `search` |
| 🔍 | Android action-button highlight | `search` |
| › | iOS list chevron | `chevron-right` |
| 🖼️ | image-view placeholder | `image` |
| 🌐 | webview address bar | `globe` |
| ⬇ | iOS action-button highlight | `download` |
| 🗑 | Android action-sheet "Delete" row | `trash-2` |
| ↪ | Android action-sheet "Forward" row | `forward` |
| ✕ | fullscreen-cover close (Android) | `x` |
| 🔔 | notification badge icon | `bell` |
| 🔔 | Android status bar | `bell` |
| 🛜 | status bar (iOS + Android) | `wifi` |
| 🔋 | status bar (iOS + Android) | `battery` |
| ••• (status bar) | iOS status bar signal indicator | `signal` |

Left unchanged: `↔` in the `<h1>`, and `·` `—` `–` `…` used as typographic
separators.

## Error handling

None needed — this is static markup generation with a fixed, known set of
icon names. If a lookup ever misses (typo in an icon name), that's a coding
mistake caught by visually reviewing the page, not a runtime condition to
guard against.

## Testing

Manual verification in the browser: load the page, expand every mock preview
in both the iOS and Android columns, and visually confirm each icon renders
(no missing/broken `<svg>`), scales correctly at its context's font-size, and
inherits the expected color (including in dark mode, if the page has one, and
against both platform accent colors).

## Files touched

- `icons.js` (new)
- `index.html` (script tag, drawer-toggle hamburger)
- `mocks.js` (all glyph → `icon()` call replacements)
- `styles.css` (`.m-icon` rule, any per-context size tweaks)
