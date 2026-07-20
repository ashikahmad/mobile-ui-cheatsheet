# Minimal/Professional Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single-file iOS↔Android UI Component Cheatsheet (`index.html`) into `index.html` + `styles.css` + `data.js` + `mocks.js` + `app.js`, apply the desaturated "quiet platform mirror" visual system with contrast-safe text colors, replace the top search/filter bar with a docs-style sticky sidebar (mobile: slide-out drawer) driven by scrollspy, and give the ten screen-position-relevant mock previews a device-silhouette treatment.

**Architecture:** Data (`data.js`) and preview renderers (`mocks.js`) become plain global-scope scripts with no behavior change beyond the preview enhancement; `app.js` owns all DOM wiring (render, search, sidebar nav, scrollspy, drawer) behind a single `DOMContentLoaded` listener; `styles.css` carries the full token system. All four are loaded by `index.html` via ordinary sequential `<script>`/`<link>` tags — no bundler, no ES modules.

**Tech Stack:** Plain HTML/CSS/JS, zero dependencies, zero build step, verified with Node one-liners (`node -e`) for pure-data checks and manual browser verification for DOM/interaction behavior.

## Global Constraints

- No build step. `index.html` must keep working when opened directly via `file://` (double-click) — this rules out `<script type="module">`, since Chrome blocks cross-origin module fetches for local files.
- Exactly five files own the page: `index.html`, `styles.css`, `data.js`, `mocks.js`, `app.js`. No others.
- `--ios-text` and `--android-text` (the colors used for `.term` text) must each measure **≥4.5:1** contrast against `--surface` (`#FFFFFF`), per WCAG AA for normal-size text.
- Page chrome (sidebar, drawer, entry cards, masthead) stays flat: hairline borders, no decorative drop shadows. Mock preview (`.m-*`) shadows/elevation are platform-accuracy, not decoration, and must NOT be flattened.
- Sidebar → drawer breakpoint is **900px** (`max-width:899px` triggers drawer mode).
- `@media (prefers-reduced-motion: reduce)` must disable/shorten the infinite mock animations and smooth scrolling.
- Sidebar category counts are static (a table of contents); search filters `main` content only and never touches the sidebar list.

---

## Current State (for reference)

`index.html` on branch `redesign/minimal-professional` (identical to `main` at commit `130a91b`) is ~1266 lines: inline `<style>` (lines 9-559), a `DATA` array of **47 entries across 8 categories** (lines 592-796), a `MOCKS` object of **48 renderer functions** plus `codeCard()` (lines 801-1127), and `renderPreview()`/`platformCell()`/`render()`/control-wiring (lines 1129-1262).

---

### Task 1: Extract `data.js`

**Files:**
- Create: `data.js`
- Modify: none yet (index.html still works as-is; cutover happens in Task 5)

**Interfaces:**
- Produces: `const DATA` (array of 47 entry objects, each `{cat, concept, demo, ios:{term, fw, none?}, android:{term, fw, none?}, desc}`), `const CATEGORY_ORDER` (array of the 8 distinct `cat` values in first-seen order).

- [ ] **Step 1: Create `data.js`**

Copy the `DATA` array and `CATEGORY_ORDER` line verbatim from the current `index.html:592-798` (from `const DATA = [` through `const CATEGORY_ORDER = [...new Set(DATA.map(d => d.cat))];`) into a new file `data.js`, with no other content — no wrapping, no exports, just the two `const` declarations exactly as they appear today.

- [ ] **Step 2: Verify entry/category counts**

Run:
```bash
node -e "
eval(require('fs').readFileSync('data.js','utf8'));
console.log('entries:', DATA.length, 'categories:', CATEGORY_ORDER.length);
console.log(DATA.length === 47 && CATEGORY_ORDER.length === 8 ? 'PASS' : 'FAIL');
"
```
Expected: `entries: 47 categories: 8` then `PASS`.

- [ ] **Step 3: Commit**

```bash
git add data.js
git commit -m "Extract DATA array into data.js"
```

---

### Task 2: Extract `mocks.js` (unmodified)

**Files:**
- Create: `mocks.js`

**Interfaces:**
- Consumes: nothing (standalone).
- Produces: `const MOCKS` (object of 48 renderer functions keyed by demo name, each `(platform: 'ios'|'android') => htmlString`), `function codeCard(lines, platform)`.

- [ ] **Step 1: Create `mocks.js`**

Copy the `MOCKS` object and `codeCard()` function verbatim from `index.html:801-1127` (from `const MOCKS = {` through the closing `}` of `codeCard`) into a new file `mocks.js`. No changes yet — the device-shell enhancement is Task 3, kept separate so this move is reviewable on its own as a pure relocation.

- [ ] **Step 2: Verify renderer count and a spot-check**

Run:
```bash
node -e "
eval(require('fs').readFileSync('mocks.js','utf8'));
console.log('renderer count:', Object.keys(MOCKS).length);
console.log(Object.keys(MOCKS).length === 48 ? 'PASS count' : 'FAIL count');
console.log(MOCKS.navbar('ios').includes('m-navbar-ios') ? 'PASS navbar' : 'FAIL navbar');
console.log(MOCKS.button('android').includes('m-btn-android') ? 'PASS button' : 'FAIL button');
"
```
Expected: `renderer count: 48`, then three `PASS` lines.

- [ ] **Step 3: Commit**

