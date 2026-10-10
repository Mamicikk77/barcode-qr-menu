/* Karşılama fotoğrafı üzerindeki canlı efektler: nargile dumanı, içecek kabarcıkları, deniz parıltısı.
   Koordinatlar fotoğrafın kendi piksel düzleminde verilir (cfg.size); ekrana "cover" yerleşimine göre taşınır. */
window.WelcomeFx = (() => {
  'use strict';

  // Yumuşak duman lekesi (bir kez çizilip tekrar kullanılır)
  const blob = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.35, 'rgba(255,255,255,.55)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return c;
  })();

  const rand = (a, b) => a + Math.random() * (b - a);

  function start(canvas, cfg, posY = 0.3) {
    if (!canvas || !cfg) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    const [iw, ih] = cfg.size;
    let W = 0, H = 0, s = 1, ox = 0, oy = 0, dpr = 1;

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      s = Math.max(W / iw, H / ih);
      ox = (W - iw * s) * 0.5;
      oy = (H - ih * s) * posY;
    }
    const X = x => ox + x * s;
    const Y = y => oy + y * s;

    /* Duman */
    const smoke = [];
    let nextPuff = 1.2, puffLeft = 0;
    function emit([x, y], strong) {
      smoke.push(strong ? {
        // Ağızdan sağa doğru üflenen nefes: yüzden uzaklaşarak dağılır
        x: x + rand(8, 18), y: y + rand(-2, 3),
        vx: rand(55, 95), vy: rand(-12, -2), r: rand(3, 6), grow: rand(16, 26),
        life: 0, max: rand(2.4, 3.4), seed: Math.random() * 1000, a: rand(.16, .26), lift: 4,
      } : {
        // Hortum çevresinden yükselen ince duman
        x: x + rand(-6, 6), y: y + rand(-4, 4),
        vx: rand(4, 14), vy: rand(-20, -10), r: rand(6, 10), grow: rand(9, 15),
        life: 0, max: rand(3.2, 4.6), seed: Math.random() * 1000, a: rand(.12, .2), lift: 6,
      });
    }

    /* Kabarcıklar */
    const bubbles = cfg.drinks.map(() => []);
    function newBubble(rect, fromBottom) {
      const [x1, y1, x2, y2] = rect;
      return { x: rand(x1 + 4, x2 - 4), y: fromBottom ? y2 - rand(0, 6) : rand(y1, y2), r: rand(1, 2.6), v: rand(14, 34), seed: Math.random() * 100 };
    }
    cfg.drinks.forEach((rect, i) => { for (let k = 0; k < (rect[2] - rect[0]) / 6; k++) bubbles[i].push(newBubble(rect, false)); });

    /* Deniz parıltıları */
    const [sx1, sy1, sx2, sy2] = cfg.sea;
    const glints = Array.from({ length: 22 }, () => ({ x: rand(sx1, sx2), y: rand(sy1, sy2), p: rand(0, 6.28), sp: rand(1.2, 2.6), w: rand(3, 8) }));

    let last = performance.now(), t = 0;
    function frame(now) {
      if (!canvas.isConnected) return;               // ekran değişti: döngüyü bitir
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now; t += dt;
      if (canvas.clientWidth !== W || canvas.clientHeight !== H) layout();
      if (document.hidden) { requestAnimationFrame(frame); return; }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Nefes ritmi: birkaç saniyede bir ağızdan duman üflenir
      nextPuff -= dt;
      if (nextPuff <= 0) { puffLeft = 1.1; nextPuff = rand(3.6, 5.2); }
      if (puffLeft > 0) { puffLeft -= dt; if (Math.random() < dt * 30) emit(cfg.mouth, true); }
      // Hortum çevresinden sürekli ince duman
      if (Math.random() < dt * 8) emit(cfg.wisp, false);

      ctx.globalCompositeOperation = 'source-over';
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.life += dt;
        if (p.life >= p.max) { smoke.splice(i, 1); continue; }
        const k = p.life / p.max;
        p.vx *= 1 - dt * 0.9;                       // yavaşlar
        p.vy -= dt * p.lift;                        // yükselir
        p.x += (p.vx + Math.sin(t * 1.3 + p.seed) * 9) * dt;
        p.y += p.vy * dt;
        p.r += p.grow * dt;
        ctx.globalAlpha = p.a * Math.sin(Math.PI * Math.min(1, k * 1.15)) * (1 - k * 0.4);
        const R = p.r * s;
        ctx.drawImage(blob, X(p.x) - R, Y(p.y) - R, R * 2, R * 2);
      }

      // Kabarcıklar (bardağın içine kırpılır)
      cfg.drinks.forEach((rect, i) => {
        const [x1, y1, x2, y2] = rect;
        ctx.save();
        ctx.beginPath();
        ctx.rect(X(x1), Y(y1), (x2 - x1) * s, (y2 - y1) * s);
        ctx.clip();
        bubbles[i].forEach(b => {
          b.y -= b.v * dt;
          if (b.y < y1 + 2) Object.assign(b, newBubble(rect, true));
          const bx = X(b.x + Math.sin(t * 3 + b.seed) * 1.5), by = Y(b.y), br = Math.max(0.8, b.r * s);
          ctx.globalAlpha = 0.75;
          ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.283);
          ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
          ctx.lineWidth = Math.max(0.6, br * 0.35); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
        });
        ctx.restore();
      });

      // Denizde parıltılar
      ctx.globalCompositeOperation = 'lighter';
      glints.forEach(g => {
        const a = Math.max(0, Math.sin(t * g.sp + g.p));
        if (a < 0.05) return;
        ctx.globalAlpha = a * 0.7;
        const gx = X(g.x), gy = Y(g.y), w = g.w * s;
        const grad = ctx.createLinearGradient(gx - w, gy, gx + w, gy);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,250,225,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(gx - w, gy - Math.max(0.6, s * 0.9), w * 2, Math.max(1.2, s * 1.8));
      });
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      requestAnimationFrame(frame);
    }
    layout();
    requestAnimationFrame(frame);
  }

  return { start };
})();
