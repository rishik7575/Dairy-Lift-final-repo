/**
 * Master Optimizer for Dairy-Lift
 * Coordinates all optimization modules for maximum performance
 */

(function() {
  'use strict';

  // Optimization modules to load
  const modules = [
    { name: 'performance-manager', path: '/js/performance-manager.js', critical: true },
    { name: 'image-optimizer', path: '/js/image-optimizer.js', critical: true },
    { name: 'global-optimizations', path: '/js/global-optimizations.js', critical: true },
    { name: 'script-optimizer', path: '/js/script-optimizer.js', critical: true },
    { name: 'critical-css', path: '/js/critical-css.js', critical: true },
    { name: 'database-optimizer', path: '/js/database-optimizer.js', critical: false },
    { name: 'placeholder-generator', path: '/js/placeholder-generator.js', critical: false },
    { name: 'register-service-worker', path: '/js/register-service-worker.js', critical: false }
  ];

  // Master optimization settings
  const settings = {
    enableAllOptimizations: true,
    prioritizeCriticalPath: true,
    monitorPerformance: true,
    adaptToDeviceCapabilities: true,
    adaptToNetworkConditions: true,
    debugMode: false
  };

  // Performance metrics
  let metrics = {
    loadStart: performance.now(),
    moduleLoadTimes: {},
    domComplete: null,
    firstPaint: null,
    firstContentfulPaint: null,
    resourceLoadTimes: {}
  };

  // Initialize master optimizer
  function init() {
    console.log('🚀 Initializing master optimizer...');
    
    // Add critical inline styles
    addCriticalInlineStyles();
    
    // Add resource hints
    addResourceHints();
    
    // Detect device capabilities
    detectCapabilities();
    
    // Load optimization modules
    loadOptimizationModules();
    
    // Monitor performance
    if (settings.monitorPerformance) {
      setupPerformanceMonitoring();
    }
    
    // Listen for network changes
    setupNetworkListener();
    
    console.log('✅ Master optimizer initialized');
  }

  // Add critical inline styles for immediate rendering
  function addCriticalInlineStyles() {
    const criticalCSS = `
      /* Critical rendering styles */
      body, html { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
      .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }
      .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
      @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      img { max-width: 100%; height: auto; }
      .above-fold { min-height: 50vh; }
      .offline-notification, .update-notification { position: fixed; bottom: 20px; right: 20px; background: #333; color: white; padding: 10px 15px; border-radius: 4px; z-index: 9999; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }

  // Add resource hints for faster loading
  function addResourceHints() {
    // DNS prefetch for external domains
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ];
    
    domains.forEach(domain => {
      // DNS prefetch
      const dns = document.createElement('link');
      dns.rel = 'dns-prefetch';
      dns.href = domain;
      document.head.appendChild(dns);
      
      // Preconnect
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = domain;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    });
    
    // Preload critical resources
    const criticalResources = [
      { path: '/js/performance-manager.js', as: 'script' },
      { path: '/js/global-optimizations.js', as: 'script' },
      { path: '/css/performance-optimizations.css', as: 'style' },
      { path: '/image/profileicone.png', as: 'image' }
    ];
    
    criticalResources.forEach(resource => {
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.href = resource.path;
      preload.as = resource.as;
      if (resource.as === 'font' || resource.as === 'image') {
        preload.crossOrigin = 'anonymous';
      }
      document.head.appendChild(preload);
    });
  }

  // Detect device capabilities
  function detectCapabilities() {
    const capabilities = {
      memory: navigator.deviceMemory || 4, // Default to 4GB if not available
      cores: navigator.hardwareConcurrency || 4,
      connection: navigator.connection ? navigator.connection.effectiveType : '4g',
      saveData: navigator.connection ? navigator.connection.saveData : false,
      touchScreen: 'ontouchstart' in window,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: more)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
    
    // Adjust settings based on capabilities
    if (settings.adaptToDeviceCapabilities) {
      // Low-end device optimizations
      if (capabilities.memory <= 2 || capabilities.cores <= 2 || capabilities.connection === 'slow-2g' || capabilities.connection === '2g') {
        console.log('📱 Detected low-end device, applying additional optimizations');
        
        // Reduce animations
        document.documentElement.classList.add('reduced-motion');
        
        // Disable non-essential features
        if (window.performanceManager) {
          window.performanceManager.optimizeForLowPerformance();
        }
      }
      
      // Save data mode
      if (capabilities.saveData) {
        console.log('📡 Data saver enabled, reducing data usage');
        document.documentElement.classList.add('save-data');
        
        // Update image optimizer settings if available
        if (window.imageOptimizer) {
          window.imageOptimizer.updateSettings({
            lazyLoad: true,
            preloadImportant: false,
            progressiveLoading: false
          });
        }
      }
      
      // Accessibility optimizations
      if (capabilities.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      }
      
      if (capabilities.highContrast) {
        document.documentElement.classList.add('high-contrast');
      }
      
      if (capabilities.darkMode) {
        document.documentElement.classList.add('dark-mode');
      }
    }
    
    // Store capabilities for other modules
    window.deviceCapabilities = capabilities;
  }

  // Load optimization modules
  function loadOptimizationModules() {
    // First load critical modules
    const criticalModules = modules.filter(module => module.critical);
    const nonCriticalModules = modules.filter(module => !module.critical);
    
    // Load critical modules immediately
    criticalModules.forEach(module => {
      loadModule(module);
    });
    
    // Load non-critical modules after a delay
    if (nonCriticalModules.length > 0) {
      if (document.readyState === 'complete') {
        // Page already loaded, load non-critical modules with a small delay
        setTimeout(() => {
          nonCriticalModules.forEach(module => {
            loadModule(module);
          });
        }, 1000);
      } else {
        // Wait for page load
        window.addEventListener('load', () => {
          setTimeout(() => {
            nonCriticalModules.forEach(module => {
              loadModule(module);
            });
          }, 1000);
        });
      }
    }
  }

  // Load a single module
  function loadModule(module) {
    const startTime = performance.now();
    
    const script = document.createElement('script');
    script.src = module.path;
    
    if (module.critical) {
      // Critical modules load with high priority
      script.setAttribute('fetchpriority', 'high');
    } else {
      // Non-critical modules can load async
      script.async = true;
    }
    
    script.onload = function() {
      const loadTime = performance.now() - startTime;
      metrics.moduleLoadTimes[module.name] = loadTime;
      
      if (settings.debugMode) {
        console.log(`📦 Loaded ${module.name} in ${loadTime.toFixed(2)}ms`);
      }
    };
    
    script.onerror = function() {
      console.error(`❌ Failed to load ${module.name}`);
    };
    
    document.head.appendChild(script);
  }

  // Set up performance monitoring
  function setupPerformanceMonitoring() {
    // Monitor page load metrics
    window.addEventListener('load', () => {
      // Record DOM complete time
      metrics.domComplete = performance.now() - metrics.loadStart;
      
      // Get paint metrics
      if (window.performance && window.performance.getEntriesByType) {
        const paintMetrics = performance.getEntriesByType('paint');
        
        paintMetrics.forEach(metric => {
          if (metric.name === 'first-paint') {
            metrics.firstPaint = metric.startTime;
          } else if (metric.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = metric.startTime;
          }
        });
      }
      
      // Get resource load times
      if (window.performance && window.performance.getEntriesByType) {
        const resources = performance.getEntriesByType('resource');
        
        resources.forEach(resource => {
          // Group by resource type
          const type = resource.initiatorType;
          
          if (!metrics.resourceLoadTimes[type]) {
            metrics.resourceLoadTimes[type] = [];
          }
          
          metrics.resourceLoadTimes[type].push({
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize
          });
        });
      }
      
      // Log performance summary
      if (settings.debugMode) {
        console.log('📊 Performance metrics:', metrics);
      }
    });
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 50) {
              console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }
  }

  // Set up network condition listener
  function setupNetworkListener() {
    if (settings.adaptToNetworkConditions && 'connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        const connection = navigator.connection.effectiveType;
        const saveData = navigator.connection.saveData;
        
        console.log(`🌐 Network condition changed: ${connection}, Save Data: ${saveData}`);
        
        // Update optimizations based on network
        if (connection === 'slow-2g' || connection === '2g') {
          // Apply extreme optimizations for slow connections
          document.documentElement.classList.add('slow-connection');
          
          // Update image optimizer settings if available
          if (window.imageOptimizer) {
            window.imageOptimizer.updateSettings({
              lazyLoad: true,
              preloadImportant: false,
              progressiveLoading: false,
              useWebP: true
            });
          }
        } else {
          document.documentElement.classList.remove('slow-connection');
        }
        
        // Update for data saver mode
        if (saveData) {
          document.documentElement.classList.add('save-data');
        } else {
          document.documentElement.classList.remove('save-data');
        }
      });
    }
    
    // Handle online/offline events
    window.addEventListener('online', () => {
      document.documentElement.classList.remove('offline');
      document.documentElement.classList.add('online');
      
      // Sync any offline operations
      if (window.databaseOptimizer) {
        window.databaseOptimizer.syncOfflineOperations();
      }
    });
    
    window.addEventListener('offline', () => {
      document.documentElement.classList.remove('online');
      document.documentElement.classList.add('offline');
    });
    
    // Set initial online/offline class
    if (navigator.onLine) {
      document.documentElement.classList.add('online');
    } else {
      document.documentElement.classList.add('offline');
    }
  }

  // Get performance metrics
  function getPerformanceMetrics() {
    return { ...metrics };
  }

  // Update optimization settings
  function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
  }

  // Export API
  window.masterOptimizer = {
    init,
    getPerformanceMetrics,
    updateSettings,
    getSettings: () => ({ ...settings })
  };

  // Initialize immediately
  init();
})();