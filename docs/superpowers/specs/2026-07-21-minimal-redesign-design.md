# Minimal/Professional Redesign — Design Spec

Date: 2026-07-21
Branch: `redesign/minimal-professional`

## Context

The page (a single-file iOS↔Android UI Component Cheatsheet) currently
uses a warm/colorful, playful visual language (saturated iOS blue /
Android green, a diagonal gradient hero, drop-shadowed mock previews)
and an all-inline-in-`index.html` code structure. This spec covers a
from-scratch redesign to a more minimalistic, professional visual
language, a rethought page layout/navigation, and a split-file code
structure — done on a separate branch, not as an incremental patch.

Prior to this branch, `main` already received two smaller fixes in
this session: collapsing the mobile category-filter chips behind a
toggle, and restructuring entry cards to title → description →
platform row. Both are superseded by this redesign (the mobile filter
problem is solved properly here via a sidebar/drawer; the entry row
shape changes again to foreground the enhanced previews) but remain
on `main` as the pre-redesign baseline.

## 1. Visual system — "Quiet Platform Mirror"

Keep the core identity that already works (iOS blue / Android green
tied to each platform's real system color) but desaturate it so color
reads as a small accent, not full-saturation UI chrome.

### Color tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAFAFA` | page background (neutral off-white, cooler than today's warm cream) |
| `--surface` | `#FFFFFF` | cards/panels |
| `--ink` | `#111318` | primary text |
| `--ink-soft` | `#6B7078` | secondary text, labels |
| `--line` | `#E4E4E7` | hairline borders (neutral gray, not today's warm tan) |
| `--ios` | muted blue (desaturated from `#0A84FF`) | dots, small accents, backgrounds |
| `--ios-text` | darker blue, chosen to clear 4.5:1 on white | `.term.ios` text only |
| `--android` | muted green (desaturated from `#189B5F`) | dots, small accents, backgrounds |
| `--android-text` | darker green, chosen to clear 4.5:1 on white | `.term.android` text only |

Splitting each platform color into a "chrome" shade and a separate
"text" shade fixes a real accessibility bug found during review:
today's `.term.ios` / `.term.android` colors measure ~3.6:1 / ~3.56:1
contrast against white, both failing WCAG AA's 4.5:1 for normal-size
text. The text-only shades must be verified ≥4.5:1 during
implementation.

### Type

Keep the Roboto / Roboto Mono pairing — Roboto is genuinely Android's
system font, so it's a subject-appropriate choice, not a generic
default. Reduce the hero's weight/scale (700 instead of 900, smaller
`clamp()` range, less vertical padding) so the page opens quietly
instead of as a poster headline. Roboto Mono continues to carry
labels, framework names, and utility text (already established and
working).

### Shape / elevation rule

A single explicit rule governs shadows and radii everywhere:

- **Page chrome** (cards, containers, buttons, the sidebar, dialogs
  that are part of the site's own UI): flat, hairline-bordered, no
  drop shadows. This is where "minimal" comes from.
- **Mock previews** (the `.m-*` renderers depicting real iOS/Android
  components): keep whatever elevation the real platform actually
  uses. Material genuinely specs elevation shadows; iOS uses shadow
  sparingly. This is accuracy, not decoration, and must not be
  flattened just because the surrounding chrome is flat.

### Signature element

The page's memorable, distinctive element moves from the old diagonal
gradient hero to the mock previews themselves: every preview now sits
inside a partial device silhouette that shows *where on a real
screen* the component lives — a nav bar pinned to the silhouette's
top edge, a tab bar/home indicator at its bottom, a drawer sliding
from its side edge, a sheet rising from its bottom edge. This directly
serves the goal of making previews "more visually connectable" and
becomes the one place the design spends its boldness.

## 2. Layout / IA

```
+---------------------------------------------------------+
| Masthead (quiet hero, full width)                        |
+------------------+----------------------------------------+
| Sidebar (sticky)  | Main content                          |
| - Search input    | - Category sections in scroll order   |
| - Category links  |   - Entry rows (see below)            |
|   (scrollspy)     |                                        |
| - Hide-examples    |                                        |
|   toggle           |                                        |
+------------------+----------------------------------------+
```

- **Masthead**: quiet version of today's hero — eyebrow, headline
  with colored iOS/Android words as the only hero color accent, one
  line of lede copy. No diagonal gradient background.
- **Sidebar** (desktop, sticky, ~260px): search input at top, then the
  category list as real `<a href="#category-slug">` anchor links
  (keyboard/screen-reader native — an upgrade over today's JS-only
  chip buttons), each showing its **static** item count. A
  scrollspy (`IntersectionObserver` on each category section)
  highlights whichever category is currently in view. The
  "hide/show all examples" toggle sits as a small utility control
  at the bottom of the sidebar.
- **Mobile** (below 900px, chosen so the ~260px sidebar plus a
  readable content column no longer both fit comfortably): the
  sidebar becomes a
  slide-out drawer opened by a single button near the top of the
  content. This fully replaces the "Filter: All ▾" chip toggle
  shipped earlier this session — same underlying need (find a
  category without eating the screen), solved with the pattern it
  actually called for. Drawer closes on Escape and on
  outside-click, returning focus to its toggle button.
- **Search** filters entries within the main content (same
  substring-match behavior as today, matched against concept, both
  platform terms/frameworks, and description). It does **not**
  recompute sidebar category counts — the sidebar is a static table
  of contents, not a live filter facet. This keeps sidebar behavior
  simple and avoids counts flickering while typing.
- **Category sections**: unchanged in spirit — grouped, in a fixed
  order, each with a heading and count — but now are scroll targets
  for the sidebar rather than the whole page's only navigation.

## 3. Entry row design

Each entry becomes:

```
[ Concept title ]
[ one-line description, muted ]
-------------------------------------------------
[ iOS: term + framework    ]  [ Android: term + framework  ]
[ device-frame preview     ]  [ device-frame preview       ]
```

The two platform halves sit side by side when there's room and wrap
to stacked top/bottom via `flex-wrap` when narrow (no fixed
breakpoint tied to the overall page breakpoint — it responds to the
entry's own available width, same technique already validated
earlier this session).

This replaces both today's baseline (a 4-column table row) and the
session's intermediate change (title → description → separate
collapsible preview block below). The preview now sits directly next
to the term/framework text it illustrates instead of behind a
detached disclosure — pairing text and its own visual directly is
what "more visually connectable" means concretely here. The
"hide/show all examples" toggle still works the same way (a CSS
class controlling preview visibility), just applied to previews that
now live inside each platform half rather than a separate block.

Entries with no native equivalent (`none: true`) keep the existing
dashed-circle "ghost" placeholder inside their device frame, restyled
to the quiet palette — no conceptual change.

## 4. Code organization

Splitting into plain, sequentially-loaded scripts — no `type="module"`,
because ES module imports fail under `file://` (Chrome blocks
cross-origin module fetches for local files), and this project's core
promise is "no build step, just open the file." Plain global-scope
scripts preserve that.

```
index.html   — markup shell only: masthead, sidebar shell, main shell, footer.
               <link rel="stylesheet" href="styles.css">
               <script src="data.js"></script>
               <script src="mocks.js"></script>
               <script src="app.js"></script>
styles.css   — all styles, sectioned with comments:
               tokens -> base/reset -> masthead -> sidebar -> main/category
               -> entry -> platform-row/preview -> mock-preview (.m-*) components
data.js      — const DATA = [...]; const CATEGORY_ORDER = [...]
mocks.js     — const MOCKS = {...}; function codeCard(...)
app.js       — render(), search wiring, sidebar nav + scrollspy,
               drawer open/close, examples toggle
```

`README.md` gets updated to match: the contribution model changes
from "edit the DATA array/MOCKS block near the top of index.html"
to "edit `data.js` for a new entry, `mocks.js` for a new preview
renderer" — still no build step, still plain static files served
as-is by GitHub Pages.

## 5. Accessibility

Carried over from the prior review, now addressed at the token/system
level instead of patched:

- `--ios-text` / `--android-text` verified ≥4.5:1 against `--bg`/`--surface`.
- `@media (prefers-reduced-motion: reduce)` disables/shortens the
  infinite mock animations (activity-indicator spin, haptic pulse)
  and the scrollspy's smooth scroll.
- Sidebar/drawer: Escape closes it, focus returns to its toggle
  button. Category links are real anchors, reachable and operable
  by keyboard without custom JS.
- Visible focus states kept on all interactive elements (search
  input, sidebar links, toggle buttons) — no `outline: none` without
  a replacement focus style.

Explicitly out of scope (YAGNI): a full modal focus-trap inside the
mobile drawer. It's a low-stakes reference page, not a form or
checkout flow; Escape-to-close plus native tab order is enough.

## 6. Edge cases

- **No search results**: keep today's empty-state message, restyled
  to the quiet palette.
- **Filtering to zero items in a category**: that category section
  disappears from main content (as today); its sidebar link stays
  present (static TOC) but simply won't have anything to scroll to
  until the search is cleared.
- **`none: true` platform entries**: unchanged behavior, restyled
  ghost placeholder (see §3).
- **Very long category list in the mobile drawer**: drawer panel
  scrolls internally; no special handling needed beyond
  `overflow-y: auto`.

## 7. Verification plan

Since this is a static page with no test suite, verification is
manual, in an actual browser (opened directly via `file://`, matching
how contributors will realistically preview it):

1. Desktop width: confirm sidebar is sticky, search filters content,
   scrollspy highlights the in-view category as you scroll.
2. Resize to mobile width: confirm the drawer opens/closes via its
   toggle, Escape closes it, focus returns correctly.
3. Recompute `--ios-text` / `--android-text` contrast against
   `--bg`/`--surface` and confirm ≥4.5:1.
4. Spot-check at least the navbar, tabbar, drawer, and sheet mock
   previews to confirm the device-silhouette positioning reads
   correctly (top-pinned, bottom-pinned, edge-sliding, bottom-rising
   respectively).
5. Emulate `prefers-reduced-motion: reduce` in devtools and confirm
   the spinner/pulse animations stop or shorten.
6. Confirm `index.html` still opens and fully renders via direct
   double-click (no local server), proving the script-splitting
   didn't reintroduce a build step or module-loading requirement.
