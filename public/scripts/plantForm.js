const log = require('debug')('app:db');

function showPosition(position, plantID) {
  document.getElementById(`latitude${plantID}`).value = position.coords.latitude;
  document.getElementById(`longitude${plantID}`).value = position.coords.longitude;
  document.getElementById(`coordinates${plantID}`).value = `(${position.coords.latitude}, ${position.coords.longitude})`;
}
// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
async function previewImage(plantID) {
  const preview = document.getElementById(`preview${plantID}`);
  const checkbox = document.getElementById(`imageValidated${plantID}`);

  if (document.getElementById(`imageInputCheckbox${plantID}`).checked) {
    const url = document.getElementById(`url${plantID}`).value;

    try {
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
      } else {
        log(error);
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

// eslint-disable-next-line no-unused-vars
function deletePlant(plantID) {
  // eslint-disable-next-line no-alert
  const confirmation = window.confirm('Are you sure you want to delete this plant? This action cannot be undone.');
  if (confirmation) {
    fetch('/delete-plant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: plantID }),
    });
    window.location.href = '/';
  }
}

// eslint-disable-next-line no-unused-vars
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

  if (plantID === 'New') { // images are only required for new plants, not edits
    imageInput.required = !imageInput.required;
    urlInput.required = !urlInput.required;
  }

  // show the correct image input field
  if (imageInputCheckbox.checked) {
    imageDiv.classList.add('hidden');
    urlDiv.classList.remove('hidden');
  } else {
    imageDiv.classList.remove('hidden');
    urlDiv.classList.add('hidden');
  }
}
