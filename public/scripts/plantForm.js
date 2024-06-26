import DBController from './utils/DBController.mjs';
import { showMessage } from './utils/flash-messages.mjs';
import updateEditedPlant, { buildDateString } from './utils/plantUtils.mjs';
import getUsername from './utils/localStore.mjs';
import PLANT_MAP from './mapDriver.js';
import { getFlagEmoji, reverseGeocode } from './utils/geoUtils.mjs';
import { plantAddEvent } from './utils/CustomEvents.mjs';
import initTouchScreen from './global-scripts/touchHover.mjs';

/**
 * Shows coordinates on the form
 * @param position {{coords: {latitude: number, longitude: number}}} the position to display
 * @param plantID {string} the ID of the plant whose form to display them on
 */
function showPosition(position, plantID) {
  document.getElementById(`latitude${plantID}`).value = position.coords.latitude;
  document.getElementById(`longitude${plantID}`).value = position.coords.longitude;

  // Round coordinates to 5 decimal places each
  document.getElementById(`coordinates${plantID}`).value = `(${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)})`;
}

/**
 * Gets a users's location and updates the plant form
 * @param plantID {string} the plant to geolocate
 */
function getLocation(plantID) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      showPosition(position, plantID);
    });
  } else {
    // eslint-disable-next-line no-alert
    alert('Geolocation is not supported by this browser.');
  }
}

/**
 * takes in an error code and adds the appropriate error message to the preview via the DOM
 * @param status {number | string} the status code of the error
 * @param plantID {string} the plantID of the modal to update
 */
function handleErrorResponse(status, plantID) {
  let errorMessage;
  switch (status) {
    case 404:
      errorMessage = 'Invalid URL, not found (404)';
      break;
    case 403:
      errorMessage = 'Forbidden, check permissions of image (403)';
      break;
    case 400:
      errorMessage = 'Bad Request error (400)';
      break;
    case 415:
      errorMessage = 'Image refused to load! Please ensure it has been linked correctly.';
      break;
    case 'not-validated':
      errorMessage = "Please validate your image URL first! (click 'Preview')";
      break;
    case 'large':
      errorMessage = 'File too large! (Max. 10MB)';
      break;
    default:
      errorMessage = `Error: ${status}`;
      break;
  }
  document.getElementById(`imagePreviewContainer${plantID}`).classList.add('hidden');
  document.getElementById(`previewError${plantID}`).classList.remove('hidden');
  document.getElementById(`previewError${plantID}`).innerText = errorMessage;
  document.getElementById(`imageValidated${plantID}`).checked = false;
}

/**
 * Handles a CORS error by updating the preview with an error message
 * CORS: Cross-Origin Resource Sharing, means that the resource is not allowed to be fetched
 * @param plantID {string} the plantID of the modal to update
 */
function handleCorsError(plantID) {
  document.getElementById(`imagePreviewContainer${plantID}`).classList.add('hidden');
  document.getElementById(`previewError${plantID}`).classList.remove('hidden');
  document.getElementById(`previewError${plantID}`).innerText = 'CORS error: Unable to fetch the resource due to cross-origin restrictions.';
  document.getElementById(`imageValidated${plantID}`).checked = false;
}

/**
 * Shows a preview of an uploaded file
 * @param plantID {string} the ID of the plant to preview
 */
