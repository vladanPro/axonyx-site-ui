(() => {
  function normalizePath(path) {
    if (!path) return "/";
    const clean = path.split("#")[0].split("?")[0];
    return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  }

  function markActiveNavigation() {
    const current = normalizePath(window.location.pathname);

    document.querySelectorAll(".site-nav__links a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;

      const target = normalizePath(new URL(href, window.location.origin).pathname);
      const isActive =
        current === target ||
        (target === "/components" && current.startsWith("/components")) ||
        (target === "/blocks" && current.startsWith("/blocks")) ||
        (target === "/themes" && current.startsWith("/themes")) ||
        (target === "/registry" && current.startsWith("/registry"));

      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function bootSiteNavigation() {
    const toggle = document.querySelector(".site-nav__toggle");
    const nav = document.querySelector(".site-nav__links");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.dataset.open !== "true";
      nav.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function boot() {
    markActiveNavigation();
    bootSiteNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
