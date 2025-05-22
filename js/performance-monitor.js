/**
 * Performance Monitor for Dairy-Lift Store Pages
 * Real-time performance tracking and optimization suggestions
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      firstPaintTime: 0,
      firstContentfulPaintTime: 0,
      largestContentfulPaintTime: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      memoryUsage: {},
      networkRequests: [],
      renderingMetrics: {}
    };
    
    this.observers = [];
    this.isMonitoring = false;
    this.performanceIndicator = null;
    
    this.init();
  }

  init() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupPerformanceObservers();
    this.trackPageLoad();
    this.createPerformanceIndicator();
    this.startMonitoring();
    
    console.log('📊 Performance Monitor initialized');
  }

  setupPerformanceObservers() {
    // Largest Contentful Paint Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaintTime = Math.round(lastEntry.startTime);
          this.updateIndicator();
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Cumulative Layout Shift Observer
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              this.metrics.cumulativeLayoutShift += entry.value;
            }
          }
          this.updateIndicator();
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

        // First Input Delay Observer
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.metrics.firstInputDelay = Math.round(entry.processingStart - entry.startTime);
            this.updateIndicator();
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Long Task Observer
        const longTaskObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            console.warn(`⚠️ Long task detected: ${Math.round(entry.duration)}ms`);
            this.optimizeForLongTask();
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);

      } catch (error) {
        console.warn('Some performance observers not supported:', error);
      }
    }
  }

  trackPageLoad() {
    // Track basic timing metrics
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.pageLoadTime = Math.round(navigation.loadEventEnd - navigation.loadEventStart);
        this.metrics.domContentLoadedTime = Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      }

      // Track paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      if (firstPaint) {
        this.metrics.firstPaintTime = Math.round(firstPaint.startTime);
      }
      
      if (firstContentfulPaint) {
        this.metrics.firstContentfulPaintTime = Math.round(firstContentfulPaint.startTime);
      }

      this.updateIndicator();
    });
  }

  createPerformanceIndicator() {
    this.performanceIndicator = document.createElement('div');
    this.performanceIndicator.id = 'performance-indicator';
    this.performanceIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      display: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(this.performanceIndicator);

    // Toggle visibility with Ctrl+Shift+P
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        this.toggleIndicator();
      }
    });
  }

  updateIndicator() {
    if (!this.performanceIndicator) return;

    const memory = this.getMemoryUsage();
    const score = this.calculatePerformanceScore();
    
    this.performanceIndicator.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; color: ${this.getScoreColor(score)};">
        Performance Score: ${score}/100
      </div>
      <div>FCP: ${this.metrics.firstContentfulPaintTime || 'N/A'}ms</div>
      <div>LCP: ${this.metrics.largestContentfulPaintTime || 'N/A'}ms</div>
      <div>CLS: ${this.metrics.cumulativeLayoutShift.toFixed(3)}</div>
      <div>FID: ${this.metrics.firstInputDelay || 'N/A'}ms</div>
      ${memory ? `<div>Memory: ${memory.used}MB / ${memory.limit}MB</div>` : ''}
      <div style="margin-top: 8px; font-size: 10px; color: #ccc;">
        Press Ctrl+Shift+P to toggle
      </div>
    `;
  }

  toggleIndicator() {
    if (this.performanceIndicator.style.display === 'none') {
      this.performanceIndicator.style.display = 'block';
      this.updateIndicator();
    } else {
      this.performanceIndicator.style.display = 'none';
    }
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for poor metrics
    if (this.metrics.firstContentfulPaintTime > 2500) score -= 20;
    else if (this.metrics.firstContentfulPaintTime > 1800) score -= 10;
    
    if (this.metrics.largestContentfulPaintTime > 4000) score -= 25;
    else if (this.metrics.largestContentfulPaintTime > 2500) score -= 15;
    
    if (this.metrics.cumulativeLayoutShift > 0.25) score -= 20;
    else if (this.metrics.cumulativeLayoutShift > 0.1) score -= 10;
    
    if (this.metrics.firstInputDelay > 300) score -= 20;
    else if (this.metrics.firstInputDelay > 100) score -= 10;
    
    const memory = this.getMemoryUsage();
    if (memory && memory.percentage > 80) score -= 15;
    else if (memory && memory.percentage > 60) score -= 5;
    
    return Math.max(0, Math.round(score));
  }

  getScoreColor(score) {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      };
    }
    return null;
  }

  optimizeForLongTask() {
    // Automatically apply optimizations when long tasks are detected
    if (window.performanceManager) {
      window.performanceManager.optimizeForLowPerformance();
    }
    
    // Suggest breaking up long tasks
    console.log('💡 Consider breaking up long tasks using setTimeout or requestIdleCallback');
  }

  startMonitoring() {
    // Monitor memory usage every 10 seconds
    setInterval(() => {
      const memory = this.getMemoryUsage();
      if (memory && memory.percentage > 85) {
        console.warn('⚠️ High memory usage detected:', memory);
        this.suggestMemoryOptimizations();
      }
    }, 10000);

    // Monitor rendering performance
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkFrameRate = (currentTime) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${fps}`);
          this.suggestRenderingOptimizations();
        }
      }
      requestAnimationFrame(checkFrameRate);
    };
    
    requestAnimationFrame(checkFrameRate);
  }

  suggestMemoryOptimizations() {
    console.log('💡 Memory optimization suggestions:');
    console.log('- Clear unused caches');
    console.log('- Remove event listeners from removed elements');
    console.log('- Reduce image sizes');
    console.log('- Use virtual scrolling for large lists');
  }

  suggestRenderingOptimizations() {
    console.log('💡 Rendering optimization suggestions:');
    console.log('- Reduce animation complexity');
    console.log('- Use CSS transforms instead of changing layout properties');
    console.log('- Implement virtual scrolling');
    console.log('- Debounce scroll and resize events');
  }

  getReport() {
    return {
      score: this.calculatePerformanceScore(),
      metrics: this.metrics,
      memory: this.getMemoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.performanceIndicator) {
      this.performanceIndicator.remove();
    }
    
    this.isMonitoring = false;
    console.log('📊 Performance Monitor cleaned up');
  }
}

// Initialize performance monitor
if (typeof window !== 'undefined') {
  window.performanceMonitor = new PerformanceMonitor();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