```bash
git add mocks.js
git commit -m "Extract MOCKS renderers into mocks.js"
```

---

### Task 3: Add device-shell treatment to the ten position-relevant previews

**Files:**
- Modify: `mocks.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: `function deviceShell(innerHtml, position)` where `position` is one of `'top' | 'bottom' | 'cover' | 'floating-bottom'`, returning `<div class="m-shell"><div class="m-shell-content ${position}">${innerHtml}</div></div>`. Renamed `.m-device` usage in `safearea` to `.m-shell` (same visual role, one consistent class name going forward). `styles.css` (Task 4) must define `.m-shell` / `.m-shell-content.<position>` — this task only touches `mocks.js`; the page will not render correctly again until Task 4 adds those rules, which is fine since nothing depends on `mocks.js` rendering correctly in isolation until the Task 5 cutover.

This is the concrete answer to "make previews more visually connectable": every preview whose whole point is *where on a screen it lives* now sits inside a shared device silhouette, pinned to the edge it actually belongs to.

- [ ] **Step 1: Add the `deviceShell` helper**

At the top of `mocks.js`, above the `MOCKS` object, add:

```js
function deviceShell(innerHtml, position){
  return `<div class="m-shell"><div class="m-shell-content ${position}">${innerHtml}</div></div>`;
}
```

- [ ] **Step 2: Wrap `navbar` (top edge) and `tabbar` (bottom edge)**

Replace:
```js
navbar(p){
  if(p==='ios') return `<div class="m-navbar m-navbar-ios"><span class="m-back">‹ Back</span><span class="m-title">Title</span><span class="m-action">Edit</span></div>`;
  return `<div class="m-navbar m-navbar-android"><span>←</span><span class="m-title">Title</span><span class="m-icons">⋮</span></div>`;
},
tabbar(p){
  if(p==='ios') return `<div class="m-tabbar m-tabbar-ios">
    <div class="m-tab"><span>◻</span>Home</div>
    <div class="m-tab active"><span>◉</span>Search</div>
    <div class="m-tab"><span>☰</span>Profile</div></div>`;
  return `<div class="m-tabbar m-tabbar-android">
    <div class="m-tab"><span class="m-tabicon">◻</span>Home</div>
    <div class="m-tab active"><span class="m-tabicon">◉</span>Search</div>
    <div class="m-tab"><span class="m-tabicon">☰</span>Profile</div></div>`;
},
```

with:
```js
navbar(p){
  const inner = p==='ios'
    ? `<div class="m-navbar m-navbar-ios"><span class="m-back">‹ Back</span><span class="m-title">Title</span><span class="m-action">Edit</span></div>`
    : `<div class="m-navbar m-navbar-android"><span>←</span><span class="m-title">Title</span><span class="m-icons">⋮</span></div>`;
  return deviceShell(inner, 'top');
},
tabbar(p){
  const inner = p==='ios'
    ? `<div class="m-tabbar m-tabbar-ios">
      <div class="m-tab"><span>◻</span>Home</div>
      <div class="m-tab active"><span>◉</span>Search</div>
      <div class="m-tab"><span>☰</span>Profile</div></div>`
    : `<div class="m-tabbar m-tabbar-android">
      <div class="m-tab"><span class="m-tabicon">◻</span>Home</div>
      <div class="m-tab active"><span class="m-tabicon">◉</span>Search</div>
      <div class="m-tab"><span class="m-tabicon">☰</span>Profile</div></div>`;
  return deviceShell(inner, 'bottom');
},
```

- [ ] **Step 3: Wrap `drawer` (cover) and rename `safearea`'s frame class**

Replace:
```js
drawer(p){
  return `<div class="m-drawer"><div class="m-drawer-panel">
    <div class="m-listrow"><span>Inbox</span></div>
    <div class="m-listrow"><span>Starred</span></div>
    <div class="m-listrow"><span>Sent</span></div>
  </div><div class="m-drawer-scrim"></div></div>`;
},
```
with:
```js
drawer(p){
  const inner = `<div class="m-drawer"><div class="m-drawer-panel">
      <div class="m-listrow"><span>Inbox</span></div>
      <div class="m-listrow"><span>Starred</span></div>
      <div class="m-listrow"><span>Sent</span></div>
    </div><div class="m-drawer-scrim"></div></div>`;
  return deviceShell(inner, 'cover');
},
```

Replace:
```js
safearea(p){
  if(p==='ios') return `<div class="m-device"><div class="m-notch"></div><div class="m-safe-inset ios">Safe Area</div></div>`;
  return `<div class="m-device"><div class="m-punch"></div><div class="m-safe-inset android">Content area</div></div>`;
},
```
with (rename `m-device` → `m-shell`, no other change):
```js
safearea(p){
  if(p==='ios') return `<div class="m-shell"><div class="m-notch"></div><div class="m-safe-inset ios">Safe Area</div></div>`;
  return `<div class="m-shell"><div class="m-punch"></div><div class="m-safe-inset android">Content area</div></div>`;
},
```

- [ ] **Step 4: Wrap `statusbar` (top) and `homeindicator` (bottom)**

Replace:
```js
statusbar(p){
  if(p==='ios') return `<div class="m-statusbar m-statusbar-ios"><span>9:41</span><span class="m-si">••• 🛜 🔋</span></div>`;
  return `<div class="m-statusbar m-statusbar-android"><span>9:41</span><span class="m-si">🔔 🛜 🔋</span></div>`;
},
homeindicator(p){
  if(p==='ios') return `<div class="m-bottomstrip"><div class="m-home-pill"></div><div class="m-bottomstrip-caption">Home Indicator</div></div>`;
  return `<div class="m-bottomstrip"><div class="m-home-pill" style="background:#5B5E64;"></div><div class="m-bottomstrip-caption">Gesture pill (or 3-button nav)</div></div>`;
},
```
with:
```js
statusbar(p){
  const inner = p==='ios'
    ? `<div class="m-statusbar m-statusbar-ios"><span>9:41</span><span class="m-si">••• 🛜 🔋</span></div>`
    : `<div class="m-statusbar m-statusbar-android"><span>9:41</span><span class="m-si">🔔 🛜 🔋</span></div>`;
  return deviceShell(inner, 'top');
},
homeindicator(p){
  const inner = p==='ios'
    ? `<div class="m-bottomstrip"><div class="m-home-pill"></div><div class="m-bottomstrip-caption">Home Indicator</div></div>`
    : `<div class="m-bottomstrip"><div class="m-home-pill" style="background:#5B5E64;"></div><div class="m-bottomstrip-caption">Gesture pill (or 3-button nav)</div></div>`;
  return deviceShell(inner, 'bottom');
},
```

- [ ] **Step 5: Wrap `actionsheet` (bottom), `sheet` (bottom), `fullscreen` (cover)**

Replace:
```js
actionsheet(p){
  if(p==='ios') return `<div class="m-sheet">
    <div class="m-listrow danger">Delete Conversation</div>
    <div class="m-listrow">Forward</div>
    <div class="m-cancel">Cancel</div>
  </div>`;
  return `<div class="m-sheet">
    <div class="m-sheet-handle"></div>
    <div class="m-listrow">🗑 Delete Conversation</div>
    <div class="m-listrow">↪ Forward</div>
  </div>`;
},
sheet(p){
  return `<div class="m-sheet">
    <div class="m-sheet-handle"></div>
    <div class="m-card-line" style="width:40%;height:9px;margin-bottom:10px;"></div>
    <div class="m-card-line"></div>
    <div class="m-card-line"></div>
  </div>`;
},
```
and
```js
fullscreen(p){
  return `<div class="m-fullscreen">
    <div class="m-fs-head"><span>New Message</span><span class="m-fs-close">✕</span></div>
    <div class="m-card-line"></div><div class="m-card-line"></div>
  </div>`;
},
```
with:
```js
actionsheet(p){
  const inner = p==='ios'
    ? `<div class="m-sheet">
      <div class="m-listrow danger">Delete Conversation</div>
      <div class="m-listrow">Forward</div>
      <div class="m-cancel">Cancel</div>
    </div>`
    : `<div class="m-sheet">
      <div class="m-sheet-handle"></div>
      <div class="m-listrow">🗑 Delete Conversation</div>
      <div class="m-listrow">↪ Forward</div>
    </div>`;
  return deviceShell(inner, 'bottom');
},
sheet(p){
  const inner = `<div class="m-sheet">
      <div class="m-sheet-handle"></div>
      <div class="m-card-line" style="width:40%;height:9px;margin-bottom:10px;"></div>
      <div class="m-card-line"></div>
      <div class="m-card-line"></div>
    </div>`;
  return deviceShell(inner, 'bottom');
},
```
and:
```js
fullscreen(p){
  const inner = `<div class="m-fullscreen">
      <div class="m-fs-head"><span>New Message</span><span class="m-fs-close">✕</span></div>
      <div class="m-card-line"></div><div class="m-card-line"></div>
    </div>`;
  return deviceShell(inner, 'cover');
},
```

- [ ] **Step 6: Wrap `toast` and `snackbar` (floating-bottom)**

Replace:
```js
toast(p){
  return `<div class="m-toast">Saved to Downloads</div>`;
},
snackbar(p){
  return `<div class="m-snackbar"><span>Message archived</span><span class="action">UNDO</span></div>`;
},
```
with:
```js
toast(p){
  return deviceShell(`<div class="m-toast">Saved to Downloads</div>`, 'floating-bottom');
},
snackbar(p){
  return deviceShell(`<div class="m-snackbar"><span>Message archived</span><span class="action">UNDO</span></div>`, 'floating-bottom');
},
```

- [ ] **Step 7: Verify shell wiring**

Run:
```bash
node -e "
eval(require('fs').readFileSync('mocks.js','utf8'));
const checks = [
  ['navbar','top'], ['tabbar','bottom'], ['drawer','cover'],
  ['statusbar','top'], ['homeindicator','bottom'], ['actionsheet','bottom'],
  ['sheet','bottom'], ['fullscreen','cover'], ['toast','floating-bottom'],
  ['snackbar','floating-bottom']
];
let ok = true;
for(const [key, pos] of checks){
  const html = MOCKS[key]('ios');
  const wantClass = 'm-shell-content ' + pos;
  if(!html.includes('m-shell') || !html.includes(wantClass)){
    console.error('FAIL', key, pos); ok = false;
  }
}
if(!MOCKS.safearea('ios').includes('m-shell')){ console.error('FAIL safearea rename'); ok = false; }
console.log(ok ? 'PASS: all 11 shell-wrapped renderers correct' : 'FAILURES ABOVE');
"
```
Expected: `PASS: all 11 shell-wrapped renderers correct`.

- [ ] **Step 8: Commit**

```bash
git add mocks.js
git commit -m "Wrap position-relevant mock previews in a device shell"
```

---

### Task 4: Write `styles.css`

**Files:**
- Create: `styles.css`

**Interfaces:**
- Produces: every class referenced by the current inline `<style>` (carried over for the ~260 lines of unchanged `.m-*` mock-component rules, `index.html:300-558` in the pre-redesign file, copied verbatim except `.m-device` → `.m-shell` per Task 3's rename), plus the new/changed rules below. `app.js` (Task 5) will rely on: `.category-block`, `.entry`, `.entry-row`, `.concept`, `.desc`, `.platform-row`, `.platform-cell`, `.term`, `.fw`, `.none`, `.no-results`, `.cat-list`, `.cat-list a.active`, `.sidebar.open`, `.sidebar-scrim.open`, `.util-toggle`, `.drawer-toggle`.

- [ ] **Step 1: Write the token, base, and reduced-motion sections**

```css
:root{
  --bg:#FAFAFA;
  --surface:#FFFFFF;
  --ink:#111318;
  --ink-soft:#6B7078;
  --line:#E4E4E7;
  --line-strong:#C9C5B8;
  --ios:#3E7FCB;
  --ios-text:#1D6FD1;
  --ios-soft:#E9F1FB;
  --ios-green:#34C759;
  --android:#2E9468;
  --android-text:#147A46;
  --android-soft:#E7F3ED;
  --radius:8px;
  --radius-sm:6px;
  --sidebar-w:260px;
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto;}
  *,*::before,*::after{
    animation-duration:0.001ms !important;
    animation-iteration-count:1 !important;
    scroll-behavior:auto !important;
  }
}
body{
  margin:0;
  background:var(--bg);
  color:var(--ink);
  font-family:"Roboto",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;}
