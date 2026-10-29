/* BoldStitch account — front-end demo session (no server). login.html writes the user; this renders sign in / avatar menu / log out. */
const BSAuth = {
  get() {
    try { return JSON.parse(localStorage.getItem('bs_user') || sessionStorage.getItem('bs_user') || 'null'); } catch (e) { return null; }
  },
  set(user, remember) {
    try { (remember ? localStorage : sessionStorage).setItem('bs_user', JSON.stringify(user)); } catch (e) {}
  },
  clear() {
    try { localStorage.removeItem('bs_user'); sessionStorage.removeItem('bs_user'); } catch (e) {}
  },
  initials(name) { return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase(); },
};

function bsToast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status');
  t.innerHTML = `<img src="assets/brand/icon-64.png" alt=""><span></span>`;
  t.querySelector('span').textContent = msg;
  document.body.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3200);
}

(function renderAccount() {
  const slot = document.getElementById('account');
  if (!slot) return;
  const ICON = {
    bag: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    out: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
  };
  const svg = k => `<svg viewBox="0 0 24 24">${ICON[k]}</svg>`;

  function draw() {
    const user = BSAuth.get();
    if (!user) {
      slot.innerHTML = `<a class="signin" href="login.html">${svg('user').replace('<svg', '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"')}Sign in</a>`;
      return;
    }
    slot.innerHTML = `
      <button class="avatar" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu"></button>
      <div class="menu" role="menu">
        <div class="menu-head"><span class="avatar"></span><div><strong></strong><small></small></div></div>
        <a href="#collection" role="menuitem">${svg('bag')}My orders</a>
        <a href="#collection" role="menuitem">${svg('heart')}Wishlist</a>
        <a href="login.html" role="menuitem">${svg('user')}Account settings</a>
        <button class="item logout" role="menuitem">${svg('out')}Log out</button>
      </div>`;
    slot.querySelectorAll('.avatar').forEach(a => a.textContent = BSAuth.initials(user.name));
    slot.querySelector('.menu-head strong').textContent = user.name;
    slot.querySelector('.menu-head small').textContent = user.email;
    const btn = slot.querySelector('button.avatar'), menu = slot.querySelector('.menu');
    const toggle = open => { menu.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
    btn.onclick = e => { e.stopPropagation(); toggle(!menu.classList.contains('open')); };
    document.addEventListener('click', e => { if (!slot.contains(e.target)) toggle(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    slot.querySelector('.logout').onclick = () => {
      const first = user.name.split(' ')[0];
      BSAuth.clear(); draw();
      bsToast(`You've been logged out. See you soon, ${first}.`);
    };
  }
  draw();

  const q = new URLSearchParams(location.search);
  if (q.has('welcome') && BSAuth.get()) {
    const u = BSAuth.get();
    setTimeout(() => bsToast(q.get('welcome') === 'new' ? `Welcome to BoldStitch, ${u.name.split(' ')[0]}!` : `Welcome back, ${u.name.split(' ')[0]}.`),
      document.documentElement.classList.contains('is-loading') ? 4300 : 600); // wait for the intro loader
    history.replaceState(null, '', location.pathname + location.hash);
  }
})();
