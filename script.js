/* ============================================================
   script.js — Birthday Invitation Interactive Logic
   Matvey XXII · 21 March 2026
============================================================ */

// ─────────────────────── CONFIG ───────────────────────
const PARTY_DATE = new Date("2026-03-21T18:00:00"); // local time

// ─────────────────────── PRELOADER ────────────────────
window.addEventListener("load", () => {
  setTimeout(() => {
    const preloader = document.getElementById("preloader");
    preloader.classList.add("hidden");
    // Trigger initial reveals after preloader fades
    setTimeout(triggerVisibleReveals, 600);
  }, 1600);
});

// ─────────────────────── PARTICLES ────────────────────
(function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");

  let W,
    H,
    particles = [];

  const PARTICLE_COUNT = 55;
  const GOLD = "rgba(212,175,55,";
  const IVORY = "rgba(253,252,240,";

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    const isGold = Math.random() > 0.4;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.5 + 0.05,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -Math.random() * 0.22 - 0.06,
      color: isGold ? GOLD : IVORY,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, randomParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.alpha += p.twinkleSpeed * p.twinkleDir;
      if (p.alpha >= 0.6 || p.alpha <= 0.03) p.twinkleDir *= -1;

      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -10) {
        p.y = H + 10;
        p.x = Math.random() * W;
      }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha.toFixed(2) + ")";
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  init();
  draw();
})();

