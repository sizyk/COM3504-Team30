// Open IndexedDB with the name "plants"
const requestIDB = indexedDB.open('plants');

// Function to handle IndexedDB upgrade
const handleUpgrade = (ev) => {
  const db = ev.target.result;
  // Create object store for tasks with auto-incrementing key
  const objectStore = db.createObjectStore('plants', { keyPath: 'id', autoIncrement: true });
  objectStore.createIndex('name', 'name', { unique: true });
};

// Function to handle adding a new plants
const handleAdd = () => {
  // Retrieve plant details and add it to the IndexedDB
  const name = document.getElementById('name').value;
  if (name !== '') {
    const plantsIDB = requestIDB.result;
    const transaction = plantsIDB.transaction(['plants'], 'readwrite');
    const plantStore = transaction.objectStore('plants');
    const description = document.getElementById('description').value;
    const dateTimeSeen = document.getElementById('dateTimeSeen').value;
    const size = document.getElementById('size').value;
    const sunExposure = document.getElementById('sunExposure').value;
    const hsColorInput = document.getElementById('hs-color-input').value;
    const hasFlowers = document.getElementById('hasFlowers').value;
    const hasFruit = document.getElementById('hasFruit').value;
    const hasSeeds = document.getElementById('hasSeeds').value;
    let filepath = document.getElementById('image').value;
    filepath = filepath.replace(/\\/g, '/');
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const addRequest = plantStore.add({
      author: 'placeholder',
      name,
      description,
      dateTimeSeen,
      size,
      sunExposure,
      colour: hsColorInput,
      latitude,
      longitude,
      filepath,
      hasFlowers: hasFlowers === 'true',
      hasFruit: hasFruit === 'true',
      hasSeeds: hasSeeds === 'true',
    });
    addRequest.addEventListener('success', () => {
      const getRequest = plantStore.get(addRequest.result);
      getRequest.addEventListener('success', () => {
      });
    });
  }
};

// Function to handle success during IndexedDB initialization
const handleSuccess = () => {
  // Add event listeners to buttons
  const addBtn = document.getElementById('submitButton');
  addBtn.addEventListener('click', handleAdd);

  // // Display the add form after a delay
  // const add_form = document.getElementById('add_form');
  // setTimeout(() => {
  //   add_form.hidden = false;
  // }, 0.8 * 1000); // i.e. in seconds
};

requestIDB.addEventListener('upgradeneeded', handleUpgrade);
requestIDB.addEventListener('success', handleSuccess);
requestIDB.addEventListener('error', (err) => {
  console.log(`ERROR : ${JSON.stringify(err)}`);
});
