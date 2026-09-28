// Unified Navigation - Works with existing nav.html structure
console.log('🔵 Unified nav script loading...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔵 DOM ready, initializing navigation...');
  
  // Give Webflow a moment, then take over
  setTimeout(initNavigation, 200);
});

function initNavigation() {
  console.log('🔵 Initializing navigation...');
  
  // ========================================
  // MOBILE HAMBURGER MENU
  // ========================================
  
  const menuButton = document.getElementById('menu-button');
  const mainMenu = document.getElementById('mainmenu');
  
  if (menuButton && mainMenu) {
    console.log('🔵 Setting up mobile hamburger...');
    
    // Remove any existing handlers by cloning
    const newMenuButton = menuButton.cloneNode(true);
    menuButton.parentNode.replaceChild(newMenuButton, menuButton);
    
    // Add our handler
    newMenuButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = mainMenu.classList.contains('w--open');
      
      if (isOpen) {
        // Close menu
        mainMenu.classList.remove('w--open');
        newMenuButton.classList.remove('w--open');
        newMenuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        console.log('🔵 Mobile menu closed');
      } else {
        // Open menu
        mainMenu.classList.add('w--open');
        newMenuButton.classList.add('w--open');
        newMenuButton.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        console.log('🔵 Mobile menu opened');
      }
    });
    
    console.log('🔵 Mobile hamburger ready!');
  } else {
    console.warn('⚠️ Menu button or main menu not found');
  }
  
  // ========================================
  // DROPDOWN MENUS (Desktop & Mobile)
  //
  // Wired up generically: every .dropdown that contains a .dropdown-toggle and
  // a .dropdown-menu works. Adding or removing a dropdown in _includes/nav.html
  // needs no change here.
  // ========================================

  const dropdowns = Array.from(document.querySelectorAll('.nav-menu .dropdown'));
  const panels = [];

  function closeAllDropdowns() {
    panels.forEach(function (d) {
      d.menu.classList.remove('show');
      d.menu.style.display = '';
      d.menu.style.maxHeight = '';
      d.toggle.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(function (dropdown) {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!toggle || !menu) return;

    // Clone to drop any handler Webflow already attached.
    const fresh = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(fresh, toggle);
    panels.push({ toggle: fresh, menu: menu });

    fresh.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = menu.classList.contains('show');
      closeAllDropdowns();

      if (!isOpen) {
        menu.classList.add('show');
        menu.style.setProperty('display', 'block', 'important');
        menu.style.setProperty('max-height', '500px', 'important');
        fresh.setAttribute('aria-expanded', 'true');
      }
    });
  });

  console.log('🔵 Dropdowns wired:', panels.length);

  // ========================================
  // CLOSE HANDLERS
  // ========================================
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    const clickedDropdown = e.target.closest('.dropdown');
    if (!clickedDropdown) {
      closeAllDropdowns();
    }
  });
  
  // Close everything on escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllDropdowns();
      
      // Also close mobile menu if open
      if (mainMenu && mainMenu.classList.contains('w--open')) {
        const btn = document.getElementById('menu-button');
        mainMenu.classList.remove('w--open');
        if (btn) btn.classList.remove('w--open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        console.log('🔵 Mobile menu closed via escape');
      }
    }
  });
  
  // Close mobile menu when clicking nav links
  if (mainMenu) {
    const navLinks = mainMenu.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        setTimeout(function() {
          const btn = document.getElementById('menu-button');
          mainMenu.classList.remove('w--open');
          if (btn) btn.classList.remove('w--open');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
          closeAllDropdowns();
        }, 100);
      });
    });
  }
  
  console.log('🔵 Navigation fully initialized!');
}