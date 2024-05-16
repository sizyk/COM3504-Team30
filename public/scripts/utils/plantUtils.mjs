import { plantAddEvent } from './CustomEvents.mjs';
import PLANT_MAP from '../mapDriver.js';

const plantGrid = document.getElementById('plant-grid');

export const indexPlantTemplate = await fetch('/public/cached-views/plant-card.ejs').then((res) => res.text());
export const singlePlantTemplate = await fetch('/public/cached-views/plant.ejs').then((res) => res.text());

/**
 * Builds a human-readable string to display the time and date at which a plant was spotted
 * @param plant {object} the plant to build a spotted string for
 */
export function buildDateString(plant) {
  const dt = new Date(plant.dateTimeSeen.toString());
  let day = dt.getDate().toString(); // Days are 1-indexed
  day = day > 9 ? day : `0${day}`;

  let month = (dt.getMonth() + 1).toString(); // Months are 0-indexed (consistency!)
  month = month > 9 ? month : `0${month}`;

  const year = dt.getFullYear();

  let hour = dt.getHours().toString();
  hour = hour > 9 ? hour : `0${hour}`;

  let min = dt.getMinutes().toString();
  min = min > 9 ? min : `0${min}`;

  // TODO - why is this 1.25
  // const tz = dt.getTimezoneOffset();

  return `${hour}:${min} on ${day}/${month}/${year}`;
}

/**
 * Updates a plant card to reflect the most current information on that plant
 * @param plant {object} the plant whose plant card must be updated
 */
export default function updateCard(plant) {
  const card = document.getElementById(`card-${plant._id}`);

  const cardImage = card.querySelector('[data-plant-image]');
  const fullImage = document.getElementById('full-image');

  cardImage.style.backgroundImage = `url('${plant.image}')`;
  fullImage.src = plant.image;

  card.querySelector('[data-name]').innerText = plant.name;
  card.querySelector('[data-spotted]').innerText = buildDateString(plant);
  card.querySelector('[data-description]').innerText = plant.description;

  // Update indicator SVGs
  const leafIndicator = card.querySelector('[data-leaves]');

  leafIndicator.querySelector('img').src = `/public/img/icons/has-leaf-${plant.hasLeaves}.svg`;
  leafIndicator.querySelector('img').alt = `An icon showing that the plant has ${plant.hasLeaves ? '' : 'no '}leaves.`;
  leafIndicator.querySelector('span').innerText = `Has ${plant.hasLeaves ? '' : 'no '}leaves.`;

  const flowerIndicator = card.querySelector('[data-flowers]');

  flowerIndicator.querySelector('img').src = `/public/img/icons/flowers-${plant.hasFlowers}.svg`;
  flowerIndicator.querySelector('img').alt = `An icon showing that the plant has ${plant.hasFlowers ? '' : 'no '}flowers.`;
  flowerIndicator.querySelector('span').innerText = `Has ${plant.hasFlowers ? '' : 'no '}flowers.`;

  const fruitIndicator = card.querySelector('[data-fruit]');

  fruitIndicator.querySelector('img').src = `/public/img/icons/fruits-or-nuts-${plant.hasFruit || plant.hasSeeds}.svg`;
  fruitIndicator.querySelector('img').alt = `An icon showing that the plant has ${plant.hasFruit || plant.hasSeeds ? '' : 'no '}fruits or nuts.`;
  fruitIndicator.querySelector('span').innerText = `Has ${plant.hasFruit || plant.hasSeeds ? '' : 'no '}fruits or nuts.`;

  const sunIndicator = card.querySelector('[data-sun]');

  sunIndicator.querySelector('img').src = `/public/img/icons/sun-${plant.sunExposure.toLowerCase()}.svg`;
  sunIndicator.querySelector('img').alt = `An icon showing that the plant has ${plant.sunExposure.toLowerCase().replace('ne', '')} sune exposure.`;
  sunIndicator.querySelector('span').innerText = `${plant.sunExposure.replace('ne', '')} sun exposure.`;

  card.querySelector('[data-colour]').style.backgroundColor = plant.colour;
}

/**
 * Function to display plant cards in an offline-safe manner. Used instead of rendering directly to
 * both improve load times and allow the same code to be used both online and offline.
 * @param card {indexPlantTemplate | singlePlantTemplate} the card with which to render each plant
 * @param plants {Object[]} the list of plants to display
 */
export function displayPlantCards(card, plants) {
  if (PLANT_MAP !== null) {
    PLANT_MAP.clear(); // Clear map to re-place plant pins again
  }

  const noPlants = document.getElementById('no-plants-warning');

  // Clone plant grid and remove all children, to update all plants at once rather than sequentially
  // (which would look bad from a UI perspective, if plants popped into view one-by-one)

  const newGrid = plantGrid.cloneNode();
  newGrid.innerHTML = '';

  const plantCoords = [];

  // Render each new plant and add to the new grid
  plants.forEach((plant) => {
    plant.displayDate = buildDateString(plant);
    plant.dateTimeSeen = new Date(plant.dateTimeSeen);
    // eslint-disable-next-line no-undef
    const renderedTemplate = ejs.render(card, { plant });
    // Add new plant view to HTML & initialise relevant event listeners
    newGrid.insertAdjacentHTML('beforeend', renderedTemplate);

    // Add coordinate to be rendered on the map
    plantCoords.push(
      { _id: plant._id, coordinates: [plant.latitude, plant.longitude], image: plant.image },
    );
  });

  // Add 'no plant' warning
  if (plants.length === 0) {
    noPlants.innerText = "No plants added yet! Click 'Add Plant' to get started.";
    newGrid.appendChild(noPlants);
  }

  // Replace old plant grid (contains a loading GIF) with new one
  plantGrid.replaceWith(newGrid);

  // Update user posted string
  document.dispatchEvent(plantAddEvent);

  if (PLANT_MAP !== null) {
    // Re-add all pants
    PLANT_MAP.pinPlants(plantCoords);
  }
}
