(() => {
  function normalizePath(path) {
    if (!path) return "/";
    const clean = path.split("#")[0].split("?")[0];
    return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  }

  function markActiveNavigation() {
    const current = normalizePath(window.location.pathname);

    document.querySelectorAll(".ax-site-header__links a, .ui-sidebar-nav a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;

      const target = normalizePath(new URL(href, window.location.origin).pathname);
      const inSidebar = link.closest(".ui-sidebar-nav");
      const isActive = inSidebar
        ? current === target
        : current === target ||
          (target === "/docs/installation" && (current === "/docs" || current.startsWith("/docs/"))) ||
          (target === "/components" && current.startsWith("/components")) ||
          (target === "/blocks" && current.startsWith("/blocks")) ||
          (target === "/themes" && current.startsWith("/themes")) ||
          (target === "/create" && current.startsWith("/create"));

      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }


  function boot() {
    markActiveNavigation();
    const site = document.querySelector('.foundry-site');
    const docsToggle = document.querySelector('.fd-menu-toggle');
    docsToggle?.addEventListener('click', () => {
      const open = site.dataset.docsOpen !== 'true';
      site.dataset.docsOpen = String(open);
      docsToggle.setAttribute('aria-expanded', String(open));
    });
    if (site) {
      const html = document.documentElement;
      const styles = ['alloy', 'forge', 'classic', 'legura'];
      const palettes = ['bronze', 'silver', 'gold'];
      const stylePickers = site.querySelectorAll('[data-foundry-style-picker]');
      const palettePickers = site.querySelectorAll('[data-foundry-palette-picker]');
      let storedStyle;
      try { storedStyle = localStorage.getItem('axonyx-site-ui-style'); } catch { /* Optional storage. */ }
      let style = styles.includes(storedStyle) ? storedStyle : site.dataset.foundryStyle;
      let preferredPalette = palettes.includes(html.dataset.theme) ? html.dataset.theme : 'bronze';
      const syncAppearance = () => {
        const isLegura = style === 'legura';
        const palette = isLegura ? 'bronze' : preferredPalette;
        const mode = isLegura ? 'light' : 'dark';
        html.dataset.theme = palette;
        html.dataset.foundryStyle = style;
        site.dataset.foundry = palette;
        site.dataset.foundryMode = mode;
        // The specimen cards retain their own palettes while previewing the selected style.
        site.querySelectorAll('[data-foundry]').forEach(scope => { scope.dataset.foundryStyle = style; });
        site.dataset.foundryStyle = style;
        stylePickers.forEach(select => { select.value = style; });
        palettePickers.forEach(select => {
          select.value = palette;
          select.disabled = isLegura;
        });
        document.dispatchEvent(new CustomEvent('foundry:appearance', { detail: { style, palette, mode } }));
      };
      stylePickers.forEach(select => select.addEventListener('change', () => {
        if (styles.includes(select.value)) {
          style = select.value;
          try { localStorage.setItem('axonyx-site-ui-style', style); } catch { /* Optional storage. */ }
        }
        syncAppearance();
      }));
      palettePickers.forEach(select => select.addEventListener('change', () => {
        if (style !== 'legura' && palettes.includes(select.value)) {
          preferredPalette = select.value;
          try { localStorage.setItem('axonyx-site-ui-theme', preferredPalette); } catch { /* Optional storage. */ }
        }
        syncAppearance();
      }));
      syncAppearance();
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
