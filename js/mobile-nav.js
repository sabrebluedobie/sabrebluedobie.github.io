// Mobile Navigation JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Create mobile navigation HTML structure
  const createMobileNav = () => {
    // Check if mobile nav already exists
    if (document.getElementById('mobile-nav-panel')) return;

    const mobileNavHTML = `
      <!-- Mobile Navigation Overlay -->
      <div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>
      
      <!-- Mobile Navigation Panel -->
      <div class="mobile-nav-panel" id="mobile-nav-panel">
        <div class="mobile-nav-header">
          <img src="/assets/images/bluedobielogo_1.webp" alt="Bluedobie Logo" class="mobile-nav-logo">
          <button class="mobile-close-btn" id="mobile-close-btn" aria-label="Close menu">&times;</button>
        </div>
        
        <div class="mobile-nav-content">
          <!-- Main Links -->
          <div class="mobile-nav-item">
            <a href="/" class="mobile-nav-link">Home</a>
          </div>
          <div class="mobile-nav-item">
            <a href="/about.html" class="mobile-nav-link">About</a>
          </div>
          <div class="mobile-nav-item">
            <a href="/services.html" class="mobile-nav-link">Services</a>
          </div>
          
          <!-- More Dropdown -->
          <div class="mobile-nav-expandable">
            <button class="mobile-nav-toggle" data-target="more-menu">
              More
              <span class="mobile-nav-toggle-icon">▼</span>
            </button>
            <div class="mobile-nav-submenu" id="more-menu">
              <a href="/our-portfolio.html" class="mobile-nav-link">Portfolio</a>
              <a href="/meet-sabre.html" class="mobile-nav-link">Meet Sabre</a>
              <a href="/contact.html" class="mobile-nav-link">Contact</a>
              <a href="/FAQ.html" class="mobile-nav-link">FAQ's</a>
              <a href="/business-links.html" class="mobile-nav-link">Our Links</a>
            </div>
          </div>
          
          <!-- Products Dropdown -->
          <div class="mobile-nav-expandable">
            <button class="mobile-nav-toggle" data-target="products-menu">
              Our Products
              <span class="mobile-nav-toggle-icon">▼</span>
            </button>
            <div class="mobile-nav-submenu" id="products-menu">
              <a href="/sales.html" class="mobile-nav-link">Offers</a>
              <a href="/dobiecore/contracts/index.html" class="mobile-nav-link">DobieCore Contracts (coming soon)</a>
              <a href="/captioncraft/captioncraft.html" class="mobile-nav-link">DobieCore Caption</a>
              <a href="/gazette/" class="mobile-nav-link">Gridiron Gazette</a>
              <a href="/blog/" class="mobile-nav-link">Dialogues</a>
            </div>
          </div>
          
          <!-- CTA Button -->
          <a href="/contact.html" class="mobile-nav-cta">Contact Us</a>
          
          <!-- Social Links Section -->
          <div class="mobile-social-section">
            <div class="mobile-social-group">
              <h4>Follow Bluedobie</h4>
              <div class="mobile-social-links">
                <a href="https://fb.com/sabrebluedobie" target="_blank" rel="noopener" class="mobile-social-link">Facebook</a>
                <a href="https://twitter.com/sabrebluedobie" target="_blank" rel="noopener" class="mobile-social-link">Twitter</a>
                <a href="https://www.linkedin.com/in/bluedobiedeveloping" target="_blank" rel="noopener" class="mobile-social-link">LinkedIn</a>
                <a href="https://instagram.com/sabrebluedobie" target="_blank" rel="noopener" class="mobile-social-link">Instagram</a>
              </div>
            </div>
            
            <div class="mobile-social-group">
              <h4>Follow Sabre</h4>
              <div class="mobile-social-links">
                <a href="https://fb.com/sabrethebluedobie" target="_blank" rel="noopener" class="mobile-social-link">Facebook</a>
                <a href="https://instagram.com/sabrethebluedobie" target="_blank" rel="noopener" class="mobile-social-link">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Insert mobile nav into body
    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);
  };

  // Initialize mobile nav
  createMobileNav();

  // Get elements
  const menuButton = document.getElementById('menu-button');
  const mobileNavPanel = document.getElementById('mobile-nav-panel');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileCloseBtn = document.getElementById('mobile-close-btn');

  // Open mobile menu
  const openMobileMenu = () => {
    mobileNavPanel.classList.add('active');
    mobileNavOverlay.classList.add('active');
    document.body.classList.add('mobile-nav-open');
    menuButton.setAttribute('aria-expanded', 'true');
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    mobileNavPanel.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    document.body.classList.remove('mobile-nav-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  // Toggle mobile menu
  if (menuButton) {
    menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileNavPanel.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Close menu when clicking overlay
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking close button
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', closeMobileMenu);
  }

  // Handle expandable sections
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('mobile-nav-toggle') || e.target.closest('.mobile-nav-toggle')) {
      const toggle = e.target.classList.contains('mobile-nav-toggle') ? e.target : e.target.closest('.mobile-nav-toggle');
      const targetId = toggle.getAttribute('data-target');
      const submenu = document.getElementById(targetId);
      
      if (submenu) {
        // Close other open submenus
        document.querySelectorAll('.mobile-nav-submenu.active').forEach(menu => {
          if (menu !== submenu) {
            menu.classList.remove('active');
            const otherToggle = document.querySelector(`[data-target="${menu.id}"]`);
            if (otherToggle) otherToggle.classList.remove('active');
          }
        });
        
        // Toggle current submenu
        submenu.classList.toggle('active');
        toggle.classList.toggle('active');
      }
    }
  });

  // Close menu when clicking links (optional, for better UX)
  document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      // Small delay to allow navigation
      setTimeout(closeMobileMenu, 100);
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNavPanel.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Desktop dropdown functionality (existing code preserved)
  const dropdownToggle = document.getElementById("dropdown-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");
  const productsToggle = document.getElementById("products-toggle");
  const productsMenu = document.getElementById("products-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.style.display === "block";
      dropdownMenu.style.display = isOpen ? "none" : "block";
      if (productsMenu) productsMenu.style.display = "none";
    });
  }

  if (productsToggle && productsMenu) {
    productsToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = productsMenu.style.display === "block";
      productsMenu.style.display = isOpen ? "none" : "block";
      if (dropdownMenu) dropdownMenu.style.display = "none";
    });
  }

  document.addEventListener("click", (e) => {
    if (dropdownToggle && dropdownMenu && 
        !dropdownToggle.contains(e.target) && 
        !dropdownMenu.contains(e.target)) {
      dropdownMenu.style.display = "none";
    }
    if (productsToggle && productsMenu && 
        !productsToggle.contains(e.target) && 
        !productsMenu.contains(e.target)) {
      productsMenu.style.display = "none";
    }
  });
});
