// JavaScript for add_new_cattle.html
document.addEventListener('DOMContentLoaded', function() {
  // Get the form element
  const cattleForm = document.getElementById('addCattleForm');
  
  // If the form exists, add a submit event listener
  if (cattleForm) {
    cattleForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get form data
      const formData = new FormData(cattleForm);
      
      // Create a cattle object from form data
      const newCattle = {
        name: formData.get('cattleName') || 'Unnamed',
        breed: formData.get('breed') || 'Unknown',
        age: formData.get('age') ? formData.get('age') + ' years old' : 'Unknown age',
        image: formData.get('imageUrl') || 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?auto=format&fit=crop&w=600&q=80',
        health: formData.get('healthStatus') || 'Good',
        lactationStatus: formData.get('lactationStatus') || 'Active',
        dailyProduction: formData.get('milkProduction') ? formData.get('milkProduction') + ' liters' : '0 liters',
        purchaseDate: formatDate(formData.get('purchaseDate'))
      };
      
      // Get existing cattle from localStorage or create a new array
      let storedCattle = [];
      try {
        const existingCattle = localStorage.getItem('newCattle');
        if (existingCattle) {
          storedCattle = JSON.parse(existingCattle);
        }
      } catch (error) {
        console.error('Error parsing stored cattle:', error);
      }
      
      // Add the new cattle to the array
      storedCattle.push(newCattle);
      
      // Save the updated array back to localStorage
      localStorage.setItem('newCattle', JSON.stringify(storedCattle));
      
      // Show success message
      showToast('Success', 'Cattle added successfully!', 'success');
      
      // Redirect to YourCattle.html after a short delay
      setTimeout(() => {
        window.location.href = 'YourCattle.html';
      }, 1500);
    });
  }
  
  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  }
  
  // Function to show toast notifications
  function showToast(title, message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'destructive' : ''}`;
    
    toast.innerHTML = `
      <div class="flex-1">
        <h3 class="toast-title">${title}</h3>
        <p class="toast-description">${message}</p>
      </div>
      <button class="ml-4 text-gray-400 hover:text-gray-500" onclick="this.parentElement.remove()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
  
  // Helper function to create toast container if it doesn't exist
  function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }
});