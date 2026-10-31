/* InnoHelix — page shell (classic script, no third-party libraries, works from file://).
   Owns: routing between pages, page transitions, language, loader, reveals,
   counters, section → particle-world signalling, top bar state, cursor. */
(function () {
  "use strict";

  /* ---------- config ---------- */
  const CONTACT_EMAIL = ""; // e.g. "hello@your-domain.com" — fills the contact button and line once set

  const qs = new URLSearchParams(location.search);
  const STILL = qs.has("still");           // deterministic screenshots only — never inferred from OS settings
  const root = document.documentElement;
  const body = document.body;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ---------- language ---------- */
  let saved = null;
  try { saved = localStorage.getItem("ih-lang"); } catch (e) { /* storage blocked */ }
  const forced = qs.get("lang");
  function applyLang(l) {
    root.dataset.lang = l;
    root.lang = l === "en" ? "en" : "zh-CN";
    setTitle();
    onScroll();
  }
  document.querySelectorAll(".lang [data-set]").forEach((b) => b.addEventListener("click", () => {
    try { localStorage.setItem("ih-lang", b.dataset.set); } catch (e) { /* ignore */ }
    applyLang(b.dataset.set);
  }));

  /* ---------- contact: no placeholder is ever shown; the email line appears once an address is set ---------- */
  if (CONTACT_EMAIL) {
    document.querySelectorAll("[data-mail]").forEach((a) => (a.href = "mailto:" + CONTACT_EMAIL));
    document.querySelectorAll("[data-mail-text]").forEach((a) => { a.textContent = CONTACT_EMAIL; a.href = "mailto:" + CONTACT_EMAIL; });
    document.querySelectorAll("[data-mail-line]").forEach((p) => (p.hidden = false));
  }

  /* ---------- reveals + counters (per page, re-armed on every visit) ---------- */
  const REVEAL = "[data-reveal], [data-reveal-lines], [data-reveal-self]";
  let io = null;
  function runCount(el) {
    const to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10);
    if (STILL) { el.textContent = to.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1600;
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function arm(view) {
    if (io) io.disconnect();
    const els = view.querySelectorAll(REVEAL + ", [data-count]");
    if (STILL || !("IntersectionObserver" in window)) {
      els.forEach((el) => { el.classList.add("in"); if (el.dataset.count) runCount(el); });
      return;
    }
    io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      if (en.target.dataset.count) runCount(en.target);
      io.unobserve(en.target);
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });
    els.forEach((el) => {
      if (el.dataset.count) el.textContent = (0).toFixed(parseInt(el.dataset.dec || "0", 10));
      io.observe(el);
    });
  }
  function disarm(view) {
    view.querySelectorAll(REVEAL).forEach((el) => el.classList.remove("in"));
  }

  /* ---------- router ---------- */
  const views = {};
  document.querySelectorAll(".view").forEach((v) => (views[v.dataset.view] = v));
  const parse = () => { const h = location.hash.replace(/^#\/?/, "").split("?")[0]; return views[h] ? h : "home"; };
  let current = null;
  function setTitle() {
    if (!current) return;
    const v = views[current];
    document.title = root.dataset.lang === "en" ? v.dataset.titleEn : v.dataset.titleZh;
  }
  function show(name, instant) {
    closeSheet();
    if (name === current) { scrollTo(0, 0); return; }
    const next = views[name], prev = current ? views[current] : null;
    const swap = () => {
      if (prev) { prev.classList.remove("is-out", "is-in"); disarm(prev); }
      Object.values(views).forEach((v) => (v.hidden = v !== next)); // deep links: home must hide too
      next.hidden = false;
      next.classList.remove("is-in"); void next.offsetWidth;
      if (!instant && !STILL) next.classList.add("is-in");
      scrollTo(0, 0);
      current = name;
      setTitle();
      document.querySelectorAll("[data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
      arm(next);
      artIndex(0);
      onScroll();
    };
    if (prev && !instant && !STILL) { prev.classList.add("is-out"); setTimeout(swap, 330); }
    else swap();
  }
  addEventListener("hashchange", () => show(parse()));
  addEventListener("popstate", () => show(parse()));
  // in-page links route directly (works inside sandboxed frames where hash navigation may be restricted)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const name = a.getAttribute("href").replace(/^#\/?/, "") || "home";
    if (!views[name]) return;
    e.preventDefault();
    try { if (location.hash.replace(/^#\/?/, "") !== name) history.pushState(null, "", "#" + name); } catch (err) { /* history blocked */ }
    show(name);
  });

  /* ---------- mobile sheet ---------- */
  const burger = document.querySelector(".burger");
  function closeSheet() { body.classList.remove("sheet-open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", () => {
    const open = !body.classList.contains("sheet-open");
    body.classList.toggle("sheet-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

  /* ---------- scroll-linked state ---------- */
  const top = document.getElementById("top");
  const prog = document.querySelector(".progress i");
  let lastY = 0, stageKey = "";
  function sectionAt(y) {
    if (!current) return null;
    const secs = views[current].querySelectorAll("[data-stage]");
    for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) return s; }
    return secs[secs.length - 1] || null;
  }
  function onScroll() {
    if (!current) return;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    prog.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    top.classList.toggle("scrolled", y > 8);
    if (y > 320 && y > lastY + 6) top.classList.add("hide");
    else if (y < lastY - 6 || y < 320) top.classList.remove("hide");
    lastY = y;

    // bar colour follows the chapter behind it; the world follows the chapter in view
    const under = sectionAt(34);
    body.classList.toggle("on-paper", !!(under && under.hasAttribute("data-paper")));
    const mid = sectionAt(vh * 0.5);
    if (mid) {
      const stage = mid.dataset.stage, dim = mid.dataset.dim ? parseFloat(mid.dataset.dim) : 1, key = stage + dim;
      if (key !== stageKey) {
        stageKey = key;
        window.__stage = { stage, dim };
        dispatchEvent(new CustomEvent("world:stage", { detail: window.__stage }));
      }
    }

    const home = current === "home";
    if (home && !STILL) {
      const hm = views.home.querySelector(".hero__main");
      const k = Math.min(1, y / (vh * 0.85));
      hm.style.opacity = (1 - k).toFixed(3);
      hm.style.transform = "translate3d(0," + (-y * 0.18).toFixed(1) + "px,0)";
      // second screen: the photograph settles in as it arrives (slow push-in plus parallax)
      const sc = views.home.querySelector(".scale"), r = sc.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        sc.style.setProperty("--zoom", (1.16 - 0.14 * p).toFixed(4));
        sc.style.setProperty("--sy", ((p - 0.5) * -60).toFixed(1) + "px");
      }
    }
    if (current === "product" && !STILL) {
      const img = views.product.querySelector(".stage__img, .stage--3d");
      if (img) {
        const r = img.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
        img.style.transform = "scale(" + (0.88 + 0.12 * p).toFixed(4) + ")";
      }
    }
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  /* ---------- technology: sticky index follows the article in view ---------- */
  const bigs = document.querySelectorAll(".tech__big span"), tocs = document.querySelectorAll(".toc li");
  function artIndex(i) { bigs.forEach((b, j) => b.classList.toggle("on", j === i)); tocs.forEach((b, j) => b.classList.toggle("on", j === i)); }
  if ("IntersectionObserver" in window) {
    const aio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) artIndex(+e.target.dataset.art); }), { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll("[data-art]").forEach((a) => aio.observe(a));
  }

  /* ---------- team: institutions list scrolls by hand, with buttons and the keyboard ---------- */
  document.querySelectorAll(".schools").forEach((box) => {
    const list = box.querySelector(".schools__list");
    const [prev, next] = box.querySelectorAll(".schools__nav button");
    const sync = () => {
      const max = list.scrollWidth - list.clientWidth - 2;
      prev.disabled = list.scrollLeft <= 2;
      next.disabled = list.scrollLeft >= max;
      list.classList.toggle("at-end", list.scrollLeft >= max);
    };
    box.querySelectorAll(".schools__nav button").forEach((b) => b.addEventListener("click", () => {
      list.scrollBy({ left: +b.dataset.dir * list.clientWidth * 0.8 });
    }));
    list.addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    new MutationObserver(sync).observe(box.closest(".view"), { attributes: true, attributeFilter: ["hidden"] });
    sync();
  });

  /* ---------- product hotspots: tap toggles (touch has no hover) ---------- */
  const hots = document.querySelectorAll(".hot");
  hots.forEach((h) => h.querySelector("button").addEventListener("click", () => {
    const on = !h.classList.contains("on");
    hots.forEach((x) => x.classList.remove("on"));
    if (on) h.classList.add("on");
  }));

  /* ---------- custom cursor: switched on by the first real mouse movement ---------- */
  const cur = document.querySelector(".cursor"), ring = cur.querySelector(".ring"), dot = cur.querySelector(".dot");
  let mx = -100, my = -100, rx = -100, ry = -100, cursorOn = false;
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    if (!cursorOn) { cursorOn = true; rx = mx; ry = my; root.classList.add("has-cursor"); requestAnimationFrame(loop); }
    dot.style.transform = "translate(" + mx + "px," + my + "px)";
  }, { passive: true });
  function loop() {
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    ring.style.transform = "translate(" + rx + "px," + ry + "px)";
    requestAnimationFrame(loop);
  }
  document.addEventListener("pointerover", (e) => cur.classList.toggle("hot", !!e.target.closest("a, button, .hot, .tile")));
  document.addEventListener("mouseleave", () => { cur.style.opacity = "0"; });
  document.addEventListener("mouseenter", () => { cur.style.opacity = "1"; });
  document.querySelectorAll(".btn").forEach((b) => b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
    b.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
  }));

  /* ---------- boot ---------- */
  applyLang(forced === "en" || forced === "zh" ? forced : saved === "en" ? "en" : "zh");
  show(parse(), true);
  if (STILL) {
    body.classList.add("still", "ready");
  } else {
    const bar = document.querySelector(".loader__bar i");
    bar.style.transition = "transform 1s cubic-bezier(.16,1,.3,1)";
    requestAnimationFrame(() => (bar.style.transform = "scaleX(1)"));
    let worldOk = false, minDone = false;
    const ready = () => body.classList.add("ready");
    addEventListener("world:ready", () => { worldOk = true; if (minDone) ready(); }, { once: true });
    setTimeout(() => { minDone = true; if (worldOk) ready(); }, 1000);
    setTimeout(ready, 2800); // never leave a blank page
  }
})();
