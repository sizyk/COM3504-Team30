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
 * A class used as a wrapper for leaflet mapping functionalities
 * @class PlantMap
 * @constructor
 * @public
 */
export default class PlantMap {
  static MIN_ZOOM = 0;

  static MAX_ZOOM = 18;

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
    if (JSVarDiv !== null) {
      this._plant = JSON.parse(JSVarDiv.dataset.plant);
    } else {
      this._plant = null;
    }

    this._plantIcon = new L.Icon({
      iconUrl: '/public/img/map-icons/plant-pin.png',

      iconSize: [45, 64],
      iconAnchor: [23, 64],
    });

    this.resetMapView();
    this.placePin(this._plant.coordinates);
  }

  /**
   * Resets the map view, ensuring it is centred on the desired plant
   */
  resetMapView() {
    this._map.setView(this._plant.coordinates, 15);
  }

  placePin(coordinates) {
    new L.Marker(coordinates, { icon: this._plantIcon }).addTo(this._map);
  }
}
