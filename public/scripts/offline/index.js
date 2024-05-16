import { showMessage } from '../utils/flash-messages.mjs';
import { displayPlantCards, indexPlantTemplate } from '../utils/plantUtils.mjs';
import DBController from '../utils/DBController.mjs';

showMessage('Connection to server lost! Showing locally stored plants.', 'info', 'wifi_off');

DBController.get('plants', {}, (plants) => displayPlantCards(indexPlantTemplate, plants));
