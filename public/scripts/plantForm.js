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

// eslint-disable-next-line no-unused-vars
function previewImage(plantID) {
  const image = document.getElementById(`image${plantID}`);
  const [file] = image.files;
  const preview = document.getElementById(`preview${plantID}`);
  if (file) {
    preview.src = URL.createObjectURL(file);
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