// ─────────────────────── COUNTDOWN ────────────────────
(function initCountdown() {
  const days = document.getElementById("cd-days");
  const hours = document.getElementById("cd-hours");
  const mins = document.getElementById("cd-mins");
  const secs = document.getElementById("cd-secs");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function bump(el, newVal) {
    const current = el.textContent;
    if (current !== newVal) {
      el.classList.remove("bump");
      void el.offsetWidth; // reflow
      el.classList.add("bump");
      el.textContent = newVal;
      setTimeout(() => el.classList.remove("bump"), 250);
    }
  }

  function tick() {
    const now = new Date();
    const diff = PARTY_DATE - now;

    if (diff <= 0) {
      days.textContent =
        hours.textContent =
        mins.textContent =
        secs.textContent =
          "00";
      document
        .getElementById("countdown-section")
        .querySelector(".section-label").textContent = "🎉 Вечер уже начался!";
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    bump(days, pad(d));
    bump(hours, pad(h));
    bump(mins, pad(m));
    bump(secs, pad(s));
  }

  tick();
  setInterval(tick, 1000);
})();

// ─────────────────────── SCROLL REVEAL ────────────────
function triggerVisibleReveals() {
  const revealEls = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger within the same parent
          const siblings = [
            ...entry.target.parentElement.querySelectorAll(
              ".reveal:not(.visible)",
            ),
          ];
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${0.08 * idx}s`;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  revealEls.forEach((el) => observer.observe(el));
}

// Also attach reveal to hero elements immediately if preloader already done
document.addEventListener("DOMContentLoaded", () => {
  // Hero elements reveal on load
  const heroItems = document.querySelectorAll("#hero .reveal");
  heroItems.forEach((el, i) => {
    el.style.transitionDelay = `${0.15 * i + 1.8}s`;
  });
});

// ─────────────────────── DETAIL CARDS STAGGER ─────────
document.querySelectorAll(".detail-card").forEach((card, i) => {
  card.style.setProperty("--i", i);
});

// ─────────────────────── SMOOTH HERO CTA ──────────────
document.getElementById("hero-cta")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("details")?.scrollIntoView({ behavior: "smooth" });
});

// ─────────────────────── RSVP CONFIG ──────────────────
const RSVP_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxHstEYTz9mJL5KBX76eX_N4oibGz1XdCvjgSmiP-2xfrolFOAeCdIm-h2KX1RKWHBCvw/exec";

// ─────────────────────── RSVP FORM ────────────────────
(function initRSVP() {
  const form = document.getElementById("rsvp-form");
  const success = document.getElementById("rsvp-success");
  const submit = document.getElementById("rsvp-submit");
  const btnText = submit.querySelector(".btn-text");

  // ── Submit handler ──
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // ── Validation ──
    const nameEl = document.getElementById("rsvp-name");
    const commentEl = document.getElementById("rsvp-comment");
    const errName = document.getElementById("err-name");
    const errAtt = document.getElementById("err-att");
    const attendanceChecked = form.querySelector(
      'input[name="attendance"]:checked',
    );

    errName.textContent = "";
    errAtt.textContent = "";

    let valid = true;
    if (!nameEl.value.trim()) {
      errName.textContent = "Пожалуйста, введи своё имя";
      valid = false;
    }
    if (!attendanceChecked) {
      errAtt.textContent = "Укажи, придёшь ли ты";
      valid = false;
    }
    if (!valid) return;

    // ── UX: loading state ──
    submit.disabled = true;
    btnText.textContent = "Отправка...";

    const isAttending = attendanceChecked.value === "yes";

    // ── Payload ──
    const payload = {
      name: nameEl.value.trim(),
      attendance: attendanceChecked.value, // "yes" | "no"
      comment: commentEl ? commentEl.value.trim() : "",
    };

    // ── Send to Google Apps Script (no-cors — response will be opaque) ──
    fetch(RSVP_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .catch(() => {
        /* opaque response — treat as success */
      })
      .finally(() => {
        // ── Gold dust burst ──
        const rect = submit.getBoundingClientRect();
        spawnGoldDust(rect.left + rect.width / 2, rect.top + rect.height / 2);

        // ── Clear form fields ──
        form.reset();
        document
          .querySelectorAll(".radio-option")
          .forEach((o) => (o.style.color = ""));

        // ── Conditional success message ──
        const successMsg = document.getElementById("rsvp-success-msg");
        successMsg.textContent = isAttending
          ? "Ответ записан, жду на празднике!"
          : "Жаль, что тебя не будет 😔";

        // ── Animate form out → success in ──
        form.style.transition = "opacity 0.5s, transform 0.5s";
        form.style.opacity = "0";
        form.style.transform = "translateY(16px)";
        setTimeout(() => {
          form.style.display = "none";
          success.classList.add("visible");
        }, 500);
      });
  });

  // Radio label highlight on change
  document.querySelectorAll(".radio-option").forEach((opt) => {
    opt.addEventListener("change", () => {
      document
        .querySelectorAll(".radio-option")
        .forEach((o) => (o.style.color = "var(--navy)"));
      const radio = opt.querySelector('input[type="radio"]');
      if (radio.checked) opt.style.color = "var(--gold)";
    });
  });

  // ── Mood button: big fullscreen gold dust ──
  const moodBtn = document.getElementById("mood-btn");
  if (moodBtn) {
    moodBtn.addEventListener("click", () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      GoldDustBig.spawn(cx, cy);
    });
  }
})();

// ─────────────────────── PARALLAX HERO ────────────────
window.addEventListener(
  "scroll",
  () => {
    const hero = document.getElementById("hero");
    const heroContent = document.getElementById("hero-content");
    const scrollY = window.scrollY;
    const heroH = hero.offsetHeight;

    if (scrollY < heroH) {
      heroContent.style.transform = `translateY(${scrollY * 0.28}px)`;
      heroContent.style.opacity = String(1 - (scrollY / heroH) * 1.4);
    }
  },
  { passive: true },
);

// ─────────────────────── CURSOR GLOW ──────────────────
(function initCursorGlow() {
  // Subtle gold glow follows cursor on dark sections
  const glow = document.createElement("div");
  glow.style.cssText = `
    position:fixed; pointer-events:none; z-index:9998;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.4s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let cx = -999,
    cy = -999;
  document.addEventListener("mousemove", (e) => {
    cx = e.clientX;
    cy = e.clientY;
    glow.style.left = cx + "px";
    glow.style.top = cy + "px";

    // Only show glow on dark sections
    const el = document.elementFromPoint(cx, cy);
    const section = el?.closest("section, footer");
    const isDark =
      section &&
      (section.id === "countdown-section" || section.id === "footer");
    glow.style.opacity = isDark ? "1" : "0";
  });
})();

