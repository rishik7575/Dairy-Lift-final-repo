/* ===================================
   DAIRY-LIFT STORE JAVASCRIPT
   ================================== */

/* ===================================
   TAILWIND CONFIGURATION
   ================================== */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#ad6ef5",
        secondary: "#8A2BE2",
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
        button: "8px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
};

/* ===================================
   GLOBAL VARIABLES
   ================================== */
// Product data management with Supabase integration
let productsData = [];
let allProducts = []; // Ensure this is globally accessible
let supabaseInitialized = false;
let wishlistItems = new Set();
let cartItems = new Map();

// We'll expose these functions to the global scope after they're defined

/* ===================================
   PERFORMANCE OPTIMIZATIONS
   ================================== */
const performanceOptimizations = {
  debounceTimers: new Map(),
  throttleTimers: new Map(),

  debounce(key, func, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  },

  throttle(key, func, delay = 100) {
    if (this.throttleTimers.has(key)) {
      return;
    }

    const timer = setTimeout(() => {
      this.throttleTimers.delete(key);
    }, delay);

    this.throttleTimers.set(key, timer);
    func();
  }
};

/* ===================================
   SUPABASE INITIALIZATION
   ================================== */
// Initialize Supabase and load products
async function initializeSupabase() {
  try {
    console.log('🔄 Initializing Supabase Products Manager...');

    const initialized = await window.supabaseProductsManager.initialize();
    if (initialized) {
      supabaseInitialized = true;
      console.log('✅ Supabase Products Manager initialized successfully');
      await loadProductsFromDatabase();

      // Set up real-time listeners
      setupRealtimeListeners();
    } else {
      throw new Error('Failed to initialize Supabase Products Manager');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    supabaseInitialized = false;
    loadFallbackProducts();
  }
}

// Set up real-time listeners for product changes with performance optimization
function setupRealtimeListeners() {
  if (!window.supabaseProductsManager) return;

  // Listen for product changes with debouncing
  window.supabaseProductsManager.addEventListener('products-changed', (data) => {
    console.log('🔄 Products changed, reloading...');
    performanceOptimizations.debounce('reload-products', () => {
      loadProductsFromDatabase();
    }, 1000);
  });

  window.supabaseProductsManager.addEventListener('product-added', (product) => {
    console.log('➕ Product added:', product);
    performanceOptimizations.debounce('reload-products-added', () => {
      loadProductsFromDatabase();
    }, 500);
  });

  window.supabaseProductsManager.addEventListener('product-updated', (data) => {
    console.log('✏️ Product updated:', data);
    performanceOptimizations.debounce('reload-products-updated', () => {
      loadProductsFromDatabase();
    }, 500);
  });

  window.supabaseProductsManager.addEventListener('product-deleted', (product) => {
    console.log('🗑️ Product deleted:', product);
    performanceOptimizations.debounce('reload-products-deleted', () => {
      loadProductsFromDatabase();
    }, 500);
  });
}

/* ===================================
   WISHLIST MANAGEMENT
   ================================== */
const wishlistManager = {
  init() {
    this.loadWishlist();
    this.updateWishlistUI();
  },

  loadWishlist() {
    try {
      const saved = localStorage.getItem('Dairy-LiftWishlist');
      if (saved) {
        wishlistItems = new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      wishlistItems = new Set();
    }
  },

  saveWishlist() {
    try {
      localStorage.setItem('Dairy-LiftWishlist', JSON.stringify([...wishlistItems]));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  },

  addToWishlist(productId) {
    // Find the full product object
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      // Store the full product object instead of just the ID
      const wishlistData = this.getWishlistData();
      wishlistData[productId] = product;
      this.saveWishlistData(wishlistData);
      wishlistItems.add(productId);
      this.updateWishlistUI();
      this.showNotification('Added to wishlist!', 'success');
    }
  },

  removeFromWishlist(productId) {
    // Remove from both the Set and the detailed storage
    const wishlistData = this.getWishlistData();
    delete wishlistData[productId];
    this.saveWishlistData(wishlistData);
    wishlistItems.delete(productId);
    this.saveWishlist();
    this.updateWishlistUI();
    this.showNotification('Removed from wishlist!', 'info');
  },

  toggleWishlist(productId) {
    if (wishlistItems.has(productId)) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(productId);
    }
  },

  isInWishlist(productId) {
    return wishlistItems.has(productId);
  },

  getWishlistData() {
    try {
      const saved = localStorage.getItem('Dairy-LiftWishlistData');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading wishlist data:', error);
      return {};
    }
  },

  saveWishlistData(data) {
    try {
      localStorage.setItem('Dairy-LiftWishlistData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving wishlist data:', error);
    }
  },

  updateWishlistUI() {
    // Update wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const productId = btn.dataset.productId;
      if (this.isInWishlist(productId)) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart"></i>';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i>';
      }
    });

    // Update wishlist count in navbar
    const wishlistLink = document.querySelector('a[href="watchliststore.html"]');
    if (wishlistLink) {
      const count = wishlistItems.size;
      let badge = wishlistLink.querySelector('.wishlist-count');
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'wishlist-count';
          wishlistLink.style.position = 'relative';
          wishlistLink.appendChild(badge);
        }
        badge.textContent = count;
      } else if (badge) {
        badge.remove();
      }
    }
  },

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
};

