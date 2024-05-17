import { showMessage } from '../utils/flash-messages.mjs';
import DBController from '../utils/DBController.mjs';
import { buildDateString, singlePlantTemplate } from '../utils/plantUtils.mjs';
import { initialiseModal } from '../global-scripts/modals.mjs';
import addEventListeners from '../plantForm.js';
import initChat from '../chat.js';

showMessage('Connection to server lost! Showing locally stored info & chats.', 'info', 'wifi_off');

const mainElem = document.getElementById('plant-grid');

// Remove trailing forward slash (if any) and parse to get plant ID
const [plantID] = window.location.href.replace(/\/$/, '').split('/').slice(-1);

// Get requested plant and render
DBController.get('plants', { _id: plantID }, (plants) => {
  if (plants.length === 0) {
    mainElem.insertAdjacentHTML('afterbegin', '<h2 class="text-3xl font-bold text-center">Unknown plant ID!</h2>');
    return;
  }

  const plant = plants[0];

  plant.displayDate = buildDateString(plant);
  plant.dateTimeSeen = new Date(plant.dateTimeSeen);

  // eslint-disable-next-line no-undef
  mainElem.insertAdjacentHTML('afterbegin', ejs.render(singlePlantTemplate, { plant }));

  mainElem.id = `card-${plantID}`;
  mainElem.dataset.plant = plantID;

  initialiseModal(document.getElementById(`${plant._id}-edit-plant-modal`));
  initialiseModal(document.getElementById('image-full-modal'));

  // eslint-disable-next-line no-use-before-define
  addEventListeners(document.getElementById(`card-${plant._id}`));

  initChat();
});
