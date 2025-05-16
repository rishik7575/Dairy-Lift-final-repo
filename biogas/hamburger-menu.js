// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu-button');
    
    // Toggle menu visibility when hamburger button is clicked
    hamburgerButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
    });
    
    // Close menu when close button is clicked
    closeMenuButton.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnHamburger = hamburgerButton.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnHamburger && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
        }
    });
});