async function previewImage(plantID) {
  const preview = document.getElementById(`preview${plantID}`);
  const checkbox = document.getElementById(`imageValidated${plantID}`);
  // loading image changes on whether you use a file or a URL
  if (document.getElementById(`imageInputCheckbox${plantID}`).checked) {
    const url = document.getElementById(`url${plantID}`).value;
    // check if the URL is from the same origin or empty and throw error if so
    if (new URL(document.baseURI).origin === new URL(url, document.baseURI).origin) {
      handleErrorResponse(404, plantID);
      return;
    }
    try {
      document.getElementById(`imagePreviewContainer${plantID}`).classList.remove('hidden');
      preview.previousElementSibling.classList.remove('hidden');
      preview.classList.add('hidden');
      // do a fetch request to the url to test for errors
      const response = await fetch(url, {});
      if (response.ok) {
        preview.previousElementSibling.classList.add('hidden');
        preview.src = url;
        preview.classList.remove('hidden');
        document.getElementById(`previewError${plantID}`).classList.add('hidden');
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('input')); // Trigger input event for form validation
      } else {
        preview.previousElementSibling.classList.add('hidden');
        handleErrorResponse(response.status, plantID);
        checkbox.checked = false; // Uncheck the checkbox if validation fails
      }
    } catch (error) {
      preview.previousElementSibling.classList.add('hidden');
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        handleCorsError(plantID);
      } else {
        // idk the error so make it a 404
        handleErrorResponse(404);
      }
      checkbox.checked = false; // Uncheck the checkbox if an error occurs
    }
  } else {
    const image = document.getElementById(`image${plantID}`);
    const [file] = image.files;
    if (file.size < 10485760) { // max. file size 10MB
      document.getElementById(`previewError${plantID}`).classList.add('hidden');
      document.getElementById(`imagePreviewContainer${plantID}`).classList.remove('hidden');
      document.getElementById(`preview${plantID}`).classList.remove('hidden');
      preview.src = URL.createObjectURL(file);
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('input')); // Trigger input event for form validation
    } else {
      handleErrorResponse('large', plantID);
    }
  }
}

/**
 * Deletes a plant from the index page
 * @param plantID {string} the ID of the plant to delete
 */
function deletePlant(plantID) {
  // eslint-disable-next-line no-alert
  const confirmation = window.confirm('Are you sure you want to delete this plant? This action cannot be undone.');
  if (confirmation) {
    DBController.delete(
      'plants',
      plantID,
      () => {
        window.location.href = '/';
      },
    );
  }
}

/**
 * Toggles between image input and URL input, and changes the required attribute accordingly
 * @param plantID {string} the ID of the plant modal to update the input for
 */
function toggleImageInput(plantID) {
  // get all the relevant elements
  const shouldShowUrl = document.getElementById(`imageInputCheckbox${plantID}`);
  const imageValidatedCheckbox = document.getElementById(`imageValidated${plantID}`);
  const imagePreviewContainer = document.getElementById(`imagePreviewContainer${plantID}`);
  const imageDiv = document.getElementById(`imageDiv${plantID}`);
  const imageInput = document.getElementById(`image${plantID}`);
  const urlDiv = document.getElementById(`urlDiv${plantID}`);
  const urlInput = document.getElementById(`url${plantID}`);
  const previewError = document.getElementById(`previewError${plantID}`);

  // invalidate image on every change
  imageValidatedCheckbox.checked = false;
  imagePreviewContainer.classList.add('hidden');
  previewError.classList.add('hidden');

  // images are only required for new plants, not edits
  imageInput.required = plantID === 'New' && !shouldShowUrl.checked;
  urlInput.required = plantID === 'New' && shouldShowUrl.checked;

  // show the correct image input field
  if (shouldShowUrl.checked) {
    imageDiv.classList.add('hidden');
    urlDiv.classList.remove('hidden');
  } else {
    imageDiv.classList.remove('hidden');
    urlDiv.classList.add('hidden');
  }
}

// clears all inputs in the create plant form
function clearForm() {
  const form = document.getElementById('createPlantForm');
  form.querySelectorAll('input').forEach((input) => {
    input.value = '';
  });
  form.querySelectorAll('textarea').forEach((textarea) => {
    textarea.value = '';
  });
  form.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
}

/**
 * Submits a plant to the database, for creation (or updating)
 * @param plant {Object} the plant object to submit
 */
function submitPlantToDB(plant) {
  return new Promise((resolve, reject) => {
    DBController.createOrUpdate(
      'plants',
      plant,
      (message, plantObject) => {
        const editPlantModal = document.getElementById('edit-plant-modal');
        if (editPlantModal !== null) {
          updateEditedPlant(plantObject);
          if (!window.plantsAppOffline) {
            // Update plant's pin on the map
            PLANT_MAP.updatePlantCoordinates(plantObject);
          }
          resolve();
        } else {
          plantObject.displayDate = buildDateString(plantObject);
          // editPlantModal is null - therefore this is a new plant
          clearForm();
          // query server to generate its card on-the-fly
          fetch('/public/cached-views/plant-card.ejs', {
            method: 'GET',
            headers: {
              'Content-Type': 'text/html',
            },
          }).then((res) => res.text())
            .then((p) => {
              plantObject.dateTimeSeen = new Date(plantObject.dateTimeSeen);
              // eslint-disable-next-line no-undef
              const renderedTemplate = ejs.render(p, { plant: plantObject });
              // Add new plant view to HTML & initialise relevant event listeners
              document.getElementById('plant-grid').insertAdjacentHTML('beforeend', renderedTemplate);

              // eslint-disable-next-line no-use-before-define
              addEventListeners(document.getElementById(`card-${plantObject._id}`));

              const noPlants = document.getElementById('no-plants-warning');
              if (noPlants !== null) {
                noPlants.classList.add('hidden');
              }

              if (!window.plantsAppOffline) {
                PLANT_MAP.pinPlants([
                  {
                    _id: plantObject._id,
                    image: plantObject.image,
                    coordinates: [plantObject.latitude, plantObject.longitude],
                  },
                ]);
              }

              // Enable touch hover on the new cards
              initTouchScreen();

              resolve();
            })
            .catch((e) => {
              // eslint-disable-next-line no-console
              console.error(e);
              reject(new Error('Plant failed to add! Please try again.'));
            });
        }
      },
    );
  });
}

