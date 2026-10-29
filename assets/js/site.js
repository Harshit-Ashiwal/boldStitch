/* BoldStitch storefront behaviour — shared by sample-1/2/3.html. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const isDark = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) < 140; };
const inr = n => '₹' + n.toLocaleString('en-IN');

const C = { black: '#151515', white: '#F8F8F6', offwhite: '#EFE8DA', navy: '#1F2A44', coffee: '#7A5A43', burgundy: '#6E1F2C' };
const COLOR_NAME = Object.fromEntries(Object.entries({ Black: C.black, White: C.white, 'Off-white': C.offwhite, Navy: C.navy, Coffee: C.coffee, Burgundy: C.burgundy }).map(([k, v]) => [v, k]));

function garment(type, color, { logo = false, hanger = true } = {}) {
  const lx = type === 'tee' ? 110 : 106, ly = type === 'hoodie' ? 110 : 96;
  const mark = logo ? `<image href="assets/brand/logo-${isDark(color) ? 'light' : 'dark'}.png" x="${lx}" y="${ly}" width="40" height="12"/>` : '';
  return `<svg viewBox="0 0 200 260" style="color:${color}" aria-hidden="true">${hanger ? '<use href="#hanger"/>' : ''}<use href="#${type}"/>${mark}</svg>`;
}

/* ---------- intro loader (once per session) ---------- */
(function intro() {
  const root = document.documentElement, loader = $('#loader');
  if (!loader) return;
  if (!root.classList.contains('is-loading')) { loader.remove(); return; }
  const pct = $('#ldPct'), t0 = performance.now(), MIN = 3000;
  let loaded = document.readyState === 'complete', done = false;
  const finish = () => {
    if (done) return; done = true;
    pct.textContent = '100';
    try { sessionStorage.setItem('bs_intro', '1'); } catch (e) {}
    loader.classList.add('leaving');
    root.classList.remove('is-loading');
    setTimeout(() => loader.remove(), 1300);
  };
  addEventListener('load', () => { loaded = true; setTimeout(finish, Math.max(0, MIN - (performance.now() - t0))); });
  if (loaded) setTimeout(finish, MIN);
  setTimeout(finish, 7000); // never trap visitors behind the intro on a slow connection
  (function tick(now) {
    if (done) return;
    const k = Math.min((now - t0) / MIN, 1);
    pct.textContent = String(Math.round((loaded ? 100 : 92) * (1 - Math.pow(1 - k, 3)))).padStart(3, '0');
    requestAnimationFrame(tick);
  })(t0);
})();

/* ---------- bag ---------- */
let bag = 0;
function addToBag(btn) {
  const count = $('#bagCount'); count.textContent = ++bag;
  count.classList.add('pop'); setTimeout(() => count.classList.remove('pop'), 300);
  if (btn) { const t = btn.textContent; btn.classList.add('done'); btn.textContent = 'Added ✓'; setTimeout(() => { btn.classList.remove('done'); btn.textContent = t; }, 1400); }
}

/* ---------- the rail: garments hang side-on and turn to face you on hover ---------- */
const RAIL = [
  { name: 'Jet Black Tee', type: 'tee', color: C.black, logo: 1, price: 999, tag: '-20%', desc: 'Heavyweight 240 GSM cotton, cut for a clean drape.' },
  { name: 'Ivory Tee', type: 'tee', color: C.offwhite, logo: 1, price: 999, tag: 'NEW', desc: 'Soft off-white cotton in our signature tone.' },
  { name: 'Navy Tee', type: 'tee', color: C.navy, logo: 1, price: 999, desc: 'Deep navy cotton that only gets better with wear.' },
  { name: 'Coffee Brown Tee', type: 'tee', color: C.coffee, logo: 0, price: 1099, tag: 'ONLY 3 LEFT', desc: 'Garment-dyed for a soft, lived-in tone.' },
  { name: 'Burgundy Tee', type: 'tee', color: C.burgundy, logo: 1, price: 1099, desc: 'Rich burgundy cotton with a gold-thread logo.' },
  { name: 'Optic White Tee', type: 'tee', color: C.white, logo: 1, price: 999, desc: 'The everyday essential — crisp, bright, and built thick.' },
  { name: 'Oversized Black Tee', type: 'tee', color: C.black, logo: 0, price: 1099, tag: 'NEW', desc: 'Dropped shoulders and a relaxed, boxy fit.' },
  { name: 'Off-White Oversized Tee', type: 'tee', color: C.offwhite, logo: 1, price: 1099, desc: 'Relaxed fit in heavyweight off-white cotton.' },
];

