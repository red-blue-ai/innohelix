/* InnoHelix — warm edition. Language, contact address, nav state, hero load, the module
   switch, the technology rail, the steps accordion, hand-drawn underlines. */
(function () {
  "use strict";

  const CONTACT_EMAIL = ""; // e.g. "hello@your-domain.com" — fills the contact button and line once set

  const root = document.documentElement;
  const qs = new URLSearchParams(location.search);
  const TITLES = { zh: "赫序科技 InnoHelix", en: "InnoHelix — Industrial waste, made into jet fuel" };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* language: shares the "ih-lang" key with the full site */
  function applyLang(l) {
    root.dataset.lang = l;
    root.lang = l === "en" ? "en" : "zh-CN";
    document.title = TITLES[l];
    onScroll();
  }
  document.querySelectorAll(".lang [data-set]").forEach((b) => b.addEventListener("click", () => {
    try { localStorage.setItem("ih-lang", b.dataset.set); } catch (e) { /* ignore */ }
    applyLang(b.dataset.set);
  }));

  /* contact */
  if (CONTACT_EMAIL) {
    document.querySelectorAll("[data-mail]").forEach((a) => (a.href = "mailto:" + CONTACT_EMAIL));
    document.querySelectorAll("[data-mail-text]").forEach((s) => {
      const a = document.createElement("a");
      a.href = "mailto:" + CONTACT_EMAIL;
      a.textContent = CONTACT_EMAIL;
      s.replaceWith(a);
    });
  }

  const seen = (els, fn, opts) => {
    if (!("IntersectionObserver" in window)) { els.forEach(fn); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }), opts);
    els.forEach((el) => io.observe(el));
  };

  /* hand-drawn underline draws once, when it comes into view */
  document.querySelectorAll(".uline path").forEach((p) => p.setAttribute("pathLength", "1"));
  seen(document.querySelectorAll(".uline"), (el) => el.classList.add("drawn"), { threshold: 1 });

  /* hero load */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("ready")));

  /* the module switch: flips on by itself once, the first time it's seen */
  const sw = document.querySelector(".switch");
  const tog = sw.querySelector(".toggle");
  let touched = false;
  sw.querySelectorAll(".gas li").forEach((li, i) => li.style.setProperty("--i", i));
  const setSwitch = (on) => { sw.dataset.on = String(on); tog.setAttribute("aria-pressed", String(on)); };
  tog.addEventListener("click", () => { touched = true; setSwitch(sw.dataset.on !== "true"); });
  seen([sw], () => setTimeout(() => { if (!touched) setSwitch(true); }, reduced ? 0 : 1100), { threshold: 0.55 });

  /* nav: transparent on the hero photo, solid after it */
  const nav = document.querySelector(".nav");
  const hero = document.querySelector(".hero");

  /* technology rail: scroll drives it while pinned, taps drive it otherwise */
  const rail = document.querySelector(".rail");
  const items = rail.querySelectorAll(".rail__list li");
  const media = rail.querySelectorAll(".rm");
  const pinned = matchMedia("(min-width: 981px)");
  let railIdx = 0;
  function railSet(i, lp) {
    if (i !== railIdx) {
      railIdx = i;
      items.forEach((li, j) => li.classList.toggle("on", j === i));
      media.forEach((m, j) => m.classList.toggle("on", j === i));
    }
    items[i].style.setProperty("--lp", lp == null ? 1 : lp.toFixed(3));
  }
  function onScroll() {
    nav.classList.toggle("solid", scrollY > hero.offsetHeight - nav.offsetHeight - 8);
    if (!pinned.matches) return;
    const r = rail.getBoundingClientRect();
    const span = r.height - innerHeight;
    const p = Math.min(0.9999, Math.max(0, -r.top / span));
    const k = p * items.length;
    railSet(Math.floor(k), k - Math.floor(k));
  }
  items.forEach((li, i) => li.querySelector("button").addEventListener("click", () => {
    if (pinned.matches) {
      const r = rail.getBoundingClientRect();
      const span = r.height - innerHeight;
      scrollTo({ top: scrollY + r.top + span * ((i + 0.05) / items.length), behavior: reduced ? "auto" : "smooth" });
    } else {
      railSet(i, 1);
    }
  }));
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  pinned.addEventListener("change", () => { items.forEach((li) => li.style.removeProperty("--lp")); onScroll(); });

  /* steps accordion */
  const steps = document.querySelectorAll(".steps__list li");
  const shots = document.querySelectorAll(".sm");
  steps.forEach((li, i) => li.querySelector("button").addEventListener("click", () => {
    steps.forEach((s, j) => { s.classList.toggle("on", j === i); s.querySelector("button").setAttribute("aria-expanded", String(j === i)); });
    shots.forEach((s, j) => s.classList.toggle("on", j === i));
  }));

  /* boot */
  let saved = null;
  try { saved = localStorage.getItem("ih-lang"); } catch (e) { /* storage blocked */ }
  const forced = qs.get("lang");
  applyLang(forced === "en" || forced === "zh" ? forced : saved === "en" ? "en" : "zh");
})();
