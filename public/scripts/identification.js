import DBController from './utils/DBController.mjs';
import getUsername from './utils/localStore.mjs';

// clears the preview divs to show new data
function clearPreview() {
  document.getElementById('name').innerHTML = '';
  document.getElementById('abtsract').innerHTML = '';
  document.getElementById('uri').innerHTML = '';
  document.getElementById('uri').setAttribute('href', '');
  document.getElementById('error').innerHTML = '';
}

// builds the SPARQL query for the given identification
function buildDBpediaQuery(urlSuffix) {
  const urlPrefix = 'http://dbpedia.org/resource/';
  const resource = urlPrefix + urlSuffix.replace(/ /g, '_');

  // The DBpedia SPARQL endpoint URL
  const endpointUrl = 'https://dbpedia.org/sparql';

  // The SPARQL query to retrieve data for the given resource
  const sparqlQuery = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbo: <http://dbpedia.org/ontology/>

        SELECT ?label ?abstract ?type
        WHERE {
          <${resource}> rdfs:label ?label .
          <${resource}> dbo:abstract ?abstract .
          <${resource}> rdf:type ?type .
        FILTER (langMatches(lang(?label), "en")) .
        FILTER (langMatches(lang(?abstract), "en")) .
        FILTER (?type = dbo:Plant) .
        }`;

  // Encode the query as a URL parameter
  const encodedQuery = encodeURIComponent(sparqlQuery);

  // Build the URL for the SPARQL query
  return `${endpointUrl}?query=${encodedQuery}&format=json`;
}

// gets the identification from the user input and updates the preview div
function getIdentification() {
  const urlSuffix = document.getElementById('identification').value;
  const url = buildDBpediaQuery(urlSuffix);
  // Use fetch to retrieve the data
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      clearPreview();
      const { bindings } = data.results;

      if (bindings[0] === undefined) { // if no data found
        document.getElementById('error').innerHTML = '<strong>Error:</strong> No plant data found for the given identification';
        document.getElementById('validationCheckbox').checked = false;
      } else { // if data found
        const fullURI = `http://dbpedia.org/resource/${urlSuffix.replace(/ /g, '_')}`;
        // update the p and a tags
        document.getElementById('name').innerHTML = `<strong>Name: </strong>${bindings[0].label.value}`;
        document.getElementById('abtsract').innerHTML = `<strong>Abstract:</strong> ${bindings[0].abstract.value}`;
        document.getElementById('uri').innerHTML = `<strong>URI:</strong> ${fullURI}`;
        document.getElementById('uri').setAttribute('href', fullURI);
        document.getElementById('validationCheckbox').checked = true;
      }
    });
}

// uses DBController to update the plant object with the identification
function submitIdentification() {
  // Ensure user has validated their URI
  if (!document.getElementById('validationCheckbox').checked) {
    document.getElementById('error').innerHTML = '<strong>Error:</strong> Please validate your identification before submitting';
    return;
  }
  // get plant object by the id
  const id = window.location.href.split('/').pop();
  DBController.get('plants', { _id: id }, (plants) => {
    const plant = plants[0];
    plant.identificationStatus = 'completed';
    plant.identifiedName = document.getElementById('identification').value;
    DBController.createOrUpdate('plants', plant, () => {
      window.location.href = `/plant/${id}`;
    });
  });
}

/**
 * Add all event listeners that are required for identification functionality
 */
const valButton = document.getElementById('validateButton');
if (valButton !== null) {
  valButton.addEventListener('click', () => {
    getIdentification();
  });
}

const submitValButton = document.getElementById('validateButton');
if (submitValButton !== null) {
  submitValButton.addEventListener('click', () => {
    submitIdentification(document.getElementById('identificationForm'));
  });
}

// get plant object by the id in the url
const plantID = window.location.href.split('/').pop();
DBController.get('plants', { _id: plantID }, (plants) => {
  const plant = plants[0];
  const username = getUsername();
  if (plant.identificationStatus === 'completed' && !window.plantsAppOffline) {
    const urlSuffix = plant.identifiedName;
    const url = buildDBpediaQuery(urlSuffix);
    // Use fetch to retrieve the data
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const { bindings } = data.results;
        const fullURI = `http://dbpedia.org/resource/${urlSuffix.replace(/ /g, '_')}`;
        document.getElementById('description').innerHTML = bindings[0].abstract.value;
        document.getElementById('dbpediaURI').setAttribute('href', fullURI);
        document.getElementById('dbpediaURI').innerHTML = `DBPedia URI: ${fullURI}`;
      });
  } else if (username === plant.author) {
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
});
