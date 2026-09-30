(() => {
  function normalizePath(path) {
    if (!path) return "/";
    const clean = path.split("#")[0].split("?")[0];
    return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  }

  function markActiveNavigation() {
    const current = normalizePath(window.location.pathname);

    document.querySelectorAll(".site-nav__links a, .ui-sidebar-nav a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;

      const target = normalizePath(new URL(href, window.location.origin).pathname);
      const inSidebar = link.closest(".ui-sidebar-nav");
      const isActive = inSidebar
        ? current === target
        : current === target ||
          (target === "/components" && current.startsWith("/components")) ||
          (target === "/blocks" && current.startsWith("/blocks")) ||
          (target === "/themes" && current.startsWith("/themes")) ||
          (target === "/create" && current.startsWith("/create"));

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
    const site = document.querySelector('.foundry-site');
    const docsToggle = document.querySelector('.fd-menu-toggle');
    docsToggle?.addEventListener('click', () => {
      const open = site.dataset.docsOpen !== 'true';
      site.dataset.docsOpen = String(open);
      docsToggle.setAttribute('aria-expanded', String(open));
    });
    if (site) {
      const html = document.documentElement;
      const styles = ['alloy', 'forge', 'classic'];
      const palettes = ['bronze', 'silver', 'gold'];
      let storedStyle;
      try { storedStyle = localStorage.getItem('axonyx-site-ui-style'); } catch { /* Optional storage. */ }
      html.dataset.foundryStyle = styles.includes(storedStyle) ? storedStyle : 'classic';
      const syncAppearance = () => {
        const palette = palettes.includes(html.dataset.theme) ? html.dataset.theme : 'bronze';
        const style = styles.includes(html.dataset.foundryStyle) ? html.dataset.foundryStyle : 'classic';
        site.dataset.foundry = palette;
        // The specimen cards retain their own palettes while previewing the selected style.
        site.querySelectorAll('[data-foundry]').forEach(scope => { scope.dataset.foundryStyle = style; });
        site.dataset.foundryStyle = style;
        document.querySelectorAll('[data-foundry-style-picker]').forEach(select => { select.value = style; });
        document.querySelectorAll('[data-foundry-palette-picker]').forEach(select => { select.value = palette; });
        document.dispatchEvent(new CustomEvent('foundry:appearance', { detail: { style, palette } }));
      };
      document.querySelectorAll('[data-foundry-style-picker]').forEach(select => select.addEventListener('change', () => {
        html.dataset.foundryStyle = select.value;
        try { localStorage.setItem('axonyx-site-ui-style', select.value); } catch { /* Optional storage. */ }
      }));
      document.querySelectorAll('[data-foundry-palette-picker]').forEach(select => select.addEventListener('change', () => {
        html.dataset.theme = select.value;
        try { localStorage.setItem('axonyx-site-ui-theme', select.value); } catch { /* Optional storage. */ }
      }));
      syncAppearance();
      new MutationObserver(syncAppearance).observe(html, { attributes: true, attributeFilter: ['data-theme', 'data-foundry-style'] });
    }
    document.querySelectorAll('[data-doc-copy]').forEach(button => {
      button.addEventListener('click', async () => {
        const code = button.closest('.fd-code').querySelector('pre');
        const status = document.querySelector('.fd-copy-status');
        try {
          await navigator.clipboard.writeText(code.textContent);
          button.textContent = 'Copied';
          if (status) status.textContent = 'Code copied.';
          window.setTimeout(() => { button.textContent = 'Copy'; }, 1800);
        } catch {
          const range = document.createRange(); range.selectNodeContents(code);
          const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
          if (status) status.textContent = 'Code selected. Use your copy shortcut.';
        }
      });
    });
    document.querySelectorAll('.fd-preview button').forEach(button => button.addEventListener('click', () => {
      const status = document.querySelector('.fd-demo-status');
      if (status) status.textContent = `${button.textContent.trim()} clicked. Ready to wire into your app.`;
    }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
