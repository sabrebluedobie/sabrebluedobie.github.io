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
  // ========================================
  
  const dropdownToggle = document.getElementById('dropdown-toggle');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const productsToggle = document.getElementById('products-toggle');
  const productsMenu = document.getElementById('products-menu');
  
  console.log('🔵 Dropdown elements found:', {
    dropdownToggle: !!dropdownToggle,
    dropdownMenu: !!dropdownMenu,
    productsToggle: !!productsToggle,
    productsMenu: !!productsMenu
  });
  
  // Helper to close all dropdowns
  function closeAllDropdowns() {
    if (dropdownMenu) {
      dropdownMenu.classList.remove('show');
      dropdownMenu.style.display = '';
    }
    if (productsMenu) {
      productsMenu.classList.remove('show');
      productsMenu.style.display = '';
    }
    if (dropdownToggle) dropdownToggle.setAttribute('aria-expanded', 'false');
    if (productsToggle) productsToggle.setAttribute('aria-expanded', 'false');
  }
  
  // "More" dropdown
  if (dropdownToggle && dropdownMenu) {
    // Clone to remove existing handlers
    const newToggle = dropdownToggle.cloneNode(true);
    dropdownToggle.parentNode.replaceChild(newToggle, dropdownToggle);
    
    newToggle.addEventListener('click', function(e) {
      console.log('🔵 More dropdown clicked');
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = dropdownMenu.classList.contains('show');
      closeAllDropdowns();
      
      if (!isOpen) {
        dropdownMenu.classList.add('show');
        dropdownMenu.style.display = 'block';
        newToggle.setAttribute('aria-expanded', 'true');
        console.log('🔵 More dropdown opened');
      }
    });
    
    console.log('🔵 More dropdown ready!');
  }
  
  // "Products" dropdown
  if (productsToggle && productsMenu) {
    // Clone to remove existing handlers
    const newToggle = productsToggle.cloneNode(true);
    productsToggle.parentNode.replaceChild(newToggle, productsToggle);
    
    newToggle.addEventListener('click', function(e) {
      console.log('🔵 Products dropdown clicked');
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = productsMenu.classList.contains('show');
      closeAllDropdowns();
      
      if (!isOpen) {
        productsMenu.classList.add('show');
        productsMenu.style.display = 'block';
        newToggle.setAttribute('aria-expanded', 'true');
        console.log('🔵 Products dropdown opened');
      }
    });
    
    console.log('🔵 Products dropdown ready!');
  }
  
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