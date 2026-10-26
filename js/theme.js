// Dark mode switch.
// The theme is set on <html data-bs-theme="..."> by a small script in each page's
// <head> (so the page never flashes the wrong theme). The site starts in light
// mode; a choice made with the switch is saved in the browser and remembered on
// every page, after a refresh, and on later visits, until the visitor changes it.
// This file wires up the navbar switch.
(() => {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.theme-toggle');

  const isDark = () => root.getAttribute('data-bs-theme') === 'dark';
  const sync = () => toggles.forEach((t) => t.setAttribute('aria-checked', String(isDark())));

  // Carry the current theme in links to the site's other pages (?theme=...). The
  // <head> script reads it and then removes it from the address bar. This keeps the
  // theme the same from page to page even where the browser keeps saved settings
  // separate for each page, as some browsers do for files opened from a computer.
  const carryTheme = () => {
    const theme = isDark() ? 'dark' : 'light';
    document.querySelectorAll('a[href]').forEach((link) => {
      if (!link.dataset.baseHref) link.dataset.baseHref = link.getAttribute('href');
      const base = link.dataset.baseHref;
      if (!base || base.startsWith('#')) return; // in-page links stay as they are
      let url;
      try { url = new URL(base, location.href); } catch (e) { return; }
      const sameSite = url.protocol === location.protocol && url.host === location.host;
      if (!sameSite || !/\.html?$/i.test(url.pathname)) return;
      const [path, hash] = base.split('#');
      const sep = path.includes('?') ? '&' : '?';
      link.setAttribute('href', `${path}${sep}theme=${theme}${hash !== undefined ? '#' + hash : ''}`);
    });
  };

  const apply = (theme) => {
    root.setAttribute('data-bs-theme', theme);
    sync();
    carryTheme();
  };

  const switchTheme = () => {
    const chosen = isDark() ? 'light' : 'dark';
    apply(chosen);
    try { localStorage.setItem('theme', chosen); } catch (e) { /* storage blocked: applies to this page only */ }
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let fadeTimer = null;
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      // Fade every colour on the page to the new theme together (see .theme-fade in
      // styles.css); with reduced motion the theme simply switches
      if (reducedMotion.matches) {
        switchTheme();
        return;
      }
      root.classList.add('theme-fade');
      void root.offsetWidth;  // apply the fade transitions before the colours change
      switchTheme();
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => root.classList.remove('theme-fade'), 350);
    });
  });

  // Keep other open tabs of the site in step when the choice changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
      apply(e.newValue);
    }
  });

  // When a page comes back from the browser's back/forward cache, show the theme
  // chosen most recently on any other page
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    try {
      const saved = localStorage.getItem('theme');
      if ((saved === 'dark' || saved === 'light') && saved !== root.getAttribute('data-bs-theme')) apply(saved);
    } catch (err) { /* storage blocked: keep the page as it is */ }
  });

  sync();
  carryTheme();
})();

// Shrink the navbar once the page is scrolled (see .site-nav.is-scrolled in styles.css)
(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 16);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
