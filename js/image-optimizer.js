/**
 * Image Optimizer for Dairy-Lift
 * Optimizes image loading and processing for better performance
 */

(function() {
  'use strict';

  // Image cache
  const imageCache = new Map();
  
  // Image optimization settings
  const settings = {
    lazyLoad: true,
    useIntersectionObserver: true,
    preloadImportant: true,
    cacheImages: true,
    optimizeOnError: true,
    lowQualityPlaceholders: true
  };

  // Initialize image optimization
  function init() {
    console.log('🖼️ Initializing image optimizer...');
    
    if (settings.useIntersectionObserver && 'IntersectionObserver' in window) {
      setupIntersectionObserver();
    } else {
      setupBasicLazyLoading();
    }
    
    if (settings.preloadImportant) {
      preloadImportantImages();
    }
    
    setupImageErrorHandling();
    
    console.log('✅ Image optimizer initialized');
  }

  // Setup intersection observer for lazy loading
  function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            loadImage(img, img.dataset.src);
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '200px',
      threshold: 0.1
    });
    
    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
    
    // Export observer for dynamic content
    window.imageObserver = observer;
  }

  // Setup basic lazy loading for browsers without IntersectionObserver
  function setupBasicLazyLoading() {
    const lazyLoad = () => {
      const lazyImages = document.querySelectorAll('img[data-src]');
      const scrollTop = window.pageYOffset;
      const viewportHeight = window.innerHeight;
      
      lazyImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        const isVisible = rect.top <= viewportHeight + 200 && rect.bottom >= -200;
        
        if (isVisible) {
          loadImage(img, img.dataset.src);
        }
      });
    };
    
    // Initial load
    lazyLoad();
    
    // Add scroll and resize listeners
    window.addEventListener('scroll', throttle(lazyLoad, 200), { passive: true });
    window.addEventListener('resize', throttle(lazyLoad, 200), { passive: true });
  }

  // Load image with caching
  function loadImage(imgElement, src) {
    if (!src) return;
    
    // Check cache first
    if (settings.cacheImages && imageCache.has(src)) {
      imgElement.src = src;
      imgElement.removeAttribute('data-src');
      imgElement.classList.remove('loading-skeleton');
      return;
    }
    
    // Create new image for preloading
    const img = new Image();
    
    img.onload = function() {
      // Update the actual image
      imgElement.src = src;
      imgElement.removeAttribute('data-src');
      imgElement.classList.remove('loading-skeleton');
      
      // Cache the image
      if (settings.cacheImages) {
        imageCache.set(src, true);
      }
    };
    
    img.onerror = function() {
      // Handle error
      if (settings.optimizeOnError) {
        imgElement.src = 'https://via.placeholder.com/300x300?text=No+Image';
        imgElement.classList.add('error-image');
        imgElement.classList.remove('loading-skeleton');
      }
    };
    
    // Start loading
    img.src = src;
  }

  // Preload important images
  function preloadImportantImages() {
    // Preload hero images and first few product images
    const importantImages = [
      ...Array.from(document.querySelectorAll('.hero-image, .featured-image')),
      ...Array.from(document.querySelectorAll('.product-image')).slice(0, 4)
    ];
    
    importantImages.forEach(img => {
      const src = img.dataset.src || img.src;
      if (src) {
        const preloadImg = new Image();
        preloadImg.src = src;
        
        if (settings.cacheImages) {
          imageCache.set(src, true);
        }
      }
    });
  }

  // Setup image error handling
  function setupImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('onerror')) {
        img.onerror = function() {
          if (settings.optimizeOnError) {
            this.src = 'https://via.placeholder.com/300x300?text=No+Image';
            this.classList.add('error-image');
          }
        };
      }
    });
  }

  // Throttle function for performance
  function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = new Date().getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return func(...args);
    };
  }

  // Initialize when DOM is ready and after products are loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Wait for products to be loaded
      setTimeout(init, 500);
    });
  } else {
    // Wait for products to be loaded
    setTimeout(init, 500);
  }
  
  // Also initialize on window load to catch dynamically loaded images
  window.addEventListener('load', function() {
    setTimeout(init, 100);
  });

  // Export API
  window.imageOptimizer = {
    init,
    loadImage,
    preloadImage: (src) => {
      if (src) {
        const img = new Image();
        img.src = src;
        if (settings.cacheImages) {
          imageCache.set(src, true);
        }
      }
    },
    updateSettings: (newSettings) => {
      Object.assign(settings, newSettings);
    },
    clearCache: () => {
      imageCache.clear();
    }
  };
})();