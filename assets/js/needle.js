/* BoldStitch needle cursor — a needle that follows the pointer with a gold thread trailing from its eye. */
(function needleCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('needle-on');

  const cv = document.createElement('canvas'); cv.id = 'thread';
  const needle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  needle.id = 'needle'; needle.setAttribute('viewBox', '0 0 12 60'); needle.setAttribute('shape-rendering', 'geometricPrecision'); needle.setAttribute('aria-hidden', 'true');
  needle.innerHTML = `
    <defs><linearGradient id="steel" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset=".42" stop-color="#5a5a5a"/><stop offset=".55" stop-color="#1c1c1c"/><stop offset="1" stop-color="#000"/></linearGradient></defs>
    <path d="M6 0 C8.6 0 9.3 2.6 9.3 6 L6.5 59.6 L6 60 L5.5 59.6 L2.7 6 C2.7 2.6 3.4 0 6 0 Z M6 2.8 C5.2 2.8 4.9 3.8 5 6 L5.4 13 C5.5 13.8 6.5 13.8 6.6 13 L7 6 C7.1 3.8 6.8 2.8 6 2.8 Z" fill="url(#steel)" fill-rule="evenodd"/>`;
  document.body.append(cv, needle);

  const ctx = cv.getContext('2d');
  const N = 18, SEG = 8.5, EYE = 35; // needle drawn at 2/3 size; thread about half the old length
  let dpr = 1, mx = -100, my = -100, lx = mx, ang = 32, scale = 1, sc = 1, started = false;
  const pts = Array.from({ length: N }, () => ({ x: mx, y: my, px: mx, py: my }));

  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; };
  addEventListener('resize', size); size();

  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    if (!started) { started = true; lx = mx; pts.forEach(p => { p.x = p.px = mx; p.y = p.py = my; }); }
    needle.classList.add('show');
    scale = e.target.closest && e.target.closest('a, button, input, textarea, select, label, .card') ? 1.15 : 1;
  }, { passive: true });
  document.addEventListener('pointerleave', () => needle.classList.remove('show'));
  addEventListener('pointerdown', e => {
    const s = document.createElement('span'); s.className = 'stitch-mark'; s.textContent = '✕';
    s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; document.body.append(s);
    setTimeout(() => s.remove(), 900);
  });

  (function loop() {
    // tilt the needle with horizontal speed so it feels like it's being pulled
    const vx = mx - lx; lx = mx;
    ang += (32 + Math.max(-28, Math.min(28, vx * 1.6)) - ang) * .15;
    sc += (scale - sc) * .2;
    needle.style.transform = `translate(${mx - 4}px, ${my - 40}px) rotate(${ang}deg) scale(${sc})`;

    const a = ang * Math.PI / 180;
    const ex = mx + Math.sin(a) * EYE * sc, ey = my - Math.cos(a) * EYE * sc;
    for (let i = 1; i < N; i++) {
      const p = pts[i], vx2 = (p.x - p.px) * .94, vy2 = (p.y - p.py) * .94;
      p.px = p.x; p.py = p.y; p.x += vx2; p.y += vy2 + .26;
    }
    for (let k = 0; k < 6; k++) {
      pts[0].x = ex; pts[0].y = ey;
      for (let i = 1; i < N; i++) {
        const A = pts[i - 1], B = pts[i], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, diff = (d - SEG) / d;
        if (i === 1) { B.x -= dx * diff; B.y -= dy * diff; }
        else { A.x += dx * diff * .5; A.y += dy * diff * .5; B.x -= dx * diff * .5; B.y -= dy * diff * .5; }
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (started) {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < N - 1; i++) ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
      ctx.lineTo(pts[N - 1].x, pts[N - 1].y);
      ctx.strokeStyle = '#9C7A3C'; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
      // short tail that loops back through the eye
      ctx.beginPath(); ctx.moveTo(ex, ey);
      ctx.quadraticCurveTo(ex - Math.cos(a) * 8, ey - Math.sin(a) * 8 + 3, ex - Math.cos(a) * 5, ey + 9); ctx.stroke();
    }
    requestAnimationFrame(loop);
  })();
})();