::selection{background:var(--ios-soft);}
```

- [ ] **Step 2: Verify the contrast-safe text colors**

Run:
```bash
node -e "
function luminance(hex){
  const c = hex.replace('#','').match(/.{2}/g).map(h => parseInt(h,16)/255);
  const lin = c.map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  return 0.2126*lin[0] + 0.7152*lin[1] + 0.0722*lin[2];
}
function contrast(hex1, hex2){
  const L1 = luminance(hex1), L2 = luminance(hex2);
  const lighter = Math.max(L1,L2), darker = Math.min(L1,L2);
  return (lighter + 0.05) / (darker + 0.05);
}
const surface = '#FFFFFF';
const pairs = { iosText: '#1D6FD1', androidText: '#147A46' };
let ok = true;
for(const [name, hex] of Object.entries(pairs)){
  const ratio = contrast(hex, surface);
  console.log(name, hex, 'vs', surface, '=', ratio.toFixed(2) + ':1');
  if(ratio < 4.5) ok = false;
}
console.log(ok ? 'PASS: both >= 4.5:1' : 'FAIL: below 4.5:1');
"
```
Expected: both ratios print at or above `4.5:1` (approximately `4.94:1` and `5.38:1`), then `PASS: both >= 4.5:1`. If either fails, darken that hex slightly and rerun before moving on — do not proceed with a failing pair.

- [ ] **Step 3: Write masthead styles**

```css
.masthead{
  padding:40px 24px 32px;
  border-bottom:1px solid var(--line);
}
.masthead-inner{max-width:1200px;margin:0 auto;}
.eyebrow{
  font-family:"Roboto Mono",monospace;
  font-size:12px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--ink-soft);
  margin:0 0 14px;
}
.masthead h1{
  font-size:clamp(26px,3.6vw,38px);
  line-height:1.15;
  margin:0 0 14px;
  font-weight:700;
  letter-spacing:-0.01em;
}
.masthead h1 .ios-word{color:var(--ios-text);}
.masthead h1 .android-word{color:var(--android-text);}
.masthead h1 .seam{
  display:inline-block;
  color:var(--ink-soft);
  font-weight:400;
  padding:0 6px;
}
.masthead p.lede{
  font-size:15px;
  line-height:1.6;
  max-width:640px;
  color:#33363B;
  margin:0 0 18px;
}
.masthead-meta{
  display:flex;gap:22px;flex-wrap:wrap;
  font-size:12.5px;color:var(--ink-soft);
}
.masthead-meta span{display:inline-flex;align-items:center;gap:7px;}
.dot{width:7px;height:7px;border-radius:50%;display:inline-block;}
.dot.ios{background:var(--ios);}
.dot.android{background:var(--android);}
```

- [ ] **Step 4: Write layout and sidebar styles (desktop)**

```css
.layout{
  max-width:1200px;
  margin:0 auto;
  display:flex;
  align-items:flex-start;
}
.drawer-toggle{display:none;}

