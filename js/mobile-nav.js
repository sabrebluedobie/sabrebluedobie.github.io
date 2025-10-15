// Mobile Navigation JavaScript - AGGRESSIVE VERSION
console.log('🔵 Mobile nav script loading...');

// Wait for EVERYTHING to load, then override Webflow
window.addEventListener('load', function() {
  console.log('🔵 Window loaded, initializing mobile nav...');
  
  // Small delay to ensure Webflow is done
  setTimeout(function() {
    initMobileNav();
  }, 100);
});

function initMobileNav() {
  console.log('🔵 Initializing mobile nav...');
  
  // DISABLE WEBFLOW NAVIGATION COMPLETELY ON MOBILE
  if (window.Webflow && typeof window.Webflow === 'object') {
    console.log('🔵 Disabling Webflow navigation...');
    // Destroy Webflow's nav functionality
    if (window.Webflow.destroy) {
      window.Webflow.destroy();
    }
    // Override the ready function to prevent re-initialization
    window.Webflow.ready = function() {};
  }
  
  // Create mobile navigation HTML structure
  const createMobileNav = () => {
    // Check if mobile nav already exists
    if (document.getElementById('mobile-nav-panel')) {
      console.log('🔵 Mobile nav already exists');
      return;
    }

    console.log('🔵 Creating mobile nav HTML...');
    
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
            <button class="mobile-nav-toggle" data-target="mobile-more-menu">
              More
              <span class="mobile-nav-toggle-icon">▼</span>
            </button>
            <div class="mobile-nav-submenu" id="mobile-more-menu">
              <a href="/our-portfolio.html" class="mobile-nav-link">Portfolio</a>
              <a href="/meet-sabre.html" class="mobile-nav-link">Meet Sabre</a>
              <a href="/contact.html" class="mobile-nav-link">Contact</a>
              <a href="/FAQ.html" class="mobile-nav-link">FAQ's</a>
              <a href="/business-links.html" class="mobile-nav-link">Our Links</a>
            </div>
          </div>
          
          <!-- Products Dropdown -->
          <div class="mobile-nav-expandable">
            <button class="mobile-nav-toggle" data-target="mobile-products-menu">
              Our Products
              <span class="mobile-nav-toggle-icon">▼</span>
            </button>
            <div class="mobile-nav-submenu" id="mobile-products-menu">
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
    console.log('🔵 Mobile nav HTML created');
  };

  // Initialize mobile nav
  createMobileNav();

  // Get elements
  const menuButton = document.getElementById('menu-button');
  const mobileNavPanel = document.getElementById('mobile-nav-panel');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileCloseBtn = document.getElementById('mobile-close-btn');

  console.log('🔵 Elements found:', {
    menuButton: !!menuButton,
    mobileNavPanel: !!mobileNavPanel,
    mobileNavOverlay: !!mobileNavOverlay,
    mobileCloseBtn: !!mobileCloseBtn
  });

  // Open mobile menu
  const openMobileMenu = () => {
    console.log('🔵 Opening mobile menu...');
    mobileNavPanel.classList.add('active');
    mobileNavOverlay.classList.add('active');
    document.body.classList.add('mobile-nav-open');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'true');
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    console.log('🔵 Closing mobile menu...');
    mobileNavPanel.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    document.body.classList.remove('mobile-nav-open');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
  };

  // NUCLEAR OPTION: Remove ALL existing click handlers and add ours
  if (menuButton) {
    console.log('🔵 Setting up hamburger button...');
    
    // Clone the button to remove all event listeners
    const newMenuButton = menuButton.cloneNode(true);
    menuButton.parentNode.replaceChild(newMenuButton, menuButton);
    
    // Now add our handler to the clean button
    newMenuButton.addEventListener('click', function(e) {
      console.log('🔵 Hamburger clicked!');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Remove Webflow's class
      newMenuButton.classList.remove('w--open');
      
      if (mobileNavPanel.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
      
      return false;
    }, true);
    
    console.log('🔵 Hamburger button ready!');
  } else {
    console.error('❌ Menu button not found!');
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

  // Close menu when clicking links
  document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeMobileMenu, 100);
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNavPanel.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  console.log('🔵 Mobile nav fully initialized!');
}

// Desktop/Tablet Dropdown Functionality
function initDesktopDropdowns() {
  console.log('🔵 Initializing desktop dropdowns...');
  
  // Get all dropdown toggles in the main nav
  const dropdownToggles = document.querySelectorAll('.nav-menu .dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    const menuId = toggle.getAttribute('aria-controls');
    const menu = document.getElementById(menuId);
    
    if (!menu) return;
    
    // Click handler for the toggle button
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      
      // Close all other dropdowns
      document.querySelectorAll('.nav-menu .dropdown-toggle').forEach(otherToggle => {
        if (otherToggle !== toggle) {
          otherToggle.setAttribute('aria-expanded', 'false');
          const otherId = otherToggle.getAttribute('aria-controls');
          const otherMenu = document.getElementById(otherId);
          if (otherMenu) {
            otherMenu.classList.remove('show');
          }
        }
      });
      
      // Toggle current dropdown
      if (isExpanded) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('show');
      } else {
        toggle.setAttribute('aria-expanded', 'true');
        menu.classList.add('show');
      }
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.nav-menu .dropdown-toggle').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
        const menuId = toggle.getAttribute('aria-controls');
        const menu = document.getElementById(menuId);
        if (menu) {
          menu.classList.remove('show');
        }
      });
    }
  });
  
  console.log('🔵 Desktop dropdowns initialized!');
}

// Initialize desktop dropdowns on load
window.addEventListener('load', function() {
  setTimeout(initDesktopDropdowns, 150);
});
