// Supabase Products Integration for Dairy-Lift
// Handles all product-related database operations with performance optimizations

class SupabaseProductsManager {
  constructor() {
    this.supabaseUrl = 'https://eseynihfxxojisyqmigk.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZXluaWhmeHhvamlzeXFtaWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTEzODksImV4cCI6MjA2MzQ4NzM4OX0.1nU7McnxI_Cx2zK2UMpxc5t1ZK0VJnx2sz_xFS0Np08';
    this.client = null;
    this.initialized = false;
    this.subscriptions = [];
    this.eventListeners = new Map();

    // Performance optimizations
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
    this.lastFetch = new Map();
    this.debounceTimers = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  // Initialize Supabase client
  async initialize() {
    try {
      if (typeof window.supabase === 'undefined') {
        throw new Error('Supabase library not loaded. Make sure to include the Supabase CDN script.');
      }

      this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);

      // Test connection
      const { error } = await this.client
        .from('products')
        .select('count', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      this.initialized = true;
      console.log('✅ Supabase Products Manager initialized successfully');

      // Set up real-time subscriptions
      this.setupRealtimeSubscriptions();

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase Products Manager:', error);
      this.initialized = false;
      return false;
    }
  }

  // Set up real-time subscriptions for product changes
  setupRealtimeSubscriptions() {
    try {
      console.log('🔄 Setting up real-time subscriptions...');

      // Subscribe to products table changes
      const productsSubscription = this.client
        .channel('products-changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          (payload) => {
            console.log('📡 Real-time product change detected:', payload);
            this.handleProductChange(payload);
          }
        )
        .subscribe();

      this.subscriptions.push(productsSubscription);
      console.log('✅ Real-time subscriptions established');
    } catch (error) {
      console.error('❌ Failed to set up real-time subscriptions:', error);
    }
  }

  // Handle real-time product changes with debouncing
  handleProductChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    console.log(`🔄 Product ${eventType}:`, { newRecord, oldRecord });

    // Clear relevant cache entries
    this.clearCache('getAllProducts');
    this.clearCache('getProductsByCategory');
    if (newRecord?.id || oldRecord?.id) {
      this.clearCache(`getProductById_${newRecord?.id || oldRecord?.id}`);
    }

