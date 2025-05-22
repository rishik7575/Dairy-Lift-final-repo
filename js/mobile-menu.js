document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle with performance optimization
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const body = document.body;

  // Performance optimization flags
  let isAnimating = false;
  let animationFrame = null;

  if (mobileMenuToggle && mobileMenu && mobileMenuClose && mobileMenuOverlay) {
    // Function to open mobile menu with performance optimization
    function openMobileMenu() {
      if (isAnimating) return;
      isAnimating = true;

      // Use requestAnimationFrame for smooth animations
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        mobileMenuToggle.classList.add('active');
        body.style.overflow = 'hidden'; // Prevent scrolling when menu is open

        // Optimized ripple effect
        if (window.performanceManager) {
          window.performanceManager.throttle('ripple-effect', () => {
            createRippleEffect();
          }, 100);
        } else {
          createRippleEffect();
        }

        // Optimized entrance animation
        animateNavLinks();

        setTimeout(() => {
          isAnimating = false;
        }, 300);
      });
    }

    function createRippleEffect() {
      const ripple = document.createElement('span');
      ripple.classList.add('menu-toggle-ripple');
      mobileMenuToggle.appendChild(ripple);

      const rect = mobileMenuToggle.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${-size/4}px`;
      ripple.style.top = `${-size/4}px`;

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.remove();
        }
      }, 600);
    }

    function animateNavLinks() {
      const navLinks = mobileMenu.querySelectorAll('.mobile-nav-link');

      // Use CSS transforms for better performance
      navLinks.forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateX(-10px)';
        link.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        link.style.transitionDelay = `${0.03 * (index + 1)}s`;

        requestAnimationFrame(() => {
          link.style.opacity = '1';
          link.style.transform = 'translateX(0)';
        });
      });
    }

    // Function to close mobile menu with performance optimization
    function closeMobileMenu() {
      if (isAnimating) return;
      isAnimating = true;

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        body.style.overflow = ''; // Restore scrolling

        setTimeout(() => {
          isAnimating = false;
        }, 300);
      });
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