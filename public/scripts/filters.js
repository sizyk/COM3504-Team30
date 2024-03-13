const FILTER_ELEMS = document.querySelectorAll('#filters input, #filters select');
const ALL_PLANTS = Array.from(document.getElementsByClassName('plant-card'));
const CURRENT_FILTERS = {};

function setFilter(filter) {
  filter.checked = filter.dataset.checked === 'true';

  filter.indeterminate = filter.dataset.indeterminate === 'true';
}

function filterPlants() {
  ALL_PLANTS.forEach((plant) => {
    const shouldHide = Object.keys(CURRENT_FILTERS).some((filterFeature) => {
      const filterValue = CURRENT_FILTERS[filterFeature];
      if (filterValue !== 'any' && plant.dataset[filterFeature] !== filterValue) {
        plant.classList.add('hidden');
        return true;
      }
      return false;
    });

    if (!shouldHide) {
      plant.classList.remove('hidden');
    }
  });
}

Array.from(FILTER_ELEMS).forEach((filter) => {
  if (filter.type === 'checkbox') {
    filter.dataset.indeterminate = 'true';
    filter.dataset.checked = 'false';

    setFilter(filter);

    filter.addEventListener('click', () => {
      if (filter.dataset.checked === 'true') {
        filter.dataset.indeterminate = 'true';
        filter.dataset.checked = 'false';
        filter.dataset.filtervalue = 'any';
      } else if (filter.dataset.indeterminate !== 'true') {
        filter.dataset.checked = 'true';
        filter.dataset.filtervalue = 'true';
      } else {
        filter.dataset.indeterminate = 'false';
        filter.dataset.filtervalue = 'false';
      }

      setFilter(filter);
    });
  }

  filter.addEventListener('change', () => {
    if (filter.tagName === 'SELECT') {
      filter.dataset.filtervalue = filter.value.toLowerCase();
    }

    const { filterfeature, filtervalue } = filter.dataset;

    CURRENT_FILTERS[filterfeature] = filtervalue;

    filterPlants();
  });
});