// ─────────────────────── GOLD DUST PARTICLES ──────────────────
function spawnGoldDust(originX, originY) {
  const count = 75;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    const size = Math.random() * 5 + 1.5;
    const isRect = Math.random() > 0.65;
    const hue = 40 + Math.random() * 18;
    const lum = 50 + Math.random() * 25;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 160 + 40;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 90;

    p.style.cssText = [
      "position:fixed",
      `left:${originX}px`,
      `top:${originY}px`,
      `width:${size}px`,
      `height:${size}px`,
      `border-radius:${isRect ? "2px" : "50%"}`,
      `background:hsl(${hue},85%,${lum}%)`,
      "pointer-events:none",
      "z-index:10000",
      "transform:translate(-50%,-50%)",
    ].join(";");
    document.body.appendChild(p);

    if (typeof gsap !== "undefined") {
      gsap.to(p, {
        x: tx,
        y: ty,
        opacity: 0,
        scale: Math.random() * 0.2 + 0.05,
        rotation: Math.random() * 540 - 270,
        duration: Math.random() * 1.8 + 0.8,
        ease: "power2.out",
        delay: Math.random() * 0.25,
        onComplete: () => p.remove(),
      });
    } else {
      setTimeout(() => p.remove(), 2500);
    }
  }
}

// ─────────────────────── GOLD DUST BIG (mood button) ──────────
// Canvas2D-based: all clicks share one RAF loop — no DOM thrashing.
const GoldDustBig = (function () {
  let cvs = null; // shared canvas element
  let ctx = null;
  let frame = null; // RAF handle — null when idle
  let pool = []; // live particles

  function ensureCanvas() {
    if (cvs) return;
    cvs = document.createElement("canvas");
    cvs.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:10000;width:100vw;height:100vh;";
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    document.body.appendChild(cvs);
    ctx = cvs.getContext("2d");
    window.addEventListener("resize", () => {
      if (!cvs) return;
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    });
  }

  function makeParticle(ox, oy) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5.5 + 1.5;
    const hue = 38 + Math.random() * 22;
    const lum = 48 + Math.random() * 30;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 3.5,
      r: Math.random() * 4.5 + 1.2,
      alpha: 0.95,
      decay: Math.random() * 0.009 + 0.004, // slow fade → long lifespan
      hue,
      lum,
      isRect: Math.random() > 0.5,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.14,
      gravity: 0.06 + Math.random() * 0.05,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    pool = pool.filter((p) => p.alpha > 0.01);

    for (const p of pool) {
      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.992;
      p.alpha -= p.decay;
      p.rot += p.rotV;

      // Draw
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = `hsl(${p.hue},88%,${p.lum}%)`;
      ctx.shadowBlur = p.r * 2.5;
      ctx.shadowColor = `hsl(${p.hue},90%,${p.lum + 12}%)`;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.isRect) {
        ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (pool.length > 0) {
      frame = requestAnimationFrame(tick);
    } else {
      // All done — clean up canvas
      frame = null;
      cvs.remove();
      cvs = null;
      ctx = null;
    }
  }

  function startLoop() {
    if (frame) return; // already running — just keep adding to pool
    frame = requestAnimationFrame(tick);
  }

  return {
    spawn(ox, oy) {
      ensureCanvas();
      // 120 particles per click — even 10 rapid clicks = 1200 particles on one canvas
      for (let i = 0; i < 120; i++) pool.push(makeParticle(ox, oy));
      startLoop();
    },
  };
})();

