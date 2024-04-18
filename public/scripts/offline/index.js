import { showMessage } from '../utils/flash-messages.mjs';
import { buildSpottedString } from '../utils/plantUtils.mjs';
import DBController from '../utils/DBController.mjs';

showMessage('Connection to server lost! Showing locally stored plants.', 'info', 'wifi_off');

const plantGrid = document.getElementById('plant-grid');

const ejsTemplate = await fetch('/public/cached-views/plant-card.ejs').then((res) => res.text());

DBController.get('plants', {}, (plants) => {
  plants.forEach((plant) => {
    plant.spottedString = buildSpottedString(plant);
    plant.dateTimeSeen = new Date(plant.dateTimeSeen);
    // eslint-disable-next-line no-undef
    const renderedTemplate = ejs.render(ejsTemplate, { plant });
    // Add new plant view to HTML & initialise relevant event listeners
    plantGrid.insertAdjacentHTML('beforeend', renderedTemplate);

    document.getElementById('no-plants-warning').classList.add('hidden');
  });
});
