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

  if (Object.prototype.hasOwnProperty.call(plant, 'image')) {
    if (cardImage) {
      cardImage.src = plant.image;
    } else {
      card.style.backgroundImage = `url('${plant.image}')`;
    }
  }

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

export function renderCardsOffline() {

}
