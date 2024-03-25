import DBController from './utils/DBController.mjs';
import { showMessage } from './utils/flash-messages.mjs';
import updateCard from './utils/plantUtils.mjs';

function showPosition(position, plantID) {
  document.getElementById(`latitude${plantID}`).value = position.coords.latitude;
  document.getElementById(`longitude${plantID}`).value = position.coords.longitude;
  document.getElementById(`coordinates${plantID}`).value = `(${position.coords.latitude}, ${position.coords.longitude})`;
}

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
    default:
      errorMessage = `Error: ${status}`;
      break;
  }
  document.getElementById(`imagePreviewContainer${plantID}`).classList.add('hidden');
  document.getElementById(`previewError${plantID}`).classList.remove('hidden');
  document.getElementById(`previewError${plantID}`).innerText = errorMessage;
  document.getElementById(`imageValidated${plantID}`).checked = false;
}

function handleCorsError(plantID) {
  document.getElementById(`imagePreviewContainer${plantID}`).classList.add('hidden');
  document.getElementById(`previewError${plantID}`).classList.remove('hidden');
  document.getElementById(`previewError${plantID}`).innerText = 'CORS error: Unable to fetch the resource due to cross-origin restrictions.';
  document.getElementById(`imageValidated${plantID}`).checked = false;
}

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
      // do a fetch request to the url to test for errors
      const response = await fetch(url, {});
      if (response.ok) {
        document.getElementById(`imagePreviewContainer${plantID}`).classList.remove('hidden');
        preview.src = url;
        document.getElementById(`preview${plantID}`).classList.remove('hidden');
        document.getElementById(`previewError${plantID}`).classList.add('hidden');
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('input')); // Trigger input event for form validation
      } else {
        handleErrorResponse(response.status, plantID);
        checkbox.checked = false; // Uncheck the checkbox if validation fails
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        handleCorsError(plantID);
      }
      checkbox.checked = false; // Uncheck the checkbox if an error occurs
    }
  } else {
    const image = document.getElementById(`image${plantID}`);
    const [file] = image.files;
    if (file) {
      document.getElementById(`imagePreviewContainer${plantID}`).classList.remove('hidden');
      document.getElementById(`preview${plantID}`).classList.remove('hidden');
      preview.src = URL.createObjectURL(file);
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('input')); // Trigger input event for form validation
    }
  }
}

function deletePlant(plantID) {
  // eslint-disable-next-line no-alert
  const confirmation = window.confirm('Are you sure you want to delete this plant? This action cannot be undone.');
  if (confirmation) {
    DBController.delete(
      'plants',
      plantID,
      (message) => {
        showMessage(message, 'success', 'delete');

        // Remove plant card
        document.getElementById(plantID.toString()).remove();

        const plantModal = document.getElementById(`${plantID}-edit-plant-modal`);
        if (plantModal !== null) {
          plantModal.classList.remove('active');
        }
      },
    );
  }
}

function toggleImageInput(plantID) {
  // get all the relevant elements
  const imageValidatedCheckbox = document.getElementById(`imageValidated${plantID}`);
  const imagePreviewContainer = document.getElementById(`imagePreviewContainer${plantID}`);
  const imageInputCheckbox = document.getElementById(`imageInputCheckbox${plantID}`);
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
  imageInput.required = plantID === 'New';
  urlInput.required = plantID === 'New';

  // show the correct image input field
  if (imageInputCheckbox.checked) {
    imageDiv.classList.add('hidden');
    urlDiv.classList.remove('hidden');
  } else {
    imageDiv.classList.remove('hidden');
    urlDiv.classList.add('hidden');
    DBController.delete(
      'plants',
      plantID,
      (message) => {
        showMessage(message, 'success', 'delete');

        // Remove plant card
        document.getElementById(plantID.toString()).remove();

        const plantModal = document.getElementById(`${plantID}-edit-plant-modal`);
        if (plantModal !== null) {
          plantModal.classList.remove('active');
        }
      },
    );
  }
}

// Add required event listeners
document.querySelectorAll('[data-click="geolocation"]').forEach((elem) => {
  elem.addEventListener('click', () => getLocation(elem.dataset.plant));
});

document.querySelectorAll('[data-click="delete"]').forEach((elem) => {
  elem.addEventListener('click', () => deletePlant(elem.dataset.plant));
});

document.querySelectorAll('[data-change="preview"]').forEach((elem) => {
  elem.addEventListener('change', () => previewImage(elem.dataset.plant));
});

document.querySelectorAll('[data-click="preview"]').forEach((elem) => {
  elem.addEventListener('click', () => previewImage(elem.dataset.plant));
});

document.querySelectorAll('[data-change="toggle-input"]').forEach((elem) => {
  elem.addEventListener('change', () => toggleImageInput(elem.dataset.plant));
});

document.querySelectorAll('[data-form="plant"]').forEach((formElem) => {
  formElem.addEventListener('submit', () => {
    const params = new FormData(formElem);

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

    const plant = { // Get data from the form
      _id: params.get('_id'),
      author: 'placeholder', // replace with user when implemented
      name: params.get('name'),
      description: params.get('description'),
      dateTimeSeen: new Date(params.get('dateTimeSeen')),
      size: parseFloat(params.get('size')),
      sunExposure: params.get('sunExposure'),
      colour: params.get('colour'),
      longitude: params.get('longitude'),
      latitude: params.get('latitude'),
      hasFlowers: params.get('hasFlowers'),
      hasLeaves: params.get('hasLeaves'),
      hasFruit: params.get('hasFruit'),
      hasSeeds: params.get('hasSeeds'),
      image: params.get('image'),
    };

    DBController.createOrUpdate(
      'plants',
      { obj: plant, formData: params },
      (message, plantObject) => {
        showMessage(message, 'success', 'check_circle');

        const plantModal = document.getElementById(`${plantObject._id}-edit-plant-modal`);
        if (plantModal !== null) {
          plantModal.classList.remove('active');
        } else {
          // plantModal is null - therefore this is a new plant
          window.location.reload(); // Refresh page to get EJS to generate new cards
          return;
        }

        const addModal = document.getElementById('plant-add-modal');
        if (addModal !== null) {
          addModal.classList.remove('active');
        }

        updateCard(plantObject);
      },
    );
  });
});
