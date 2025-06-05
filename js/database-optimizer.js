/**
 * Database Optimizer for Dairy-Lift
 * Optimizes database operations for better performance
 */

(function() {
  'use strict';

  // Database cache
  const queryCache = new Map();
  const dataCache = new Map();
  
  // Database optimization settings
  const settings = {
    cacheQueries: true,
    cacheTimeout: 60000, // 1 minute
    batchOperations: true,
    maxCacheSize: 100,
    useIndexedDB: true,
    offlineSupport: true,
    compressionEnabled: true,
    logPerformance: false
  };

  // Initialize database optimization
  function init() {
    console.log('🗄️ Initializing database optimizer...');
    
    // Set up IndexedDB for offline support if enabled
    if (settings.useIndexedDB) {
      setupIndexedDB();
    }
    
    // Intercept Supabase operations if available
    if (window.supabase) {
      interceptSupabaseOperations();
    }
    
    console.log('✅ Database optimizer initialized');
  }

  // Set up IndexedDB for offline caching
  function setupIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('dairy-lift-cache', 1);
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('queries')) {
          db.createObjectStore('queries', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('offline-operations')) {
          db.createObjectStore('offline-operations', { keyPath: 'id', autoIncrement: true });
        }
      };
      
      request.onsuccess = function(event) {
        window.dbCache = event.target.result;
        resolve(event.target.result);
      };
      
      request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Intercept Supabase operations
  function interceptSupabaseOperations() {
    // Skip if Supabase is not available
    if (!window.supabase) return;
    
    // Store original methods
    const originalSelect = window.supabase.from;
    
    // Override the from method
    window.supabase.from = function(table) {
      const originalChain = originalSelect.call(this, table);
      
      // Clone the original chain
      const optimizedChain = Object.create(Object.getPrototypeOf(originalChain));
      Object.assign(optimizedChain, originalChain);
      
      // Override the select method
      const originalSelectMethod = optimizedChain.select;
      optimizedChain.select = function(...args) {
        const selectChain = originalSelectMethod.apply(this, args);
        
        // Override the then method to add caching
        const originalThen = selectChain.then;
        selectChain.then = function(onFulfilled, onRejected) {
          // Generate a cache key
          const cacheKey = generateCacheKey(table, 'select', args, this);
          
          // Check cache first if enabled
          if (settings.cacheQueries && queryCache.has(cacheKey)) {
            const cachedResult = queryCache.get(cacheKey);
            
            // Check if cache is still valid
            if (Date.now() - cachedResult.timestamp < settings.cacheTimeout) {
              if (settings.logPerformance) {
                console.log(`🗄️ Cache hit for query: ${cacheKey}`);
              }
              
              // Return cached result
              return Promise.resolve(onFulfilled ? onFulfilled(cachedResult.data) : cachedResult.data);
            } else {
              // Remove expired cache
              queryCache.delete(cacheKey);
            }
          }
          
          // If offline and we have cached data, use it
          if (settings.offlineSupport && !navigator.onLine && queryCache.has(cacheKey)) {
            const cachedResult = queryCache.get(cacheKey);
            console.log(`🗄️ Using cached data while offline: ${cacheKey}`);
            return Promise.resolve(onFulfilled ? onFulfilled(cachedResult.data) : cachedResult.data);
          }
          
          // Perform the original operation
          return originalThen.call(this, result => {
            // Cache the result if successful
            if (settings.cacheQueries && result && !result.error) {
              // Implement LRU cache
              if (queryCache.size >= settings.maxCacheSize) {
                const oldestKey = queryCache.keys().next().value;
                queryCache.delete(oldestKey);
              }
              
              // Store in cache
              queryCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });
              
              // Also store in IndexedDB if enabled
              if (settings.useIndexedDB && window.dbCache) {
                const transaction = window.dbCache.transaction(['queries'], 'readwrite');
                const store = transaction.objectStore('queries');
                
                store.put({
                  id: cacheKey,
                  data: settings.compressionEnabled ? compressData(result) : result,
                  timestamp: Date.now()
                });
              }
              
              if (settings.logPerformance) {
                console.log(`🗄️ Cached query result: ${cacheKey}`);
              }
            }
            
            return onFulfilled ? onFulfilled(result) : result;
          }, onRejected);
        };
        
        return selectChain;
      };
      
      // Override insert, update, and delete methods to handle offline operations
      ['insert', 'update', 'delete', 'upsert'].forEach(method => {
        const originalMethod = optimizedChain[method];
        
        optimizedChain[method] = function(...args) {
          const chain = originalMethod.apply(this, args);
          
          // If offline, store the operation for later
          if (settings.offlineSupport && !navigator.onLine) {
            // Store the operation in IndexedDB
            if (settings.useIndexedDB && window.dbCache) {
              const transaction = window.dbCache.transaction(['offline-operations'], 'readwrite');
              const store = transaction.objectStore('offline-operations');
              
              store.add({
                table,
                method,
                args,
                timestamp: Date.now()
              });
              
              console.log(`🗄️ Stored offline operation: ${method} on ${table}`);
            }
            
            // Return a mock successful response
            return {
              then: (onFulfilled) => {
                const mockResult = { 
                  data: args[0], 
                  offline: true,
                  message: 'Operation stored for when online'
                };
                return Promise.resolve(onFulfilled ? onFulfilled(mockResult) : mockResult);
              }
            };
          }
          
          // For online operations, invalidate related caches after completion
          const originalThen = chain.then;
          chain.then = function(onFulfilled, onRejected) {
            return originalThen.call(this, result => {
              // Invalidate cache for this table
              invalidateTableCache(table);
              
              return onFulfilled ? onFulfilled(result) : result;
            }, onRejected);
          };
          
          return chain;
        };
      });
      
      return optimizedChain;
    };
    
    // Add sync method to process offline operations when back online
    window.supabase.sync = function() {
      if (!settings.useIndexedDB || !window.dbCache) {
        return Promise.resolve({ synced: 0 });
      }
      
      return new Promise((resolve, reject) => {
        const transaction = window.dbCache.transaction(['offline-operations'], 'readwrite');
        const store = transaction.objectStore('offline-operations');
        const request = store.getAll();
        
        request.onsuccess = function() {
          const operations = request.result;
          let synced = 0;
          
          // Process each operation
          const processOperations = async () => {
            for (const op of operations) {
              try {
                // Execute the operation
                const result = await window.supabase
                  .from(op.table)[op.method](...op.args);
                
                if (!result.error) {
                  // Remove from offline store
                  const deleteTransaction = window.dbCache.transaction(['offline-operations'], 'readwrite');
                  const deleteStore = deleteTransaction.objectStore('offline-operations');
                  deleteStore.delete(op.id);
                  
                  synced++;
                }
              } catch (error) {
                console.error(`Error syncing operation:`, op, error);
              }
            }
            
            resolve({ synced, total: operations.length });
          };
          
          processOperations();
        };
        
        request.onerror = function(event) {
          reject(event.target.error);
        };
      });
    };
    
    // Sync when coming back online
    window.addEventListener('online', function() {
      window.supabase.sync().then(result => {
        console.log(`🔄 Synced ${result.synced}/${result.total} offline operations`);
      });
    });
  }

  // Generate a cache key for a query
  function generateCacheKey(table, method, args, chain) {
    // Extract filters and other query modifiers
    const filters = [];
    
    // Check for filter methods on the chain
    ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 'in', 'is'].forEach(filter => {
      if (chain[filter] && chain[filter].args) {
        filters.push(`${filter}:${JSON.stringify(chain[filter].args)}`);
      }
    });
    
    // Check for order, limit, offset
    ['order', 'limit', 'offset'].forEach(modifier => {
      if (chain[modifier] && chain[modifier].args) {
        filters.push(`${modifier}:${JSON.stringify(chain[modifier].args)}`);
      }
    });
    
    // Combine all parts into a key
    return `${table}:${method}:${JSON.stringify(args)}:${filters.join(',')}`;
  }

  // Invalidate cache for a specific table
  function invalidateTableCache(table) {
    // Remove from memory cache
    for (const key of queryCache.keys()) {
      if (key.startsWith(`${table}:`)) {
        queryCache.delete(key);
      }
    }
    
    // Remove from IndexedDB if enabled
    if (settings.useIndexedDB && window.dbCache) {
      const transaction = window.dbCache.transaction(['queries'], 'readwrite');
      const store = transaction.objectStore('queries');
      const request = store.openCursor();
      
      request.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.key.startsWith(`${table}:`)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
    
    if (settings.logPerformance) {
      console.log(`🗄️ Invalidated cache for table: ${table}`);
    }
  }

  // Clear all caches
  function clearAllCaches() {
    // Clear memory cache
    queryCache.clear();
    dataCache.clear();
    
    // Clear IndexedDB if enabled
    if (settings.useIndexedDB && window.dbCache) {
      const transaction = window.dbCache.transaction(['queries', 'data'], 'readwrite');
      transaction.objectStore('queries').clear();
      transaction.objectStore('data').clear();
    }
    
    console.log('🧹 Cleared all database caches');
  }

  // Compress data to save space
  function compressData(data) {
    if (!settings.compressionEnabled) return data;
    
    try {
      // Simple compression: convert to JSON and use built-in compression
      const jsonString = JSON.stringify(data);
      
      // Use compression stream if available
      if (window.CompressionStream) {
        // This is async, so we'd need to adjust the architecture to use it properly
        // For now, just return the uncompressed data
        return data;
      }
      
      // Fallback: simple run-length encoding for strings
      return jsonString;
    } catch (error) {
      console.error('Error compressing data:', error);
      return data;
    }
  }

  // Decompress data
  function decompressData(compressedData) {
    if (!settings.compressionEnabled) return compressedData;
    
    try {
      // If it's a string, assume it's JSON
      if (typeof compressedData === 'string') {
        return JSON.parse(compressedData);
      }
      
      return compressedData;
    } catch (error) {
      console.error('Error decompressing data:', error);
      return compressedData;
    }
  }

  // Update database optimization settings
  function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
  }

  // Export API
  window.databaseOptimizer = {
    init,
    clearCache: clearAllCaches,
    invalidateTable: invalidateTableCache,
    updateSettings,
    getCacheSize: () => queryCache.size,
    getSettings: () => ({ ...settings })
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();