/* ===================================
   UTILITY FUNCTIONS
   ================================== */
// Category normalization function
function normalizeCategory(category) {
  const categoryMap = {
    'ice cream': 'icecream',
    'ice-cream': 'icecream',
    'ice_cream': 'icecream'
  };

  const normalized = category.toLowerCase().trim();
  return categoryMap[normalized] || normalized;
}

/* ===================================
   PRODUCT LOADING AND MANAGEMENT
   ================================== */
// Load products from Supabase database
async function loadProductsFromDatabase() {
  try {
    console.log('🔄 Loading products from database...');
    showLoadingIndicator(true);

    if (!window.supabaseProductsManager) {
      throw new Error('Supabase Products Manager not available');
    }

    const products = await window.supabaseProductsManager.getAllProducts();
    console.log(`📦 Loaded ${products.length} products from database`);

    // Process and normalize products
    productsData = products.map(product => ({
      ...product,
      category: normalizeCategory(product.category),
      price: parseFloat(product.price) || 0,
      rating: parseInt(product.rating) || 5,
      inStock: product.in_stock !== false,
      featured: product.featured === true,
      imageUrl: product.image_url || product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
      nutritionInfo: product.nutrition_info || {
        calories: '150 kcal',
        fat: '8g',
        protein: '8g',
        calcium: '300mg'
      }
    }));

    console.log('✅ Products processed and normalized');

    // Initialize the store with loaded products
    initializeStoreWithProducts();

  } catch (error) {
    console.error('❌ Error loading products from database:', error);
    loadFallbackProducts();
  } finally {
    showLoadingIndicator(false);
  }
}

// Load fallback products if database fails
function loadFallbackProducts() {
  console.log('🔄 Loading fallback products...');

  productsData = [
    {
      id: 'milk-001',
      name: 'Fresh Whole Milk',
      description: 'Premium quality whole milk from grass-fed cows',
      price: 45.99,
      category: 'milk',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      inStock: true,
      featured: true,
      rating: 5,
      nutritionInfo: {
        calories: '150 kcal',
        fat: '8g',
        protein: '8g',
        calcium: '300mg'
      }
    },
    {
      id: 'cheese-001',
      name: 'Aged Cheddar Cheese',
      description: 'Rich and creamy aged cheddar with a sharp flavor',
      price: 89.99,
      category: 'cheese',
      imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      inStock: true,
      featured: false,
      rating: 4,
      nutritionInfo: {
        calories: '113 kcal',
        fat: '9g',
        protein: '7g',
        calcium: '200mg'
      }
    },
    {
      id: 'yogurt-001',
      name: 'Greek Yogurt',
      description: 'Thick and creamy Greek yogurt with live cultures',
      price: 35.99,
      category: 'yogurt',
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      inStock: true,
      featured: false,
      rating: 5,
      nutritionInfo: {
        calories: '100 kcal',
        fat: '0g',
        protein: '17g',
        calcium: '200mg'
      }
    },
    {
      id: 'butter-001',
      name: 'Organic Butter',
      description: 'Creamy organic butter made from the finest cream',
      price: 65.99,
      category: 'butter',
      imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      inStock: true,
      featured: false,
      rating: 4,
      nutritionInfo: {
        calories: '717 kcal',
        fat: '81g',
        protein: '1g',
        calcium: '24mg'
      }
    },
    {
      id: 'icecream-001',
      name: 'Vanilla Ice Cream',
      description: 'Rich and creamy vanilla ice cream made with real vanilla beans',
      price: 55.99,
      category: 'icecream',
      imageUrl: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      inStock: false,
      featured: false,
      rating: 5,
      nutritionInfo: {
        calories: '207 kcal',
        fat: '11g',
        protein: '4g',
        calcium: '128mg'
      }
    }
  ];

  console.log('✅ Fallback products loaded');
  initializeStoreWithProducts();
}

