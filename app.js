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
  const preview = entry.demo ? renderCellPreview(entry, key) : '';
  return `<div class="platform-cell"><span class="label-mobile">${mobileLabel}</span>${inner}${preview}</div>`;
}

function renderCellPreview(entry, key){
  const p = entry[key];
  const label = key === 'ios' ? 'iOS' : 'Android';
  const inner = p.none
    ? `<div class="m-unsupported"><div class="m-unsupported-icon">–</div><div class="m-unsupported-text">${p.term}</div></div>`
    : `<div class="m-body">${MOCKS[entry.demo](key)}</div>`;
  return `<div class="m-frame m-frame-${key}"><span class="m-frame-tag"><span class="dot ${key}"></span>${label}</span>${inner}</div>`;
}

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
    const hidden = document.body.classList.toggle('examples-hidden');
    toggleBtn.textContent = hidden ? 'Show all examples' : 'Hide all examples';
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
