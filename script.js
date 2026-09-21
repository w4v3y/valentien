/* ============================================================
   Flores Amarillas · Te Amo  —  motor de la escena
   - Cielo de estrellas tenues
   - Lluvia de destellos dorados (como polvo de estrellas)
   - Corazón dibujado con partículas doradas sobre el centro
   - Ramos de girasoles y frases de amor colocados alrededor
   - Toca la pantalla para soltar un estallido de destellos
   ============================================================ */
(() => {
  "use strict";

  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");

  // En pantallas pequeñas bajamos la densidad para que vaya fluido.
  const isSmall = Math.min(window.innerWidth, window.innerHeight) < 500;

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildHeart();
  }

  /* ---------- Estrellas de fondo ---------- */
  const stars = [];
  function initStars() {
    stars.length = 0;
    const n = Math.round((W * H) / (isSmall ? 9000 : 6000));
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.2,
        tw: Math.random() * Math.PI * 2,       // fase de parpadeo
        sp: Math.random() * 0.8 + 0.2,         // deriva vertical lenta
      });
    }
  }

  /* ---------- Destellos dorados que caen ---------- */
  const sparks = [];
  const MAX_SPARKS = isSmall ? 220 : 400;

  function spawnSpark() {
    if (sparks.length >= MAX_SPARKS) return;
    sparks.push({
      x: Math.random() * W,
      y: -10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: Math.random() * 1.6 + 0.6,
      r: Math.random() * 2.2 + 0.6,
      life: 0,
      max: Math.random() * 260 + 160,
      hue: 42 + Math.random() * 14,            // ámbar-dorado
    });
  }

  // Estallido al tocar / hacer clic
  function burst(x, y) {
    const n = isSmall ? 18 : 28;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.3;
      const sp = Math.random() * 2.6 + 0.8;
      sparks.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 0.4,
        r: Math.random() * 2.4 + 0.8,
        life: 0,
        max: Math.random() * 90 + 60,
        hue: 42 + Math.random() * 14,
      });
    }
  }

  /* ---------- Corazón de partículas ---------- */
  let heartPts = [];
  const HEART_CY = 0.24;   // altura del corazón (fracción de la escena)
  function buildHeart() {
    heartPts = [];
    const cx = W * 0.5;
    const cy = H * HEART_CY;
    // Escala relativa al tamaño de pantalla
    const s = Math.min(W, H) * 0.022;
    for (let t = 0; t < Math.PI * 2; t += 0.08) {
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t)
               - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      heartPts.push({
        x: cx + hx * s,
        y: cy - hy * s,
        ph: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ---------- Bucle de animación ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(2, (now - last) / 16.7);
    last = now;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    // Estrellas
    for (const st of stars) {
      st.tw += 0.05 * dt;
      st.y += st.sp * 0.05 * dt;
      if (st.y > H) st.y = 0;
      const a = 0.35 + 0.35 * Math.sin(st.tw);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 244, 210, ${a})`;
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Destellos dorados
    if (Math.random() < 0.6) spawnSpark();
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const fade = 1 - p.life / p.max;
      if (fade <= 0 || p.y > H + 10) { sparks.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `hsla(${p.hue}, 100%, 75%, ${fade})`);
      g.addColorStop(1, `hsla(${p.hue}, 100%, 55%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Corazón brillante de partículas
    const beat = 1 + Math.sin(now / 500) * 0.03;
    const hcx = W * 0.5, hcy = H * HEART_CY;
    for (const hp of heartPts) {
      hp.ph += 0.08 * dt;
      const tw = 0.7 + 0.3 * Math.sin(hp.ph);
      const x = hcx + (hp.x - hcx) * beat;
      const y = hcy + (hp.y - hcy) * beat;
      const rad = 4.2 * tw;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 3);
      g.addColorStop(0, `rgba(255, 255, 240, ${tw})`);
      g.addColorStop(0.25, `rgba(255, 236, 170, ${tw})`);
      g.addColorStop(0.6, `rgba(255, 195, 60, ${tw * 0.6})`);
      g.addColorStop(1, "rgba(255, 160, 30, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }

  /* ---------- Ramos de girasoles ---------- */
  // Posiciones en % de la escena (x, y) y tamaño en rem.
  const FLOWERS = [
    { x: 8,  y: 30, s: 2.2 }, { x: 16, y: 44, s: 3.0 },
    { x: 12, y: 62, s: 2.6 }, { x: 30, y: 70, s: 2.0 },
    { x: 50, y: 40, s: 3.4 }, { x: 62, y: 68, s: 2.4 },
    { x: 84, y: 30, s: 3.0 }, { x: 88, y: 50, s: 2.4 },
    { x: 90, y: 70, s: 2.2 }, { x: 72, y: 26, s: 1.8 },
    { x: 28, y: 24, s: 1.8 }, { x: 46, y: 82, s: 2.0 },
  ];
  const BOUQUETS = ["🌻", "🌻", "💐"];
  function placeFlowers() {
    const box = document.getElementById("flowers");
    FLOWERS.forEach((f, i) => {
      const el = document.createElement("div");
      el.className = "flower";
      el.textContent = BOUQUETS[i % BOUQUETS.length];
      el.style.left = f.x + "%";
      el.style.top = f.y + "%";
      el.style.setProperty("--size", f.s + "rem");
      el.style.setProperty("--dur", (4 + Math.random() * 3).toFixed(2) + "s");
      el.style.setProperty("--delay", (Math.random() * 2).toFixed(2) + "s");
      box.appendChild(el);
    });
  }

  /* ---------- Frases de amor ---------- */
  const PHRASES = [
    { t: "Te adoro 💛",       x: 26, y: 33 },
    { t: "Eres mi sol 💛",    x: 10, y: 50 },
    { t: "Eres única 💛",     x: 18, y: 58 },
    { t: "Amor de mi vida",   x: 42, y: 30 },
    { t: "Me encantas",       x: 64, y: 34 },
    { t: "Mi Amor 💛",        x: 80, y: 44 },
    { t: "Eres preciosa 💛",  x: 70, y: 50 },
    { t: "Te Amo 💛",         x: 40, y: 60 },
    { t: "Siempre juntos 🤍", x: 30, y: 82 },
    { t: "Eres mi todo 💛",   x: 82, y: 78 },
  ];
  function placePhrases() {
    const box = document.getElementById("phrases");
    PHRASES.forEach((p) => {
      const el = document.createElement("div");
      el.className = "phrase";
      el.textContent = p.t;
      el.style.left = p.x + "%";
      el.style.top = p.y + "%";
      el.style.setProperty("--dur", (5 + Math.random() * 4).toFixed(2) + "s");
      el.style.setProperty("--delay", (Math.random() * 4).toFixed(2) + "s");
      box.appendChild(el);
    });
  }

  /* ---------- Interacción táctil ---------- */
  function initTouch() {
    const scene = document.getElementById("scene");
    const hint = document.getElementById("hint");
    let hidden = false;

    const at = (e) => {
      const r = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      burst(pt.clientX - r.left, pt.clientY - r.top);
      if (!hidden && hint) { hint.classList.add("gone"); hidden = true; }
    };

    scene.addEventListener("touchstart", (e) => { at(e); }, { passive: true });
    scene.addEventListener("mousedown", at);
    // Evita el zoom por doble toque en iOS
    scene.addEventListener("dblclick", (e) => e.preventDefault());
  }

  /* ---------- Arranque ---------- */
  // En móvil la barra del navegador cambia la altura: recalculamos.
  window.addEventListener("resize", () => { resize(); initStars(); });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => { resize(); initStars(); }, 250);
  });

  resize();
  initStars();
  placeFlowers();
  placePhrases();
  initTouch();
  requestAnimationFrame(frame);
})();