.sidebar{
  flex:0 0 var(--sidebar-w);
  width:var(--sidebar-w);
  position:sticky;
  top:0;
  align-self:flex-start;
  height:100vh;
  overflow-y:auto;
  padding:24px 18px;
  border-right:1px solid var(--line);
  display:flex;
  flex-direction:column;
  gap:16px;
}
#search{
  padding:9px 12px;
  border:1px solid var(--line);
  border-radius:var(--radius-sm);
  background:var(--surface);
  font-size:13.5px;
  font-family:inherit;
  color:var(--ink);
  outline:none;
  width:100%;
}
#search:focus-visible{border-color:var(--ios-text);box-shadow:0 0 0 3px var(--ios-soft);}

.cat-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;}
.cat-list a{
  display:flex;
  justify-content:space-between;
  gap:8px;
  padding:7px 8px;
  border-radius:var(--radius-sm);
  font-size:13px;
  color:var(--ink-soft);
  text-decoration:none;
}
.cat-list a:hover{background:var(--bg);color:var(--ink);}
.cat-list a.active{background:var(--ink);color:#fff;}
.cat-list a .cat-count{font-family:"Roboto Mono",monospace;font-size:11px;opacity:.75;}
.cat-list a:focus-visible{outline:2px solid var(--ios-text);outline-offset:2px;}

.util-toggle{
  align-self:flex-start;
  padding:7px 12px;
  border-radius:999px;
  border:1px dashed var(--line-strong);
  background:none;
  font-family:"Roboto Mono",monospace;
  font-size:11.5px;
  color:var(--ink-soft);
  cursor:pointer;
}
.util-toggle:hover{background:var(--ink);color:#fff;border-color:var(--ink);}
.util-toggle:focus-visible{outline:2px solid var(--ios-text);outline-offset:2px;}

.result-count{
  font-size:11.5px;color:var(--ink-soft);
  font-family:"Roboto Mono",monospace;
}

.sidebar-scrim{display:none;}
```

- [ ] **Step 5: Write the mobile drawer media query**

```css
@media (max-width:899px){
  .drawer-toggle{
    display:inline-flex;
    align-items:center;
    gap:8px;
    margin:16px 24px 0;
    padding:9px 14px;
    border-radius:999px;
    border:1px solid var(--line);
    background:var(--surface);
    font-size:13px;
    font-family:inherit;
    color:var(--ink);
    cursor:pointer;
  }
  .drawer-toggle:focus-visible{outline:2px solid var(--ios-text);outline-offset:2px;}
  .layout{display:block;}
  .sidebar{
    position:fixed;
    top:0; left:0; bottom:0;
    width:min(80vw,320px);
    height:100vh;
    background:var(--surface);
    border-right:none;
    box-shadow:2px 0 16px rgba(0,0,0,.16);
    transform:translateX(-100%);
    transition:transform .18s ease;
    z-index:20;
  }
  .sidebar.open{transform:translateX(0);}
  .sidebar-scrim{
    display:block;
    position:fixed; inset:0;
    background:rgba(17,19,24,.35);
    opacity:0; pointer-events:none;
    transition:opacity .18s ease;
    z-index:19;
  }
  .sidebar-scrim.open{opacity:1;pointer-events:auto;}
}
```

- [ ] **Step 6: Write main/category/entry/platform-row styles**

```css
main{flex:1 1 auto; min-width:0; padding:32px 24px 100px;}
.category-block{margin-bottom:44px;scroll-margin-top:16px;}
.category-block:last-child{margin-bottom:0;}
.category-head{
  display:flex;align-items:baseline;gap:12px;
  margin-bottom:16px;
  padding-bottom:10px;
  border-bottom:2px solid var(--ink);
}
.category-head .num{
  font-family:"Roboto Mono",monospace;
  font-size:12px;color:var(--ink-soft);
}
.category-head h2{font-size:18px;margin:0;font-weight:700;}
.category-head .count{
  margin-left:auto;font-family:"Roboto Mono",monospace;
  font-size:12px;color:var(--ink-soft);
}

.entry{
  background:var(--surface);
  border:1px solid var(--line);
  border-radius:var(--radius);
  padding:16px 18px;
  margin-bottom:10px;
}
.entry-row{display:flex;flex-direction:column;gap:10px;}
.entry:hover{border-color:var(--line-strong);}

.concept{font-weight:700;font-size:15px;}
.desc{font-size:13.5px;line-height:1.55;color:#3B3E43;}

.platform-row{
  display:flex;
  flex-wrap:wrap;
  gap:14px 24px;
  padding-top:8px;
  border-top:1px dashed var(--line);
}
.platform-cell{flex:1 1 220px;font-size:13.5px;line-height:1.5;}
.platform-cell .label-mobile{
  display:inline-block;
  font-family:"Roboto Mono",monospace;
  font-size:10.5px;
  text-transform:uppercase;
  letter-spacing:.06em;
  color:var(--ink-soft);
  margin-bottom:3px;
}
.term{font-weight:600;}
.term.ios{color:var(--ios-text);}
.term.android{color:var(--android-text);}
.fw{
  display:block;
  font-family:"Roboto Mono",monospace;
  font-size:12px;
  color:var(--ink-soft);
  margin-top:2px;
}
.none{color:#8A8880;font-style:italic;font-size:13px;}

.no-results{
  text-align:center;padding:60px 20px;color:var(--ink-soft);font-size:14px;
}

footer{
  border-top:1px solid var(--line);
  padding:30px 24px 50px;
  text-align:center;
  font-size:12.5px;
  color:var(--ink-soft);
}
footer a{text-decoration:underline;text-underline-offset:2px;}
footer code{font-family:"Roboto Mono",monospace;background:var(--bg);padding:1px 5px;border-radius:4px;}
```

- [ ] **Step 7: Write preview/frame/shell styles**

```css
.preview{margin-top:10px;}
.m-frame{
  position:relative;
  border-radius:12px;
  padding:20px 12px 14px;
  min-height:96px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  border:1px solid var(--line);
}
.m-frame-ios{ background:#F2F2F7; font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif; }
.m-frame-android{ background:#F6F7F4; font-family:"Roboto",sans-serif; }
.m-frame-tag{
  position:absolute; top:8px; left:10px;
  font-family:"Roboto Mono",monospace;
  font-size:9px; text-transform:uppercase; letter-spacing:.08em;
  color:var(--ink-soft);
  display:inline-flex; align-items:center; gap:5px;
}
.m-frame-tag .dot{width:6px;height:6px;}
.m-body{width:100%;}

.m-shell{
  position:relative;
  width:100%;
  max-width:150px;
  height:150px;
  margin:0 auto;
  border:2px solid var(--line-strong);
  border-radius:20px;
  background:var(--surface);
  overflow:hidden;
}
.m-shell-content{position:absolute;left:0;right:0;}
.m-shell-content.top{top:0;padding:6px;}
.m-shell-content.bottom{bottom:0;padding:6px;}
.m-shell-content.cover{inset:0;}
.m-shell-content.floating-bottom{bottom:10px;left:8px;right:8px;}
```

- [ ] **Step 8: Copy the unchanged mock-component styles verbatim**

Copy `index.html:290-298` (`.m-unsupported*`) and `index.html:300-558` (from `/* button */` through the end of `/* code card */`, i.e. every `.m-btn*` / `.m-fab` / `.m-switch*` / `.m-checkbox*` / `.m-listrow*` / `.m-radio*` / `.m-wheel*` / `.m-dropdown*` / `.m-field*` / `.m-search*` / `.m-slider*` / `.m-track*` / `.m-thumb` / `.m-stepper*` / `.m-list*` / `.m-grid*` / `.m-card*` / `.m-dialog*` / `.m-popover*` / `.m-fullscreen*` / `.m-toast` / `.m-snackbar*` / `.m-spinner*` / `.m-progress*` / `.m-activity*` / `.m-badge*` / `.m-refresh` / `.m-sticky*` / `.m-navbar*` / `.m-tabbar*` / `.m-drawer*` / `.m-segmented*` / `.m-tabsrow*` / `.m-menu*` / `.m-swipe*` / `.m-depth*` / `.m-dark*` / `.m-statusbar*` / `.m-notch`/`.m-punch`/`.m-safe-inset*` / `.m-bottomstrip*`/`.m-home-pill`/`.m-nav-buttons` / `.m-stackdemo*`/`.m-stackbox*` / `.m-constraint*`/`.m-pin*` / `.m-navstack*` / `.m-haptic*` / `.m-specdoc*` / `.m-code*`) into `styles.css` unchanged, **except** two edits:

1. `.m-device` → rename to `.m-shell` — but `.m-shell` was already fully defined in Step 7 above, so **delete** the old `.m-device{...}` rule entirely rather than duplicating it (the `.m-notch`, `.m-punch`, `.m-safe-inset*` rules that reference it stay, unchanged).
2. `.m-drawer{ position:relative; width:100%; height:96px; border-radius:8px; overflow:hidden; }` → change the fixed `height:96px` to `height:100%`, since `drawer` is now always rendered inside a 150px-tall `.m-shell` (Task 3) rather than standing alone:
```css
.m-drawer{ position:relative; width:100%; height:100%; border-radius:8px; overflow:hidden; }
```

Everything else in this block is copied with zero changes — all the `var(--ios)` / `var(--android)` / `var(--ios-green)` references automatically pick up the new muted token values from Step 1, which is what achieves the "quiet platform mirror" look for every mock preview without touching each rule individually.

- [ ] **Step 9: Sanity-check the file**

Run:
```bash
grep -c '^\.m-' styles.css
grep -c 'controls\|\.chip\|filter-toggle' styles.css
```
Expected: the first command prints a large number (the ported mock-component rule count, roughly 90+); the second prints `0` — none of the old top-controls-bar classes should exist in the new file (they're fully replaced by the sidebar).

- [ ] **Step 10: Commit**

```bash
git add styles.css
git commit -m "Add styles.css: quiet platform mirror tokens, sidebar/drawer layout, device shell"
```

---

### Task 5: Rewrite `index.html` and write `app.js`

**Files:**
- Modify: `index.html` (full rewrite of body content and `<head>`)
- Create: `app.js`

**Interfaces:**
- Consumes: `DATA`, `CATEGORY_ORDER` (from `data.js`), `MOCKS`, `codeCard` (from `mocks.js`), and the CSS classes produced by Task 4.
- Produces: nothing consumed by later tasks (this is the integration point — the whole page is functional after this task).

- [ ] **Step 1: Rewrite `index.html`**

Replace the entire file with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Platform Vocabulary — iOS ↔ Android UI Reference</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>

<header class="masthead">
  <div class="masthead-inner">
    <p class="eyebrow">Cross-platform mobile · vocabulary reference</p>
    <h1><span class="ios-word">iOS</span><span class="seam">↔</span><span class="android-word">Android</span> UI Component Cheatsheet</h1>
    <p class="lede">The same idea, two names. This is a lookup table for the moment a designer says "just add a bottom sheet" and the iOS dev hears <em>Action Sheet</em> while the Android dev hears <em>BottomSheetDialog</em> — so everyone in the standup is talking about the same thing.</p>
    <div class="masthead-meta">
      <span><span class="dot ios"></span>iOS — UIKit / SwiftUI</span>
      <span><span class="dot android"></span>Android — Views / Jetpack Compose</span>
    </div>
  </div>
</header>

<button id="drawerToggle" class="drawer-toggle" aria-expanded="false" aria-controls="sidebar">☰ Browse &amp; search</button>

<div class="layout">
  <nav id="sidebar" class="sidebar" aria-label="Categories">
    <input id="search" type="text" placeholder="Search a concept, or a term like &quot;snackbar&quot;, &quot;UITableView&quot;, &quot;drawer&quot;…" autocomplete="off">
    <ul class="cat-list" id="catList"></ul>
    <button id="toggleExamples" class="util-toggle">Hide all examples</button>
    <span class="result-count" id="resultCount"></span>
  </nav>
  <div class="sidebar-scrim" id="sidebarScrim"></div>
  <main id="main"></main>
</div>

<footer>
  Built as a living reference — spot an inaccuracy or a missing component? Edit <code>data.js</code> for a new entry or <code>mocks.js</code> for a new preview renderer, then open a PR.
</footer>

<script src="data.js"></script>
<script src="mocks.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `app.js`**

```js
function slugify(str){
  return str.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function matchesQuery(entry, q){
  if(!q) return true;
  const haystack = [entry.concept, entry.ios.term, entry.ios.fw, entry.android.term, entry.android.fw, entry.desc].join(' ').toLowerCase();
  return haystack.includes(q);
}

function platformCell(entry, key, mobileLabel){
  const p = entry[key];
  let inner;
  if(p.none){
    inner = `<span class="none">${p.term}</span><span class="fw">${p.fw}</span>`;
  } else {
    inner = `<span class="term ${key}">${p.term}</span><span class="fw">${p.fw}</span>`;
  }
  return `<div class="platform-cell"><span class="label-mobile">${mobileLabel}</span>${inner}</div>`;
}

function renderPreview(entry, open){
  if(!entry.demo) return '';
  const iosInner = entry.ios.none
    ? `<div class="m-unsupported"><div class="m-unsupported-icon">–</div><div class="m-unsupported-text">${entry.ios.term}</div></div>`
    : `<div class="m-body">${MOCKS[entry.demo]('ios')}</div>`;
  const androidInner = entry.android.none
    ? `<div class="m-unsupported"><div class="m-unsupported-icon">–</div><div class="m-unsupported-text">${entry.android.term}</div></div>`
    : `<div class="m-body">${MOCKS[entry.demo]('android')}</div>`;
  return `
    <details class="preview"${open ? ' open' : ''}>
      <summary>Example</summary>
      <div class="preview-row">
        <div class="m-frame m-frame-ios"><span class="m-frame-tag"><span class="dot ios"></span>iOS</span>${iosInner}</div>
        <div class="m-frame m-frame-android"><span class="m-frame-tag"><span class="dot android"></span>Android</span>${androidInner}</div>
      </div>
    </details>`;
}

let examplesOpen = true;
let scrollObserver = null;
const isMobile = () => window.matchMedia('(max-width:899px)').matches;

function render(filterText){
  const main = document.getElementById('main');
  main.innerHTML = '';
  const q = filterText.trim().toLowerCase();
  let totalShown = 0;

  CATEGORY_ORDER.forEach((cat, idx) => {
    const items = DATA.filter(d => d.cat === cat).filter(d => matchesQuery(d, q));
    if(items.length === 0) return;
    totalShown += items.length;

    const block = document.createElement('section');
    block.className = 'category-block';
    block.id = 'cat-' + slugify(cat);
    block.innerHTML = `
      <div class="category-head">
        <span class="num">${String(idx+1).padStart(2,'0')}</span>
        <h2>${cat}</h2>
        <span class="count">${items.length} item${items.length>1?'s':''}</span>
      </div>
    `;

    items.forEach(d => {
      const entry = document.createElement('div');
      entry.className = 'entry';
      entry.innerHTML = `
        <div class="entry-row">
          <div class="concept">${d.concept}</div>
          <div class="desc">${d.desc}</div>
          <div class="platform-row">
            ${platformCell(d, 'ios', 'iOS')}
            ${platformCell(d, 'android', 'Android')}
          </div>
        </div>
        ${renderPreview(d, examplesOpen)}
      `;
      block.appendChild(entry);
    });

    main.appendChild(block);
  });

  document.getElementById('resultCount').textContent = totalShown ? `${totalShown} components` : '';
  if(totalShown === 0){
    main.innerHTML = `<div class="no-results">No matches. Try a different term — or a broader one.</div>`;
  }
  setupScrollspy();
}

function buildSidebarNav(){
  const list = document.getElementById('catList');
  list.innerHTML = '';
  CATEGORY_ORDER.forEach(cat => {
    const count = DATA.filter(d => d.cat === cat).length;
    const li = document.createElement('li');
    li.innerHTML = `<a href="#cat-${slugify(cat)}" data-cat="${cat}">${cat}<span class="cat-count">${count}</span></a>`;
    li.querySelector('a').addEventListener('click', () => {
      if(isMobile()) closeDrawer();
    });
    list.appendChild(li);
  });
}

function setupScrollspy(){
  if(scrollObserver) scrollObserver.disconnect();
  const links = [...document.querySelectorAll('.cat-list a')];
  const blocks = [...document.querySelectorAll('.category-block')];
  if(blocks.length === 0) return;
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, {rootMargin:'-10% 0px -70% 0px', threshold:0});
  blocks.forEach(b => scrollObserver.observe(b));
}

function openDrawer(){
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarScrim').classList.add('open');
  document.getElementById('drawerToggle').setAttribute('aria-expanded', 'true');
}
function closeDrawer(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarScrim').classList.remove('open');
  document.getElementById('drawerToggle').setAttribute('aria-expanded', 'false');
  document.getElementById('drawerToggle').focus();
}

function init(){
  buildSidebarNav();

  const searchEl = document.getElementById('search');
  searchEl.addEventListener('input', () => render(searchEl.value));

  const toggleBtn = document.getElementById('toggleExamples');
  toggleBtn.addEventListener('click', () => {
    examplesOpen = !examplesOpen;
    toggleBtn.textContent = examplesOpen ? 'Hide all examples' : 'Show all examples';
    render(searchEl.value);
  });

  const drawerToggle = document.getElementById('drawerToggle');
  const scrim = document.getElementById('sidebarScrim');
  drawerToggle.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if(sidebar.classList.contains('open')) closeDrawer(); else openDrawer();
  });
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && document.getElementById('sidebar').classList.contains('open')){
      closeDrawer();
    }
  });

  render('');
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 3: Verify the split is complete**

Run:
```bash
grep -c '<style>' index.html
grep -c 'const DATA' index.html
grep -c 'const MOCKS' index.html
grep -c 'type="module"' index.html
```
Expected: all four print `0` — no inline `<style>`, no inline `DATA`/`MOCKS`, and no `type="module"` anywhere (the file:// constraint).

- [ ] **Step 4: Manual browser verification**

Open `index.html` directly (double-click, or `open index.html` on macOS) and confirm, at a normal desktop window width:
1. The sidebar is visible on the left with the search box, all 8 category links (with counts), the "Hide all examples" toggle, and a result count.
2. Typing in search live-filters entries across all categories; clearing it restores everything.
3. Scrolling the page highlights the currently-visible category's sidebar link (the `active` style — dark background).
4. Clicking a sidebar category link jumps to that section.
5. Every entry shows title → description → an iOS/Android platform row with previews; the 11 shell-wrapped previews (navbar, tabbar, drawer, statusbar, homeindicator, actionsheet, sheet, fullscreen, toast, snackbar, safearea) show their content pinned inside a device silhouette at the documented edge.
6. Entries with `none:true` (e.g. FAB, checkbox, toast on iOS) still show the dashed-ghost placeholder.
7. "Hide all examples" / "Show all examples" toggles every preview's visibility.

Then resize the browser below 900px wide (or use devtools responsive mode) and confirm:
8. The sidebar disappears and a "☰ Browse & search" button appears near the top.
9. Clicking it slides the sidebar in from the left with a dimmed scrim behind it.
10. Clicking the scrim, or pressing Escape, closes the drawer and returns focus to the toggle button (confirm visually with a focus ring, or via devtools' Accessibility pane showing focus on `#drawerToggle`).
11. Clicking a category link inside the open drawer closes the drawer and jumps to that section.

- [ ] **Step 5: Commit**

```bash
git add index.html app.js
git commit -m "Rewrite index.html around a sidebar/drawer layout and split app.js out of the inline script"
```

---

### Task 6: Update `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the "Contributing" and "Deployment" sections**

Change:
```markdown
## Contributing

The whole page is a single `index.html` file with no build step. Component data lives in the `DATA` array near the top of the `<script>` block; mock UI previews are generated by the `MOCKS` renderers below it. Edit either and open a PR — spotted an inaccuracy or missing component? Fixes welcome.
```
to:
```markdown
## Contributing

Still no build step — just plain static files served as-is. Component data lives in `data.js`; mock UI previews are generated by the renderers in `mocks.js`; page behavior (search, sidebar navigation, the mobile drawer) lives in `app.js`; everything visual is in `styles.css`. Edit whichever file matches your change and open a PR — spotted an inaccuracy or missing component? Fixes welcome.
```

Leave "## Deployment" as-is (`Served as-is via GitHub Pages from the main branch root.` — still true, GitHub Pages serves multiple static files exactly like it served one).

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Update README for the split file layout"
```

---

## Self-Review Notes

- **Spec coverage:** all 7 spec sections have a task — §1 palette/type/shape/signature → Task 4; §2 layout/sidebar/drawer/scrollspy → Task 4 (CSS) + Task 5 (markup/JS); §3 entry row shape → Task 5; §4 file split → Tasks 1, 2, 5; §5 accessibility → Task 4 (reduced-motion, focus-visible) + Task 5 (Escape/focus-return, real anchor links); §6 edge cases (no-results, `none:true` ghost) → Task 5 (unchanged logic, verified in Step 4); §7 verification plan → folded into each task's own Step 4/manual-check rather than a separate final task, since there's nothing left to verify once Task 6 lands.
- **Type/name consistency checked:** `matchesQuery(entry, q)`, `slugify(str)`, `platformCell(entry, key, mobileLabel)`, `renderPreview(entry, open)`, `render(filterText)`, `deviceShell(innerHtml, position)` are named and called the same way everywhere they appear across Tasks 3 and 5.
- **No placeholders:** every step above contains the literal code to write or the literal command to run; the only "copy from existing file" instructions (Task 4 Step 8, and the DATA/MOCKS moves in Tasks 1-2) point at exact, already-fully-specified line ranges of code that isn't changing, not new code being deferred.