(function rack() {
  const rail = $('.rail'), track = $('#track'), cap = $('#cap');
  if (!track) return;
  const items = RAIL;
  const DEFAULT = [cap.querySelector('.name').textContent, cap.querySelector('.desc').textContent];
  let touched = false, current = null;

  items.forEach((it, i) => {
    const slot = document.createElement('div');
    slot.className = 'slot'; slot.tabIndex = 0; slot.setAttribute('role', 'button'); slot.setAttribute('aria-label', `${it.name}, ${inr(it.price)}`);
    slot.innerHTML = `<div class="swing" style="--d:${(-i * .41).toFixed(2)}s;--t:${rand(3.4, 4.8).toFixed(2)}s"><div class="turn">${garment(it.type, it.color, { logo: it.logo })}</div></div>`
      + (it.tag ? `<span class="htag" style="animation-delay:${(-i * .3).toFixed(1)}s">${it.tag}</span>` : '');
    slot._item = it;
    track.append(slot);
  });

  function caption(name, desc) {
    cap.classList.add('swap');
    clearTimeout(cap._t);
    cap._t = setTimeout(() => { cap.querySelector('.name').textContent = name; cap.querySelector('.desc').textContent = desc; cap.classList.remove('swap'); }, 200);
  }
  function activate(slot) {
    if (current === slot) return;
    current?.classList.remove('on');
    current = slot;
    if (!slot) { caption(...DEFAULT); return; }
    slot.classList.add('on');
    caption(`${slot._item.name} · ${inr(slot._item.price)}`, slot._item.desc);
  }

  track.addEventListener('pointerover', e => { const s = e.target.closest('.slot'); if (s && e.pointerType === 'mouse') { touched = true; activate(s); } });
  track.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') activate(null); });
  track.addEventListener('focusin', e => { touched = true; activate(e.target.closest('.slot')); });
  track.addEventListener('click', e => {
    const s = e.target.closest('.slot'); if (!s) return;
    touched = true;
    if (current !== s) { activate(s); return; } // first tap on touch screens turns it around
    openZoom(s._item, s.querySelector('.turn'));
  });
  track.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const s = e.target.closest('.slot'); s && openZoom(s._item, s.querySelector('.turn')); } });

  // a one-time hint: the middle garment turns to face you, then goes back
  const wait = document.documentElement.classList.contains('is-loading') ? 5400 : 2600;
  setTimeout(() => {
    if (touched) return;
    const mid = track.children[Math.floor(track.children.length / 2)];
    activate(mid);
    setTimeout(() => { if (!touched) activate(null); }, 2200);
  }, wait);
})();

/* ---------- zoom view ---------- */
const zoom = $('#zoom');
function openZoom(it, fromEl) {
  $('.z-art', zoom).innerHTML = garment(it.type, it.color, { logo: it.logo });
  $('.z-eyebrow', zoom).textContent = `${COLOR_NAME[it.color] || ''} · ${{ tee: 'T-shirt', hoodie: 'Hoodie', sweat: 'Crewneck' }[it.type]}`;
  $('h3', zoom).textContent = it.name;
  $('.price', zoom).textContent = inr(it.price);
  $('.desc', zoom).textContent = it.desc;
  zoom.hidden = false; document.body.style.overflow = 'hidden';
  const art = $('.z-art', zoom), to = art.getBoundingClientRect(), from = fromEl.getBoundingClientRect();
  const s = from.height / to.height;
  art.animate([
    { transform: `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${s})` },
    { transform: 'none' },
  ], { duration: 750, easing: 'cubic-bezier(.2,.8,.2,1)' });
  zoom.animate([{ backgroundColor: 'rgba(247,237,220,0)' }, { backgroundColor: 'rgba(247,237,220,.9)' }], { duration: 500 });
  $('.z-info', zoom).animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 250, fill: 'backwards', easing: 'cubic-bezier(.2,.8,.2,1)' });
  $('.z-close', zoom).focus({ preventScroll: true });
}
function closeZoom() {
  if (zoom.hidden) return;
  zoom.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280 }).onfinish = () => { zoom.hidden = true; document.body.style.overflow = ''; };
}
if (zoom) {
  $('.z-close', zoom).onclick = closeZoom;
  zoom.addEventListener('click', e => { if (e.target === zoom) closeZoom(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeZoom(); });
  $$('.sizes button', zoom).forEach(b => b.onclick = () => $$('.sizes button', zoom).forEach(x => x.classList.toggle('on', x === b)));
  $('.z-add', zoom).onclick = e => addToBag(e.currentTarget);
}

/* ---------- boxes drop once per page load: black only, small, lots of them ---------- */
(function dropBoxes() {
  const drop = $('#drop'); if (!drop) return;
  const W = innerWidth, small = W < 700;
  const rows = [
    { n: Math.round(W / (small ? 22 : 30)), min: small ? 16 : 22, max: small ? 24 : 32, bottom: 20, o: .55, base: .35 },
    { n: Math.round(W / (small ? 26 : 36)), min: small ? 20 : 26, max: small ? 30 : 42, bottom: 0, o: 1, base: .6 },
  ];
  rows.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const img = new Image(), w = rand(r.min, r.max);
      img.src = 'assets/box-black.png'; img.alt = '';
      img.style.cssText = `width:${w.toFixed(0)}px; left:calc(${((i + rand(.15, .85)) / r.n * 100).toFixed(2)}% - ${(w / 2).toFixed(0)}px); bottom:${r.bottom}px; z-index:${ri};
        --o:${r.o}; --delay:${(r.base + i * .035 + rand(0, .3)).toFixed(2)}s; --fall:${rand(.95, 1.35).toFixed(2)}s; --r0:${rand(-30, 30).toFixed(0)}deg; --r:${rand(-7, 7).toFixed(1)}deg`;
      drop.append(img);
    }
  });
})();

