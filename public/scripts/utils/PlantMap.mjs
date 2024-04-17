// Import leaflet L constant from window
const { L } = window;

/*
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */
// eslint-disable-next-line no-underscore-dangle
const originalInitTile = L.GridLayer.prototype._initTile;
L.GridLayer.include({
  // eslint-disable-next-line no-underscore-dangle
  _initTile(tile) {
    originalInitTile.call(this, tile);

    const tileSize = this.getTileSize();

    tile.style.width = `${tileSize.x + 1}px`;
    tile.style.height = `${tileSize.y + 1}px`;
  },
});

/**
 * Constructs a custom leaflet DivIcon for a given plant. The plant's image will be
 * in a circle, with an arrow below pointing the the plant's location
 * @param plant {{_id: string, image: string}} the plant to create an icon for
 * @returns {L.DivIcon} the DivIcon for the plant
 */
function getPlantIcon(plant) {
  return new L.DivIcon({
    className: '',
    html: `<a href="/plant/${plant._id}" style="background-image: url('${plant.image}');" class="plant-icon"></a>`,
    iconAnchor: [32, 77], // half of width + border size, height + overflow of arrow
  });
}

/**
 * A class used as a wrapper for leaflet mapping functionalities
 * @class PlantMap
 * @constructor
 * @public
 */
export default class PlantMap {
  static MIN_ZOOM = 0;

  static MAX_ZOOM = 18;

  static PLANT_ICON = new L.Icon({
    iconUrl: '/public/img/map-icons/plant-pin.png',

    iconSize: [45, 64],
    iconAnchor: [23, 64],
  });

  /**
   * Constructor for the PlantMap class
   * @param id {string} The ID of the map's div (usually 'map')
   * @param variablesID {string} The ID of the div containing details about plant being displayed
   */
  constructor(id = 'map', variablesID = 'js-variables') {
    this._tiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    this._attributionLabel = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    // zoomControl: false to prevent controls from being placed in the upper left of the map
    this._map = L.map(id, { zoomControl: false, zoomSnap: 1 });
    this._mapDiv = document.getElementById(id);
    this._viewReset = false;

    // Invalidate size to ensure entire map div is taken up by map
    // Prevents need for fixed width/height
    this._mapDiv.addEventListener('leaflet-invalidate', () => {
      this._map.invalidateSize();
      if (!this._viewReset) {
        this.resetMapView();
        this._viewReset = true;
      }
    });

    L.tileLayer(this._tiles, {
      maxZoom: PlantMap.MAX_ZOOM,
      minZoom: PlantMap.MIN_ZOOM,
      attribution: this._attributionLabel,
    }).addTo(this._map);

    // add zoom control in top right
    L.control.zoom({
      position: 'topright',
    }).addTo(this._map);

    // Get variables from view
    const JSVarDiv = document.getElementById(variablesID);
    this._plantMarkers = {};

    if (JSVarDiv !== null) {
      this.pinPlants(JSON.parse(JSVarDiv.dataset.plants));
      this._mapCentre = JSON.parse(JSVarDiv.dataset.centre);
    } else {
      this._mapCentre = [0, 0];
    }

    this.resetMapView();
  }

  /**
   * Resets the map view, ensuring it is centred on the desired plant
   */
  resetMapView() {
    const pinGroup = L.featureGroup(Object.values(this._plantMarkers));
    this._map.fitBounds(pinGroup.getBounds());
  }

  /**
   * Draws pins for a list of plant coordinates, and stores them in an object
   * @param plants {{id: string, coordinates: int[]}[]}
   */
  pinPlants(plants) {
    plants.forEach((plant) => {
      this._plantMarkers[plant._id] = L.marker(plant.coordinates, { icon: getPlantIcon(plant) });
      this._plantMarkers[plant._id].addTo(this._map);
    });
  }

  /**
   * Updates the marker for a given plant
   * @param plant {{_id: string, latitude: int, longitude: int}} the plant to update
   */
  updatePlantCoordinates(plant) {
    this._plantMarkers[plant._id].setLatLng(new L.LatLng(plant.latitude, plant.longitude));
  }
}
