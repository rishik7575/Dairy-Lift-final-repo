/**
 * Store Performance Bridge
 * Enhances the existing storenew.js with performance optimizations
 * without replacing its core functionality
 */

(function() {
  'use strict';

  // Show loading indicator
  function showLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.display = 'block';
    }
  }
  
  // Hide loading indicator
  function hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
  
  // Initialize Supabase if needed
  async function initializeSupabaseIfNeeded() {
    if (!window.supabaseProductsManager || !window.supabaseProductsManager.initialized) {
      console.log('🔄 Initializing Supabase Products Manager...');
      
      // Make sure Supabase is loaded
      if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded. Waiting...');
        setTimeout(initializeSupabaseIfNeeded, 500);
        return false;
      }
      
      // Initialize Supabase Products Manager
      if (window.supabaseProductsManager) {
        const initialized = await window.supabaseProductsManager.initialize();
        if (!initialized) {
          console.error('❌ Failed to initialize Supabase Products Manager');
          return false;
        }
      } else {
        console.error('❌ Supabase Products Manager not available');
        return false;
      }
    }
    
    return true;
  }
  
  // Wait for storenew.js to initialize
  async function init() {
    console.log('🔄 Initializing store performance bridge...');
    
    // Show loading indicator while waiting
    showLoadingIndicator();
    
    // Make sure Supabase is initialized
    const supabaseInitialized = await initializeSupabaseIfNeeded();
    if (!supabaseInitialized) {
      console.log('⏳ Waiting for Supabase to initialize...');
      setTimeout(init, 500);
      return;
    }
    
    // Check if storenew.js has loaded
    if (typeof window.allProducts === 'undefined') {
      console.log('⏳ Waiting for storenew.js to initialize...');
      
      // Try to trigger product loading if initializeSupabase function exists
      if (typeof window.initializeSupabase === 'function') {
        console.log('🔄 Triggering product loading...');
        try {
          await window.initializeSupabase();
        } catch (error) {
          console.error('❌ Error initializing Supabase:', error);
        }
      }
      
      setTimeout(init, 500);
      return;
    }
    
    // Wait for products to be loaded from database
    if (!Array.isArray(window.allProducts) || window.allProducts.length === 0) {
      console.log('⏳ Waiting for products to be loaded...');
      
      // Try to trigger product loading if loadProductsFromDatabase function exists
      if (typeof window.loadProductsFromDatabase === 'function') {
        console.log('🔄 Triggering product loading...');
        try {
          await window.loadProductsFromDatabase();
        } catch (error) {
          console.error('❌ Error loading products:', error);
        }
      }
      
      setTimeout(init, 500);
      return;
    }
    
    // Hide loading indicator once products are loaded
    hideLoadingIndicator();
    
    // Apply performance enhancements
    enhanceProductRendering();
    enhanceEventHandling();
    enhanceFiltering();
    enhanceImageLoading();
    
    console.log('✅ Store performance bridge initialized');
  }

  // Enhance product rendering
  function enhanceProductRendering() {
    // Override the original renderProductGrid function if it exists
    if (typeof renderProductGrid === 'function') {
      const originalRenderProductGrid = renderProductGrid;
      
      window.renderProductGrid = function(products) {
        console.log('🔄 Enhanced product rendering...');
        
        // Use performance monitoring
        if (window.monitorRenderTime) {
          return window.monitorRenderTime(() => {
            originalRenderProductGrid(products);
          });
        } else {
          return originalRenderProductGrid(products);
        }
      };
    }
    
    // Add hardware acceleration to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      card.style.transform = 'translateZ(0)';
      card.style.willChange = 'transform';
      card.style.backfaceVisibility = 'hidden';
    });
  }

  // Enhance event handling
  function enhanceEventHandling() {
    // Debounce search input
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
      const originalHandler = searchInput.oninput;
      let searchTimer;
      
      searchInput.oninput = function(e) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          if (originalHandler) {
            originalHandler.call(this, e);
          }
        }, 300);
      };
    }
    
    // Throttle scroll events
    let isScrolling = false;
    window.addEventListener('scroll', function() {
      if (!isScrolling) {
        window.requestAnimationFrame(function() {
          // Handle scroll events here
          isScrolling = false;
        });
        isScrolling = true;
      }
    }, { passive: true });
  }

  // Enhance filtering
  function enhanceFiltering() {
    // Override the original filterAndRenderProducts function if it exists
    if (typeof filterAndRenderProducts === 'function') {
      const originalFilterAndRenderProducts = filterAndRenderProducts;
      
      window.filterAndRenderProducts = function() {
        console.log('🔄 Enhanced filtering...');
        
        // Use performance monitoring
        if (window.monitorRenderTime) {
          return window.monitorRenderTime(() => {
            originalFilterAndRenderProducts();
          });
        } else {
          return originalFilterAndRenderProducts();
        }
      };
    }
  }

  // Enhance image loading
  function enhanceImageLoading() {
    // Add lazy loading to images
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
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Wait a bit to ensure storenew.js has initialized
      setTimeout(init, 300);
    });
  } else {
    // Wait a bit to ensure storenew.js has initialized
    setTimeout(init, 300);
  }
  
  // Also initialize on window load
  window.addEventListener('load', function() {
    setTimeout(init, 100);
  });
})();