/* ---------- collection: categories first, products inside ---------- */
const CATS = {
  men:    { label: 'Men', blurb: 'Tees, hoodies & crews', art: [['hoodie', C.navy], ['tee', C.offwhite]] },
  women:  { label: 'Women', blurb: 'Relaxed fits, soft tones', art: [['tee', C.white], ['sweat', C.offwhite]] },
  drops:  { label: 'New Drops', blurb: 'Fresh off the rail', art: [['tee', C.coffee], ['hoodie', C.burgundy]] },
  custom: { label: 'Custom Studio', blurb: 'Your print, your embroidery', art: [['sweat', C.black], ['tee', C.offwhite]] },
};
const PRODUCTS = [
  { cat: 'men', name: 'Signature Tee', type: 'tee', price: 999, tag: 'Bestseller', colors: [C.black, C.white, C.navy, C.coffee], logo: 1 },
  { cat: 'men', name: 'Heavyweight Hoodie', type: 'hoodie', price: 2499, tag: 'New', colors: [C.navy, C.black, C.burgundy, C.offwhite], logo: 1 },
  { cat: 'men', name: 'Embroidered Crew', type: 'sweat', price: 1899, tag: 'Embroidery', colors: [C.coffee, C.black, C.offwhite], logo: 1 },
  { cat: 'men', name: 'Oversized Tee', type: 'tee', price: 1099, tag: 'Relaxed fit', colors: [C.burgundy, C.black, C.offwhite], logo: 1 },
  { cat: 'women', name: 'Relaxed Tee', type: 'tee', price: 999, tag: 'Bestseller', colors: [C.offwhite, C.white, C.burgundy], logo: 1 },
  { cat: 'women', name: 'Cloud Hoodie', type: 'hoodie', price: 2399, tag: 'New', colors: [C.offwhite, C.coffee, C.black], logo: 1 },
  { cat: 'women', name: 'Classic Crewneck', type: 'sweat', price: 1799, tag: 'Soft fleece', colors: [C.white, C.navy, C.burgundy], logo: 1 },
  { cat: 'women', name: 'Boxy Tee', type: 'tee', price: 1049, tag: 'Boxy fit', colors: [C.coffee, C.black, C.white], logo: 0 },
  { cat: 'drops', name: 'Burgundy Edit Hoodie', type: 'hoodie', price: 2599, tag: 'Just in', colors: [C.burgundy, C.black], logo: 1 },
  { cat: 'drops', name: 'Navy Night Tee', type: 'tee', price: 1099, tag: 'Just in', colors: [C.navy, C.offwhite], logo: 1 },
  { cat: 'drops', name: 'Latte Crewneck', type: 'sweat', price: 1899, tag: 'Limited', colors: [C.coffee, C.offwhite], logo: 1 },
  { cat: 'custom', name: 'Custom Print Tee', type: 'tee', price: 1199, tag: 'Printing', colors: [C.white, C.black, C.navy, C.offwhite], logo: 0 },
  { cat: 'custom', name: 'Embroidered Name Hoodie', type: 'hoodie', price: 2799, tag: 'Embroidery', colors: [C.black, C.navy, C.burgundy], logo: 0 },
  { cat: 'custom', name: 'Team Pack (10 Tees)', type: 'tee', price: 8990, tag: 'Bulk', colors: [C.black, C.white, C.coffee], logo: 0 },
];

