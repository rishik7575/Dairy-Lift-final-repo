/**
 * Critical CSS Extractor for Dairy-Lift
 * Extracts and inlines critical CSS for faster rendering
 */

(function() {
  'use strict';

  // CSS optimization settings
  const settings = {
    inlineCritical: true,
    asyncLoadNonCritical: true,
    minifyCritical: true,
    preloadFonts: true,
    removeUnused: true,
    criticalSelectors: [
      'body', 'html', '.container', '.header', '.navbar', '.hero', 
      '.product-card', '.btn', '.card', '.footer', '.main-content',
      '.above-fold', '#main', '.profile-icon', '.search-bar'
    ]
  };

  // Initialize CSS optimization
  function init() {
    console.log('🎨 Initializing critical CSS extractor...');
    
    if (settings.inlineCritical) {
      extractAndInlineCriticalCSS();
    }
    
    if (settings.asyncLoadNonCritical) {
      loadNonCriticalCSSAsync();
    }
    
    if (settings.preloadFonts) {
      preloadCriticalFonts();
    }
    
    console.log('✅ Critical CSS extractor initialized');
  }

  // Extract and inline critical CSS
  function extractAndInlineCriticalCSS() {
    // Get all stylesheets
    const styleSheets = Array.from(document.styleSheets);
    
    try {
      let criticalCSS = '';
      
      // Process each stylesheet
      styleSheets.forEach(sheet => {
        // Skip external stylesheets that haven't loaded yet
        if (sheet.href && !sheet.cssRules) return;
        
        // Skip already processed sheets
        if (sheet.ownerNode && sheet.ownerNode.hasAttribute('data-processed')) return;
        
        // Mark as processed
        if (sheet.ownerNode) {
          sheet.ownerNode.setAttribute('data-processed', 'true');
        }
        
        // Extract critical rules
        const rules = extractCriticalRules(sheet);
        criticalCSS += rules;
      });
      
      // Minify if enabled
      if (settings.minifyCritical) {
        criticalCSS = minifyCSS(criticalCSS);
      }
      
      // Inline the critical CSS
      if (criticalCSS) {
        const style = document.createElement('style');
        style.setAttribute('data-critical', 'true');
        style.textContent = criticalCSS;
        
        // Insert at the top of the head
        if (document.head.firstChild) {
          document.head.insertBefore(style, document.head.firstChild);
        } else {
          document.head.appendChild(style);
        }
      }
    } catch (error) {
      console.error('Error extracting critical CSS:', error);
    }
  }

  // Extract critical CSS rules from a stylesheet
  function extractCriticalRules(sheet) {
    let criticalRules = '';
    
    try {
      // Process each rule in the stylesheet
      Array.from(sheet.cssRules || []).forEach(rule => {
        // Handle different rule types
        if (rule.type === CSSRule.STYLE_RULE) {
          // Check if this is a critical selector
          if (isCriticalSelector(rule.selectorText)) {
            criticalRules += rule.cssText + '\n';
          }
        } else if (rule.type === CSSRule.MEDIA_RULE) {
          // For media queries, check if they're for mobile or critical
          if (isMediaQueryCritical(rule.media.mediaText)) {
            let mediaRules = '';
            
            // Process rules inside the media query
            Array.from(rule.cssRules).forEach(mediaRule => {
              if (mediaRule.type === CSSRule.STYLE_RULE && isCriticalSelector(mediaRule.selectorText)) {
                mediaRules += mediaRule.cssText + '\n';
              }
            });
            
            if (mediaRules) {
              criticalRules += `@media ${rule.media.mediaText} {\n${mediaRules}}\n`;
            }
          }
        } else if (rule.type === CSSRule.FONT_FACE_RULE || 
                  rule.type === CSSRule.KEYFRAMES_RULE) {
          // Include all @font-face and @keyframes rules
          criticalRules += rule.cssText + '\n';
        }
      });
    } catch (error) {
      console.warn('Error processing stylesheet:', error);
    }
    
    return criticalRules;
  }

  // Check if a selector is critical
  function isCriticalSelector(selectorText) {
    if (!selectorText) return false;
    
    // Split multiple selectors
    const selectors = selectorText.split(',');
    
    return selectors.some(selector => {
      selector = selector.trim();
      
      // Check against our list of critical selectors
      return settings.criticalSelectors.some(criticalSelector => {
        // Direct match
        if (selector === criticalSelector) return true;
        
        // Child or descendant of critical selector
        if (selector.startsWith(criticalSelector + ' ') || 
            selector.startsWith(criticalSelector + '.') || 
            selector.startsWith(criticalSelector + '#') || 
            selector.startsWith(criticalSelector + ':')) {
          return true;
        }
        
        // Class or ID match
        if (criticalSelector.startsWith('.') || criticalSelector.startsWith('#')) {
          return selector.includes(criticalSelector);
        }
        
        return false;
      });
    });
  }

  // Check if a media query is critical
  function isMediaQueryCritical(mediaText) {
    // Consider mobile-first media queries as critical
    return mediaText.includes('max-width') || 
           mediaText.includes('prefers-reduced-motion') || 
           mediaText.includes('print') === false;
  }

  // Load non-critical CSS asynchronously
  function loadNonCriticalCSSAsync() {
    const links = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    links.forEach(link => {
      // Skip if already processed
      if (link.hasAttribute('data-processed')) return;
      
      // Mark as processed
      link.setAttribute('data-processed', 'true');
      
      // Get the href
      const href = link.href;
      
      // Remove the original link
      link.parentNode.removeChild(link);
      
      // Create a preload link
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'style';
      preload.href = href;
      document.head.appendChild(preload);
      
      // Create a new link with onload
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = href;
      newLink.setAttribute('data-processed', 'true');
      newLink.setAttribute('media', 'print');
      newLink.setAttribute('onload', "this.media='all'");
      document.head.appendChild(newLink);
    });
  }

  // Preload critical fonts
  function preloadCriticalFonts() {
    // Find font URLs in stylesheets
    const fontUrls = extractFontUrls();
    
    // Preload each font
    fontUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Extract font URLs from stylesheets
  function extractFontUrls() {
    const fontUrls = new Set();
    
    try {
      // Process each stylesheet
      Array.from(document.styleSheets).forEach(sheet => {
        // Skip external stylesheets that haven't loaded yet
        if (sheet.href && !sheet.cssRules) return;
        
        // Look for @font-face rules
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            const src = rule.style.getPropertyValue('src');
            
            // Extract URL from src
            const urlMatch = src.match(/url\(['"]?([^'")]+)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
              fontUrls.add(urlMatch[1]);
            }
          }
        });
      });
    } catch (error) {
      console.warn('Error extracting font URLs:', error);
    }
    
    return Array.from(fontUrls);
  }

  // Simple CSS minification
  function minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ')             // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
      .replace(/;}/g, '}')              // Remove trailing semicolons
      .trim();
  }

  // Update CSS optimization settings
  function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
  }

  // Export API
  window.criticalCSS = {
    init,
    extractAndInlineCriticalCSS,
    loadNonCriticalCSSAsync,
    preloadCriticalFonts,
    updateSettings,
    addCriticalSelector: (selector) => {
      settings.criticalSelectors.push(selector);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();