// ─────────────────────── THREE.JS COIN ────────────────────────
(function initCoin() {
  if (typeof THREE === "undefined") return;
  const coinCanvas = document.getElementById("coin-canvas");
  if (!coinCanvas) return;

  // Belt-and-suspenders: enforce fixed positioning in case CSS is overridden
  coinCanvas.style.cssText +=
    ";position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;";

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // ── Mobile helpers ──
  const isMobile = () => window.innerWidth < 768;
  const baseScale = () => (isMobile() ? 0.18 : 0.36);
  // Tighter path on mobile — coin stays in outer quarter of viewport
  const pathAmp = () => (isMobile() ? 0.38 : 1.0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: coinCanvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, W() / H(), 0.1, 100);
  camera.position.z = 11;

  // Lighting — softer, more diffused for watermark feel
  scene.add(new THREE.AmbientLight(0xfff8e1, 1.2));
  const keyLight = new THREE.DirectionalLight(0xffd060, 2.0);
  keyLight.position.set(5, 7, 8);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0xffffff, 1.2, 25);
  fillLight.position.set(-5, -3, 6);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0xffcc33, 1.5, 20);
  rimLight.position.set(3, -6, -3);
  scene.add(rimLight);

  // Canvas texture factory
  function makeFaceTexture(isFront) {
    const S = 512,
      cx = S / 2,
      cy = S / 2,
      r = S / 2 - 4;
    const tc = document.createElement("canvas");
    tc.width = tc.height = S;
    const ctx = tc.getContext("2d");

    // Gold radial gradient
    const grd = ctx.createRadialGradient(cx - 40, cy - 40, 0, cx, cy, r);
    grd.addColorStop(0, "#F7E87A");
    grd.addColorStop(0.4, "#D4AF37");
    grd.addColorStop(0.85, "#A07B10");
    grd.addColorStop(1, "#7A5A05");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer polished ring
    ctx.strokeStyle = "rgba(255,240,120,0.55)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Inner matte ring
    ctx.strokeStyle = "rgba(80,50,0,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 34, 0, Math.PI * 2);
    ctx.stroke();

    if (isFront) {
      // Engraved shadow
      ctx.fillStyle = "rgba(60,35,0,0.55)";
      ctx.font = "bold 172px Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("22", cx + 4, cy + 6);
      // Main numeral
      ctx.fillStyle = "rgba(50,28,0,0.95)";
      ctx.fillText("22", cx, cy);
      // Engraving highlight
      ctx.fillStyle = "rgba(255,245,160,0.22)";
      ctx.fillText("22", cx - 2, cy - 3);
      // Circular inscription
      const label = "MATVEY  ·  MMXXVI  ·  ";
      const insR = r - 22;
      ctx.font = "17px Georgia, serif";
      ctx.fillStyle = "rgba(70,42,0,0.6)";
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < label.length; i++) {
        const a = (i / label.length) * Math.PI * 2 - Math.PI / 2;
        ctx.save();
        ctx.rotate(a);
        ctx.fillText(label[i], 0, -insR);
        ctx.restore();
      }
      ctx.restore();
    } else {
      // Back: ornament star
      ctx.font = "110px Georgia, serif";
      ctx.fillStyle = "rgba(70,42,0,0.28)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✦", cx, cy);
    }
    return new THREE.CanvasTexture(tc);
  }

  // Materials — transparent so coin reads as elegant watermark, not solid object
  const sideMat = new THREE.MeshPhongMaterial({
    color: 0xd4af37,
    specular: 0xffee88,
    shininess: 70,
    transparent: true,
    opacity: 0.72,
  });
  const frontMat = new THREE.MeshPhongMaterial({
    map: makeFaceTexture(true),
    specular: 0xffee88,
    shininess: 55,
    color: 0xd4af37,
    transparent: true,
    opacity: 0.72,
  });
  const backMat = new THREE.MeshPhongMaterial({
    map: makeFaceTexture(false),
    specular: 0xffee88,
    shininess: 55,
    color: 0xd4af37,
    transparent: true,
    opacity: 0.72,
  });

  // Two groups: scrollGroup (GSAP pos/rot) ← spinGroup (RAF spin)
  const scrollGroup = new THREE.Group();
  const spinGroup = new THREE.Group();
  scrollGroup.add(spinGroup);
  scene.add(scrollGroup);

  // Coin mesh: CylinderGeometry [side=0, top=1, bottom=2]
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.2, 80), [
    sideMat,
    frontMat,
    backMat,
  ]);
  spinGroup.add(coin);

  // Knurling around edge (rings of notches)
  for (let i = 0; i < 88; i++) {
    const a = (i / 88) * Math.PI * 2;
    const nm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.07), sideMat);
    nm.position.set(Math.cos(a) * 2.32, 0, Math.sin(a) * 2.32);
    nm.rotation.y = a;
    spinGroup.add(nm);
  }

  // Rotate the ENTIRE spinGroup so the coin face (top cap +Y) points toward +Z (camera)
  spinGroup.rotation.x = -Math.PI / 2;

  // Set initial scale and position based on device
  const s0 = baseScale();
  scrollGroup.scale.set(s0, s0, s0);
  scrollGroup.position.set(3.8 * pathAmp(), 2.0 * pathAmp(), 0);

  // Show coin canvas (opacity adapts to device width)
  function applyCoinOpacity() {
    coinCanvas.classList.add("visible");
    coinCanvas.style.opacity = window.innerWidth < 768 ? "0.55" : "";
  }
  applyCoinOpacity();

  // Resize — update renderer, camera, coin scale & opacity
  window.addEventListener("resize", () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
    const s = baseScale();
    scrollGroup.scale.set(s, s, s);
    applyCoinOpacity();
  });

  // GSAP ScrollTrigger scroll-path animation
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Reveal coin after preloader finishes
    setTimeout(() => coinCanvas.classList.add("visible"), 2100);

    const amp = pathAmp();
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 2.2,
      },
    });

    // Coin path — stays near CORNERS so it never blocks central content:
    // hero top-right → details bottom-left → countdown top-right
    // → dresscode bottom-right → rsvp top-left (away from form & button)
    tl.to(scrollGroup.position, {
      x: -3.8 * amp,
      y: -2.2 * amp,
      z: 0.2,
      duration: 0.25,
    }) // details
      .to(scrollGroup.position, {
        x: 3.6 * amp,
        y: 2.0 * amp,
        z: 0.0,
        duration: 0.25,
      }) // countdown
      .to(scrollGroup.position, {
        x: 3.6 * amp,
        y: -2.2 * amp,
        z: 0.3,
        duration: 0.25,
      }) // dresscode
      .to(scrollGroup.position, {
        x: -3.8 * amp,
        y: 2.0 * amp,
        z: 0.5,
        duration: 0.25,
      }); // rsvp

    // Tilt variation (parallel from t=0)
    tl.to(scrollGroup.rotation, { x: 0.1, z: -0.08, duration: 0.5 }, 0).to(
      scrollGroup.rotation,
      { x: 0.4, z: 0.12, duration: 0.5 },
      0.5,
    );

    // Slight scale variation during scroll for depth feel
    const maxScale = baseScale() * 1.17;
    tl.to(
      scrollGroup.scale,
      { x: maxScale, y: maxScale, z: maxScale, duration: 1 },
      0,
    );
  } else {
    coinCanvas.classList.add("visible");
  }

  // RAF: continuous coin spin + gentle sway
  let animTime = 0;
  (function loop() {
    requestAnimationFrame(loop);
    animTime += 0.01;
    spinGroup.rotation.z += 0.014;
    scrollGroup.rotation.y = Math.sin(animTime * 0.4) * 0.12;
    renderer.render(scene, camera);
  })();
})();

// ─────────────────────── GIFT CARDS STAGGER ───────────────
// (same stagger logic as detail-cards)
document.querySelectorAll("#gifts .detail-card").forEach((card, i) => {
  card.style.setProperty("--i", i);
});
