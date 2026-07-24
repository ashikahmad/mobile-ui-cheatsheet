function deviceShell(innerHtml, position, platform){
  if(position === 'top' || position === 'top-chrome'){
    const marker = platform === 'android' ? `<div class="m-shell-punch"></div>` : `<div class="m-shell-notch"></div>`;
    const chromeClass = position === 'top-chrome' ? ' chrome' : '';
    return `<div class="m-shell crop-top${chromeClass}">${marker}<div class="m-shell-content">${innerHtml}</div></div>`;
  }
  if(position === 'bottom' || position === 'bottom-sheet'){
    const sheetClass = position === 'bottom-sheet' ? ' sheet' : '';
    return `<div class="m-shell crop-bottom${sheetClass}"><div class="m-shell-content">${innerHtml}</div><div class="m-shell-home-pill"></div></div>`;
  }
  if(position === 'floating-bottom'){
    return `<div class="m-shell crop-bottom floating"><div class="m-shell-content">${innerHtml}</div><div class="m-shell-home-pill"></div></div>`;
  }
  return `<div class="m-shell full"><div class="m-shell-content">${innerHtml}</div></div>`;
}

function iosActivityTicks(){
  const ticks = Array.from({length:8}, (_, i) => {
    const opacity = (1 - i*0.11).toFixed(2);
    return `<div class="m-tick" style="transform:rotate(${i*45}deg);opacity:${opacity};"></div>`;
  }).join('');
  return `<div class="m-activity">${ticks}</div>`;
}