// Set the max date for the date input to the current date and time adjusted for timezone
function setDatetimeMax() {
  const dateInput = document.getElementById('dateTimeSeen');
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  dateInput.max = localDateTime;
}

/**
 * Submits the add plant form, or a plant's edit form, and updates the page live
 * @param formElem {HTMLFormElement} the form element that has been submitted
 */
async function submitPlantForm(formElem) {
  setDatetimeMax(); // reset the max date to the current date and time
  const params = new FormData(formElem);
  const shouldShowUrl = formElem.querySelector('[data-change="toggle-input"]');

  // Set ID on form submit, rather than on page load
  if (!params.has('_id')) {
    params.set('_id', Date.now());
  }

  // Checkboxes have no value if not checked, so manually check whether they are true
  params.set('hasFlowers', params.get('hasFlowers') === 'true');
  params.set('hasLeaves', params.get('hasLeaves') === 'true');
  params.set('hasFruit', params.get('hasFruit') === 'true');
  params.set('hasSeeds', params.get('hasSeeds') === 'true');

  if (/^\d+$/.test(params.get('_id').toString())) {
    // Convert ID to hex string if it's just an integer
    const hexID = parseInt(params.get('_id').toString(), 10).toString(16);
    params.set('_id', hexID.padStart(24, '0'));
  }
  // Get username from localStore
  const username = getUsername();
  // If username is not set do nothing
  if (username == null) {
    return new Promise((resolve, reject) => { reject(new Error('No username found! Please log in before adding a plant.')); });
  }

  let lat = params.get('latitude').toString();
  let lng = params.get('longitude').toString();

  if (lat === null) {
    lat = '0';
  }

  if (lng === null) {
    lng = '0';
  }

  const { displayName, countryCode } = await reverseGeocode(lat, lng);

  // Only check for geo error if not offline
  if (!window.plantsAppOffline && displayName === 'error') {
    return new Promise((resolve, reject) => { reject(new Error('Geocoding failed! Please try again.')); });
  }

  const flagEmoji = getFlagEmoji(countryCode);

  const plant = { // Get data from the form
    _id: params.get('_id'),
    author: username, // replace with user when implemented
    name: params.get('name').trim(),
    description: params.get('description').trim(),
    dateTimeSeen: new Date(params.get('dateTimeSeen')),
    flag: flagEmoji,
    placeName: displayName,
    size: params.get('size'),
    sunExposure: params.get('sunExposure'),
    colour: params.get('colour'),
    latitude: lat,
    longitude: lng,
    hasFlowers: params.get('hasFlowers'),
    hasLeaves: params.get('hasLeaves'),
    hasFruit: params.get('hasFruit'),
    hasSeeds: params.get('hasSeeds'),
    identificationStatus: 'in-progress', // completed or in-progress
    identifiedName: '', // URI reference to plant
  };

  // If user is using a URL, simply add it to the plant
  if (shouldShowUrl.checked) {
    // Only update URL if one was passed
    if (params.get('url').trim().length > 0) {
      plant.image = params.get('url').trim();
    }

    return new Promise((resolve, reject) => {
      submitPlantToDB(plant).then(resolve).catch(reject);
    });
  }

  return new Promise((resolve, reject) => {
    // If not using a URL, read file as base64
    const reader = new FileReader();

    reader.addEventListener('loadend', () => {
      // Only update image if one was actually uploaded
      if (reader.result.substring(reader.result.indexOf(',') + 1).length > 0) {
        plant.image = reader.result;
      }

      submitPlantToDB(plant).then(resolve).catch(reject);
    });

    reader.readAsDataURL(params.get('image'));
  });
}

