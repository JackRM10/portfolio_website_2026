const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  initBrandLogoFallback();
  initTechLogoFallbacks();
  initMobileNav();
  initSectionHighlighting(reduceMotion);
  initReveal(reduceMotion);
  initTypewriter(reduceMotion);
  initParticles(reduceMotion);
});

function initBrandLogoFallback() {
  const logo = $(".brand-logo");
  const mark = $(".brand-mark");
  if (!logo || !mark) return;

  const src = logo.getAttribute("src");
  if (!src) return;

  logo.addEventListener("load", () => {
    logo.hidden = false;
    mark.hidden = true;
  });
  logo.addEventListener("error", () => {
    logo.hidden = true;
    mark.hidden = false;
  });

  logo.src = src;
}

function initTechLogoFallbacks() {
  const slots = $$(".logo-slot[data-logo-src]");
  slots.forEach((slot) => {
    const src = slot.getAttribute("data-logo-src");
    const img = $(".tech-logo", slot);
    if (!src || !img) return;

    img.addEventListener("load", () => {
      img.hidden = false;
      slot.classList.add("has-image");
    });
    img.addEventListener("error", () => {
      img.hidden = true;
      slot.classList.remove("has-image");
    });

    img.src = src;
  });
}

function initMobileNav() {
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  if (!toggle || !nav) return;

  const setMenu = (isOpen) => {
    nav.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("open"));
  });

  $$(".nav a").forEach((a) => {
    a.addEventListener("click", () => {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  document.addEventListener("click", (event) => {
    const clickInsideNav = nav.contains(event.target);
    const clickToggle = toggle.contains(event.target);
    if (!clickInsideNav && !clickToggle) setMenu(false);
  });
}

function initSectionHighlighting(reduceMotion) {
  const navLinks = $$(".nav a");
  const sections = $$("section[id]");

  const setActive = () => {
    let currentId = "";
    const y = window.scrollY;

    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (y >= top) currentId = sec.id;
    });

    navLinks.forEach((a) => {
      const isCurrent = a.getAttribute("href") === `#${currentId}`;
      a.classList.toggle("active", isCurrent);
      if (isCurrent) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });
}

function initReveal(reduceMotion) {
  const reveals = $$(".reveal");
  if (!reveals.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });

  reveals.forEach((el) => io.observe(el));
}

function initTypewriter(reduceMotion) {
  const el = document.getElementById("typewriter");
  if (!el) return;

  const phrases = (el.dataset.phrases || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!phrases.length) return;
  if (reduceMotion) {
    el.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let direction = 1;
  const speed = 42;
  const pause = 900;

  const tick = () => {
    const text = phrases[phraseIndex];
    charIndex += direction;
    el.textContent = text.slice(0, charIndex);

    if (direction === 1 && charIndex >= text.length) {
      direction = -1;
      setTimeout(tick, pause);
      return;
    }

    if (direction === -1 && charIndex <= 0) {
      direction = 1;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(tick, 250);
      return;
    }

    setTimeout(tick, speed);
  };

  tick();
}

function initParticles(reduceMotion) {
  if (reduceMotion) return;

  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w;
  let h;
  let dpr;

  const resize = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  };

  window.addEventListener("resize", resize, { passive: true });
  resize();

  const count = Math.floor((window.innerWidth * window.innerHeight) / 45000);
  const pts = Array.from({ length: Math.max(28, Math.min(70, count)) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25 * dpr,
    vy: (Math.random() - 0.5) * 0.25 * dpr,
    r: (Math.random() * 1.6 + 0.6) * dpr,
    a: Math.random() * 0.45 + 0.15
  }));

  const lineDist = 150 * dpr;

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (const p of pts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(234,240,255,${p.a})`;
      ctx.fill();
    }

    for (let i = 0; i < pts.length; i += 1) {
      for (let j = i + 1; j < pts.length; j += 1) {
        const a = pts[i];
        const b = pts[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < lineDist) {
          const alpha = (1 - dist / lineDist) * 0.2;
          ctx.strokeStyle = `rgba(76,125,255,${alpha})`;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  step();
}
