# Lucide Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every emoji and Unicode-glyph icon stand-in across the site with a self-hosted Lucide SVG icon.

**Architecture:** A new `icons.js` vendors 26 Lucide icon SVGs (path data copied verbatim from `lucide-static@1.26.0`, ISC licensed) behind an `ICONS` map and a tiny `icon(name)` helper that returns an inline `<svg class="m-icon">` string. `mocks.js` and `index.html` call `icon(name)` wherever they previously interpolated an emoji/glyph character. A single `.m-icon` CSS rule (`width/height: 1em`, `stroke: currentColor`) makes every icon inherit size from its ancestor's `font-size` and color from its ancestor's `color`, exactly like the text glyphs they replace.

**Tech Stack:** Plain JS/HTML/CSS, no build step, no package manager. Icons are vendored (copy-pasted, real path data, not CDN-loaded) to match the project's "served as-is" static-file model.

## Global Constraints

- No build step, no `package.json`, no bundler — every file must work as a plain `<script src>` / `<link>` (from `README.md`: "Still no build step — just plain static files served as-is").
- No new runtime/network dependency (icons are vendored inline SVG, not loaded from a CDN).
- Icons use `stroke="currentColor"` so they inherit color from CSS the same way the glyphs they replace did.
- Icon path data must be copied verbatim from Lucide's published source (`lucide-static@1.26.0`, ISC license) — never hand-approximated.
- The decorative `↔` in the page `<h1>` and typographic punctuation (`·` `—` `–` `…`) are out of scope — do not touch them.
- Local verification: `.claude/launch.json` defines a `static-server` config (`python3 .claude/no-cache-server.py 4176`, port 4176). Use the project's preview tooling with that config name to load `index.html` and visually check each task's output; there is no automated test suite in this repo.

---

### Task 1: Vendor Lucide icon data into `icons.js`

**Files:**
- Create: `icons.js`
- Modify: `index.html:46` (add script tag before `mocks.js`)

**Interfaces:**
- Produces: `ICONS` (object, icon-name string → inner SVG markup string) and `icon(name)` (function, icon-name string → full `<svg>` markup string) as page-global bindings (script-tag style, matching how `MOCKS` in `mocks.js` and `DATA` in `data.js` are already exposed). Every later task calls `icon('some-name')` inside a template string.

- [ ] **Step 1: Create `icons.js` with the icon data and helper**

```js
const ICONS = {
  'menu': '<path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" />',
  'chevron-left': '<path d="m15 18-6-6 6-6" />',
  'chevron-right': '<path d="m9 18 6-6-6-6" />',
  'chevron-down': '<path d="m6 9 6 6 6-6" />',
  'arrow-left': '<path d="m12 19-7-7 7-7" /><path d="M19 12H5" />',
  'arrow-right': '<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />',
  'arrow-up': '<path d="m5 12 7-7 7 7" /><path d="M12 19V5" />',
  'arrow-down': '<path d="M12 5v14" /><path d="m19 12-7 7-7-7" />',
  'more-vertical': '<circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />',
  'more-horizontal': '<circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />',
  'home': '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
  'search': '<path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />',
  'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />',
  'pointer': '<path d="M22 14a8 8 0 0 1-8 8" /><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" /><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" /><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" /><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />',
  'calendar': '<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />',
  'check': '<path d="M20 6 9 17l-5-5" />',
  'image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  'globe': '<circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />',
  'download': '<path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" />',
  'trash-2': '<path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
  'forward': '<path d="m15 17 5-5-5-5" /><path d="M4 18v-2a4 4 0 0 1 4-4h12" />',
  'x': '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  'bell': '<path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />',
  'wifi': '<path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0" /><path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />',
  'battery': '<path d="M 22 14 L 22 10" /><rect x="2" y="6" width="16" height="12" rx="2" />',
  'signal': '<path d="M2 20h.01" /><path d="M7 20v-4" /><path d="M12 20v-8" /><path d="M17 20V8" /><path d="M22 4v16" />',
};

function icon(name) {
  const inner = ICONS[name];
  if (!inner) throw new Error(`icon(): unknown icon name "${name}"`);
  return `<svg class="m-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
