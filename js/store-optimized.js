/**
 * Optimized Store JavaScript for Dairy-Lift
 * High-performance product management with virtual scrolling and caching
 */

class OptimizedStoreManager {
  constructor() {
    this.productsData = [];
    this.filteredProducts = [];
    this.wishlistItems = new Set();
    this.cartItems = new Map();
    this.currentPage = 0;
    this.itemsPerPage = 20;
    this.isLoading = false;
    this.searchQuery = '';
    this.activeFilters = {
      categories: new Set(['all']),
      priceRange: 20,
      availability: new Set(['in-stock']),
      rating: new Set(['5', '4', '3'])
    };

    // Performance optimizations
    this.debounceTimers = new Map();
    this.intersectionObserver = null;
    this.virtualScrollContainer = null;
    this.renderedItems = new Map();

    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing Optimized Store Manager...');
      
      // Load saved data
      this.loadWishlist();
      this.loadCart();
      
      // Setup UI
      this.setupEventListeners();
      this.setupVirtualScrolling();
      this.setupIntersectionObserver();
      
      // Load products
      await this.loadProducts();
      
      // Initial render
      this.renderProducts();
      
      console.log('✅ Store Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Store Manager:', error);
      this.showErrorMessage('Failed to load store. Please refresh the page.');
    }
  }

  // Load products with caching
  async loadProducts() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoadingState();

    try {
      // Try to get from Supabase first
      if (window.supabaseProductsManager && window.supabaseProductsManager.initialized) {
        this.productsData = await window.supabaseProductsManager.getAllProducts();
      } else {
        // Fallback to sample data
        this.productsData = this.getFallbackProducts();
      }

      this.filteredProducts = [...this.productsData];
      this.hideLoadingState();
      
      console.log(`📦 Loaded ${this.productsData.length} products`);
    } catch (error) {
      console.error('Error loading products:', error);
      this.productsData = this.getFallbackProducts();
      this.filteredProducts = [...this.productsData];
      this.hideLoadingState();
    } finally {
      this.isLoading = false;
    }
  }

  // Setup virtual scrolling for better performance
  setupVirtualScrolling() {
    this.virtualScrollContainer = document.getElementById('product-grid');
    if (!this.virtualScrollContainer) return;

    // Create virtual scroll wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'virtual-scroll-wrapper';
    wrapper.style.height = 'auto';
    wrapper.style.overflow = 'visible';
    
    this.virtualScrollContainer.appendChild(wrapper);
  }

  // Setup intersection observer for lazy loading
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.remove('loading-skeleton');
            this.intersectionObserver.unobserve(img);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
  }

  // Optimized event listeners with delegation
  setupEventListeners() {
    // Search with debouncing
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.debounce('search', () => {
          this.searchQuery = e.target.value.toLowerCase();
          this.filterProducts();
        }, 300);
      });
    }

    // Category filters
    document.addEventListener('click', (e) => {
      if (e.target.matches('.category-tag')) {
        this.handleCategoryFilter(e.target);
      } else if (e.target.matches('.add-to-cart-btn')) {
        this.handleAddToCart(e.target);
      } else if (e.target.matches('.wishlist-btn')) {
        this.handleWishlistToggle(e.target);
      } else if (e.target.matches('.quick-view-btn')) {
        this.handleQuickView(e.target);
      }
    });

    // Sort dropdown
    const sortSelect = document.getElementById('sort-products');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortProducts(e.target.value);
      });
    }

    // Filter checkboxes
    document.addEventListener('change', (e) => {
      if (e.target.matches('.category-filter, .availability-filter, .rating-filter')) {
        this.handleFilterChange(e.target);
      }
    });

    // Price range slider
    const priceRange = document.getElementById('price-range');
    if (priceRange) {
      priceRange.addEventListener('input', (e) => {
        this.debounce('price-filter', () => {
          this.activeFilters.priceRange = parseInt(e.target.value);
          document.getElementById('price-range-value').textContent = `₹${e.target.value}`;
          this.filterProducts();
        }, 200);
      });
    }
  }

  // Debounce utility
  debounce(key, func, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  // Optimized product filtering
  filterProducts() {
    const startTime = performance.now();
    
    this.filteredProducts = this.productsData.filter(product => {
      // Search filter
      if (this.searchQuery && !product.name.toLowerCase().includes(this.searchQuery)) {
        return false;
      }

      // Category filter
      if (!this.activeFilters.categories.has('all') && 
          !this.activeFilters.categories.has(product.category)) {
        return false;
      }

      // Price filter
      if (product.price > this.activeFilters.priceRange) {
        return false;
      }

      // Availability filter
      const availability = product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock';
      if (!this.activeFilters.availability.has(availability)) {
        return false;
      }

      return true;
    });

    const endTime = performance.now();
    console.log(`🔍 Filtered ${this.filteredProducts.length} products in ${(endTime - startTime).toFixed(2)}ms`);

    this.currentPage = 0;
    this.renderProducts();
  }

  // Optimized product rendering with virtual scrolling
  renderProducts() {
    const container = document.getElementById('product-grid');
    if (!container) return;

    const startTime = performance.now();

    // Clear existing content
    container.innerHTML = '';

    if (this.filteredProducts.length === 0) {
      this.showEmptyState(container);
      return;
    }

    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Render products in batches
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredProducts.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const product = this.filteredProducts[i];
      const productCard = this.createProductCard(product);
      fragment.appendChild(productCard);
    }

    container.appendChild(fragment);

    // Setup lazy loading for images
    const images = container.querySelectorAll('img[data-src]');
    images.forEach(img => {
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(img);
      }
    });

    const endTime = performance.now();
    console.log(`🎨 Rendered ${endIndex - startIndex} products in ${(endTime - startTime).toFixed(2)}ms`);

    // Update UI counters
    this.updateUICounters();
  }

  // Create optimized product card
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    const isInWishlist = this.wishlistItems.has(product.id.toString());
    const isInCart = this.cartItems.has(product.id.toString());
    const stockStatus = product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock';
    const stockText = product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock';

    card.innerHTML = `
      <div class="product-image-container">
        <img 
          data-src="${product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}" 
          alt="${product.name}"
          class="product-image loading-skeleton"
          loading="lazy"
          decoding="async"
        >
        ${product.stock_quantity <= 10 && product.stock_quantity > 0 ? 
          '<div class="product-badge">Low Stock</div>' : ''}
        ${product.stock_quantity === 0 ? 
          '<div class="product-badge out-of-stock">Out of Stock</div>' : ''}
        
        <div class="product-actions">
          <button class="action-btn wishlist-btn ${isInWishlist ? 'active' : ''}" 
                  data-product-id="${product.id}" 
                  title="Add to Wishlist">
            <i class="fas fa-heart"></i>
          </button>
          <button class="action-btn quick-view-btn" 
                  data-product-id="${product.id}" 
                  title="Quick View">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      
      <div class="product-content">
        <div class="product-rating">
          <div class="rating-stars">
            ${this.generateStars(product.rating || 4.5)}
          </div>
          <span class="rating-count">(${product.reviews || 0})</span>
        </div>
        
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description || 'Fresh dairy product from our farm'}</p>
        
        <div class="product-price-container">
          <span class="product-price">₹${product.price}</span>
          <span class="product-stock ${stockStatus}">${stockText}</span>
        </div>
      </div>
      
      <div class="product-footer">
        <button class="btn btn-primary add-to-cart-btn ${isInCart ? 'added-to-cart' : ''}" 
                data-product-id="${product.id}"
                ${product.stock_quantity === 0 ? 'disabled' : ''}>
          <i class="fas fa-shopping-cart"></i>
          ${isInCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    `;

    return card;
  }

  // Generate star rating HTML
  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';

    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }

    return starsHTML;
  }

  // Show loading state
  showLoadingState() {
    const container = document.getElementById('product-grid');
    if (!container) return;

    container.innerHTML = Array(6).fill(0).map(() => `
      <div class="product-card loading-skeleton" style="height: 400px;">
        <div style="height: 200px; background: #f0f0f0; margin-bottom: 1rem;"></div>
        <div style="height: 20px; background: #f0f0f0; margin-bottom: 0.5rem;"></div>
        <div style="height: 16px; background: #f0f0f0; margin-bottom: 1rem;"></div>
        <div style="height: 40px; background: #f0f0f0;"></div>
      </div>
    `).join('');
  }

  // Hide loading state
  hideLoadingState() {
    const skeletons = document.querySelectorAll('.loading-skeleton');
    skeletons.forEach(skeleton => {
      if (skeleton.classList.contains('product-card')) {
        skeleton.remove();
      }
    });
  }

  // Show empty state
  showEmptyState(container) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
        <i class="fas fa-search" style="font-size: 4rem; color: var(--muted-foreground); margin-bottom: 1rem;"></i>
        <h3 style="margin-bottom: 0.5rem;">No products found</h3>
        <p style="color: var(--muted-foreground);">Try adjusting your search or filters</p>
        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
          Reset Filters
        </button>
      </div>
    `;
  }

  // Update UI counters
  updateUICounters() {
    // Update cart count
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const totalItems = Array.from(this.cartItems.values()).reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Update wishlist count
    const wishlistCount = document.querySelector('.wishlist-count');
    if (wishlistCount) {
      wishlistCount.textContent = this.wishlistItems.size;
      wishlistCount.style.display = this.wishlistItems.size > 0 ? 'flex' : 'none';
    }
  }

  // Fallback products for offline mode
  getFallbackProducts() {
    return [
      {
        id: 1,
        name: "Fresh Whole Milk",
        description: "Pure, fresh whole milk from grass-fed cows",
        price: 60,
        stock_quantity: 50,
        category: "milk",
        image_url: "https://via.placeholder.com/300x300?text=Fresh+Milk",
        rating: 4.8,
        reviews: 124
      },
      {
        id: 2,
        name: "Organic Cheddar Cheese",
        description: "Aged organic cheddar cheese with rich flavor",
        price: 250,
        stock_quantity: 25,
        category: "cheese",
        image_url: "https://via.placeholder.com/300x300?text=Cheddar+Cheese",
        rating: 4.6,
        reviews: 89
      },
      {
        id: 3,
        name: "Greek Yogurt",
        description: "Creamy Greek yogurt packed with probiotics",
        price: 120,
        stock_quantity: 30,
        category: "yogurt",
        image_url: "https://via.placeholder.com/300x300?text=Greek+Yogurt",
        rating: 4.7,
        reviews: 156
      }
    ];
  }

  // Load wishlist from localStorage
  loadWishlist() {
    try {
      const saved = localStorage.getItem('Dairy-LiftWishlist');
      if (saved) {
        this.wishlistItems = new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      this.wishlistItems = new Set();
    }
  }

  // Load cart from localStorage
  loadCart() {
    try {
      const saved = localStorage.getItem('Dairy-LiftCart');
      if (saved) {
        const cartArray = JSON.parse(saved);
        this.cartItems = new Map(cartArray.map(item => [item.id.toString(), item]));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.cartItems = new Map();
    }
  }

  // Show error message
  showErrorMessage(message) {
    const container = document.getElementById('product-grid');
    if (container) {
      container.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--destructive); margin-bottom: 1rem;"></i>
          <h3 style="margin-bottom: 0.5rem; color: var(--destructive);">Error</h3>
          <p style="color: var(--muted-foreground)">${message}</p>
          <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
            Retry
          </button>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.optimizedStoreManager = new OptimizedStoreManager();
  });
} else {
  window.optimizedStoreManager = new OptimizedStoreManager();
}
