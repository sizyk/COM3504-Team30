import { showMessage } from '../utils/flash-messages.mjs';
import IDB from '../utils/IDB.mjs';
import { buildSpottedString } from '../utils/plantUtils.mjs';
import { initialiseModal } from '../global-scripts/modals.mjs';
import addEventListeners from '../plantForm.js';

showMessage('Connection to server lost! Showing locally stored plants.', 'info', 'wifi_off');

const plantGrid = document.getElementById('plant-grid');

const ejsTemplate = await fetch('/public/cached-views/plant-card.ejs').then((res) => res.text());

IDB.getAll('plants', (e) => {
  e.target.result.forEach((plant) => {
    plant.spottedString = buildSpottedString(plant);
    plant.dateTimeSeen = new Date(plant.dateTimeSeen);
    // eslint-disable-next-line no-undef
    const renderedTemplate = ejs.render(ejsTemplate, { plant });
    // Add new plant view to HTML & initialise relevant event listeners
    plantGrid.insertAdjacentHTML('beforeend', renderedTemplate);

    initialiseModal(document.getElementById(`${plant._id}-edit-plant-modal`));

    // eslint-disable-next-line no-use-before-define
    addEventListeners(document.getElementById(`card-${plant._id}`));
    document.getElementById('no-plants-warning').classList.add('hidden');
  });
});