// Initialize store with loaded products
function initializeStoreWithProducts() {
  console.log('🚀 Initializing store with products...');

  // Set global products reference for compatibility
  window.allProducts = productsData;
  allProducts = productsData;

  // Initialize wishlist manager
  wishlistManager.init();

  // Initialize cart
  cartInstance = new Cart();

  // Initialize simple filtering system
  initializeSimpleFiltering();

  // Initial render of all products
  filterAndRenderProducts();

  console.log('✅ Store initialized with products');
}

// Show/hide loading indicator
function showLoadingIndicator(show) {
  let indicator = document.getElementById('loading-indicator');

  if (show && !indicator) {
    indicator = document.createElement('div');
    indicator.id = 'loading-indicator';
    indicator.innerHTML = `
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading products...</p>
        </div>
      </div>
    `;
    document.body.appendChild(indicator);
  } else if (!show && indicator) {
    indicator.remove();
  }
}

function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="fa${i <= rating ? 's' : 'r'} fa-star"></i>`;
  }
  return stars;
}

/* ===================================
   CART FUNCTIONALITY
   ================================== */
// Cart functionality
class Cart {
  constructor() {
    this.items = [];
    this.loadFromStorage();
    this.syncWithUpdatedProducts(); // Sync cart with any updated products
    this.initEventListeners();
    this.updateCartDisplay();
  }

  loadFromStorage() {
    const savedCart = localStorage.getItem('Dairy-LiftCart');
    if (savedCart) {
      this.items = JSON.parse(savedCart);
    }
  }

  // Sync cart with updated products from manage_store.html
  syncWithUpdatedProducts() {
    // Remove any cart items that no longer exist in the products list
    this.items = this.items.filter(item => {
      return productsData.some(product => product.id === item.id);
    });

    // Update product details in cart items
    this.items.forEach(item => {
      const product = productsData.find(p => p.id === item.id);
      if (product) {
        item.name = product.name;
        item.price = product.price;
        item.imageUrl = product.imageUrl;
        // If product is now out of stock, remove it from cart
        if (!product.inStock) {
          this.items = this.items.filter(i => i.id !== item.id);
        }
      }
    });

    // Save the updated cart
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem('Dairy-LiftCart', JSON.stringify(this.items));
  }

  addItem(productId, quantity = 1) {
    const product = productsData.find(p => p.id === productId);
    if (!product || !product.inStock) return;

    const existingItem = this.items.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity
      });
    }

    this.saveToStorage();
    this.updateCartDisplay();
    this.showAddToCartNotification(product.name);
    this.updateProductButtonState(productId);
  }

  updateProductButtonState(productId) {
    // Update all add to cart buttons for this product
    const addToCartBtns = document.querySelectorAll(`.add-to-cart-btn[data-id="${productId}"]`);
    const item = this.items.find(item => item.id === productId);

    addToCartBtns.forEach(btn => {
      if (item && item.quantity > 0) {
        btn.innerHTML = `<i class="fas fa-check"></i> Added to Cart (${item.quantity})`;
        btn.classList.add('added-to-cart');
      } else {
        btn.innerHTML = `<i class="fas fa-shopping-cart"></i> Add to Cart`;
        btn.classList.remove('added-to-cart');
      }
    });
  }

  updateAllProductButtonStates() {
    // Update button states for all products
    const allAddToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    allAddToCartBtns.forEach(btn => {
      const productId = btn.getAttribute('data-id');
      if (productId) {
        this.updateProductButtonState(productId);
      }
    });
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveToStorage();
    this.updateCartDisplay();
    this.updateProductButtonState(productId);
  }

  updateQuantity(productId, newQuantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = newQuantity;
        this.saveToStorage();
        this.updateCartDisplay();
        this.updateProductButtonState(productId);
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  clearCart() {
    this.items = [];
    this.saveToStorage();
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    // Update cart count
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      cartCount.textContent = this.getTotalItems();
    }

    // Update all product button states
    this.updateAllProductButtonStates();

    // Update cart items in drawer
    const cartBody = document.getElementById('cart-body');
    const subtotalEl = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (this.items.length === 0) {
      cartBody.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart empty-cart-icon"></i>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any products to your cart yet.</p>
        </div>
      `;
      subtotalEl.textContent = formatPrice(0);
      checkoutBtn.disabled = true;
    } else {
      let cartItemsHTML = '<div class="cart-items">';

      this.items.forEach(item => {
        cartItemsHTML += `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
              <img src="${item.imageUrl}" alt="${item.name}">
            </div>
            <div class="cart-item-content">
              <h4 class="cart-item-title">${item.name}</h4>
              <p class="cart-item-price">${formatPrice(item.price)} each</p>
              <div class="cart-item-quantity">
                <button class="cart-quantity-btn decrease-qty" data-id="${item.id}">-</button>
                <span class="cart-quantity-value">${item.quantity}</span>
                <button class="cart-quantity-btn increase-qty" data-id="${item.id}">+</button>
                <button class="cart-item-remove" data-id="${item.id}">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="cart-item-subtotal">
              ${formatPrice(item.price * item.quantity)}
            </div>
          </div>
        `;
      });

      cartItemsHTML += '</div>';
      cartBody.innerHTML = cartItemsHTML;
      subtotalEl.textContent = formatPrice(this.getTotal());
      checkoutBtn.disabled = false;

      // Add event listeners to cart items
      document.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const item = this.items.find(item => item.id === id);
          if (item) this.updateQuantity(id, item.quantity - 1);
        });
      });

      document.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const item = this.items.find(item => item.id === id);
          if (item) this.updateQuantity(id, item.quantity + 1);
        });
      });

      document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.removeItem(id);
        });
      });
    }
  }

  showAddToCartNotification(productName) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--primary)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = 'var(--radius)';
    notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '1000';
    notification.style.transition = 'all 0.3s ease';
    notification.style.transform = 'translateY(100px)';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-check-circle"></i>
        <div>
          <div style="font-weight: 500;">${productName}</div>
          <div style="font-size: 0.875rem;">Added to your cart</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
    }, 10);

    // Hide and remove notification
    setTimeout(() => {
      notification.style.transform = 'translateY(100px)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  initEventListeners() {
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const checkoutBtn = document.getElementById('checkout-btn');

    cartToggle.addEventListener('click', () => {
      cartDrawer.classList.add('open');
    });

    closeCart.addEventListener('click', () => {
      cartDrawer.classList.remove('open');
    });

    checkoutBtn.addEventListener('click', () => {
      window.location.href = 'cartstore.html';
    });

    // Close cart when clicking outside
    document.addEventListener('click', (event) => {
      if (cartDrawer.classList.contains('open') &&
          !cartDrawer.contains(event.target) &&
          !cartToggle.contains(event.target)) {
        cartDrawer.classList.remove('open');
      }
    });
  }
}

