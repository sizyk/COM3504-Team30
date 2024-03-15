const FILTER_ELEMS = document.querySelectorAll('#filters input, #filters select');
const ALL_PLANTS = Array.from(document.getElementsByClassName('plant-card'));
const CURRENT_FILTERS = {};

/**
 * Cycle a checkbox through checked/indeterminate/unchecked, and update CURRENT_FILTERS accordingly
 * (for some reason straight up modifying `checkbox.checked` or `checkbox.indeterminate` doesn't
 * work, so used a data- element to store the values of checked and indeterminate
 * @param checkbox {HTMLInputElement} the checkbox to use
 */
function handleCheckbox(checkbox) {
  if (checkbox.dataset.checked === 'true') {
    checkbox.dataset.indeterminate = 'false';
    checkbox.dataset.checked = 'false';

    CURRENT_FILTERS[checkbox.dataset.filterfeature] = 'false';
  } else if (checkbox.dataset.indeterminate === 'true') {
    checkbox.dataset.indeterminate = 'false';
    checkbox.dataset.checked = 'true';

    CURRENT_FILTERS[checkbox.dataset.filterfeature] = 'true';
  } else {
    checkbox.dataset.indeterminate = 'true';

    CURRENT_FILTERS[checkbox.dataset.filterfeature] = 'any';
  }

  checkbox.checked = checkbox.dataset.checked === 'true';
  checkbox.indeterminate = checkbox.dataset.indeterminate === 'true';
}

/**
 * Updates CURRENT_FILTERS to reflect the state of a select element
 * @param select {HTMLSelectElement} the select element to use
 */
function handleSelect(select) {
  CURRENT_FILTERS[select.dataset.filterfeature] = select.value.toLowerCase();
}

/**
 * Decides whether a plant should be hidden, based on a single filter feature
 * @param plant {HTMLDivElement} the plant card to perform filtering on
 * @param filterFeature {string} the feature that determines whether the plant should be hidden
 * @returns {boolean} true if plant should be hidden, given the current filters, else false
 */
function shouldHide(plant, filterFeature) {
  const filterValue = CURRENT_FILTERS[filterFeature];
  if (filterValue !== 'any' && plant.dataset[filterFeature] !== filterValue) {
    plant.classList.add('hidden');
    return true;
  }
  return false;
}

/**
 * Performs filtering on all plants currently rendered on the page
 */
function filterPlants() {
  ALL_PLANTS.forEach((plant) => {
    if (!Object.keys(CURRENT_FILTERS).some((feature) => shouldHide(plant, feature))) {
      plant.classList.remove('hidden');
    }
  });
}

// Initialise filter elements
Array.from(FILTER_ELEMS).forEach((filter) => {
  if (filter.type === 'checkbox') {
    filter.dataset.indeterminate = 'true';
    filter.indeterminate = true;
    filter.dataset.checked = 'false';
    filter.checked = false;

    CURRENT_FILTERS[filter.dataset.filterfeature] = 'any';

    filter.addEventListener('click', () => handleCheckbox(filter));
  } else if (filter.tagName === 'SELECT') {
    filter.value = 'Any';
  }

  filter.addEventListener('change', () => {
    if (filter.tagName === 'SELECT') {
      handleSelect(filter);
    }

    filterPlants();
  });
});

// Initial filter to catch page refreshes
filterPlants();