const MOCKS = {
  navbar(p){
    const inner = p==='ios'
      ? `<div class="m-navbar m-navbar-ios"><span class="m-back">${icon('chevron-left')} Back</span><span class="m-title">Title</span><span class="m-action">Edit</span></div>`
      : `<div class="m-navbar m-navbar-android"><span>${icon('arrow-left')}</span><span class="m-title">Title</span><span class="m-icons">${icon('more-vertical')}</span></div>`;
    return deviceShell(inner, 'top', p);
  },
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
  drawer(p){
    const inner = `<div class="m-drawer"><div class="m-drawer-panel">
        <div class="m-listrow"><span>Inbox</span></div>
        <div class="m-listrow"><span>Starred</span></div>
        <div class="m-listrow"><span>Sent</span></div>
      </div><div class="m-drawer-scrim"></div></div>`;
    return deviceShell(inner, 'cover');
  },
  backrow(p){
    if(p==='ios') return `<div style="text-align:center;font-size:12px;"><span style="color:var(--ios);font-weight:600;">${icon('chevron-left')} Back</span><div style="color:#8E8E93;font-size:10px;margin-top:6px;">+ edge-swipe gesture</div></div>`;
    return `<div style="text-align:center;font-size:12px;"><span style="color:var(--android);font-weight:600;">${icon('arrow-left')} Up</span><div style="color:#8E8E93;font-size:10px;margin-top:6px;">+ system back gesture</div></div>`;
  },
  segmented(p){
    if(p==='ios') return `<div class="m-segmented"><span class="active">Day</span><span>Week</span><span>Month</span></div>`;
    return `<div class="m-tabsrow"><span class="active">Day</span><span>Week</span><span>Month</span></div>`;
  },
  button(p){
    if(p==='ios') return `<button class="m-btn m-btn-ios">Continue</button>`;
    return `<button class="m-btn m-btn-android">Continue</button>`;
  },
  fab(p){
    return `<div class="m-fab">+</div>`;
  },
  overflow(p){
    if(p==='ios') return `<div><div class="m-menu-anchor">${icon('more-horizontal')}</div><div class="m-menu">
      <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
    return `<div><div class="m-menu-anchor">${icon('more-vertical')}</div><div class="m-menu">
      <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
  },
  contextmenu(p){
    return `<div><div class="m-menu-anchor" style="text-align:center;font-size:10.5px;color:#8E8E93;">${icon('pointer')} long-press item</div><div class="m-menu">
      <div class="m-dropdown-item">Rename</div><div class="m-dropdown-item">Duplicate</div><div class="m-dropdown-item">Delete</div></div></div>`;
  },
  swipe(p){
    return `<div class="m-swipe"><div class="m-swipe-content">Grocery list</div><div class="m-swipe-action">Delete</div></div>`;
  },
  textfield(p){
    if(p==='ios') return `<div class="m-field-ios">Email address</div>`;
    return `<div class="m-field-android"><span class="m-label">Email</span>you@example.com</div>`;
  },
  textarea(p){
    if(p==='ios') return `<div class="m-field-ios" style="min-height:52px;">Add a comment…</div>`;
    return `<div class="m-field-android" style="min-height:52px;"><span class="m-label">Comment</span>Add a comment…</div>`;
  },
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
  switch(p){
    if(p==='ios') return `<div class="m-switch-row"><span>Notifications</span><div class="m-switch m-switch-ios"><div class="m-knob"></div></div></div>`;
    return `<div class="m-switch-row"><span>Notifications</span><div class="m-switch m-switch-android"><div class="m-knob"></div></div></div>`;
  },
  checkbox(p){
    return `<div class="m-checkrow">
      <div class="m-checkline"><span class="m-checkbox">${icon('check')}</span> Remember me</div>
      <div class="m-checkline"><span class="m-checkbox" style="background:#fff;box-shadow:inset 0 0 0 2px #C9C5B8;"></span> Send updates</div>
    </div>`;
  },
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
  slider(p){
    if(p==='ios') return `<div class="m-slider"><div class="m-track"><div class="m-track-fill" style="width:55%;background:var(--ios);"></div><div class="m-thumb" style="left:55%;"></div></div></div>`;
    return `<div class="m-slider"><div class="m-track m-track-android"><div class="m-track-fill" style="width:55%;background:var(--android);"></div><div class="m-thumb" style="left:55%;width:18px;height:18px;"></div></div></div>`;
  },
  stepper(p){
    return `<div class="m-stepper"><span>–</span><span>+</span></div>`;
  },
  searchbar(p){
    if(p==='ios') return `<div class="m-search m-search-ios">${icon('search')} Search</div>`;
    return `<div class="m-search m-search-android">${icon('search')} Search</div>`;
  },
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
  grid(p){
    const cls = p==='ios' ? 'm-grid-ios' : 'm-grid-android';
    const items = Array.from({length:6}, (_, i) => `<div>${i+1}</div>`).join('');
    return `<div class="m-grid ${cls}">${items}</div>`;
  },
  card(p){
    const cls = p==='ios' ? 'm-card-ios' : 'm-card-android';
    return `<div class="${cls}"><div class="m-card-line"></div><div class="m-card-line"></div><div class="m-card-line"></div></div>`;
  },
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
  divider(p){
    const cls = p==='ios' ? 'm-divider-ios' : 'm-divider-android';
    return `<div class="m-divider-demo">
      <div class="m-card-line"></div>
      <div class="${cls}"></div>
      <div class="m-card-line"></div>
      <div class="${cls}"></div>
      <div class="m-card-line"></div>
    </div>`;
  },
  actionbutton(p){
    const inner = p==='ios'
      ? `<div class="m-navbar m-navbar-ios"><span class="m-back">${icon('chevron-left')} Back</span><span class="m-title">Title</span><span class="m-action m-action-highlight">${icon('download')}</span></div>`
      : `<div class="m-navbar m-navbar-android"><span>${icon('arrow-left')}</span><span class="m-title">Title</span><span class="m-action-highlight">${icon('search')}</span></div>`;
    return deviceShell(inner, 'top', p);
  },
  refresh(p){
    if(p==='ios') return `<div class="m-refresh"><div style="margin-bottom:8px;">${iosActivityTicks()}</div>Pull to refresh</div>`;
    return `<div class="m-refresh"><div class="m-spinner m-spinner-android" style="margin-bottom:8px;"></div>Pull to refresh</div>`;
  },
  sticky(p){
    const cls = p==='ios' ? 'm-sticky-ios' : 'm-sticky-android';
    const inner = `<div class="m-sticky ${cls}">
      <div class="m-sticky-head">A</div>
      <div class="m-listrow">Alicia</div>
      <div class="m-listrow">Amir</div>
      <div class="m-sticky-head">B</div>
      <div class="m-listrow">Beth</div>
    </div>`;
    return deviceShell(inner, 'cover');
  },
  alert(p){
    if(p==='ios') return `<div class="m-dialog-ios">
      <div class="m-dtitle">Delete photo?</div>
      <div class="m-dmsg">This action can't be undone.</div>
      <div class="m-dbtns"><span>Cancel</span><span>Delete</span></div>
    </div>`;
    return `<div class="m-dialog-android">
      <div class="m-dtitle">Delete photo?</div>
      <div class="m-dmsg">This action can't be undone.</div>
      <div class="m-dbtns"><span>CANCEL</span><span>DELETE</span></div>
    </div>`;
  },
  actionsheet(p){
    if(p==='ios'){
      const inner = `<div class="m-actionsheet">
        <div class="m-actionsheet-group">
          <div class="m-actionsheet-row danger">Delete Conversation</div>
          <div class="m-actionsheet-row">Forward</div>
        </div>
        <div class="m-actionsheet-row m-actionsheet-cancel">Cancel</div>
      </div>`;
      return deviceShell(inner, 'bottom');
    }
    const inner = `<div class="m-sheet">
        <div class="m-sheet-handle"></div>
        <div class="m-listrow">🗑 Delete Conversation</div>
        <div class="m-listrow">↪ Forward</div>
      </div>`;
    return deviceShell(inner, 'bottom-sheet');
  },
  sheet(p){
    const inner = `<div class="m-sheet">
        <div class="m-sheet-handle"></div>
        <div class="m-card-line" style="width:40%;height:9px;margin-bottom:10px;"></div>
        <div class="m-card-line"></div>
        <div class="m-card-line"></div>
      </div>`;
    return deviceShell(inner, 'bottom-sheet');
  },
  popover(p){
    if(p==='ios') return `<div class="m-popover m-popover-ios">
      <div class="m-listrow">Share</div><div class="m-listrow">Copy Link</div></div>`;
    return `<div class="m-popover">
      <div class="m-listrow">Share</div><div class="m-listrow">Copy Link</div></div>`;
  },
  fullscreen(p){
    if(p==='ios'){
      const inner = `<div class="m-fullscreen">
        <div class="m-navbar m-navbar-ios">
          <span class="m-back">Cancel</span>
          <span class="m-title">New Message</span>
          <span class="m-action">Send</span>
        </div>
        <div class="m-fs-body">
          <div class="m-card-line"></div>
          <div class="m-card-line"></div>
          <div class="m-card-line" style="width:70%;"></div>
        </div>
      </div>`;
      return deviceShell(inner, 'cover');
    }
    const inner = `<div class="m-fullscreen">
        <div class="m-fs-toolbar-android">
          <span class="m-fs-close">✕</span>
          <span class="m-fs-title">New Message</span>
          <span class="m-fs-save">SAVE</span>
        </div>
        <div class="m-fs-body">
          <div class="m-card-line"></div>
          <div class="m-card-line"></div>
          <div class="m-card-line" style="width:70%;"></div>
        </div>
      </div>`;
    return deviceShell(inner, 'cover');
  },
  toast(p){
    return deviceShell(`<div class="m-toast">Saved to Downloads</div>`, 'floating-bottom');
  },
  snackbar(p){
    return deviceShell(`<div class="m-snackbar"><span>Message archived</span><span class="action">UNDO</span></div>`, 'floating-bottom');
  },
  spinner(p){
    const cls = p==='ios' ? 'm-spinner-ios' : 'm-spinner-android';
    return `<div class="m-spinner ${cls}"></div>`;
  },
  activityindicator(p){
    if(p==='ios') return iosActivityTicks();
    return `<div class="m-spinner m-spinner-android"></div>`;
  },
  progress(p){
    const color = p==='ios' ? 'var(--ios)' : 'var(--android)';
    const h = p==='ios' ? '5px' : '7px';
    return `<div class="m-progress" style="height:${h};"><div class="m-progress-fill" style="background:${color};"></div></div>`;
  },
  badge(p){
    return `<div class="m-badge-wrap"><div class="m-badge-icon">🔔</div><div class="m-badge-dot">3</div></div>`;
  },
  depth(p){
    if(p==='ios') return `<div class="m-depth-row">
      <div class="m-depth-card" style="box-shadow:0 1px 2px rgba(0,0,0,.12);"></div>
      <div class="m-depth-card" style="box-shadow:0 3px 8px rgba(0,0,0,.18);"></div>
    </div>`;
    return `<div class="m-depth-row">
      <div class="m-depth-card" style="box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>
      <div class="m-depth-card" style="box-shadow:0 8px 16px rgba(0,0,0,.3);"></div>
    </div>`;
  },
  darkmode(p){
    const dark = p==='ios' ? '#1C1C1E' : '#121212';
    return `<div class="m-dark-row">
      <div class="m-dark-swatch" style="background:#F2F2F7;color:#8E8E93;">Light</div>
      <div class="m-dark-swatch" style="background:${dark};color:#fff;">Dark</div>
    </div>`;
  },
  statusbar(p){
    const inner = p==='ios'
      ? `<div class="m-statusbar m-statusbar-ios"><span>9:41</span><span class="m-si">••• 🛜 🔋</span></div>`
      : `<div class="m-statusbar m-statusbar-android"><span>9:41</span><span class="m-si">🔔 🛜 🔋</span></div>`;
    return deviceShell(inner, 'top-chrome', p);
  },
  safearea(p){
    if(p==='ios') return `<div class="m-shell full"><div class="m-notch"></div><div class="m-safe-inset ios">Safe Area</div></div>`;
    return `<div class="m-shell full"><div class="m-punch"></div><div class="m-safe-inset android">Content area</div></div>`;
  },
  homeindicator(p){
    const caption = p==='ios' ? 'Home Indicator' : 'Gesture pill (or 3-button nav)';
    return deviceShell(`<div class="m-bottomstrip-caption">${caption}</div>`, 'bottom');
  },
  stack(p){
    const cls = p==='ios' ? 'ios' : 'android';
    return `<div class="m-stackdemo"><div class="m-stackbox ${cls}"></div><div class="m-stackbox ${cls}"></div><div class="m-stackbox ${cls}"></div></div>`;
  },
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
  stacknav(p){
    const cls = p==='ios' ? 'ios' : 'android';
    return `<div class="m-navstack"><div class="m-navstack-back"></div><div class="m-navstack-front ${cls}"><span>Screen B</span></div></div>`;
  },
  modalpresent(p){
    if(p==='ios'){
      return `<div class="m-modalstack">
        <div class="m-modalstack-back"></div>
        <div class="m-modalstack-scrim"></div>
        <div class="m-modalstack-sheet"><span>New Screen</span></div>
      </div>`;
    }
    return `<div class="m-modalstack">
      <div class="m-modalstack-back"></div>
      <div class="m-modalstack-scrim"></div>
      <div class="m-modalstack-dialog"><span>New Screen</span></div>
    </div>`;
  },
  haptic(p){
    if(p==='ios') return `<div class="m-haptic-wrap">
      <div class="m-haptic">
        <div class="m-haptic-ring ios"></div>
        <div class="m-haptic-ring ios delay"></div>
        <div class="m-haptic-core ios"></div>
      </div>
      <div class="m-haptic-labels">Light · Medium · Heavy · Success · Error</div>
    </div>`;
    return `<div class="m-haptic-wrap">
      <div class="m-haptic">
        <div class="m-haptic-ring android"></div>
        <div class="m-haptic-core android"></div>
      </div>
      <div class="m-haptic-labels">Single vibration effect</div>
    </div>`;
  },
  guideline(p){
    if(p==='ios') return `<a class="m-specdoc" href="https://developer.apple.com/design/" target="_blank" rel="noopener">
      <div class="m-specdoc-bar ios"></div>
      <div class="m-specdoc-title">Human Interface<br>Guidelines</div>
      <div class="m-specdoc-sub">developer.apple.com/design</div>
    </a>`;
    return `<a class="m-specdoc" href="https://m3.material.io/" target="_blank" rel="noopener">
      <div class="m-specdoc-bar android"></div>
      <div class="m-specdoc-title">Material Design 3</div>
      <div class="m-specdoc-sub">m3.material.io</div>
    </a>`;
  },
  declarative(p){
    if(p==='ios') return codeCard([
      {t:'VStack {', i:0},
      {t:'Text("Hello")', i:1},
      {t:'Button("Tap") { }', i:1},
      {t:'}', i:0},
    ], 'ios');
    return codeCard([
      {t:'Column {', i:0},
      {t:'Text("Hello")', i:1},
      {t:'Button(onClick={}) { }', i:1},
      {t:'}', i:0},
    ], 'android');
  },
  imperative(p){
    if(p==='ios') return codeCard([
      {t:'let label = UILabel()', i:0},
      {t:'label.text = "Hello"', i:0},
      {t:'view.addSubview(label)', i:0},
    ], 'ios');
    return codeCard([
      {t:'val tv = TextView(ctx)', i:0},
      {t:'tv.text = "Hello"', i:0},
      {t:'layout.addView(tv)', i:0},
    ], 'android');
  },
  iconsystem(p){
    if(p==='ios') return `<a class="m-specdoc" href="https://developer.apple.com/sf-symbols/" target="_blank" rel="noopener">
      <div class="m-specdoc-bar ios"></div>
      <div class="m-specdoc-title">SF Symbols</div>
      <div class="m-specdoc-sub">developer.apple.com/sf-symbols</div>
    </a>`;
    return `<a class="m-specdoc" href="https://fonts.google.com/icons" target="_blank" rel="noopener">
      <div class="m-specdoc-bar android"></div>
      <div class="m-specdoc-title">Material Symbols</div>
      <div class="m-specdoc-sub">fonts.google.com/icons</div>
    </a>`;
  }
};

function codeCard(lines, platform){
  const rows = lines.map(l => `<div class="m-code-line" style="padding-left:${l.i*14}px;">${l.t}</div>`).join('');
  return `<div class="m-code ${platform}">${rows}</div>`;
}
