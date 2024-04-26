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

  document.querySelectorAll('[data-sort-icon]').forEach((icon) => {
    icon.style.rotate = ascendingOrder ? '0deg' : '180deg';
    icon.title = `Click to sort in ${ascendingOrder ? 'ascending' : 'descending'} order`;
  });
}

document.querySelectorAll('[data-sort]').forEach((btn) => {
  btn.addEventListener('click', () => {
    switch (btn.parentElement.querySelector('select').value) {
      case 'Time Seen':
        sortPlantsByDateTimeSeen();
        break;
      default:
        break;
    }
  });
});