/**
 * Add all event listeners that are required for plant form functionality
 */
export default function addEventListeners(card) {
  let id = card.dataset.plant;
  if (document.getElementById('editPlantForm')) {
    id = 'Edit';
  }

  card.querySelectorAll('[data-click="geolocation"]').forEach((elem) => {
    elem.addEventListener('click', () => getLocation(id));
  });

  card.querySelectorAll('[data-click="delete"]').forEach((elem) => {
    elem.addEventListener('click', () => deletePlant(id));
  });

  card.querySelectorAll('[data-change="preview"]').forEach((elem) => {
    elem.addEventListener('change', () => previewImage(id));
  });

  card.querySelectorAll('[data-click="preview"]').forEach((elem) => {
    elem.addEventListener('click', () => previewImage(id));
  });

  card.querySelectorAll('[data-form="plant"]').forEach((formElem) => {
    formElem.addEventListener('submit', () => submitPlantForm(formElem));
  });

  card.querySelectorAll('[data-change="toggle-input"]').forEach((elem) => {
    elem.addEventListener('change', () => toggleImageInput(id));
  });

  // Wrap these last two in try/catch as single querySelector means event listener will throw error
  // if nothing is found
  try {
    // If image cannot be loaded for whatever reason, throw a 415 error (Unsupported Media Type)
    card.querySelector('[data-img="preview"]').addEventListener('error', () => handleErrorResponse(415, id));
  } catch (e) { /* empty */ }

  try {
    card.querySelector('input[name="url"]').addEventListener('keydown', (e) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        previewImage(id).then(() => {
        });
      }
    });
  } catch (e) { /* empty */ }
}

/**
 * Runs the form submission function in the background, to make it non-blocking
 * @param plantAddForm {HTMLFormElement} the form element to submit
 */
function submitBackgroundTaskAdd(plantAddForm) {
  // Ensure user has validated their image
  if (document.getElementById('imageInputCheckboxNew').checked && !document.getElementById('imageValidatedNew').checked) {
    handleErrorResponse('not-validated', 'New');
    return;
  }

  // Hide form and inform user that plant is being added in the background
  document.getElementById('plant-add-modal').classList.remove('active');
  showMessage('Adding plant...', 'info', 'info', true);

  // Run async submit function
  submitPlantForm(plantAddForm)
    .then(() => {
      showMessage('Plant added successfully!', 'success', 'done');
      document.dispatchEvent(plantAddEvent);
    })
    .catch((e) => {
      showMessage(e, 'error', 'error');
    });
}

function submitBackgroundTaskEdit() {
  // Ensure user has validated their image
  if (document.getElementById('imageInputCheckboxEdit').checked && !document.getElementById('imageValidatedEdit').checked) {
    handleErrorResponse('not-validated', 'New');
    return;
  }

  // Hide form and inform user that plant is being added in the background
  document.getElementById('edit-plant-modal').classList.remove('active');
  showMessage('Adding plant...', 'info', 'info', true);

  showMessage('Plant edited successfully!', 'success', 'done');
}

/**
 * Initialises all forms on the screen
 */
export function initForm() {
  const plantAddForm = document.getElementById('createPlantForm');
  if (plantAddForm) {
    plantAddForm.addEventListener('submit', () => submitBackgroundTaskAdd(plantAddForm));
    addEventListeners(plantAddForm);
  }

  const plantEditForm = document.getElementById('editPlantForm');
  if (plantEditForm) {
    plantEditForm.addEventListener('submit', () => submitBackgroundTaskEdit(plantEditForm));
    addEventListeners(plantEditForm);
  }

  document.querySelectorAll('[data-plant-card]').forEach(addEventListeners);

  setDatetimeMax();

  // Handle new location being passed from location picker
  document.addEventListener('pick-location', (e) => {
    // Convert location to format expected by showPosition
    const location = {
      coords: {
        latitude: e.detail.lat,
        longitude: e.detail.lng,
      },
    };

    showPosition(location, e.detail.plantID);
  });
}

try {
  initForm();
} catch (e) { /* fail silently */ }
