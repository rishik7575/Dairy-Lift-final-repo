/**
 * Animation Manager for Dairy-Lift
 * Optimizes animations and visual effects for better performance
 */

class AnimationManager {
  constructor() {
    this.activeAnimations = new Set();
    this.animationQueue = [];
    this.isProcessing = false;
    this.reducedMotion = false;
    this.performanceMode = 'auto'; // auto, high, low
    
    this.init();
  }

  init() {
    this.detectReducedMotion();
    this.setupPerformanceDetection();
    this.optimizeExistingAnimations();
    console.log('🎬 Animation Manager initialized');
  }

  // Detect user's reduced motion preference
  detectReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = mediaQuery.matches;
    
    mediaQuery.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      this.updateAnimationSettings();
    });
  }

  // Detect device performance capabilities
  setupPerformanceDetection() {
    // Check device memory
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      this.performanceMode = 'low';
    }
    
    // Check hardware concurrency
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      this.performanceMode = 'low';
    }
    
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkPerformance = (currentTime) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        if (fps < 30 && this.performanceMode !== 'low') {
          this.performanceMode = 'low';
          this.updateAnimationSettings();
        } else if (fps > 50 && this.performanceMode === 'low') {
          this.performanceMode = 'high';
          this.updateAnimationSettings();
        }
      }
      requestAnimationFrame(checkPerformance);
    };
    
    requestAnimationFrame(checkPerformance);
  }

  // Update animation settings based on performance
  updateAnimationSettings() {
    const root = document.documentElement;
    
    if (this.reducedMotion || this.performanceMode === 'low') {
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
      this.disableComplexAnimations();
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.3s');
      this.enableComplexAnimations();
    }
  }

  // Disable complex animations for better performance
  disableComplexAnimations() {
    const style = document.createElement('style');
    style.id = 'animation-performance-override';
    style.textContent = `
      .floating, .pulse, .bounce {
        animation: none !important;
      }
      .card:hover {
        transform: none !important;
      }
      .product-image {
        transition: none !important;
      }
    `;
    
    const existing = document.getElementById('animation-performance-override');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(style);
  }

  // Enable complex animations
  enableComplexAnimations() {
    const existing = document.getElementById('animation-performance-override');
    if (existing) {
      existing.remove();
    }
  }

  // Optimize existing animations
  optimizeExistingAnimations() {
    // Use Intersection Observer for scroll-based animations
    this.setupScrollAnimations();
    
    // Optimize hover effects
    this.optimizeHoverEffects();
    
    // Batch DOM updates
    this.setupBatchedUpdates();
  }

  // Setup efficient scroll animations
  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.queueAnimation(() => {
            entry.target.classList.add('animate-in');
          });
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe elements that should animate on scroll
    document.querySelectorAll('.animate-on-scroll, .reveal, .fade-in').forEach(el => {
      observer.observe(el);
    });
  }

  // Optimize hover effects using event delegation
  optimizeHoverEffects() {
    let hoverTimeout;
    
    document.addEventListener('mouseover', (e) => {
      if (this.performanceMode === 'low') return;
      
      const card = e.target.closest('.card, .product-card');
      if (card) {
        clearTimeout(hoverTimeout);
        this.queueAnimation(() => {
          card.style.transform = 'translateY(-5px)';
        });
      }
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.card, .product-card');
      if (card) {
        hoverTimeout = setTimeout(() => {
          this.queueAnimation(() => {
            card.style.transform = '';
          });
        }, 100);
      }
    });
  }

  // Setup batched DOM updates
  setupBatchedUpdates() {
    this.batchedUpdates = [];
    this.updateScheduled = false;
    
    this.scheduleBatchUpdate = () => {
      if (this.updateScheduled) return;
      
      this.updateScheduled = true;
      requestAnimationFrame(() => {
        this.batchedUpdates.forEach(update => update());
        this.batchedUpdates = [];
        this.updateScheduled = false;
      });
    };
  }

  // Queue animation for optimal performance
  queueAnimation(animationFn, priority = 'normal') {
    if (this.reducedMotion) {
      // Skip animations if reduced motion is preferred
      return;
    }

    const animation = {
      fn: animationFn,
      priority,
      timestamp: performance.now()
    };

    if (priority === 'high') {
      this.animationQueue.unshift(animation);
    } else {
      this.animationQueue.push(animation);
    }

    this.processQueue();
  }

  // Process animation queue
  processQueue() {
    if (this.isProcessing || this.animationQueue.length === 0) return;
    
    this.isProcessing = true;
    
    requestAnimationFrame(() => {
      const maxAnimationsPerFrame = this.performanceMode === 'low' ? 2 : 5;
      let processed = 0;
      
      while (this.animationQueue.length > 0 && processed < maxAnimationsPerFrame) {
        const animation = this.animationQueue.shift();
        try {
          animation.fn();
        } catch (error) {
          console.warn('Animation error:', error);
        }
        processed++;
      }
      
      this.isProcessing = false;
      
      // Continue processing if there are more animations
      if (this.animationQueue.length > 0) {
        setTimeout(() => this.processQueue(), 16); // ~60fps
      }
    });
  }

  // Smooth scroll with performance optimization
  smoothScrollTo(element, options = {}) {
    if (this.reducedMotion) {
      element.scrollIntoView({ behavior: 'auto' });
      return;
    }

    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    };

    element.scrollIntoView({ ...defaultOptions, ...options });
  }

  // Animate counter with performance optimization
  animateCounter(element, start, end, duration = 1000) {
    if (this.reducedMotion) {
      element.textContent = end;
      return;
    }

    const startTime = performance.now();
    const range = end - start;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + range * easeOutQuart);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  // Fade in element with performance optimization
  fadeIn(element, duration = 300) {
    if (this.reducedMotion) {
      element.style.opacity = '1';
      return Promise.resolve();
    }

    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease`;
      
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        setTimeout(resolve, duration);
      });
    });
  }

  // Slide in element with performance optimization
  slideIn(element, direction = 'up', duration = 300) {
    if (this.reducedMotion) {
      element.style.transform = 'none';
      return Promise.resolve();
    }

    return new Promise(resolve => {
      const transforms = {
        up: 'translateY(20px)',
        down: 'translateY(-20px)',
        left: 'translateX(20px)',
        right: 'translateX(-20px)'
      };

      element.style.transform = transforms[direction];
      element.style.opacity = '0';
      element.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
      
      requestAnimationFrame(() => {
        element.style.transform = 'none';
        element.style.opacity = '1';
        setTimeout(resolve, duration);
      });
    });
  }

  // Get performance metrics
  getMetrics() {
    return {
      activeAnimations: this.activeAnimations.size,
      queuedAnimations: this.animationQueue.length,
      performanceMode: this.performanceMode,
      reducedMotion: this.reducedMotion,
      isProcessing: this.isProcessing
    };
  }

  // Cleanup method
  cleanup() {
    this.animationQueue = [];
    this.activeAnimations.clear();
    this.isProcessing = false;
    
    const style = document.getElementById('animation-performance-override');
    if (style) {
      style.remove();
    }
    
    console.log('🧹 Animation Manager cleaned up');
  }
}

// Create global instance
window.animationManager = new AnimationManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationManager;
}
