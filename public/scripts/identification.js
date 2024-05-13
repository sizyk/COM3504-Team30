import DBController from './utils/DBController.mjs';

// clears the preview divs to show new data
function clearPreview() {
  document.getElementById('name').innerHTML = '';
  document.getElementById('abtsract').innerHTML = '';
  document.getElementById('uri').innerHTML = '';
  document.getElementById('uri').setAttribute('href', '');
  document.getElementById('error').innerHTML = '';
}

function getIdentification() {
  const urlPrefix = 'http://dbpedia.org/resource/';
  const urlSuffix = document.getElementById('identification').value;
  const resource = urlPrefix + urlSuffix.replace(/ /g, '_');

  // The DBpedia SPARQL endpoint URL
  const endpointUrl = 'https://dbpedia.org/sparql';

  // The SPARQL query to retrieve data for the given resource
  const sparqlQuery = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbo: <http://dbpedia.org/ontology/>

        SELECT ?label ?abstract
        WHERE {
          <${resource}> rdfs:label ?label .
          <${resource}> dbo:abstract ?abstract .
        FILTER (langMatches(lang(?label), "en")) .
        FILTER (langMatches(lang(?abstract), "en")) .
        }`;

  // Encode the query as a URL parameter
  const encodedQuery = encodeURIComponent(sparqlQuery);

  // Build the URL for the SPARQL query
  const url = `${endpointUrl}?query=${encodedQuery}&format=json`;
  // Use fetch to retrieve the data
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      clearPreview();
      const { bindings } = data.results;

      if (bindings[0] === undefined) { // if no data found
        document.getElementById('error').innerHTML = '<strong>Error:</strong> No data found for the given identification';
        document.getElementById('validationCheckbox').checked = false;
      } else { // if data found
        // update the p and a tags
        document.getElementById('name').innerHTML = `<strong>Name: </strong>${bindings[0].label.value}`;
        document.getElementById('abtsract').innerHTML = `<strong>Abstract:</strong> ${bindings[0].abstract.value}`;
        document.getElementById('uri').innerHTML = `<strong>URI:</strong> ${resource}`;
        document.getElementById('uri').setAttribute('href', resource);
        document.getElementById('validationCheckbox').checked = true;
      }
    });
}

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
document.getElementById('validateButton').addEventListener('click', () => {
  getIdentification();
});

document.getElementById('submitValidationButton').addEventListener('click', () => {
  submitIdentification(document.getElementById('identificationForm'));
});
