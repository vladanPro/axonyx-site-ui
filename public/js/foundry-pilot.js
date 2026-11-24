(() => {
  function boot() {
    const root = document.querySelector('.foundry-pilot');
    if (!root || root.dataset.booted) return;
    root.dataset.booted = 'true';
    const $ = (selector) => root.querySelector(selector);
    const site = root.closest('.foundry-site');
    if (site) {
      root.dataset.foundry = site.dataset.foundry;
      root.dataset.foundryStyle = site.dataset.foundryStyle;
      root.dataset.foundryMode = site.dataset.foundryMode;
    }
    const selector = () => `[data-foundry="${root.dataset.foundry}"][data-foundry-style="${root.dataset.foundryStyle}"][data-foundry-mode="${root.dataset.foundryMode}"]`;
    function defaultAccent() {
      root.style.removeProperty('--ax-primary');
      return getComputedStyle(root).getPropertyValue('--ax-primary').trim();
    }
    function defaultRadius() {
      root.style.removeProperty('--ax-radius-md');
      return Number.parseFloat(getComputedStyle(root).getPropertyValue('--ax-radius-md'));
    }
    let accent = defaultAccent();
    let radius = defaultRadius();
    const picker = $('#accent-picker');
    const hex = $('#accent-hex');
    const code = $('#theme-css');
    const copyStatus = $('#copy-status');
    function foreground(value) {
      const rgb = value.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
      const luminance = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      return luminance > .179 ? '#000000' : '#ffffff';
    }
    function render() {
      root.style.setProperty('--ax-primary', accent);
      root.style.setProperty('--ax-on-primary', foreground(accent));
      root.style.setProperty('--ax-radius-md', `${radius}px`);
      picker.value = accent;
      hex.value = accent.toUpperCase();
      hex.setAttribute('aria-invalid', 'false');
      code.value = `${selector()} {\n  --ax-primary: ${accent};\n  --ax-radius-md: ${radius}px;\n  --ax-on-primary: ${foreground(accent)};\n}`;
      root.querySelectorAll('[data-finish]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.finish === root.dataset.foundry)));
      root.querySelectorAll('[data-radius]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.radius) === radius)));
      copyStatus.textContent = '';
    }
    document.addEventListener('foundry:appearance', event => {
      const next = event.detail;
      root.dataset.foundry = next.palette;
      root.dataset.foundryStyle = next.style;
      root.dataset.foundryMode = next.mode;
      radius = defaultRadius();
      accent = defaultAccent();
      render();
    });
    root.querySelectorAll('[data-finish]').forEach(button => button.addEventListener('click', () => {
      root.dataset.foundry = button.dataset.finish;
      accent = defaultAccent();
      render();
    }));
    root.querySelectorAll('[data-radius]').forEach(button => button.addEventListener('click', () => { radius = Number(button.dataset.radius); render(); }));
    picker.addEventListener('input', () => { accent = picker.value; render(); });
    hex.addEventListener('input', () => {
      const valid = /^#[0-9a-f]{6}$/i.test(hex.value);
      hex.setAttribute('aria-invalid', String(!valid));
      if (valid) { accent = hex.value.toLowerCase(); render(); }
    });
    $('#copy-theme').addEventListener('click', async () => {
      try {
        const response = await fetch('/_ax/pkg/axonyx-ui/foundry.css');
        if (!response.ok) throw new Error('Theme foundation unavailable');
        const base = await response.text();
        const overrides = code.value;
        await navigator.clipboard.writeText(`/* Load after Axonyx UI. Apply this selector to your Foundry wrapper: ${selector()}. */\n${base}\n/* Your overrides */\n${overrides}\n`);
        copyStatus.textContent = 'Copied foundation + your overrides.';
      } catch {
        code.focus(); code.select();
        copyStatus.textContent = 'Copy the selected overrides; download the foundation below.';
      }
    });
    const form = $('#workspace-form');
    const status = $('#workspace-status');
    const defaults = { workspace: 'Acme Studio', url: 'acme.axonyx.app', role: 'editor', builds: true, updates: false };
    let saved = { ...defaults };
    try {
      const stored = JSON.parse(localStorage.getItem('foundry-pilot-workspace'));
      if (stored && typeof stored.workspace === 'string' && typeof stored.url === 'string' && ['editor','viewer','admin'].includes(stored.role) && typeof stored.builds === 'boolean' && typeof stored.updates === 'boolean') saved = stored;
    } catch { /* Storage is optional for this local demo. */ }
    function restore() {
      for (const [name,value] of Object.entries(saved)) {
        const input = form.elements.namedItem(name);
        if (!input) continue;
        if (input.type === 'checkbox') {
          input.checked = value;
          input.closest('.ax-switch').dataset.checked = String(value);
        } else input.value = value;
      }
    }
    form.elements.namedItem('workspace').required = true;
    form.elements.namedItem('url').required = true;
    form.addEventListener('submit', event => {
      event.preventDefault();
      saved = { workspace: form.elements.workspace.value.trim(), url: form.elements.url.value.trim(), role: form.elements.role.value, builds: form.elements.builds.checked, updates: form.elements.updates.checked };
      if (!saved.workspace || !saved.url) { status.textContent = 'Enter a workspace name and URL.'; return; }
      try { localStorage.setItem('foundry-pilot-workspace', JSON.stringify(saved)); status.textContent = 'Saved in this browser.'; }
      catch { status.textContent = 'Saved for this preview session.'; }
    });
    form.addEventListener('reset', event => { event.preventDefault(); restore(); status.textContent = 'Unsaved changes discarded.'; });
    form.addEventListener('input', () => { status.textContent = 'Unsaved changes'; });
    const entries = [...document.querySelectorAll('.ui-sidebar-nav a[href^="/components/"]')].map(a => ({ name: a.textContent.trim(), href: a.getAttribute('href') }));
    const results = $('#component-results');
    $('#component-search').addEventListener('input', event => {
      const query = event.target.value.trim().toLowerCase();
      results.replaceChildren(); results.hidden = !query;
      if (!query) return;
      const matches = entries.filter(entry => entry.name.toLowerCase().includes(query)).slice(0, 6);
      for (const entry of matches) { const link = document.createElement('a'); link.href = entry.href; link.textContent = entry.name; results.append(link); }
      if (!matches.length) { const text = document.createElement('p'); text.textContent = 'No matching components.'; results.append(text); }
    });
    $('#component-search').addEventListener('keydown', event => { if (event.key === 'Escape') results.hidden = true; if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); } });
    document.addEventListener('click', event => { if (!event.target.closest('.fp-search')) results.hidden = true; });
    render(); restore();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
