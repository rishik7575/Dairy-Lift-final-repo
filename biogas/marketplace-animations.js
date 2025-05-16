// SmartDairy Marketplace - Enhanced Animations and Dynamic Effects

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations and effects
    initColorEnhancements();
    initCategoryTabEffects();
    initProductCardAnimations();
    initSearchEffects();
    initButtonEffects();
    updateCartCountDisplay();
    
    // Add event listeners for category tabs
    const categoryTabs = document.querySelectorAll('#category-tabs button');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            categoryTabs.forEach(t => {
                t.classList.remove('border-farm-green', 'text-farm-green');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            
            // Add active class to clicked tab
            this.classList.remove('border-transparent', 'text-gray-500');
            this.classList.add('border-farm-green', 'text-farm-green');
            
            // Add transition effect when switching categories
            const productsGrid = document.getElementById('products-grid');
            productsGrid.style.opacity = '0';
            productsGrid.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                productsGrid.style.opacity = '1';
                productsGrid.style.transform = 'translateY(0)';
            }, 300);
        });
    });
    
    // Add event listener for search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Add search animation effect
            if (this.value.length > 0) {
                this.classList.add('ring-2', 'ring-farm-light-green');
            } else {
                this.classList.remove('ring-2', 'ring-farm-light-green');
            }
        });
    }
    
    // Add to cart functionality with animation
    const addToCartButtons = document.querySelectorAll('[onclick*="addToCart"]');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const originalText = this.innerHTML;
            
            // Add animation effect
            this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
            
            setTimeout(() => {
                this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Added';
                this.classList.add('bg-farm-light-green');
                
                // Update cart count with animation
                updateCartCount();
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('bg-farm-light-green');
                }, 1500);
            }, 800);
        });
    });
});

// Function to initialize color enhancements
function initColorEnhancements() {
    // Apply enhanced colors to elements
    document.querySelectorAll('.bg-farm-green').forEach(el => {
        el.style.backgroundColor = 'var(--farm-green)';
    });
    
    document.querySelectorAll('.text-farm-green').forEach(el => {
        el.style.color = 'var(--farm-green)';
    });
    
    document.querySelectorAll('.hover\\:text-farm-green').forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.color = 'var(--farm-green)';
        });
        el.addEventListener('mouseleave', function() {
            if (!this.classList.contains('text-farm-green')) {
                this.style.color = '';
            }
        });
    });
    
    document.querySelectorAll('.hover\\:text-farm-light-green').forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.color = 'var(--farm-light-green)';
        });
        el.addEventListener('mouseleave', function() {
            if (!this.classList.contains('text-farm-light-green')) {
                this.style.color = '';
            }
        });
    });
}

// Function to initialize category tab effects
function initCategoryTabEffects() {
    const tabs = document.querySelectorAll('#category-tabs button');
    tabs.forEach(tab => {
        // Add hover effect
        tab.addEventListener('mouseenter', function() {
            if (!this.classList.contains('border-farm-green')) {
                this.style.borderBottomColor = 'var(--farm-light-green)';
                this.style.color = 'var(--farm-light-green)';
            }
        });
        
        tab.addEventListener('mouseleave', function() {
            if (!this.classList.contains('border-farm-green')) {
                this.style.borderBottomColor = '';
                this.style.color = '';
            }
        });
    });
}

// Function to initialize product card animations
function initProductCardAnimations() {
    const productCards = document.querySelectorAll('#products-grid > div');
    
    productCards.forEach((card, index) => {
        // Add staggered entrance animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = 'var(--shadow-hover)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
}

// Function to initialize search effects
function initSearchEffects() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.style.boxShadow = 'var(--shadow-glow)';
            this.style.borderColor = 'var(--farm-light-green)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.style.boxShadow = '';
            this.style.borderColor = '';
        });
    }
}

// Function to initialize button effects
function initButtonEffects() {
    const buttons = document.querySelectorAll('button, .button');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Function to update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const secondaryCartCount = document.getElementById('secondary-cart-count');
    
    if (cartCount) {
        let count = parseInt(cartCount.textContent) || 0;
        count += 1;
        
        cartCount.textContent = count;
        cartCount.classList.add('animate-bounce');
        
        setTimeout(() => {
            cartCount.classList.remove('animate-bounce');
        }, 1000);
    }
    
    if (secondaryCartCount) {
        let count = parseInt(secondaryCartCount.textContent) || 0;
        count += 1;
        
        secondaryCartCount.textContent = count;
        secondaryCartCount.classList.remove('hidden');
        secondaryCartCount.classList.add('animate-bounce');
        
        setTimeout(() => {
            secondaryCartCount.classList.remove('animate-bounce');
        }, 1000);
    }
}

// Function to update cart count display
function updateCartCountDisplay() {
    const cartCount = document.getElementById('cart-count');
    const secondaryCartCount = document.getElementById('secondary-cart-count');
    
    if (cartCount && secondaryCartCount) {
        const count = parseInt(cartCount.textContent) || 0;
        
        if (count > 0) {
            secondaryCartCount.textContent = count;
            secondaryCartCount.classList.remove('hidden');
        }
    }
}