/* ===================================
   PRODUCT FILTERING AND RENDERING
   ================================== */
// Simple and reliable product filtering system
let currentCategory = 'all';
let allProducts = [];

// Helper functions for rendering
function formatPrice(price) {
  return `₹${price.toFixed(2)}`;
}

// Render add to cart button with correct state
function renderAddToCartButton(product) {
  if (!product.inStock) {
    return `<button class="btn btn-primary add-to-cart-btn" data-id="${product.id}" disabled>
              <i class="fas fa-shopping-cart"></i> Out of Stock
            </button>`;
  }

  // Check if product is in cart
  let cart = [];
  try {
    const savedCart = localStorage.getItem('Dairy-LiftCart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }

  const cartItem = cart.find(item => item.id === product.id);

  if (cartItem && cartItem.quantity > 0) {
    return `<button class="btn btn-primary add-to-cart-btn added-to-cart" data-id="${product.id}">
              <i class="fas fa-check"></i> Added to Cart (${cartItem.quantity})
            </button>`;
  } else {
    return `<button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>`;
  }
}

// Initialize simple filtering system
function initializeSimpleFiltering() {
  console.log('🔄 Initializing simple filtering system...');

  // Set up category tag click handlers
  document.querySelectorAll('.category-tag').forEach(tag => {
    tag.addEventListener('click', function() {
      // Remove active class from all tags
      document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));

      // Add active class to clicked tag
      this.classList.add('active');

      // Get category from data attribute
      const category = this.getAttribute('data-category');
      currentCategory = category;

      console.log(`🔍 Filtering by category: ${category}`);

      // Apply filter immediately
      filterAndRenderProducts();
    });
  });

  console.log('✅ Simple filtering system initialized');
}

