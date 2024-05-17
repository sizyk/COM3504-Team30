import { showMessage } from '../utils/flash-messages.mjs';
import DBController from '../utils/DBController.mjs';
import { buildDateString, singlePlantTemplate } from '../utils/plantUtils.mjs';
import { initialiseModal } from '../global-scripts/modals.mjs';
import { initForm } from '../plantForm.js';
import initChat, { addUserMessage } from '../chat.js';
import getUsername from '../utils/localStore.mjs';

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

  mainElem.id = 'plant';
  mainElem.dataset.plant = plantID;
  mainElem.dataset.identified = String(plant.identificationStatus === 'completed');

  initialiseModal(document.getElementById('edit-plant-modal'));
  initialiseModal(document.getElementById('image-full-modal'));

  if (getUsername() === plant.author && plant.identificationStatus !== 'completed') {
    // plant can be edited and identified only if user==author & plant is not identified
    const idButton = document.getElementById('identify-button');
    if (idButton !== null) {
      idButton.classList.remove('hidden');
    }

    const editButton = document.getElementById('edit-button');
    if (editButton !== null) {
      editButton.classList.remove('hidden');
    }
  }

  initForm();

  initChat();

  // Get all chats for the requested plant
  DBController.get('chats', { plant: plantID }, (chats) => {
    chats.forEach((chat) => addUserMessage(chat.message, chat.user));
  }, () => { /* fail silently */ });
});
