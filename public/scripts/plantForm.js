function getLocation(plantID) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            showPosition(position, plantID);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function showPosition(position, plantID) {
    document.getElementById('latitude' + plantID).value = position.coords.latitude;
    document.getElementById('longitude' + plantID).value = position.coords.longitude;
    document.getElementById('coordinates' + plantID).value =
        `(${position.coords.latitude}, ${position.coords.longitude})`;
}

function previewImage(plantID) {
    let image = document.getElementById('image' + plantID);
    let [file] = image.files;
    let preview = document.getElementById('preview' + plantID);
    if (file) {
        preview.src = URL.createObjectURL(file);
    }
}

function deletePlant(plantID) {
    const confirmation = confirm('Are you sure you want to delete this plant? This action cannot be undone.');
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