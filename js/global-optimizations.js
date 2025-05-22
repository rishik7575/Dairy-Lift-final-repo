/**
 * Global Performance Optimizations for Dairy-Lift
 * This script should be loaded on every page to ensure optimal performance
 */

(function() {
  'use strict';

  // Performance optimization flags
  let isOptimized = false;
  let performanceObserver = null;
  let intersectionObserver = null;

  // Initialize optimizations when DOM is ready
  function initOptimizations() {
    if (isOptimized) return;
    
    console.log('🚀 Initializing global performance optimizations...');
    
    // Core optimizations
    optimizeImages();
    optimizeAnimations();
    optimizeForms();
    optimizeScrolling();
    setupLazyLoading();
    optimizeEventListeners();
    setupPerformanceMonitoring();
    
    isOptimized = true;
    console.log('✅ Global optimizations initialized');
  }

  // Optimize images for better loading
  function optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
      
      // Optimize image error handling
      if (!img.onerror) {
        img.onerror = function() {
          this.style.display = 'none';
          console.warn('Failed to load image:', this.src);
        };
      }
    });
  }

  // Optimize animations for better performance
  function optimizeAnimations() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Optimize CSS animations
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
    animatedElements.forEach(el => {
      // Use transform instead of changing layout properties
      el.style.willChange = 'transform, opacity';
    });
  }

  // Optimize form interactions
  function optimizeForms() {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, textarea, select');
    
    // Debounce form validation
    inputs.forEach(input => {
      let validationTimer;
      
      input.addEventListener('input', function() {
        clearTimeout(validationTimer);
        validationTimer = setTimeout(() => {
          // Trigger validation
          if (this.checkValidity) {
            this.checkValidity();
          }
        }, 300);
      });
    });

    // Optimize form submissions
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          setTimeout(() => {
            submitBtn.disabled = false;
          }, 2000);
        }
      });
    });
  }

  // Optimize scrolling performance
  function optimizeScrolling() {
    let scrollTimer;
    let isScrolling = false;

    // Throttle scroll events
    window.addEventListener('scroll', function() {
      if (!isScrolling) {
        requestAnimationFrame(function() {
          // Handle scroll events here
          isScrolling = false;
        });
        isScrolling = true;
      }
    }, { passive: true });

    // Optimize scroll-to-top functionality
    const scrollToTopBtn = document.querySelector('.scroll-to-top, #scroll-to-top');
    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // Setup lazy loading for content
  function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            
            // Lazy load images
            if (element.tagName === 'IMG' && element.dataset.src) {
              element.src = element.dataset.src;
              element.removeAttribute('data-src');
            }
            
            // Lazy load iframes
            if (element.tagName === 'IFRAME' && element.dataset.src) {
              element.src = element.dataset.src;
              element.removeAttribute('data-src');
            }
            
            // Trigger lazy animations
            if (element.classList.contains('lazy-animate')) {
              element.classList.add('animate-in');
            }
            
            intersectionObserver.unobserve(element);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      // Observe lazy elements
      document.querySelectorAll('[data-src], .lazy-animate').forEach(el => {
        intersectionObserver.observe(el);
      });
    }
  }

  // Optimize event listeners
  function optimizeEventListeners() {
    // Use event delegation for better performance
    document.addEventListener('click', function(e) {
      // Handle button clicks
      if (e.target.matches('button, .btn')) {
        // Add click feedback
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
          e.target.style.transform = '';
        }, 100);
      }
      
      // Handle card clicks
      if (e.target.closest('.card, .product-card')) {
        const card = e.target.closest('.card, .product-card');
        card.style.transform = 'translateY(-2px)';
        setTimeout(() => {
          card.style.transform = '';
        }, 200);
      }
    });

    // Optimize hover effects
    let hoverTimeout;
    document.addEventListener('mouseover', function(e) {
      clearTimeout(hoverTimeout);
      
      const hoverElement = e.target.closest('[data-hover], .hover-effect');
      if (hoverElement) {
        hoverElement.classList.add('hovered');
      }
    });

    document.addEventListener('mouseout', function(e) {
      hoverTimeout = setTimeout(() => {
        const hoverElement = e.target.closest('[data-hover], .hover-effect');
        if (hoverElement) {
          hoverElement.classList.remove('hovered');
        }
      }, 100);
    });
  }

  // Setup performance monitoring
  function setupPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        performanceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`);
            }
          });
        });
        
        performanceObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Performance monitoring not available');
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 80) {
          console.warn(`High memory usage: ${usedPercent.toFixed(1)}%`);
          // Trigger garbage collection if possible
          if (window.gc) {
            window.gc();
          }
        }
      }, 30000);
    }
  }

  // Cleanup function
  function cleanup() {
    if (performanceObserver) {
      performanceObserver.disconnect();
    }
    
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
    
    console.log('🧹 Global optimizations cleaned up');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizations);
  } else {
    initOptimizations();
  }

  // Initialize when window loads (for dynamic content)
  window.addEventListener('load', function() {
    setTimeout(initOptimizations, 100);
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Export for manual initialization
  window.globalOptimizations = {
    init: initOptimizations,
    cleanup: cleanup,
    isOptimized: () => isOptimized
  };

  // Add CSS optimizations
  const optimizationCSS = `
    /* Performance optimizations */
    * {
      box-sizing: border-box;
    }
    
    img {
      max-width: 100%;
      height: auto;
    }
    
    .lazy-animate {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .lazy-animate.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .hover-effect {
      transition: transform 0.2s ease;
    }
    
    .hover-effect.hovered {
      transform: translateY(-2px);
    }
    
    /* Optimize animations for better performance */
    .card, .product-card {
      will-change: transform;
    }
    
    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      .lazy-animate {
        transition: none;
      }
    }
  `;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = optimizationCSS;
  document.head.appendChild(style);

})();
