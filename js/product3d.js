/* Product page: the live 3D cutaway of the module (machine/reformer.html in an iframe).
   Loads as it nears the viewport, tells the page inside when it is actually on screen (it renders only then),
   and follows the language switch. */
(function () {
  "use strict";
  const frame = document.querySelector(".stage__frame");
  if (!frame) return;
  const root = document.documentElement, full = document.querySelector(".stage__full");
  const lang = () => (root.dataset.lang === "en" ? "en" : "zh");
  let loaded = "", near = false, onScreen = false;

  const tell = () => {
    if (!loaded || !frame.contentWindow) return;
    frame.contentWindow.postMessage({ type: "innohelix:visible", on: onScreen && !document.hidden }, "*");
  };
  const load = () => {
    if (loaded === lang()) return;
    loaded = lang();
    frame.src = frame.dataset.src + "&lang=" + loaded;
  };
  const syncLink = () => { if (full) full.href = "machine/reformer.html" + (lang() === "en" ? "?lang=en" : ""); };

  new IntersectionObserver((es) => { near = es[es.length - 1].isIntersecting; if (near) load(); }, { rootMargin: "600px 0px" }).observe(frame);
  new IntersectionObserver((es) => { onScreen = es[es.length - 1].isIntersecting; tell(); }, { threshold: 0.3 }).observe(frame);
  addEventListener("message", (e) => { if (e.source === frame.contentWindow && e.data && e.data.type === "innohelix:machine-ready") tell(); });
  document.addEventListener("visibilitychange", tell);
  new MutationObserver(() => { syncLink(); if (loaded && loaded !== lang()) { loaded = ""; if (near) load(); } }).observe(root, { attributes: true, attributeFilter: ["data-lang"] });
  syncLink();
})();
