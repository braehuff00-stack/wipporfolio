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

  const apply = (theme) => {
    root.setAttribute('data-bs-theme', theme);
    sync();
  };

  const switchTheme = () => {
    const chosen = isDark() ? 'light' : 'dark';
    apply(chosen);
    try { localStorage.setItem('theme', chosen); } catch (e) { /* storage blocked: applies to this page only */ }
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

  // Keep other open tabs of the site in step when the choice changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
      apply(e.newValue);
    }
  });

  sync();
})();
