// Dark mode switch.
// The theme is set on <html data-bs-theme="..."> by a small script in each page's
// <head> (so the page never flashes the wrong theme). The site starts in light
// mode; a choice made with the switch is remembered on every page, after a
// refresh, and on later visits, until the visitor changes it.
// This file wires up the navbar switch.
(() => {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.theme-toggle');

  const isDark = () => root.getAttribute('data-bs-theme') === 'dark';
  const sync = () => toggles.forEach((t) => t.setAttribute('aria-checked', String(isDark())));

  const savedTheme = () => {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  };

  // The visitor's choice, if any: saved, or carried in from the last page's link
  const fromUrl = new URLSearchParams(window.location.search).get('theme');
  let chosen = (fromUrl === 'dark' || fromUrl === 'light' ? fromUrl : null) || savedTheme();

  const apply = (theme) => {
    root.setAttribute('data-bs-theme', theme);
    sync();
  };

  const switchTheme = () => {
    chosen = isDark() ? 'light' : 'dark';
    apply(chosen);
    try { localStorage.setItem('theme', chosen); } catch (e) { /* storage blocked: the address below still keeps it */ }
    // Keep this page's address in step, so a refresh shows the new choice even
    // if it arrived with an older ?theme= from a link (or storage is blocked)
    const url = new URL(window.location.href);
    url.searchParams.set('theme', chosen);
    history.replaceState(history.state, '', url);
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      // Cross-fade the whole page to the new theme (see .theme-fade in styles.css).
      // Browsers without View Transitions fall back to the quick colour fade.
      if (!document.startViewTransition || reducedMotion.matches) {
        switchTheme();
        return;
      }
      root.classList.add('theme-fade');
      const transition = document.startViewTransition(switchTheme);
      transition.finished.finally(() => root.classList.remove('theme-fade'));
    });
  });

  // Carry the choice to the next page through the link itself. Saved storage
  // covers most cases, but browsers keep storage per file (or block it) when the
  // site is opened straight from disk, so the choice would otherwise be lost.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || !chosen || link.getAttribute('href').startsWith('#')) return;  // same-page jumps (e.g. skip link)
    const url = new URL(link.getAttribute('href'), window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.endsWith('.html')) return;
    url.searchParams.set('theme', chosen);
    link.href = url.href;
  });

  // Keep other open tabs of the site in step when the choice changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
      chosen = e.newValue;
      apply(chosen);
    }
  });

  sync();
})();
