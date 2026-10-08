document.addEventListener('DOMContentLoaded', initNavigation);

function initNavigation() {
  const menuButton = document.getElementById('menu-button');
  const mainMenu = document.getElementById('mainmenu');
  if (!mainMenu || !menuButton) return;
  const nav = mainMenu.closest('.site-nav');
  const panels = [];
  const compact = window.matchMedia('(max-width: 991px)');
  const background = Array.from(document.querySelectorAll('main, footer, .social-bar'));
  const previousInert = new Map();
  let previousOverflow = '';
  const visibleControls = () => Array.from(mainMenu.querySelectorAll('a[href], button:not([disabled])'))
    .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');

  function closeDropdown(panel) {
    panel.menu.inert = true;
    panel.menu.classList.remove('show');
    panel.menu.style.display = '';
    panel.menu.style.maxHeight = '';
    panel.toggle.setAttribute('aria-expanded', 'false');
  }
  function closeAllDropdowns() { panels.forEach(closeDropdown); }
  function setDrawerOpen(open, returnFocus = false) {
    if (!mainMenu || !menuButton) return;
    const wasOpen = mainMenu.classList.contains('w--open');
    mainMenu.inert = compact.matches && !open;
    mainMenu.classList.toggle('w--open', open);
    menuButton.classList.toggle('w--open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    if (open && !wasOpen) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      background.forEach(element => { previousInert.set(element, element.inert); element.inert = true; });
      visibleControls()[0]?.focus();
    } else if (!open && wasOpen) {
      document.body.style.overflow = previousOverflow;
      background.forEach(element => { element.inert = previousInert.get(element) || false; });
      previousInert.clear();
      closeAllDropdowns();
      if (returnFocus) menuButton.focus();
    }
  }
  menuButton?.addEventListener('click', event => {
    event.preventDefault();
    setDrawerOpen(!mainMenu.classList.contains('w--open'), true);
  });
  document.querySelectorAll('.nav-menu .dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!toggle || !menu) return;
    const panel = { toggle, menu };
    panels.push(panel);
    closeDropdown(panel);
    toggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      closeAllDropdowns();
      if (open) {
        menu.inert = false;
        menu.classList.add('show');
        menu.style.setProperty('display', 'block', 'important');
        menu.style.setProperty('max-height', compact.matches ? 'none' : '500px', 'important');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.dropdown')) closeAllDropdowns();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const panel = panels.find(panel => panel.toggle.getAttribute('aria-expanded') === 'true');
      if (panel) { closeDropdown(panel); panel.toggle.focus(); }
      else setDrawerOpen(false, true);
    }
    if (event.key === 'Tab' && mainMenu?.classList.contains('w--open')) {
      const controls = [...visibleControls(), menuButton];
      const index = controls.indexOf(document.activeElement);
      if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === controls.length - 1)) {
        event.preventDefault();
        controls[event.shiftKey ? controls.length - 1 : 0]?.focus();
      }
    }
  });
  mainMenu?.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', () => setDrawerOpen(false));
  });
  compact.addEventListener('change', () => {
    const focusInside = mainMenu.contains(document.activeElement);
    setDrawerOpen(false);
    if (compact.matches && focusInside) menuButton.focus();
  });
  // Mark only the URL actually being viewed, independent of .html clean URLs.
  const path = value => value.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  mainMenu.querySelectorAll('a[href]').forEach(link => {
    if (path(new URL(link.href, window.location.href).pathname) === path(window.location.pathname)) {
      link.setAttribute('aria-current', 'page');
    }
  });
  nav?.classList.add('nav-ready');
  setDrawerOpen(false);
}
