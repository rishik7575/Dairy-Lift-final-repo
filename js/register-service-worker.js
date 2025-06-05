/**
 * Service Worker Registration for Dairy-Lift
 * Registers the service worker for caching and offline support
 */

(function() {
  'use strict';

  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/js/service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', function() {
            // A new service worker is installing
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', function() {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                showUpdateNotification();
              }
            });
          });
        })
        .catch(function(error) {
          console.error('ServiceWorker registration failed: ', error);
        });
        
      // Handle controller change (when a new service worker takes over)
      navigator.serviceWorker.addEventListener('controllerchange', function() {
        console.log('New service worker controller');
      });
    });
  }

  // Show update notification
  function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <p>A new version is available!</p>
        <button id="update-button">Update Now</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add event listener to update button
    document.getElementById('update-button').addEventListener('click', function() {
      // Reload the page to activate the new service worker
      window.location.reload();
    });
  }

  // Add offline form submission support
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    // Store form data when offline
    window.addEventListener('submit', function(event) {
      // Only handle form submissions that should be synced
      if (!event.target.hasAttribute('data-sync-form')) {
        return;
      }
      
      // Check if we're offline
      if (!navigator.onLine) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const formObject = {};
        
        formData.forEach(function(value, key) {
          formObject[key] = value;
        });
        
        // Store form data in IndexedDB
        storeOfflineForm({
          url: event.target.action,
          method: event.target.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formObject)
        })
        .then(function() {
          // Show offline submission notification
          showOfflineSubmissionNotification();
          
          // Request background sync
          return navigator.serviceWorker.ready;
        })
        .then(function(registration) {
          return registration.sync.register('sync-forms');
        })
        .catch(function(error) {
          console.error('Error storing form data:', error);
        });
      }
    });
  }

  // Store form data in IndexedDB
  function storeOfflineForm(formData) {
    return new Promise(function(resolve, reject) {
      const request = indexedDB.open('dairy-lift-offline', 1);
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('offline-forms', { keyPath: 'id', autoIncrement: true });
      };
      
      request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['offline-forms'], 'readwrite');
        const store = transaction.objectStore('offline-forms');
        
        const storeRequest = store.add(formData);
        
        storeRequest.onsuccess = function() {
          resolve();
        };
        
        storeRequest.onerror = function(error) {
          reject(error);
        };
      };
      
      request.onerror = function(error) {
        reject(error);
      };
    });
  }

  // Show offline submission notification
  function showOfflineSubmissionNotification() {
    const notification = document.createElement('div');
    notification.className = 'offline-notification';
    notification.innerHTML = `
      <div class="offline-notification-content">
        <p>You're offline! Your form has been saved and will be submitted when you're back online.</p>
        <button id="close-notification-button">OK</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add event listener to close button
    document.getElementById('close-notification-button').addEventListener('click', function() {
      notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 5000);
  }

  // Add offline detection
  window.addEventListener('online', function() {
    document.body.classList.remove('offline');
    document.body.classList.add('online');
    
    // Show online notification
    const notification = document.createElement('div');
    notification.className = 'online-notification';
    notification.innerHTML = `
      <div class="online-notification-content">
        <p>You're back online!</p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(function() {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 3000);
  });

  window.addEventListener('offline', function() {
    document.body.classList.remove('online');
    document.body.classList.add('offline');
    
    // Show offline notification
    const notification = document.createElement('div');
    notification.className = 'offline-notification';
    notification.innerHTML = `
      <div class="offline-notification-content">
        <p>You're offline! Some features may be limited.</p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(function() {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 3000);
  });

  // Set initial online/offline status
  if (navigator.onLine) {
    document.body.classList.add('online');
  } else {
    document.body.classList.add('offline');
  }
})();