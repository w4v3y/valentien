/* ============================================================
   Flores Amarillas · Te Amo — motor de la animación
   Coreografía del video, por fases:
     0.0s  cielo estrellado + florecitas cayendo con estela
     2.8s  estalla la galaxia dorada (disco + espiral)
     4.2s  nace el corazón y crece
     5.0s  florecen los ramos de girasoles
     5.8s  aparecen las frases de amor
     6.0s  fuente de partículas del centro hacia el corazón
    12.0s  se abre la carta de amor
   ============================================================ */
(() => {
  "use strict";

  /* ---------- Línea de tiempo (segundos) ---------- */
  const T = {
    galaxy: 2.8,
    heart:  4.2,
    bloom:  5.0,
    phrase: 5.8,
    jet:    6.0,
    card:  12.0,
  };

  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d", { alpha: true });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, DPR = 1, small = false;
  let cx = 0, cy = 0;            // centro de la galaxia
  let hx = 0, hy = 0, hs = 1;    // centro y escala del corazón

  const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  const easeOut  = (p) => 1 - Math.pow(1 - p, 3);
  const easeBack = (p) => { const c = 1.70158 + 1; return 1 + c * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2); };

  /* ---------- Dimensionado ---------- */
  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    small = Math.min(W, H) < 500;
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    cx = W * 0.5;  cy = H * 0.50;      // núcleo de la galaxia
    hx = W * 0.5;  hy = H * 0.255;     // centro del corazón
    hs = Math.min(W * 0.016, H * 0.0085);  // escala del corazón

    buildStars();
    buildGalaxy();
    buildHeart();
  }

  /* ---------- Estrellas ---------- */
  let stars = [];
  function buildStars() {
    const n = Math.round((W * H) / (small ? 7000 : 5200));
    stars = new Array(n);
    for (let i = 0; i < n; i++) {
      stars[i] = {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.25,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 1.6 + 0.4,
      };
    }
  }

  /* ---------- Galaxia: disco + brazos espirales ---------- */
  let gal = [];
  let R = 0;
  function buildGalaxy() {
    R = W * 0.74;
    const n = small ? 2600 : 4200;
    gal = new Array(n);
    for (let i = 0; i < n; i++) {
      // Densidad mayor hacia el centro
      const u = Math.pow(Math.random(), 0.62);
      const r = 0.06 * R + u * R;
      // Dos brazos logarítmicos con dispersión
      const arm = (i % 2) * Math.PI;
      const spread = (Math.random() - 0.5) * (1.1 + 2.2 * u);
      const a0 = 3.1 * Math.log(r / (R * 0.06)) + arm + spread;
      gal[i] = {
        r,
        a: a0,
        // rotación diferencial: el centro gira más rápido
        w: 0.42 / Math.pow(r / R + 0.14, 0.78),
        s: Math.random() * 1.0 + 0.6,
        b: 0.35 + 0.65 * (1 - u),          // brillo
        z: (Math.random() - 0.5) * 0.10,   // grosor del disco
        t: Math.random() * Math.PI * 2,    // fase de centelleo
        d: 0.35 + Math.random() * 0.65,    // retardo de aparición
      };
    }
  }

  /* ---------- Corazón de glitter ---------- */
  let heart = [];
  function buildHeart() {
    const n = small ? 900 : 1300;
    heart = new Array(n);
    for (let i = 0; i < n; i++) {
      const t = Math.random() * Math.PI * 2;
      const px = 16 * Math.pow(Math.sin(t), 3);
      const py = 13 * Math.cos(t) - 5 * Math.cos(2 * t)
               - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      // Banda gruesa: desplazamiento aleatorio alrededor de la curva
      const jx = (Math.random() - 0.5) * 1.7;
      const jy = (Math.random() - 0.5) * 1.7;
      heart[i] = {
        x: px + jx,
        y: -py + jy,
        s: Math.random() * 1.1 + 0.7,
        t: Math.random() * Math.PI * 2,
        b: 0.45 + Math.random() * 0.55,
      };
    }
  }

  /* ---------- Partículas sueltas ---------- */
  const petals = [];   // florecitas que caen con estela
  const jets = [];     // fuente del centro hacia el corazón
  const bursts = [];   // estallidos al tocar
  const GLYPHS = ["🌻", "🌼", "💛"];

  function spawnPetal() {
    if (petals.length > (small ? 26 : 42)) return;
    petals.push({
      x: Math.random() * W,
      y: -30,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 1.5 + 0.7,
      sz: Math.random() * 12 + 9,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.04,
      g: GLYPHS[(Math.random() * GLYPHS.length) | 0],
      trail: Math.random() < 0.3,
    });
  }

  function spawnJet() {
    jets.push({
      x: cx + (Math.random() - 0.5) * 14,
      y: cy - 4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 1.5 + 1.1),
      life: 0,
      max: Math.random() * 60 + 55,
      s: Math.random() * 1.6 + 0.6,
    });
  }

  function burst(x, y) {
    const n = small ? 20 : 30;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.35;
      const sp = Math.random() * 2.8 + 0.9;
      bursts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 0.5,
        life: 0,
        max: Math.random() * 55 + 45,
        s: Math.random() * 1.9 + 0.7,
      });
    }
  }

  /* ---------- Dibujo ---------- */
  const t0 = performance.now();
  let last = t0;

  function draw(now) {
    const time = (now - t0) / 1000;              // segundos desde el inicio
    const dt = Math.min(2.2, (now - last) / 16.7);
    last = now;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    /* --- Estrellas --- */
    const starIn = clamp01(time / 1.2);
    for (const s of stars) {
      s.ph += 0.045 * dt;
      s.y += s.sp * 0.04 * dt;
      if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
      const a = (0.30 + 0.35 * Math.sin(s.ph)) * starIn;
      ctx.fillStyle = "rgba(255,247,222," + a.toFixed(3) + ")";
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    /* --- Galaxia --- */
    const gp = clamp01((time - T.galaxy) / 1.6);
    if (gp > 0) {
      const grow = easeOut(gp);
      const squash = 0.30;

      // Resplandor del disco
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, squash);
      const dg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * grow);
      dg.addColorStop(0.00, "rgba(255,252,226," + (0.78 * grow) + ")");
      dg.addColorStop(0.16, "rgba(255,226,130," + (0.46 * grow) + ")");
      dg.addColorStop(0.45, "rgba(214,186,46,"  + (0.24 * grow) + ")");
      dg.addColorStop(1.00, "rgba(120,110,20,0)");
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(0, 0, R * grow, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Polvo de estrellas en brazos espirales
      for (const p of gal) {
        const vis = clamp01((grow - p.d * 0.5) / 0.5);
        if (vis <= 0) continue;
        p.a += p.w * 0.012 * dt;
        p.t += 0.09 * dt;
        const rr = p.r * grow;
        const x = cx + Math.cos(p.a) * rr;
        const y = cy + Math.sin(p.a) * rr * squash + p.z * rr * squash;
        const tw = 0.55 + 0.45 * Math.sin(p.t);
        const a = Math.min(1, p.b * tw * vis * 1.25);
        ctx.fillStyle = "rgba(255," + (228 + ((p.b * 26) | 0)) + ",150," + a.toFixed(3) + ")";
        ctx.fillRect(x, y, p.s, p.s);
      }

      // Núcleo brillante
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 58 * grow);
      core.addColorStop(0, "rgba(255,255,250," + (1.0 * grow) + ")");
      core.addColorStop(0.3, "rgba(255,240,175," + (0.62 * grow) + ")");
      core.addColorStop(1, "rgba(255,190,60,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, 58 * grow, 0, Math.PI * 2);
      ctx.fill();
    }

    /* --- Corazón --- */
    const hp = clamp01((time - T.heart) / 1.7);
    if (hp > 0) {
      const sc = (reduced ? 1 : easeBack(hp)) * hs;
      const beat = 1 + Math.sin(time * 2.1) * 0.028;
      for (const p of heart) {
        p.t += 0.10 * dt;
        const tw = 0.5 + 0.5 * Math.sin(p.t);
        const x = hx + p.x * sc * beat;
        const y = hy + p.y * sc * beat;
        const a = Math.min(1, p.b * tw * hp * 1.3);
        const col = "255," + (246 - ((tw * 34) | 0)) + ",128,";
        ctx.fillStyle = "rgba(" + col + (a * 0.22).toFixed(3) + ")";
        ctx.fillRect(x - p.s * 0.9, y - p.s * 0.9, p.s * 2.8, p.s * 2.8);
        ctx.fillStyle = "rgba(" + col + a.toFixed(3) + ")";
        ctx.fillRect(x, y, p.s, p.s);
      }
      // Halo suave del corazón
      const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 20 * hs * hp);
      hg.addColorStop(0, "rgba(255,238,170," + (0.10 * hp) + ")");
      hg.addColorStop(1, "rgba(255,200,60,0)");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(hx, hy, 20 * hs * hp, 0, Math.PI * 2);
      ctx.fill();
    }

    /* --- Fuente del centro hacia el corazón --- */
    if (time > T.jet && !reduced) {
      if (Math.random() < 0.7) spawnJet();
    }
    for (let i = jets.length - 1; i >= 0; i--) {
      const p = jets[i];
      p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy *= 0.994;
      const f = 1 - p.life / p.max;
      if (f <= 0) { jets.splice(i, 1); continue; }
      ctx.fillStyle = "rgba(255,244,190," + (f * 0.75).toFixed(3) + ")";
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }

    /* --- Florecitas cayendo con estela --- */
    if (Math.random() < (time < T.galaxy ? 0.34 : 0.12)) spawnPetal();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y > H + 40) { petals.splice(i, 1); continue; }
      if (p.trail) {
        const g = ctx.createLinearGradient(p.x, p.y - 26, p.x, p.y);
        g.addColorStop(0, "rgba(255,226,140,0)");
        g.addColorStop(1, "rgba(255,226,140,.30)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 16, p.y - 26);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      // Resplandor dorado detrás de la flor (modo aditivo)
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz * 1.25);
      halo.addColorStop(0, "rgba(255,226,120,.55)");
      halo.addColorStop(1, "rgba(255,190,50,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz * 1.25, 0, Math.PI * 2);
      ctx.fill();
      // La flor en sí, en modo normal (el emoji no admite mezcla aditiva)
      ctx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = p.sz + "px serif";
      ctx.fillText(p.g, 0, 0);
      ctx.restore();
      ctx.globalCompositeOperation = "lighter";
    }

    /* --- Estallidos al tocar --- */
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.012 * dt;
      const f = 1 - p.life / p.max;
      if (f <= 0) { bursts.splice(i, 1); continue; }
      ctx.fillStyle = "rgba(255,238,160," + f.toFixed(3) + ")";
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(draw);
  }

  /* ---------- Ramos de girasoles (DOM) ---------- */
  const FLOWERS = [
    { x:  9, y: 36, s: 1.7 }, { x: 17, y: 48, s: 2.4 }, { x: 10, y: 61, s: 1.9 },
    { x: 25, y: 71, s: 1.6 }, { x: 34, y: 41, s: 1.2 }, { x: 45, y: 80, s: 1.8 },
    { x: 62, y: 74, s: 1.5 }, { x: 69, y: 43, s: 1.2 }, { x: 85, y: 35, s: 2.3 },
    { x: 92, y: 54, s: 1.8 }, { x: 88, y: 69, s: 1.6 }, { x: 74, y: 27, s: 1.3 },
    { x: 23, y: 26, s: 1.2 }, { x: 56, y: 32, s: 1.1 },
  ];
  const BOUQUET = ["🌻", "🌼", "🌻", "🌻", "🌼"];

  function placeFlowers() {
    const box = document.getElementById("flowers");
    const frag = document.createDocumentFragment();
    FLOWERS.forEach((f, i) => {
      const el = document.createElement("div");
      el.className = "flower";
      el.style.left = f.x + "%";
      el.style.top = f.y + "%";
      el.style.setProperty("--delay", (5.0 + i * 0.11).toFixed(2) + "s");
      el.style.setProperty("--dur", (4 + Math.random() * 3).toFixed(2) + "s");
      const g = document.createElement("i");
      g.textContent = BOUQUET[i % BOUQUET.length];
      g.style.setProperty("--size", f.s + "rem");
      g.style.setProperty("--dur", (4 + Math.random() * 3).toFixed(2) + "s");
      g.style.setProperty("--delay", (5.6 + i * 0.11).toFixed(2) + "s");
      el.appendChild(g);
      frag.appendChild(el);
    });
    box.appendChild(frag);
  }

  /* ---------- Frases de amor (DOM) ---------- */
  const PHRASES = [
    { t: "Te adoro 💛",        x: 25, y: 37 },
    { t: "Eres mi sol 🌻",     x: 11, y: 52 },
    { t: "Eres única 💛",      x: 20, y: 63 },
    { t: "Amor de mi vida 🤍", x: 43, y: 34 },
    { t: "Me encantas 🌻",     x: 66, y: 37 },
    { t: "Mi Amor 🤍",         x: 79, y: 47 },
    { t: "Eres preciosa 💛",   x: 71, y: 57 },
    { t: "Te Amo 🌼",          x: 35, y: 62 },
    { t: "Siempre juntos 🤍",  x: 27, y: 76 },
    { t: "Eres mi todo 💛",    x: 76, y: 65 },
    { t: "My Love 💛",         x: 52, y: 55 },
  ];

  function placePhrases() {
    const box = document.getElementById("phrases");
    const frag = document.createDocumentFragment();
    PHRASES.forEach((p, i) => {
      const el = document.createElement("div");
      el.className = "phrase";
      el.textContent = p.t;
      el.style.left = p.x + "%";
      el.style.top = p.y + "%";
      el.style.setProperty("--delay", (5.8 + i * 0.16).toFixed(2) + "s");
      el.style.setProperty("--dur", (6 + Math.random() * 4).toFixed(2) + "s");
      frag.appendChild(el);
    });
    box.appendChild(frag);
  }

  /* ---------- Carta de amor ---------- */
  function initCard() {
    const layer = document.getElementById("cardLayer");
    const btnClose = document.getElementById("btnClose");
    const btnLetter = document.getElementById("btnLetter");

    const open = () => { layer.classList.add("show"); btnLetter.classList.remove("show"); };
    const close = () => { layer.classList.remove("show"); btnLetter.classList.add("show"); };

    btnClose.addEventListener("click", close);
    btnLetter.addEventListener("click", open);
    layer.addEventListener("click", (e) => { if (e.target === layer) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && layer.classList.contains("show")) close();
    });

    setTimeout(open, T.card * 1000);
  }

  /* ---------- Toque: estallido de destellos ---------- */
  function initTouch() {
    const scene = document.getElementById("scene");
    const hint = document.getElementById("hint");
    let hidden = false;
    const at = (e) => {
      const r = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      burst(pt.clientX - r.left, pt.clientY - r.top);
      if (!hidden) { hint.classList.add("gone"); hidden = true; }
    };
    scene.addEventListener("touchstart", at, { passive: true });
    scene.addEventListener("mousedown", at);
    scene.addEventListener("dblclick", (e) => e.preventDefault());
  }

  /* ---------- Arranque ---------- */
  let rt;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 120); };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 260));

  resize();
  placeFlowers();
  placePhrases();
  initCard();
  initTouch();
  requestAnimationFrame(draw);
})();
