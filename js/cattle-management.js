function loadCattleCards() {
  const cattleContainer = document.getElementById('cattle-container');
  const cattleData = JSON.parse(localStorage.getItem('cattle')) || [];
  
  cattleContainer.innerHTML = '';
  
  cattleData.forEach(cattle => {
    const card = createCattleCard(cattle);
    cattleContainer.appendChild(card);
  });
}

function createCattleCard(cattle) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in';
  
  card.innerHTML = `
    <div class="relative h-48 overflow-hidden">
      <img 
        src="${cattle.imageUrl || 'placeholder.jpg'}" 
        alt="${cattle.breed} ${cattle.gender}"
        class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
      <div class="absolute top-2 right-2 bg-dairy-yellow text-dairy-dark font-semibold text-xs py-1 px-2 rounded-full">
        ${cattle.gender}
      </div>
    </div>
    
    <div class="p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-bold text-dairy-dark">${cattle.tagId}</h3>
        <span class="font-bold text-dairy-green">
          ₹${parseFloat(cattle.purchasePrice).toLocaleString()}
        </span>
      </div>
      
      <p class="text-sm font-medium text-dairy-green mb-2">${cattle.breed}</p>
      
      <p class="text-gray-600 text-sm mb-4 line-clamp-2">${cattle.notes || 'No additional notes'}</p>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-xs font-medium text-gray-500">${cattle.healthStatus}</span>
        </div>
        
        <button 
          onclick="viewCattleDetails('${cattle.id}')"
          class="bg-dairy-green hover:bg-dairy-green/90 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  `;
  
  return card;
}

function viewCattleDetails(id) {
  // Implement the logic to view cattle details
  console.log('Viewing details for cattle:', id);
  // You can redirect to a details page or show a modal with the cattle details
}

// Load cattle cards when the page loads
document.addEventListener('DOMContentLoaded', loadCattleCards);