(function collection() {
  const cats = $('#cats'), shop = $('#shop'), grid = $('#grid'), tabs = $('#tabs');
  if (!cats) return;
  const count = Object.fromEntries(Object.keys(CATS).map(k => [k, PRODUCTS.filter(p => p.cat === k).length]));

  cats.innerHTML = Object.entries(CATS).map(([k, c], i) => `
    <article class="cat cat-${k} reveal" data-cat="${k}" tabindex="0" role="button" style="transition-delay:${i * .08}s" aria-label="Shop ${c.label}">
      <div class="cat-top"><span>0${i + 1}</span><span>${count[k]} styles</span></div>
      <div class="cat-art"><div class="pair">${c.art.map(([t, col]) => `<div class="pc">${garment(t, col, { logo: true })}</div>`).join('')}</div></div>
      <div><h3>${c.label}</h3><p>${c.blurb}</p><button class="go" tabindex="-1"><span>Shop ${c.label.split(' ')[0]}</span><i>→</i></button></div>
    </article>`).join('');
  tabs.innerHTML = Object.entries(CATS).map(([k, c]) => `<button data-cat="${k}">${c.label}</button>`).join('');

  function render(cat) {
    $$('button', tabs).forEach(b => b.classList.toggle('on', b.dataset.cat === cat));
    grid.innerHTML = '';
    PRODUCTS.filter(p => p.cat === cat).forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'card'; card.style.animationDelay = `${i * .07}s`;
      card.innerHTML = `
        <span class="tag">${p.tag}</span>
        <div class="stage" style="--d:${-i * .8}s">${garment(p.type, p.colors[0], { logo: p.logo, hanger: false })}</div>
        <h3>${p.name}</h3>
        <div class="row"><span class="price">${inr(p.price)}</span>
          <div class="swatches">${p.colors.map((c, j) => `<button aria-label="${COLOR_NAME[c]}" title="${COLOR_NAME[c]}" style="background:${c}" class="${j ? '' : 'on'}" data-c="${c}"></button>`).join('')}</div></div>
        <button class="add">Add to bag</button>`;
      $$('.swatches button', card).forEach(b => b.onclick = () => {
        $$('.swatches button', card).forEach(x => x.classList.toggle('on', x === b));
        $('.stage', card).innerHTML = garment(p.type, b.dataset.c, { logo: p.logo, hanger: false });
      });
      $('.add', card).onclick = e => addToBag(e.currentTarget);
      grid.append(card);
    });
  }
  function open(cat) {
    cats.classList.add('away');
    setTimeout(() => { cats.hidden = true; shop.hidden = false; render(cat); $('#collection').scrollIntoView({ behavior: 'smooth' }); }, 350);
  }
  cats.addEventListener('click', e => { const c = e.target.closest('.cat'); c && open(c.dataset.cat); });
  cats.addEventListener('keydown', e => { const c = e.target.closest('.cat'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(c.dataset.cat); } });
  tabs.addEventListener('click', e => { const b = e.target.closest('button'); b && render(b.dataset.cat); });
  $('#back').onclick = () => { shop.hidden = true; cats.hidden = false; requestAnimationFrame(() => cats.classList.remove('away')); };
})();

/* ---------- nav, reveal, counters ---------- */
const nav = $('nav.top');
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true });
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in'); io.unobserve(en.target);
  $$('[data-count]', en.target).forEach(el => {
    const end = +el.dataset.count, t0 = performance.now();
    const tick = now => { const k = Math.min((now - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}), { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- contact ---------- */
$('#form')?.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (!f.name.value.trim() || !/^\S+@\S+\.\S+$/.test(f.email.value)) { (f.name.value.trim() ? f.email : f.name).focus(); return; }
  $('#thanks').classList.add('show');
  setTimeout(() => { $('#thanks').classList.remove('show'); f.reset(); }, 4200);
});
