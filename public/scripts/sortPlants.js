import { showMessage } from './utils/flash-messages.mjs';

const EARTH_RADIUS = 6378.137; // km

let userCoords = null;

let ascendingOrder = true;

/**
 * Computes the haversine distance between two coordinates
 * Formula from: https://community.esri.com/t5/coordinate-reference-systems-blog/distance-on-a-sphere-the-haversine-formula/ba-p/902128
 * @param lat1 {number} the latitude of the first point
 * @param lng1 {number} the longitude of the first point
 * @param lat2 {number} the latitude of the second point
 * @param lng2 {number} the longitude of the second point
 * @returns {number} the distance (in metres) between the two points
 */
function calculateHaversine(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * (Math.PI / 180); // deg2rad below
  const dLon = (lng2 - lng1) * (Math.PI / 180);

  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

/**
 * Comparison function to sort two plants by date posted
 * @param a {HTMLDivElement} the first plant to compare
 * @param b {HTMLDivElement} the second plant to compare
 * @returns {number} the difference in date posted between the two plants
 */
function dateTimeComparison(a, b) {
  const dateTimeSeenA = new Date(a.dataset.datetimeseen);
  const dateTimeSeenB = new Date(b.dataset.datetimeseen);
  if (ascendingOrder) {
    return dateTimeSeenA - dateTimeSeenB;
  }
  return dateTimeSeenB - dateTimeSeenA;
}

/**
 * Comparison function to sort two plants by distance from the user
 * @param a {HTMLDivElement} the first plant to compare
 * @param b {HTMLDivElement} the second plant to compare
 * @returns {number} the difference in distance between the two plants
 */
function geoComparison(a, b) {
  // Computes haversine distance between two plants and the user's location
  // https://en.wikipedia.org/wiki/Haversine_formula

  const lat1 = parseFloat(a.dataset.latitude);
  const lng1 = parseFloat(a.dataset.longitude);
  const lat2 = parseFloat(b.dataset.latitude);
  const lng2 = parseFloat(b.dataset.longitude);

  const distA = calculateHaversine(lat1, lng1, userCoords.latitude, userCoords.longitude);
  const distB = calculateHaversine(lat2, lng2, userCoords.latitude, userCoords.longitude);

  if (ascendingOrder) {
    return distA - distB;
  }
  return distB - distA;
}

/**
 * General function that can sort all plants by a given comparison function
 * @param compareFn {<HTMLDivElement>(a: HTMLDivElement, b: HTMLDivElement) => number}
 * the comparison function to use in sorting
 */
function sortPlants(compareFn) {
  const plantCardsContainer = document.getElementById('plant-grid');
  const plantCards = Array.from(plantCardsContainer.querySelectorAll('[data-plant-card]'));

  // Sort plant cards based on dateTimeSeen attribute
  plantCards.sort(compareFn);

  // Remove existing plant cards from container
  plantCardsContainer.innerHTML = '';

  // Re-append sorted plant cards to container
  plantCards.forEach((plantCard) => plantCardsContainer.appendChild(plantCard));

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
        sortPlants(dateTimeComparison);
        break;
      case 'Distance':
        // Get user location & cache it, to prevent annoying popup every time user clicks on sort
        if (userCoords === null) {
          navigator.geolocation.getCurrentPosition((position) => {
            userCoords = position.coords;
            sortPlants(geoComparison);
          }, () => {
            showMessage('Current location unavailable!', 'error', 'error');
          }, {
            // Use cached position for up to an hour
            maximumAge: 60 * 60 * 1000,
            // Timeout after 5 seconds
            timeout: 5000,
          });
        } else {
          sortPlants(geoComparison);
        }
        break;
      default:
        break;
    }
  });
});
