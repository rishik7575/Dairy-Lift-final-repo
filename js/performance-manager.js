/**
 * Performance Manager for Dairy-Lift
 * Optimizes refresh rates, caching, and overall performance
 */

class PerformanceManager {
  constructor() {
    this.cache = new Map();
    this.observers = new Map();
    this.timers = new Map();
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.refreshRates = new Map();
    this.isVisible = true;
    this.networkStatus = 'online';

    // Performance settings
    this.settings = {
      cacheTimeout: 30000, // 30 seconds
      fastRefreshRate: 5000, // 5 seconds
      normalRefreshRate: 15000, // 15 seconds
      slowRefreshRate: 60000, // 1 minute
      debounceDelay: 300,
      throttleDelay: 100,
      maxCacheSize: 100
    };

    this.init();
  }

  init() {
    this.setupVisibilityListener();
    this.setupNetworkListener();
    this.setupPerformanceMonitoring();
    this.optimizeExistingTimers();
    this.optimizeDOMOperations();
    this.preloadCriticalResources();
    console.log('🚀 Performance Manager initialized with enhanced optimizations');
  }

  // Visibility API for performance optimization
  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      console.log(`👁️ Page visibility changed: ${this.isVisible ? 'visible' : 'hidden'}`);

      if (this.isVisible) {
        this.resumeOperations();
      } else {
        this.pauseOperations();
      }
    });
  }

  // Network status monitoring
  setupNetworkListener() {
    window.addEventListener('online', () => {
      this.networkStatus = 'online';
      console.log('🌐 Network: online');
      this.resumeOperations();
    });

    window.addEventListener('offline', () => {
      this.networkStatus = 'offline';
      console.log('🌐 Network: offline');
      this.pauseOperations();
    });
  }

  // Performance monitoring
  setupPerformanceMonitoring() {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
          console.warn('⚠️ High memory usage detected, clearing caches');
          this.clearAllCaches();
        }
      }, 30000);
    }

    // Monitor frame rate
    let lastTime = performance.now();
    let frameCount = 0;

    const checkFrameRate = (currentTime) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${fps}`);
          this.optimizeForLowPerformance();
        }
      }
      requestAnimationFrame(checkFrameRate);
    };

    requestAnimationFrame(checkFrameRate);
  }

  // Optimize existing timers and intervals
  optimizeExistingTimers() {
    // Override setInterval to track and optimize
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;

    window.setInterval = (callback, delay, ...args) => {
      const optimizedDelay = this.getOptimizedDelay(delay);
      const id = originalSetInterval(() => {
        if (this.shouldExecute()) {
          callback(...args);
        }
      }, optimizedDelay);

      this.timers.set(id, { type: 'interval', delay: optimizedDelay, original: delay });
      return id;
    };

    window.clearInterval = (id) => {
      this.timers.delete(id);
      return originalClearInterval(id);
    };
  }

  // Get optimized delay based on current conditions
  getOptimizedDelay(originalDelay) {
    if (!this.isVisible) {
      return Math.max(originalDelay * 4, this.settings.slowRefreshRate);
    }

    if (this.networkStatus === 'offline') {
      return Math.max(originalDelay * 2, this.settings.normalRefreshRate);
    }

    return originalDelay;
  }

  // Check if operations should execute
  shouldExecute() {
    return this.isVisible && this.networkStatus === 'online';
  }

  // Debounce function with automatic cleanup
  debounce(key, func, delay = this.settings.debounceDelay) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      if (this.shouldExecute()) {
        func();
      }
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  // Throttle function with automatic cleanup
  throttle(key, func, delay = this.settings.throttleDelay) {
    if (this.throttleTimers.has(key)) {
      return;
    }

    const timer = setTimeout(() => {
      this.throttleTimers.delete(key);
    }, delay);

    this.throttleTimers.set(key, timer);

    if (this.shouldExecute()) {
      func();
    }
  }

  // Smart caching with size limits
  setCache(key, data, customTimeout = null) {
    // Implement LRU cache
    if (this.cache.size >= this.settings.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout: customTimeout || this.settings.cacheTimeout
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.timeout) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, cached);

    return cached.data;
  }

  clearCache(key) {
    this.cache.delete(key);
  }

  clearAllCaches() {
    this.cache.clear();
    console.log('🧹 All caches cleared');
  }

  // Pause operations when page is not visible
  pauseOperations() {
    console.log('⏸️ Pausing operations');
    // Reduce refresh rates for all active timers
    this.timers.forEach((timer, id) => {
      if (timer.type === 'interval') {
        clearInterval(id);
        const newId = setInterval(timer.callback, timer.delay * 4);
        this.timers.set(newId, timer);
        this.timers.delete(id);
      }
    });
  }

  // Resume operations when page becomes visible
  resumeOperations() {
    console.log('▶️ Resuming operations');
    // Force refresh of critical data
    if (window.supabaseProductsManager) {
      window.supabaseProductsManager.getAllProducts(true);
    }
  }

  // Optimize for low performance devices
  optimizeForLowPerformance() {
    console.log('🐌 Optimizing for low performance');

    // Reduce animation complexity
    document.documentElement.style.setProperty('--animation-duration', '0.1s');

    // Disable non-essential animations
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.1s !important;
        animation-delay: 0s !important;
        transition-duration: 0.1s !important;
        transition-delay: 0s !important;
      }
      .product-card {
        will-change: auto !important;
      }
      .product-image {
        will-change: auto !important;
      }
      .hover-effect:hover {
        transform: none !important;
      }
    `;
    document.head.appendChild(style);

    // Increase cache timeout
    this.settings.cacheTimeout = 60000; // 1 minute

    // Disable virtual scrolling for low-end devices
    if (window.productListing && window.productListing.virtualScroll) {
      window.productListing.virtualScroll.enabled = false;
    }
  }

  // Get performance metrics
  getMetrics() {
    return {
      cacheSize: this.cache.size,
      activeTimers: this.timers.size,
      isVisible: this.isVisible,
      networkStatus: this.networkStatus,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
        percentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
      } : null,
      renderingPerformance: this.getRenderingMetrics()
    };
  }

  // Get rendering performance metrics
  getRenderingMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      };
    }
    return null;
  }

  // Get First Paint timing
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? Math.round(firstPaint.startTime) : null;
  }

  // Get First Contentful Paint timing
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : null;
  }

  // Optimize DOM operations
  optimizeDOMOperations() {
    // Batch DOM reads and writes
    let readOperations = [];
    let writeOperations = [];

    window.requestDOMRead = (callback) => {
      readOperations.push(callback);
      this.scheduleDOM();
    };

    window.requestDOMWrite = (callback) => {
      writeOperations.push(callback);
      this.scheduleDOM();
    };

    this.scheduleDOM = this.debounce('dom-operations', () => {
      // Execute all reads first
      readOperations.forEach(callback => callback());
      readOperations = [];

      // Then execute all writes
      writeOperations.forEach(callback => callback());
      writeOperations = [];
    }, 16); // ~60fps
  }

  // Preload critical resources
  preloadCriticalResources() {
    // Critical images
    const criticalImages = [
      'image/profileicone.png',
      'image/logo.png',
      'image/hero-image.jpg',
      'image/placeholder.png'
    ];

    // Critical CSS
    const criticalCSS = [
      'css/performance-optimizations.css'
    ];

    // Critical JavaScript
    const criticalJS = [
      'js/global-optimizations.js',
      'js/image-optimizer.js'
    ];

    // Critical fonts
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    // Preload critical images
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical CSS
    criticalCSS.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload critical JavaScript
    criticalJS.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload critical fonts
    criticalFonts.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Add DNS prefetch for external domains
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);

      // Also add preconnect for important domains
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = domain;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    });
  }

  // Cleanup method
  cleanup() {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.forEach(timer => clearTimeout(timer));
    this.timers.forEach((timer, id) => {
      if (timer.type === 'interval') clearInterval(id);
      if (timer.type === 'timeout') clearTimeout(id);
    });

    this.cache.clear();
    this.observers.clear();
    this.timers.clear();
    this.debounceTimers.clear();
    this.throttleTimers.clear();

    console.log('🧹 Performance Manager cleaned up');
  }
}

// Create global instance
window.performanceManager = new PerformanceManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceManager;
}
