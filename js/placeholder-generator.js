/**
 * Placeholder Image Generator for Dairy-Lift
 * Creates placeholder images for offline use and loading states
 */

(function() {
  'use strict';

  // Generate a placeholder SVG
  function generatePlaceholderSVG(width, height, text) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="#888888">
          ${text || 'Image'}
        </text>
      </svg>
    `;
    
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
  }

  // Generate a placeholder for product images
  function generateProductPlaceholder() {
    return generatePlaceholderSVG(300, 300, 'Product');
  }

  // Generate a placeholder for profile images
  function generateProfilePlaceholder() {
    return generatePlaceholderSVG(100, 100, 'Profile');
  }

  // Generate a placeholder for hero images
  function generateHeroPlaceholder() {
    return generatePlaceholderSVG(1200, 400, 'Hero Image');
  }

  // Generate a tiny placeholder for progressive loading
  function generateTinyPlaceholder() {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
  }

  // Create a placeholder image element
  function createPlaceholderImage(width, height, text) {
    const img = document.createElement('img');
    img.src = generatePlaceholderSVG(width, height, text);
    img.width = width;
    img.height = height;
    img.alt = text || 'Placeholder image';
    img.classList.add('placeholder-image');
    
    return img;
  }

  // Replace broken images with placeholders
  function replaceBrokenImages() {
    document.querySelectorAll('img').forEach(img => {
      if (!img.complete || img.naturalWidth === 0) {
        img.src = generatePlaceholderSVG(
          img.width || 300,
          img.height || 300,
          'Image not available'
        );
      }
    });
  }

  // Export API
  window.placeholderGenerator = {
    generatePlaceholderSVG,
    generateProductPlaceholder,
    generateProfilePlaceholder,
    generateHeroPlaceholder,
    generateTinyPlaceholder,
    createPlaceholderImage,
    replaceBrokenImages
  };

  // Replace broken images when page loads
  window.addEventListener('load', replaceBrokenImages);
})();