```

- [ ] **Step 2: Wire the script into `index.html`**

Change `index.html:46-48` from:

```html
<script src="data.js"></script>
<script src="mocks.js"></script>
<script src="app.js"></script>
```

to:

```html
<script src="data.js"></script>
<script src="icons.js"></script>
<script src="mocks.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 3: Verify the icon data structurally**

Run:

```bash
node -e "
$(cat icons.js)
const names = Object.keys(ICONS);
console.log('icon count:', names.length);
for (const name of names) {
  const svg = icon(name);
  if (!svg.startsWith('<svg') || !svg.includes('</svg>') || !svg.includes(ICONS[name])) {
    throw new Error('bad output for ' + name);
  }
}
try { icon('does-not-exist'); throw new Error('should have thrown'); } catch (e) {
  if (!/unknown icon name/.test(e.message)) throw e;
}
console.log('all icons OK');
"
```

Expected output: `icon count: 26` then `all icons OK`.

- [ ] **Step 4: Commit**

```bash
git add icons.js index.html
git commit -m "Vendor Lucide icon set behind an icon() helper"
```

---

### Task 2: Add `.m-icon` styling and convert the drawer-toggle hamburger

**Files:**
- Modify: `styles.css` (new rule near the other generic `.m-*` component rules, e.g. after line 429's `.m-checkmark`)
- Modify: `index.html:14`

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Add the `.m-icon` rule to `styles.css`**

Insert after the `.m-checkmark` rule (`styles.css:429`):

```css
.m-icon{ width:1em; height:1em; display:inline-block; vertical-align:-0.15em; flex-shrink:0; }
```

- [ ] **Step 2: Replace the drawer-toggle hamburger glyph**

`index.html` is static markup, so the icon markup is written directly into it (identical output to `icon('menu')` in `icons.js`, hand-inlined here since this one usage is in HTML, not a `mocks.js` template string). Change `index.html:14` from:

```html
<button id="drawerToggle" class="drawer-toggle" aria-expanded="false" aria-controls="sidebar" aria-label="Browse categories and search">☰</button>
```

to:

```html
<button id="drawerToggle" class="drawer-toggle" aria-expanded="false" aria-controls="sidebar" aria-label="Browse categories and search"><svg class="m-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" /></svg></button>
```

- [ ] **Step 3: Verify in the browser**

Start the `static-server` preview config and open the page. Resize to a narrow/mobile width so the drawer toggle is visible (`.drawer-toggle{display:none;}` at `styles.css:94` is the desktop default — the button only shows under the mobile breakpoint at `styles.css:176`). Confirm:
- The hamburger renders as a crisp line-icon, not a glyph or missing box.
- It's centered in its 32×32 button and roughly 19px (`font-size:19px` on `.drawer-toggle`, `styles.css:188`) — inherited via `.m-icon{width:1em;height:1em}`.
- Clicking it still opens/closes the sidebar drawer (unrelated JS, just confirming nothing broke).

- [ ] **Step 4: Commit**

```bash
git add styles.css index.html
git commit -m "Add .m-icon rule and swap the drawer-toggle hamburger for a Lucide icon"
```

---

### Task 3: Convert Navigation & Structure mocks (`navbar`, `tabbar`, `backrow`)

**Files:**
- Modify: `mocks.js:26-43` (`navbar`, `tabbar`), `mocks.js:52-55` (`backrow`)

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Convert `navbar()`**

Replace `mocks.js:26-31`:

```js
navbar(p){
  const inner = p==='ios'
    ? `<div class="m-navbar m-navbar-ios"><span class="m-back">‹ Back</span><span class="m-title">Title</span><span class="m-action">Edit</span></div>`
    : `<div class="m-navbar m-navbar-android"><span>←</span><span class="m-title">Title</span><span class="m-icons">⋮</span></div>`;
  return deviceShell(inner, 'top', p);
},
```

with:

```js
navbar(p){
  const inner = p==='ios'
    ? `<div class="m-navbar m-navbar-ios"><span class="m-back">${icon('chevron-left')} Back</span><span class="m-title">Title</span><span class="m-action">Edit</span></div>`
    : `<div class="m-navbar m-navbar-android"><span>${icon('arrow-left')}</span><span class="m-title">Title</span><span class="m-icons">${icon('more-vertical')}</span></div>`;
  return deviceShell(inner, 'top', p);
},
```

- [ ] **Step 2: Convert `tabbar()`**

Replace `mocks.js:32-43`:

```js
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

with:

```js
tabbar(p){
  const inner = p==='ios'
    ? `<div class="m-tabbar m-tabbar-ios">
      <div class="m-tab"><span>${icon('home')}</span>Home</div>
      <div class="m-tab active"><span>${icon('search')}</span>Search</div>
      <div class="m-tab"><span>${icon('user')}</span>Profile</div></div>`
    : `<div class="m-tabbar m-tabbar-android">
      <div class="m-tab"><span class="m-tabicon">${icon('home')}</span>Home</div>
      <div class="m-tab active"><span class="m-tabicon">${icon('search')}</span>Search</div>
      <div class="m-tab"><span class="m-tabicon">${icon('user')}</span>Profile</div></div>`;
  return deviceShell(inner, 'bottom');
},
```

- [ ] **Step 3: Convert `backrow()`**

Replace `mocks.js:52-55`:

```js
backrow(p){
  if(p==='ios') return `<div style="text-align:center;font-size:12px;"><span style="color:var(--ios);font-weight:600;">‹ Back</span><div style="color:#8E8E93;font-size:10px;margin-top:6px;">+ edge-swipe gesture</div></div>`;
  return `<div style="text-align:center;font-size:12px;"><span style="color:var(--android);font-weight:600;">← Up</span><div style="color:#8E8E93;font-size:10px;margin-top:6px;">+ system back gesture</div></div>`;
},
```

with:

```js
backrow(p){
  if(p==='ios') return `<div style="text-align:center;font-size:12px;"><span style="color:var(--ios);font-weight:600;">${icon('chevron-left')} Back</span><div style="color:#8E8E93;font-size:10px;margin-top:6px;">+ edge-swipe gesture</div></div>`;
  return `<div style="text-align:center;font-size:12px;"><span style="color:var(--android);font-weight:600;">${icon('arrow-left')} Up</span><div style="color:#8E8E93;font-size:10px;margin-top:6px;">+ system back gesture</div></div>`;
},
```

- [ ] **Step 4: Verify in the browser**

Load the page, expand the "Top bar with title & actions", "Bottom tab navigation", and "Going back a screen" entries (Navigation & Structure category) for both iOS and Android columns. Confirm: back chevron/arrow renders next to "Back"/"Up" text and inherits the platform accent color; the android overflow shows three vertical dots; the tab bar shows house / magnifying-glass / person icons instead of square/circle/hamburger, sized to fit the small tab labels.

- [ ] **Step 5: Commit**

```bash
git add mocks.js
git commit -m "Convert Navigation & Structure mock icons to Lucide"
```

---

### Task 4: Convert Buttons & Actions mocks (`actionbutton`, `overflow`, `contextmenu`)

**Files:**
- Modify: `mocks.js:67-76` (`overflow`, `contextmenu`), `mocks.js:185-190` (`actionbutton`)

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Convert `overflow()`**

Replace `mocks.js:67-72`:

```js
overflow(p){
  if(p==='ios') return `<div><div class="m-menu-anchor">•••</div><div class="m-menu">
    <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
  return `<div><div class="m-menu-anchor">⋮</div><div class="m-menu">
    <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
},
```

with:

```js
overflow(p){
  if(p==='ios') return `<div><div class="m-menu-anchor">${icon('more-horizontal')}</div><div class="m-menu">
    <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
  return `<div><div class="m-menu-anchor">${icon('more-vertical')}</div><div class="m-menu">
    <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
},
```

- [ ] **Step 2: Convert `contextmenu()`**

Replace `mocks.js:73-76`:

```js
contextmenu(p){
  return `<div><div class="m-menu-anchor" style="text-align:center;font-size:10.5px;color:#8E8E93;">☝︎ long-press item</div><div class="m-menu">
    <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
},
```

with:

```js
contextmenu(p){
  return `<div><div class="m-menu-anchor" style="text-align:center;font-size:10.5px;color:#8E8E93;">${icon('pointer')} long-press item</div><div class="m-menu">
    <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
},
```

- [ ] **Step 3: Convert `actionbutton()`**

Replace `mocks.js:185-190`:

```js
actionbutton(p){
  const inner = p==='ios'
    ? `<div class="m-navbar m-navbar-ios"><span class="m-back">‹ Back</span><span class="m-title">Title</span><span class="m-action m-action-highlight">⬇</span></div>`
    : `<div class="m-navbar m-navbar-android"><span>←</span><span class="m-title">Title</span><span class="m-action-highlight">🔍</span></div>`;
  return deviceShell(inner, 'top', p);
},
```

with:

```js
actionbutton(p){
  const inner = p==='ios'
    ? `<div class="m-navbar m-navbar-ios"><span class="m-back">${icon('chevron-left')} Back</span><span class="m-title">Title</span><span class="m-action m-action-highlight">${icon('download')}</span></div>`
    : `<div class="m-navbar m-navbar-android"><span>${icon('arrow-left')}</span><span class="m-title">Title</span><span class="m-action-highlight">${icon('search')}</span></div>`;
  return deviceShell(inner, 'top', p);
},
```

- [ ] **Step 4: Verify in the browser**

Expand "Overflow / \"more\" menu", "Long-press contextual menu", and "Action button on the top bar" (Buttons & Actions category) for both platforms. Confirm the overflow anchors show three dots (horizontal for iOS, vertical for Android), the long-press caption shows a pointer icon before the text, and the top-bar highlighted action shows a download icon (iOS) / search icon (Android) inside its pill background.

- [ ] **Step 5: Commit**

```bash
git add mocks.js
git commit -m "Convert Buttons & Actions mock icons to Lucide"
```

---

### Task 5: Convert Input & Selection mocks (`datepicker`, `picker`, `checkbox`, `radio`, `searchbar`)

**Files:**
- Modify: `mocks.js:88-97` (`datepicker`), `mocks.js:102-118` (`checkbox`, `radio`), `mocks.js:120-131` (`picker`), `mocks.js:139-142` (`searchbar`)

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Convert `datepicker()`**

Replace `mocks.js:88-97`:

```js
datepicker(p){
  if(p==='ios') return `<div class="m-wheel">
    <div class="m-wheel-row">Jul 14</div>
    <div class="m-wheel-row mid">Jul 15</div>
    <div class="m-wheel-row">Jul 16</div>
  </div>`;
  return `<div class="m-dropdown">
    <div class="m-dropdown-head"><span>📅 Jul 16, 2026</span><span>▾</span></div>
  </div>`;
},
```

with:

```js
datepicker(p){
  if(p==='ios') return `<div class="m-wheel">
    <div class="m-wheel-row">Jul 14</div>
    <div class="m-wheel-row mid">Jul 15</div>
    <div class="m-wheel-row">Jul 16</div>
  </div>`;
  return `<div class="m-dropdown">
    <div class="m-dropdown-head"><span>${icon('calendar')} Jul 16, 2026</span><span>${icon('chevron-down')}</span></div>
  </div>`;
},
```

- [ ] **Step 2: Convert `checkbox()` and `radio()`**

Replace `mocks.js:102-107`:

```js
checkbox(p){
  return `<div class="m-checkrow">
    <div class="m-checkline"><span class="m-checkbox">✓</span> Remember me</div>
    <div class="m-checkline"><span class="m-checkbox" style="background:#fff;box-shadow:inset 0 0 0 2px #C9C5B8;"></span> Send updates</div>
  </div>`;
},
```

with:

```js
checkbox(p){
  return `<div class="m-checkrow">
    <div class="m-checkline"><span class="m-checkbox">${icon('check')}</span> Remember me</div>
    <div class="m-checkline"><span class="m-checkbox" style="background:#fff;box-shadow:inset 0 0 0 2px #C9C5B8;"></span> Send updates</div>
  </div>`;
},
```

Replace `mocks.js:108-119`:

```js
radio(p){
  if(p==='ios') return `<div class="m-list m-list-ios">
    <div class="m-listrow"><span>Small</span><span></span></div>
    <div class="m-listrow"><span>Medium</span><span class="m-checkmark">✓</span></div>
    <div class="m-listrow"><span>Large</span><span></span></div>
  </div>`;
  return `<div>
    <div class="m-radiorow"><div class="m-radio"></div>Small</div>
    <div class="m-radiorow"><div class="m-radio selected"></div>Medium</div>
    <div class="m-radiorow"><div class="m-radio"></div>Large</div>
  </div>`;
},
```

with:

```js
radio(p){
  if(p==='ios') return `<div class="m-list m-list-ios">
    <div class="m-listrow"><span>Small</span><span></span></div>
    <div class="m-listrow"><span>Medium</span><span class="m-checkmark">${icon('check')}</span></div>
    <div class="m-listrow"><span>Large</span><span></span></div>
  </div>`;
  return `<div>
    <div class="m-radiorow"><div class="m-radio"></div>Small</div>
    <div class="m-radiorow"><div class="m-radio selected"></div>Medium</div>
    <div class="m-radiorow"><div class="m-radio"></div>Large</div>
  </div>`;
},
```

- [ ] **Step 3: Convert `picker()`**

Replace `mocks.js:126-130`'s dropdown branch (inside `picker(p)`, `mocks.js:120-131`):

```js
picker(p){
  if(p==='ios') return `<div class="m-wheel">
    <div class="m-wheel-row">March</div>
    <div class="m-wheel-row mid">April</div>
    <div class="m-wheel-row">May</div>
  </div>`;
  return `<div class="m-dropdown">
    <div class="m-dropdown-head"><span>April</span><span>▾</span></div>
    <div class="m-dropdown-item">March</div>
    <div class="m-dropdown-item">May</div>
  </div>`;
},
```

with:

```js
picker(p){
  if(p==='ios') return `<div class="m-wheel">
    <div class="m-wheel-row">March</div>
    <div class="m-wheel-row mid">April</div>
    <div class="m-wheel-row">May</div>
  </div>`;
  return `<div class="m-dropdown">
    <div class="m-dropdown-head"><span>April</span><span>${icon('chevron-down')}</span></div>
    <div class="m-dropdown-item">March</div>
    <div class="m-dropdown-item">May</div>
  </div>`;
},
```

- [ ] **Step 4: Convert `searchbar()`**

Replace `mocks.js:139-142`:

```js
searchbar(p){
  if(p==='ios') return `<div class="m-search m-search-ios">🔍 Search</div>`;
  return `<div class="m-search m-search-android">🔍 Search</div>`;
},
```

with:

```js
searchbar(p){
  if(p==='ios') return `<div class="m-search m-search-ios">${icon('search')} Search</div>`;
  return `<div class="m-search m-search-android">${icon('search')} Search</div>`;
},
```

- [ ] **Step 5: Verify in the browser**

Expand "Date / time selection", "Checkbox", "Single choice from a list", "Scrollable value picker", and "Search input" (Input & Selection category). Confirm: Android date/picker dropdowns show a chevron-down caret (and calendar icon for the date field); the checked checkbox and selected radio row show a checkmark; both platform search bars show a magnifying-glass icon before "Search".

- [ ] **Step 6: Commit**

```bash
git add mocks.js
git commit -m "Convert Input & Selection mock icons to Lucide"
```

---

### Task 6: Convert Lists & Collections mocks (`list`)

**Files:**
- Modify: `mocks.js:143-154`

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Convert `list()`**

Replace `mocks.js:143-154`:

```js
list(p){
  if(p==='ios') return `<div class="m-list m-list-ios">
    <div class="m-listrow"><span>Inbox</span><span class="m-chev">›</span></div>
    <div class="m-listrow"><span>Drafts</span><span class="m-chev">›</span></div>
    <div class="m-listrow"><span>Sent</span><span class="m-chev">›</span></div>
  </div>`;
  return `<div class="m-list m-list-android">
    <div class="m-listrow"><span>Inbox</span></div>
    <div class="m-listrow"><span>Drafts</span></div>
    <div class="m-listrow"><span>Sent</span></div>
  </div>`;
},
```

with:

```js
list(p){
  if(p==='ios') return `<div class="m-list m-list-ios">
    <div class="m-listrow"><span>Inbox</span><span class="m-chev">${icon('chevron-right')}</span></div>
    <div class="m-listrow"><span>Drafts</span><span class="m-chev">${icon('chevron-right')}</span></div>
    <div class="m-listrow"><span>Sent</span><span class="m-chev">${icon('chevron-right')}</span></div>
  </div>`;
  return `<div class="m-list m-list-android">
    <div class="m-listrow"><span>Inbox</span></div>
    <div class="m-listrow"><span>Drafts</span></div>
    <div class="m-listrow"><span>Sent</span></div>
  </div>`;
},
```

- [ ] **Step 2: Verify in the browser**

Expand "Vertical scrolling list" (Lists & Collections). Confirm the iOS list rows each show a light-gray chevron-right at their trailing edge.

- [ ] **Step 3: Commit**

```bash
git add mocks.js
git commit -m "Convert Lists & Collections mock icons to Lucide"
```

---

### Task 7: Convert Media & Content mocks (`imageview`, `webview`)

**Files:**
- Modify: `mocks.js:164-174`
- Modify: `styles.css:488` (`.m-webview-bar`, add flex alignment for the icon+text pairing)

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Convert `imageview()` and `webview()`**

Replace `mocks.js:164-174`:

```js
imageview(p){
  const cls = p==='ios' ? 'm-image-ios' : 'm-image-android';
  return `<div class="m-image-frame ${cls}"><span>🖼️</span></div>`;
},
webview(p){
  const cls = p==='ios' ? 'm-webview-ios' : 'm-webview-android';
  return `<div class="m-webview ${cls}">
    <div class="m-webview-bar">🌐 example.com</div>
    <div class="m-webview-body"><div class="m-card-line"></div><div class="m-card-line"></div><div class="m-card-line"></div></div>
  </div>`;
},
```

with:

```js
imageview(p){
  const cls = p==='ios' ? 'm-image-ios' : 'm-image-android';
  return `<div class="m-image-frame ${cls}"><span>${icon('image')}</span></div>`;
},
webview(p){
  const cls = p==='ios' ? 'm-webview-ios' : 'm-webview-android';
  return `<div class="m-webview ${cls}">
    <div class="m-webview-bar">${icon('globe')} example.com</div>
    <div class="m-webview-body"><div class="m-card-line"></div><div class="m-card-line"></div><div class="m-card-line"></div></div>
  </div>`;
},
```

- [ ] **Step 2: Align the webview bar's icon and text**

`.m-webview-bar` (`styles.css:488`) is currently a plain text line, not a flex container — the globe icon needs vertical centering against the "example.com" text. iOS's bar is centered via `text-align:center` on `.m-webview-ios .m-webview-bar` (`styles.css:489`); Android's bar has no `text-align`, so it stays left-aligned by default block flow. Switching the shared rule to `display:flex` requires moving that centering to `justify-content:center` on the iOS-specific rule, so Android's `justify-content:flex-start` default keeps it left-aligned.

Change `styles.css:488-490` from:

```css
.m-webview-bar{ font-size:9.5px; padding:6px 10px; font-family:"Roboto Mono",monospace; }
.m-webview-ios .m-webview-bar{ background:rgba(249,249,251,.95); color:#6B6F76; box-shadow:0 1px 0 #D8D8DC; text-align:center; }
.m-webview-android .m-webview-bar{ background:#fff; color:#5B5E64; box-shadow:0 1px 4px rgba(0,0,0,.12); }
```

to:

```css
.m-webview-bar{ display:flex; align-items:center; gap:4px; font-size:9.5px; padding:6px 10px; font-family:"Roboto Mono",monospace; }
.m-webview-ios .m-webview-bar{ background:rgba(249,249,251,.95); color:#6B6F76; box-shadow:0 1px 0 #D8D8DC; justify-content:center; }
.m-webview-android .m-webview-bar{ background:#fff; color:#5B5E64; box-shadow:0 1px 4px rgba(0,0,0,.12); }
```

- [ ] **Step 3: Verify in the browser**

Expand "Displaying an image" and "Embedding web content" (Media & Content). Confirm the image placeholder shows a centered picture icon at ~24px, and the webview address bar shows a small globe icon centered before "example.com" (iOS) / left-aligned before "example.com" (Android), vertically aligned with the text.

- [ ] **Step 4: Commit**

```bash
git add mocks.js styles.css
git commit -m "Convert Media & Content mock icons to Lucide"
```

---

### Task 8: Convert Overlays & Sheets mocks (`actionsheet`, `fullscreen`)

**Files:**
- Modify: `mocks.js:218-235` (`actionsheet`), `mocks.js:251-280` (inside `fullscreen`)

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Convert `actionsheet()`**

Replace `mocks.js:229-234` (the Android branch of `actionsheet`):

```js
const inner = `<div class="m-sheet">
    <div class="m-sheet-handle"></div>
    <div class="m-listrow">🗑 Delete Conversation</div>
    <div class="m-listrow">↪ Forward</div>
  </div>`;
return deviceShell(inner, 'bottom-sheet');
```

with:

```js
const inner = `<div class="m-sheet">
    <div class="m-sheet-handle"></div>
    <div class="m-listrow">${icon('trash-2')} Delete Conversation</div>
    <div class="m-listrow">${icon('forward')} Forward</div>
  </div>`;
return deviceShell(inner, 'bottom-sheet');
```

- [ ] **Step 2: Convert the fullscreen close icon**

Replace `mocks.js:267-272` (the start of the Android branch of `fullscreen`, up through the toolbar's closing tag — the rest of the function, `.m-fs-body` onward, is unchanged):

```js
const inner = `<div class="m-fullscreen">
        <div class="m-fs-toolbar-android">
          <span class="m-fs-close">✕</span>
          <span class="m-fs-title">New Message</span>
          <span class="m-fs-save">SAVE</span>
        </div>
```

with:

```js
const inner = `<div class="m-fullscreen">
        <div class="m-fs-toolbar-android">
          <span class="m-fs-close">${icon('x')}</span>
          <span class="m-fs-title">New Message</span>
          <span class="m-fs-save">SAVE</span>
        </div>
```

- [ ] **Step 3: Verify in the browser**

Expand "List of actions from the bottom" and "Full-screen temporary flow" (Overlays & Sheets), Android column. Confirm the action-sheet rows show a trash icon before "Delete Conversation" and a forward-arrow icon before "Forward", and the fullscreen toolbar shows an X icon instead of the ✕ glyph.

- [ ] **Step 4: Commit**

```bash
git add mocks.js
git commit -m "Convert Overlays & Sheets mock icons to Lucide"
```

---

### Task 9: Convert Feedback & Status mocks (`badge`)

**Files:**
- Modify: `mocks.js:300-302`

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Convert `badge()`**

Replace `mocks.js:300-302`:

```js
badge(p){
  return `<div class="m-badge-wrap"><div class="m-badge-icon">🔔</div><div class="m-badge-dot">3</div></div>`;
},
```

with:

```js
badge(p){
  return `<div class="m-badge-wrap"><div class="m-badge-icon">${icon('bell')}</div><div class="m-badge-dot">3</div></div>`;
},
```

- [ ] **Step 2: Verify in the browser**

Expand "Small numeric/status marker" (Feedback & Status). Confirm the badge shows a bell icon in its circular gray background with the "3" count dot overlapping its corner.

- [ ] **Step 3: Commit**

```bash
git add mocks.js
git commit -m "Convert Feedback & Status mock icons to Lucide"
```

---

### Task 10: Convert System Chrome & Layout mocks (`statusbar`, `constraints`)

**Files:**
- Modify: `mocks.js:320-325` (`statusbar`), `mocks.js:338-348` (`constraints`)
- Modify: `styles.css:620` (`.m-statusbar .m-si`, add flex alignment for the icon row)

**Interfaces:**
- Consumes: `icon(name)` from Task 1.

- [ ] **Step 1: Convert `statusbar()`**

Replace `mocks.js:320-325`:

```js
statusbar(p){
  const inner = p==='ios'
    ? `<div class="m-statusbar m-statusbar-ios"><span>9:41</span><span class="m-si">••• 🛜 🔋</span></div>`
    : `<div class="m-statusbar m-statusbar-android"><span>9:41</span><span class="m-si">🔔 🛜 🔋</span></div>`;
  return deviceShell(inner, 'top-chrome', p);
},
```

with:

```js
statusbar(p){
  const inner = p==='ios'
    ? `<div class="m-statusbar m-statusbar-ios"><span>9:41</span><span class="m-si">${icon('signal')}${icon('wifi')}${icon('battery')}</span></div>`
    : `<div class="m-statusbar m-statusbar-android"><span>9:41</span><span class="m-si">${icon('bell')}${icon('wifi')}${icon('battery')}</span></div>`;
  return deviceShell(inner, 'top-chrome', p);
},
```

- [ ] **Step 2: Give `.m-si` a flex gap between icons**

Text-glyph icons were separated by literal space characters (which `letter-spacing` doesn't apply between block-level SVG children in a meaningful way once concatenated with no spaces). Change `styles.css:620`:

```css
.m-statusbar .m-si{ font-size:10px; letter-spacing:1px; }
```

to:

```css
.m-statusbar .m-si{ display:inline-flex; align-items:center; gap:4px; font-size:10px; }
```

(`letter-spacing` is dropped since it no longer has a text run to apply to; `gap` replaces its role of spacing the three icons.)

- [ ] **Step 3: Convert `constraints()`**

Replace `mocks.js:338-348`:

```js
constraints(p){
  const cls = p==='ios' ? 'ios' : 'android';
  const color = p==='ios' ? 'var(--ios)' : 'var(--android)';
  return `<div class="m-constraint-frame">
    <span class="m-pin m-pin-top" style="color:${color};">↑</span>
    <span class="m-pin m-pin-bottom" style="color:${color};">↓</span>
    <span class="m-pin m-pin-left" style="color:${color};">←</span>
    <span class="m-pin m-pin-right" style="color:${color};">→</span>
    <div class="m-constraint-box ${cls}"></div>
  </div>`;
},
```

with:

```js
constraints(p){
  const cls = p==='ios' ? 'ios' : 'android';
  const color = p==='ios' ? 'var(--ios)' : 'var(--android)';
  return `<div class="m-constraint-frame">
    <span class="m-pin m-pin-top" style="color:${color};">${icon('arrow-up')}</span>
    <span class="m-pin m-pin-bottom" style="color:${color};">${icon('arrow-down')}</span>
    <span class="m-pin m-pin-left" style="color:${color};">${icon('arrow-left')}</span>
    <span class="m-pin m-pin-right" style="color:${color};">${icon('arrow-right')}</span>
    <div class="m-constraint-box ${cls}"></div>
  </div>`;
},
```

- [ ] **Step 4: Verify in the browser**

Expand "Device status area (clock, signal, battery)" and "Constraint-based layout" (System Chrome & Layout). Confirm: both status bars show three evenly-spaced monochrome icons (signal/wifi/battery for iOS, bell/wifi/battery for Android) in white/black matching the bar's text color; the constraints diagram shows four arrow icons (up/down/left/right) around the box in the platform accent color.

- [ ] **Step 5: Full-page sweep**

With the server still running, reload `index.html` once more and scroll through every category, expanding all examples on both platforms (or use the page's own "examples" toggle if it shows them all at once). Confirm no emoji or bare Unicode arrow/chevron/dot glyph remains anywhere, and no `<svg>` renders empty (which would indicate a typo'd icon name).

- [ ] **Step 6: Commit**

```bash
git add mocks.js styles.css
git commit -m "Convert System Chrome & Layout mock icons to Lucide"
```
