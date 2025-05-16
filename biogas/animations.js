/**
 * SmartDairy - Animations and Dynamic Effects
 * This script adds dynamic animations and interactive effects to the website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll animations
    initScrollAnimations();
    
    // Add dynamic navbar effects
    initNavbarEffects();
    
    // Add hover effects to cards and buttons
    initHoverEffects();
    
    // Add loading animations
    initLoadingAnimations();
});

/**
 * Initialize scroll-based animations for elements with reveal classes
 */
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    // Initial check on page load
    checkRevealElements();
    
    // Check elements on scroll
    window.addEventListener('scroll', checkRevealElements);
    
    function checkRevealElements() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            } else {
                // Optional: remove the class if you want the animation to replay when scrolling back up
                // element.classList.remove('active');
            }
        });
    }
}

/**
 * Add dynamic effects to the navbar on scroll
 */
function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }
}

/**
 * Add interactive hover effects to cards and buttons
 */
function initHoverEffects() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', createRippleEffect);
    });
    
    function createRippleEffect(e) {
        const button = e.currentTarget;
        
        // Remove any existing ripple elements
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        button.appendChild(ripple);
        
        // Position the ripple
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        
        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Add tilt effect to cards
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', handleCardTilt);
        card.addEventListener('mouseleave', resetCardTilt);
    });
    
    function handleCardTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = (y - centerY) / 10;
        const tiltY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    }
    
    function resetCardTilt(e) {
        const card = e.currentTarget;
        card.style.transform = '';
    }
}

/**
 * Initialize loading animations for dynamic content
 */
function initLoadingAnimations() {
    // Add loading animation to stats
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
        const targetValue = parseInt(stat.textContent);
        animateCounter(stat, 0, targetValue, 1500);
    });
    
    function animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
}

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);