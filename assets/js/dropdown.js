document.addEventListener("DOMContentLoaded", () => {
  console.log('🔵 Dropdown.js loading...');
  
  // First dropdown (More)
  const dropdownToggle = document.getElementById("dropdown-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  // Second dropdown (Products)
  const productsToggle = document.getElementById("products-toggle");
  const productsMenu = document.getElementById("products-menu");

  console.log('🔵 Dropdown elements:', {
    dropdownToggle: !!dropdownToggle,
    dropdownMenu: !!dropdownMenu,
    productsToggle: !!productsToggle,
    productsMenu: !!productsMenu
  });

  // Helper function to close all dropdowns
  const closeAllDropdowns = () => {
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
  };

  // Setup first dropdown (More)
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", (e) => {
      console.log('🔵 More dropdown clicked');
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = dropdownMenu.classList.contains('show');
      
      // Close all dropdowns first
      closeAllDropdowns();
      
      // Then open this one if it was closed
      if (!isOpen) {
        dropdownMenu.classList.add('show');
        dropdownMenu.style.display = 'block';
        dropdownToggle.setAttribute('aria-expanded', 'true');
        console.log('🔵 More dropdown opened');
      }
    });
  }

  // Setup second dropdown (Products)
  if (productsToggle && productsMenu) {
    productsToggle.addEventListener("click", (e) => {
      console.log('🔵 Products dropdown clicked');
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = productsMenu.classList.contains('show');
      
      // Close all dropdowns first
      closeAllDropdowns();
      
      // Then open this one if it was closed
      if (!isOpen) {
        productsMenu.classList.add('show');
        productsMenu.style.display = 'block';
        productsToggle.setAttribute('aria-expanded', 'true');
        console.log('🔵 Products dropdown opened');
      }
    });
  }

  // Close both when clicking outside
  document.addEventListener("click", (e) => {
    // Check if click is outside both dropdowns
    const clickedInsideDropdown = 
      (dropdownToggle && dropdownToggle.contains(e.target)) ||
      (dropdownMenu && dropdownMenu.contains(e.target)) ||
      (productsToggle && productsToggle.contains(e.target)) ||
      (productsMenu && productsMenu.contains(e.target));
    
    if (!clickedInsideDropdown) {
      closeAllDropdowns();
      console.log('🔵 Dropdowns closed (clicked outside)');
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
      console.log('🔵 Dropdowns closed (escape key)');
    }
  });

  console.log('🔵 Dropdown.js initialized!');
});
