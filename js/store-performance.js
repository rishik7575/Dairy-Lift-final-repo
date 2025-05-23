/**
 * Store Performance Optimizations
 * Specialized performance enhancements for the Dairy-Lift store page
 */

(function() {
  'use strict';

  // Performance metrics
  const metrics = {
    renderTime: [],
    interactionDelay: [],
    memoryUsage: []
  };

  // Store optimization settings
  const settings = {
    useVirtualScroll: true,
    lazyLoadImages: true,
    useIntersectionObserver: true,
    debounceSearch: true,
    throttleScroll: true,
    batchDomUpdates: true,
    useRequestAnimationFrame: true,
    useRequestIdleCallback: true
  };

  // Initialize performance optimizations
  function init() {
    console.log('🚀 Initializing store performance optimizations...');
    
    // Apply core optimizations
    optimizeImages();
    optimizeEventListeners();
    optimizeRendering();
    setupIntersectionObserver();
    setupVirtualScrolling();
    
    // Monitor performance
    setupPerformanceMonitoring();
    
    console.log('✅ Store performance optimizations initialized');
  }

  // Optimize image loading and rendering
  function optimizeImages() {
    // Use native lazy loading
    document.querySelectorAll('img:not([loading])').forEach(img => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });
    
    // Prevent layout shifts with aspect ratio
    document.querySelectorAll('.product-image-container').forEach(container => {
      if (!container.style.aspectRatio) {
        container.style.aspectRatio = '1 / 1';
      }
    });
    
    // Optimize image error handling
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('onerror')) {
        img.onerror = function() {
          this.src = 'https://via.placeholder.com/300x300?text=No+Image';
          this.classList.add('error-image');
        };
      }
    });
  }

  // Optimize event listeners with delegation and throttling
  function optimizeEventListeners() {
    // Throttle scroll events
    let isScrolling = false;
    window.addEventListener('scroll', function() {
      if (!isScrolling && settings.throttleScroll) {
        window.requestAnimationFrame(function() {
          // Handle scroll events here
          isScrolling = false;
        });
        isScrolling = true;
      }
    }, { passive: true });
    
    // Debounce search input
    const searchInput = document.getElementById('search-products');
    if (searchInput && settings.debounceSearch) {
      let searchTimer;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          // The actual search will be handled by the main store script
          console.log('Search debounced');
        }, 300);
      });
    }
    
    // Optimize filter interactions
    const filterCheckboxes = document.querySelectorAll('.checkbox');
    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        // Add visual feedback
        this.closest('.checkbox-item').classList.add('checkbox-changed');
        setTimeout(() => {
          this.closest('.checkbox-item').classList.remove('checkbox-changed');
        }, 300);
      });
    });
  }

  // Optimize rendering with batching and RAF
  function optimizeRendering() {
    // Create a batch processor for DOM updates
    window.batchDomUpdates = function(updates, callback) {
      if (!settings.batchDomUpdates) {
        updates.forEach(update => update());
        if (callback) callback();
        return;
      }
      
      // Use requestAnimationFrame for visual updates
      if (settings.useRequestAnimationFrame) {
        requestAnimationFrame(() => {
          const fragment = document.createDocumentFragment();
          updates.forEach(update => update(fragment));
          if (callback) callback(fragment);
        });
      } else {
        const fragment = document.createDocumentFragment();
        updates.forEach(update => update(fragment));
        if (callback) callback(fragment);
      }
    };
    
    // Optimize animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
  }

  // Setup intersection observer for lazy loading
  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window) || !settings.useIntersectionObserver) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Lazy load images
          if (element.tagName === 'IMG' && element.dataset.src) {
            const img = new Image();
            img.onload = function() {
              element.src = element.dataset.src;
              element.classList.remove('loading-skeleton');
            };
            img.src = element.dataset.src;
            element.removeAttribute('data-src');
          }
          
          // Add animation class
          if (element.classList.contains('product-card')) {
            element.classList.add('product-card-visible');
          }
          
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });
    
    // Observe product cards and images
    window.lazyLoadObserver = observer;
    
    // Function to start observing elements
    window.observeElements = function() {
      document.querySelectorAll('.product-card, img[data-src]').forEach(el => {
        observer.observe(el);
      });
    };
    
    // Start observing existing elements
    window.observeElements();
  }

  // Setup virtual scrolling for large product lists
  function setupVirtualScrolling() {
    if (!settings.useVirtualScroll) return;
    
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    
    // Add virtual scrolling container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'virtual-scroll-container';
    scrollContainer.style.minHeight = '200px';
    
    // Will be used by the store script to implement virtual scrolling
    window.virtualScrollContainer = scrollContainer;
  }

  // Setup performance monitoring
  function setupPerformanceMonitoring() {
    // Monitor rendering performance
    window.monitorRenderTime = function(callback) {
      const start = performance.now();
      callback();
      const end = performance.now();
      const duration = end - start;
      
      metrics.renderTime.push(duration);
      if (metrics.renderTime.length > 10) {
        metrics.renderTime.shift();
      }
      
      const average = metrics.renderTime.reduce((sum, time) => sum + time, 0) / metrics.renderTime.length;
      console.log(`Render time: ${duration.toFixed(2)}ms (avg: ${average.toFixed(2)}ms)`);
      
      return duration;
    };
    
    // Monitor memory usage if available
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedJSHeapSize = memory.usedJSHeapSize / (1024 * 1024);
        const jsHeapSizeLimit = memory.jsHeapSizeLimit / (1024 * 1024);
        const usedPercentage = (usedJSHeapSize / jsHeapSizeLimit) * 100;
        
        metrics.memoryUsage.push(usedPercentage);
        if (metrics.memoryUsage.length > 10) {
          metrics.memoryUsage.shift();
        }
        
        if (usedPercentage > 80) {
          console.warn(`High memory usage: ${usedPercentage.toFixed(1)}% (${usedJSHeapSize.toFixed(1)}MB / ${jsHeapSizeLimit.toFixed(1)}MB)`);
        }
      }, 10000);
    }
    
    // Monitor interaction delays
    const interactionEvents = ['click', 'input', 'change'];
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        if (e.target.closest('button, input, select, .interactive')) {
          const start = performance.now();
          
          requestAnimationFrame(() => {
            const delay = performance.now() - start;
            metrics.interactionDelay.push(delay);
            
            if (metrics.interactionDelay.length > 10) {
              metrics.interactionDelay.shift();
            }
            
            const average = metrics.interactionDelay.reduce((sum, time) => sum + time, 0) / metrics.interactionDelay.length;
            if (delay > 100) {
              console.warn(`Slow interaction response: ${delay.toFixed(2)}ms (avg: ${average.toFixed(2)}ms)`);
            }
          });
        }
      }, { passive: true });
    });
  }

  // Initialize when DOM is ready and after storenew.js has loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Wait a bit to ensure storenew.js has initialized
      setTimeout(init, 100);
    });
  } else {
    // Wait a bit to ensure storenew.js has initialized
    setTimeout(init, 100);
  }

  // Export API
  window.storePerformance = {
    init,
    getMetrics: () => ({ ...metrics }),
    updateSettings: (newSettings) => {
      Object.assign(settings, newSettings);
      console.log('Updated performance settings:', settings);
    }
  };
})();