    // Debounce event emissions to prevent spam
    this.debounce('product-change-events', () => {
      // Emit custom events for different change types
      switch (eventType) {
        case 'INSERT':
          this.emitEvent('product-added', newRecord);
          break;
        case 'UPDATE':
          this.emitEvent('product-updated', { old: oldRecord, new: newRecord });
          break;
        case 'DELETE':
          this.emitEvent('product-deleted', oldRecord);
          break;
      }

      // Emit general product change event
      this.emitEvent('products-changed', { eventType, newRecord, oldRecord });
    }, 500);
  }

  // Event system for real-time updates
  addEventListener(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(callback);
  }

  removeEventListener(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      const listeners = this.eventListeners.get(eventType);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(eventType, data) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  // Clean up subscriptions
  cleanup() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
    this.eventListeners.clear();
    console.log('🧹 Cleaned up subscriptions and event listeners');
  }

  // Performance optimization methods
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

  getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const now = Date.now();
    return (now - cached.timestamp) < this.cacheTimeout;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get all products with caching
  async getAllProducts(forceRefresh = false) {
    try {
      const cacheKey = this.getCacheKey('getAllProducts');

      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && this.isCacheValid(cacheKey)) {
        console.log('📦 Returning cached products');
        return this.getCache(cacheKey);
      }

      if (!this.initialized) {
        await this.initialize();
      }

      const { data, error } = await this.client
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      const products = data || [];
      this.setCache(cacheKey, products);
      console.log(`✅ Fetched ${products.length} products from database`);

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);

      // Return cached data as fallback
      const cacheKey = this.getCacheKey('getAllProducts');
      const cached = this.getCache(cacheKey);
      if (cached) {
        console.log('📦 Returning cached products as fallback');
        return cached;
      }

      return [];
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { data, error } = await this.client
        .from('products')
        .select('*')
        .eq('active', true)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch products by category: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // Get single product by ID
  async getProductById(id) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { data, error } = await this.client
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  // Add new product
  async addProduct(productData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Determine status based on stock
      const status = this.determineStatus(productData.stock);

      const product = {
        name: productData.name,
        description: productData.description || '',
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        category: productData.category,
        image_url: productData.imageUrl || '',
        status: status,
        discount: parseFloat(productData.discount) || 0,
        active: true
      };

      const { data, error } = await this.client
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add product: ${error.message}`);
      }

      // Create notification for product addition
      await this.createProductNotification('product_added', data);

      // Create recent activity
      await this.createRecentActivity('product_added', data);

      console.log('✅ Product added successfully:', data);
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Update existing product
  async updateProduct(id, productData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Determine status based on stock
      const status = this.determineStatus(productData.stock);

      const updates = {
        name: productData.name,
        description: productData.description || '',
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        category: productData.category,
        image_url: productData.imageUrl || '',
        status: status,
        discount: parseFloat(productData.discount) || 0
      };

      const { data, error } = await this.client
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }

      // Create notification for product update
      await this.createProductNotification('product_updated', data);

      // Create recent activity
      await this.createRecentActivity('product_updated', data);

      console.log('✅ Product updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product (soft delete by setting active to false)
  async deleteProduct(id) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Get product details before deletion
      const product = await this.getProductById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      const { data, error } = await this.client
        .from('products')
        .update({ active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }

      // Create notification for product deletion
      await this.createProductNotification('product_deleted', product);

      // Create recent activity
      await this.createRecentActivity('product_deleted', product);

      console.log('✅ Product deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Get all product categories
  async getCategories() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { data, error } = await this.client
        .from('product_categories')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Determine product status based on stock
  determineStatus(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
  }

  // Create product notification
  async createProductNotification(type, product) {
    try {
      const titles = {
        'product_added': 'New Product Added',
        'product_updated': 'Product Updated',
        'product_deleted': 'Product Removed',
        'product_low_stock': 'Low Stock Alert'
      };

      const descriptions = {
        'product_added': `${product.name} has been added to the store`,
        'product_updated': `${product.name} has been updated`,
        'product_deleted': `${product.name} has been removed from the store`,
        'product_low_stock': `${product.name} is running low on stock (${product.stock} remaining)`
      };

      const notification = {
        type: type,
        title: titles[type],
        description: descriptions[type],
        priority: type === 'product_low_stock' ? 'high' : 'medium',
        status: 'pending',
        related_table: 'products',
        related_id: product.id,
        metadata: {
          product_name: product.name,
          product_category: product.category,
          product_price: product.price,
          product_stock: product.stock
        }
      };

      const { error } = await this.client
        .from('notifications')
        .insert([notification]);

      if (error) {
        console.error('Failed to create notification:', error);
      }
    } catch (error) {
      console.error('Error creating product notification:', error);
    }
  }

  // Create recent activity
  async createRecentActivity(type, product) {
    try {
      const titles = {
        'product_added': 'Product Added',
        'product_updated': 'Product Updated',
        'product_deleted': 'Product Removed'
      };

      const descriptions = {
        'product_added': `${product.name} was added to the store`,
        'product_updated': `${product.name} was updated`,
        'product_deleted': `${product.name} was removed from the store`
      };

      const icons = {
        'product_added': 'fas fa-plus-circle',
        'product_updated': 'fas fa-edit',
        'product_deleted': 'fas fa-trash'
      };

      const activity = {
        type: type,
        title: titles[type],
        description: descriptions[type],
        priority: 'medium',
        icon: icons[type],
        related_table: 'products',
        related_id: product.id,
        created_by: 'Admin'
      };

      const { error } = await this.client
        .from('recent_activities')
        .insert([activity]);

      if (error) {
        console.error('Failed to create recent activity:', error);
      }
    } catch (error) {
      console.error('Error creating recent activity:', error);
    }
  }

  // Get recent activities
  async getRecentActivities(limit = 10) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { data, error } = await this.client
        .from('recent_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch recent activities: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }
}

// Create global instance
window.supabaseProductsManager = new SupabaseProductsManager();
