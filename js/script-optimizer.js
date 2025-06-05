/**
 * Script Optimizer for Dairy-Lift
 * Optimizes JavaScript loading and execution
 */

(function() {
  'use strict';

  // Script loading states
  const loadedScripts = new Set();
  const loadingScripts = new Map();
  const scriptQueue = [];
  let isProcessingQueue = false;

  // Script optimization settings
  const settings = {
    asyncLoading: true,
    deferNonCritical: true,
    prioritizeCritical: true,
    useModules: true,
    inlineSmallScripts: true,
    bundleScripts: true,
    maxConcurrentLoads: 4
  };

  // Initialize script optimization
  function init() {
    console.log('📜 Initializing script optimizer...');
    
    // Optimize existing scripts
    optimizeExistingScripts();
    
    // Set up mutation observer to catch dynamically added scripts
    setupScriptObserver();
    
    // Override document.createElement to intercept script creation
    interceptScriptCreation();
    
    console.log('✅ Script optimizer initialized');
  }

  // Optimize existing scripts on the page
  function optimizeExistingScripts() {
    const scripts = document.querySelectorAll('script[src]:not([optimized])');
    
    scripts.forEach(script => {
      // Mark as optimized to avoid processing again
      script.setAttribute('optimized', 'true');
      
      // Skip if already loaded
      if (script.hasAttribute('data-loaded')) {
        loadedScripts.add(script.src);
        return;
      }
      
      // Determine if script is critical
      const isCritical = script.hasAttribute('data-critical') || 
                         isCriticalScript(script.src);
      
      if (isCritical) {
        // Load critical scripts immediately
        loadScript(script.src, true);
      } else if (settings.deferNonCritical) {
        // Replace with optimized loading
        const parent = script.parentNode;
        const nextSibling = script.nextSibling;
        
        // Remove original script
        parent.removeChild(script);
        
        // Queue for deferred loading
        queueScript(script.src, () => {
          const newScript = document.createElement('script');
          newScript.src = script.src;
          newScript.setAttribute('optimized', 'true');
          newScript.setAttribute('data-loaded', 'true');
          
          if (script.hasAttribute('async')) newScript.async = true;
          if (script.hasAttribute('defer')) newScript.defer = true;
          if (script.hasAttribute('type')) newScript.type = script.type;
          if (script.hasAttribute('crossorigin')) newScript.crossOrigin = script.getAttribute('crossorigin');
          
          // Insert at the same position
          if (nextSibling) {
            parent.insertBefore(newScript, nextSibling);
          } else {
            parent.appendChild(newScript);
          }
        });
      }
    });
  }

  // Set up mutation observer to optimize dynamically added scripts
  function setupScriptObserver() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === 'SCRIPT' && node.src && !node.hasAttribute('optimized')) {
              // Optimize the dynamically added script
              node.setAttribute('optimized', 'true');
              
              // Determine if script is critical
              const isCritical = node.hasAttribute('data-critical') || 
                                isCriticalScript(node.src);
              
              if (!isCritical && settings.deferNonCritical) {
                // Prevent the script from loading
                const originalSrc = node.src;
                node.removeAttribute('src');
                
                // Queue for deferred loading
                queueScript(originalSrc, () => {
                  node.src = originalSrc;
                  node.setAttribute('data-loaded', 'true');
                });
              } else {
                loadedScripts.add(node.src);
              }
            }
          });
        }
      });
    });
    
    observer.observe(document, { childList: true, subtree: true });
  }

  // Intercept script creation to optimize loading
  function interceptScriptCreation() {
    const originalCreateElement = document.createElement;
    
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(document, tagName);
      
      if (tagName.toLowerCase() === 'script') {
        // Override the src property
        let originalSrc = '';
        
        Object.defineProperty(element, 'src', {
          get: function() {
            return originalSrc;
          },
          set: function(value) {
            originalSrc = value;
            
            // Skip if already optimized
            if (element.hasAttribute('optimized')) {
              return;
            }
            
            // Mark as optimized
            element.setAttribute('optimized', 'true');
            
            // Determine if script is critical
            const isCritical = element.hasAttribute('data-critical') || 
                              isCriticalScript(value);
            
            if (!isCritical && settings.deferNonCritical) {
              // Don't set src attribute yet
              queueScript(value, () => {
                // Use the original setter
                Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')
                  .set.call(element, value);
                element.setAttribute('data-loaded', 'true');
              });
            } else {
              // Use the original setter
              Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')
                .set.call(element, value);
              loadedScripts.add(value);
            }
          }
        });
      }
      
      return element;
    };
  }

  // Check if a script is critical
  function isCriticalScript(src) {
    const criticalPatterns = [
      'performance-manager.js',
      'global-optimizations.js',
      'image-optimizer.js',
      'auth.js',
      'critical'
    ];
    
    return criticalPatterns.some(pattern => src.includes(pattern));
  }

  // Load a script with promise
  function loadScript(src, isCritical = false) {
    // Skip if already loaded
    if (loadedScripts.has(src)) {
      return Promise.resolve();
    }
    
    // Return existing promise if script is already loading
    if (loadingScripts.has(src)) {
      return loadingScripts.get(src);
    }
    
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.setAttribute('optimized', 'true');
      
      if (settings.asyncLoading && !isCritical) {
        script.async = true;
      }
      
      if (settings.useModules && src.endsWith('.mjs')) {
        script.type = 'module';
      }
      
      script.onload = function() {
        loadedScripts.add(src);
        loadingScripts.delete(src);
        script.setAttribute('data-loaded', 'true');
        resolve();
      };
      
      script.onerror = function(error) {
        loadingScripts.delete(src);
        console.error(`Failed to load script: ${src}`, error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
    
    loadingScripts.set(src, promise);
    return promise;
  }

  // Queue a script for deferred loading
  function queueScript(src, callback) {
    scriptQueue.push({ src, callback });
    
    // Start processing the queue if not already processing
    if (!isProcessingQueue) {
      processScriptQueue();
    }
  }

  // Process the script queue
  function processScriptQueue() {
    if (scriptQueue.length === 0) {
      isProcessingQueue = false;
      return;
    }
    
    isProcessingQueue = true;
    
    // Calculate how many scripts we can load concurrently
    const currentlyLoading = loadingScripts.size;
    const availableSlots = Math.max(0, settings.maxConcurrentLoads - currentlyLoading);
    
    if (availableSlots === 0) {
      // Wait for a script to finish loading
      Promise.race(Array.from(loadingScripts.values()))
        .then(() => {
          setTimeout(processScriptQueue, 0);
        })
        .catch(() => {
          setTimeout(processScriptQueue, 0);
        });
      return;
    }
    
    // Load the next batch of scripts
    const batch = scriptQueue.splice(0, availableSlots);
    
    batch.forEach(item => {
      loadScript(item.src)
        .then(() => {
          // Execute callback
          if (item.callback) {
            item.callback();
          }
          
          // Continue processing the queue
          setTimeout(processScriptQueue, 0);
        })
        .catch(() => {
          // Continue processing the queue even if there's an error
          setTimeout(processScriptQueue, 0);
        });
    });
  }

  // Preload a script without executing it
  function preloadScript(src) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  }

  // Inline a small script
  function inlineScript(src) {
    return fetch(src)
      .then(response => response.text())
      .then(code => {
        const script = document.createElement('script');
        script.textContent = code;
        script.setAttribute('data-original-src', src);
        script.setAttribute('optimized', 'true');
        script.setAttribute('data-loaded', 'true');
        document.head.appendChild(script);
        
        loadedScripts.add(src);
        return script;
      });
  }

  // Update script optimization settings
  function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
  }

  // Export API
  window.scriptOptimizer = {
    init,
    loadScript,
    preloadScript,
    inlineScript,
    updateSettings,
    getLoadedScripts: () => Array.from(loadedScripts),
    getQueueLength: () => scriptQueue.length,
    getLoadingScripts: () => Array.from(loadingScripts.keys())
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();