// Filter and render products
function filterAndRenderProducts() {
  console.log(`🔍 Filtering products - Category: ${currentCategory}, Total products: ${allProducts.length}`);

  let filtered = [...allProducts];

  // Apply category filter
  if (currentCategory !== 'all') {
    filtered = filtered.filter(product => {
      const matches = product.category === currentCategory;
      console.log(`Product "${product.name}" (category: "${product.category}") ${matches ? '✅ matches' : '❌ does not match'} filter "${currentCategory}"`);
      return matches;
    });
  }

  console.log(`🔍 Filter result: ${filtered.length} products found`);

  // Render products
  renderProductGrid(filtered);
}

// Render product grid
function renderProductGrid(products) {
  const productGrid = document.getElementById('product-grid');

  if (!productGrid) {
    console.error('❌ Product grid element not found');
    return;
  }

  if (products.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
        <i class="fas fa-search" style="font-size: 3rem; color: var(--muted); margin-bottom: 1rem;"></i>
        <h3>No products found</h3>
        <p>Try selecting a different category</p>
      </div>
    `;
    return;
  }

  let productsHTML = '';

  products.forEach(product => {
    const isInWishlist = wishlistManager.isInWishlist(product.id);

    productsHTML += `
      <div class="card product-card" data-id="${product.id}">
        <div class="product-image-container">
          <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
          ${product.inStock ?
            (product.featured ? '<span class="product-badge">Featured</span>' : '') :
            '<span class="product-badge out-of-stock">Out of Stock</span>'
          }
          <div class="product-actions">
            <button class="action-btn wishlist-btn ${isInWishlist ? 'active' : ''}" data-product-id="${product.id}">
              <i class="fa${isInWishlist ? 's' : 'r'} fa-heart"></i>
            </button>
            <button class="action-btn quick-view-btn" data-id="${product.id}">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        <div class="product-content">
          <div class="product-rating">
            <div class="rating-stars">
              ${renderStars(product.rating)}
            </div>
            <span class="rating-count">(${product.rating})</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-price-container">
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
              ${product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
        </div>
        <div class="product-footer">
          ${renderAddToCartButton(product)}
        </div>
      </div>
    `;
  });

  productGrid.innerHTML = productsHTML;
  console.log(`✅ Rendered ${products.length} products to grid`);

  // Add event listeners for interactive elements
  addProductEventListeners();
}

// Add event listeners for product interactions
function addProductEventListeners() {
  // Add to cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const id = btn.getAttribute('data-id');
      const product = allProducts.find(p => p.id === id);
      if (product && product.inStock) {
        addToCart(id);
      }
    });
  });

  // Wishlist buttons
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const id = btn.getAttribute('data-product-id');
      toggleWishlist(id);
    });
  });

  // Quick view buttons
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const id = btn.getAttribute('data-id');
      openQuickView(id);
    });
  });
}

/* ===================================
   MODAL AND QUICK VIEW FUNCTIONALITY
   ================================== */
// Quick view modal functionality
function openQuickView(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const modalContent = modal.querySelector('.modal-content');

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Quick View</h2>
      <button class="modal-close" onclick="closeQuickView()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <div class="quick-view-content">
        <div class="quick-view-image">
          <img src="${product.imageUrl}" alt="${product.name}">
          ${product.inStock ?
            (product.featured ? '<span class="product-badge">Featured</span>' : '') :
            '<span class="product-badge out-of-stock">Out of Stock</span>'
          }
        </div>
        <div class="quick-view-details">
          <div class="product-rating">
            <div class="rating-stars">
              ${renderStars(product.rating)}
            </div>
            <span class="rating-count">(${product.rating})</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-price">${formatPrice(product.price)}</div>
          <div class="product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
            ${product.inStock ? 'In Stock' : 'Out of Stock'}
          </div>
          <div class="nutrition-info">
            <h4>Nutrition Information</h4>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span class="nutrition-label">Calories:</span>
                <span class="nutrition-value">${product.nutritionInfo.calories}</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">Fat:</span>
                <span class="nutrition-value">${product.nutritionInfo.fat}</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">Protein:</span>
                <span class="nutrition-value">${product.nutritionInfo.protein}</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">Calcium:</span>
                <span class="nutrition-value">${product.nutritionInfo.calcium}</span>
              </div>
            </div>
          </div>
          <div class="quick-view-actions">
            ${renderAddToCartButton(product)}
            <button class="btn btn-secondary wishlist-btn ${wishlistManager.isInWishlist(product.id) ? 'active' : ''}" data-product-id="${product.id}">
              <i class="fa${wishlistManager.isInWishlist(product.id) ? 's' : 'r'} fa-heart"></i>
              ${wishlistManager.isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Add event listeners for modal actions
  const addToCartBtn = modal.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (product.inStock) {
        addToCart(product.id);
        // Update the button in the modal
        addToCartBtn.outerHTML = renderAddToCartButton(product);
      }
    });
  }

  const wishlistBtn = modal.querySelector('.wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      toggleWishlist(product.id);
      // Update the button in the modal
      const isInWishlist = wishlistManager.isInWishlist(product.id);
      wishlistBtn.innerHTML = `
        <i class="fa${isInWishlist ? 's' : 'r'} fa-heart"></i>
        ${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      `;
      wishlistBtn.classList.toggle('active', isInWishlist);
    });
  }
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

/* ===================================
   MAIN INTERACTION FUNCTIONS
   ================================== */
// Main functions for product interactions
function addToCart(productId) {
  if (cartInstance) {
    cartInstance.addItem(productId);
  }
}

function toggleWishlist(productId) {
  wishlistManager.toggleWishlist(productId);
}

/* ===================================
   MOBILE MENU FUNCTIONALITY
   ================================== */
// Mobile menu functionality
function initializeMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = 'auto';
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (event) => {
    if (mobileMenu && mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(event.target) &&
        !mobileMenuToggle.contains(event.target)) {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  });
}

/* ===================================
   INITIALIZATION AND DOM READY
   ================================== */
// Global cart instance
let cartInstance;

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Dairy-Lift Store initializing...');

  try {
    // Initialize mobile menu
    initializeMobileMenu();

    // Initialize Supabase and load products
    await initializeSupabase();

    // Close modal when clicking outside
    document.addEventListener('click', (event) => {
      const modal = document.getElementById('quick-view-modal');
      if (modal && modal.style.display === 'flex' && event.target === modal) {
        closeQuickView();
      }
    });

    console.log('✅ Dairy-Lift Store initialized successfully');

  } catch (error) {
    console.error('❌ Error initializing store:', error);
  }
});

// Authentication initialization
if (typeof window !== 'undefined') {
  window.addEventListener('load', function() {
    // Initialize authentication if available
    if (window.authManager) {
      window.authManager.init();
    }
  });
}

// Expose key functions to the global scope for external scripts
window.initializeSupabase = initializeSupabase;
window.loadProductsFromDatabase = loadProductsFromDatabase;
window.loadFallbackProducts = loadFallbackProducts;
window.filterAndRenderProducts = filterAndRenderProducts;
window.renderProductGrid = renderProductGrid;