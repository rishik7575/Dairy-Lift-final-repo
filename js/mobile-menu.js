document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const body = document.body;

  if (mobileMenuToggle && mobileMenu && mobileMenuClose && mobileMenuOverlay) {
    // Function to open mobile menu
    function openMobileMenu() {
      mobileMenu.classList.add('active');
      mobileMenuOverlay.classList.add('active');
      mobileMenuToggle.classList.add('active');
      body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
      
      // Add a subtle ripple effect on click
      const ripple = document.createElement('span');
      ripple.classList.add('menu-toggle-ripple');
      mobileMenuToggle.appendChild(ripple);
      
      // Position the ripple where the click happened
      const rect = mobileMenuToggle.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${-size/4}px`;
      ripple.style.top = `${-size/4}px`;
      
      // Remove the ripple after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 600);
      
      // Add entrance animation to each nav link
      const navLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
      navLinks.forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateX(-10px)';
        link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        link.style.transitionDelay = `${0.05 * (index + 1)}s`;
        
        setTimeout(() => {
          link.style.opacity = '1';
          link.style.transform = 'translateX(0)';
        }, 10);
      });
    }

    // Function to close mobile menu
    function closeMobileMenu() {
      mobileMenu.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
      body.style.overflow = ''; // Restore scrolling
    }

    // Toggle menu when clicking the hamburger button
    mobileMenuToggle.addEventListener('click', function(event) {
      event.stopPropagation();
      if (mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when clicking the close button
    mobileMenuClose.addEventListener('click', closeMobileMenu);
    
    // Close menu when clicking the overlay
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);

    // Close mobile menu when clicking on a link
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu when pressing Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }
});