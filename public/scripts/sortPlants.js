let ascendingOrder = true;

// Function to sort plant cards by dateTimeSeen
function sortPlantsByDateTimeSeen() {
  const plantCardsContainer = document.getElementById('plant-grid');
  const plantCards = Array.from(plantCardsContainer.querySelectorAll('[data-plant-card]'));

  // Sort plant cards based on dateTimeSeen attribute
  plantCards.sort((a, b) => {
    const dateTimeSeenA = new Date(a.dataset.datetimeseen);
    const dateTimeSeenB = new Date(b.dataset.datetimeseen);
    if (ascendingOrder) {
      return dateTimeSeenA - dateTimeSeenB;
    }
    return dateTimeSeenB - dateTimeSeenA;
  });

  // Remove existing plant cards from container
  plantCardsContainer.innerHTML = '';

  // Re-append sorted plant cards to container
  plantCards.forEach((plantCard) => {
    plantCardsContainer.appendChild(plantCard);
  });

  // Toggle sorting order for next click
  ascendingOrder = !ascendingOrder;
  // Update sort button icon based on sorting order
  const sortIcon = document.getElementById('sort-icon');
  const sortIconSmall = document.getElementById('sort-icon-small');
  sortIcon.innerText = ascendingOrder ? 'arrow_drop_up' : 'arrow_drop_down'; // Up or down arrow symbol
  sortIconSmall.innerText = ascendingOrder ? 'arrow_drop_up' : 'arrow_drop_down';
}

// Add event listener to sort button
const sortButton = document.getElementById('sort-button');
const sortButtonSmall = document.getElementById('sort-button-small');
sortButton.addEventListener('click', sortPlantsByDateTimeSeen);
sortButtonSmall.addEventListener('click', sortPlantsByDateTimeSeen);
