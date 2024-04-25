import { showMessage } from '../utils/flash-messages.mjs';
import DBController from '../utils/DBController.mjs';
import { buildDateString } from '../utils/plantUtils.mjs';
import { initialiseModal } from '../global-scripts/modals.mjs';
import addEventListeners from '../plantForm.js';
import initChat from '../chat.js';

showMessage('Connection to server lost! Showing locally stored info & chats.', 'info', 'wifi_off');

const mainElem = document.getElementById('card');

const ejsTemplate = await fetch('/public/cached-views/plant.ejs').then((res) => res.text()).catch(() => {
  mainElem.insertAdjacentHTML('afterbegin', '<h2 class="text-3xl font-bold text-center">Failed to load view! Try clearing your cache & reloading when connected.</h2>');
});

// Remove trailing forward slash (if any) and parse to get plant ID
const [plantID] = window.location.href.replace(/\/$/, '').split('/').slice(-1);

// Get requested plant and render
DBController.get('plants', { _id: plantID }, (plants) => {
  if (plants.length === 0) {
    mainElem.insertAdjacentHTML('afterbegin', '<h2 class="text-3xl font-bold text-center">Unknown plant ID!</h2>');
    return;
  }

  // If template failed to load, its type will not be string as it will be void
  if (typeof ejsTemplate !== 'string') {
    return;
  }

  const plant = plants[0];

  plant.displayDate = buildDateString(plant);
  plant.dateTimeSeen = new Date(plant.dateTimeSeen);

  // eslint-disable-next-line no-undef
  mainElem.insertAdjacentHTML('afterbegin', ejs.render(ejsTemplate, { plant }));

  mainElem.id = `card-${plantID}`;
  mainElem.dataset.plant = plantID;

  initialiseModal(document.getElementById(`${plant._id}-edit-plant-modal`));

  // eslint-disable-next-line no-use-before-define
  addEventListeners(document.getElementById(`card-${plant._id}`));

  initChat();
});
