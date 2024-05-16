// Import leaflet L constant from window
import { leafletInvalidateEvent } from './CustomEvents.mjs';

const { L } = window;

/*
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */
if (!window.plantsAppOffline) {
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
}

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
    iconAnchor: [32, 77], // half of width, height + overflow of arrow
  });
}

/**
 * Creates a leaflet DivIcon for a new plant
 * @returns {L.DivIcon} the DivIcon created
 */
function getNewPlantIcon() {
  return new L.DivIcon({
    className: '',
    // pointer-events: none to remove hover effect
    html: `<div class="plant-icon bg-background dark:bg-background-inverse pointer-events-none">
             <img src="/public/img/icons/has-leaf-true.svg" alt="An Image of a Leaf" class="h-full w-full"/>
           </div>`,
    iconAnchor: [32, 77], // half of width, height + overflow of arrow
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

  /**
   * Constructor for the PlantMap class
   * @param id {string} The ID of the map's div (usually 'map')
   * @param variablesID {string} The ID of the div containing details about plant being displayed
   * @param type {'display' | 'pickLocation'} the type of the map - whether it is being used to
   *                                          display plants, or to pick a location
   */
  constructor(id = 'map', variablesID = 'js-variables', type = 'display') {
    if (window.plantsAppOffline) {
      return;
    }

    this._tiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    this._attributionLabel = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    // zoomControl: false to prevent controls from being placed in the upper left of the map
    this._map = L.map(id, { zoomControl: false, zoomSnap: 1, worldCopyJump: true });
    this._mapDiv = document.getElementById(id);
    this._viewReset = false;

    // Invalidate size to ensure entire map div is taken up by map
    // Prevents need for fixed width/height
    this._mapDiv.addEventListener(leafletInvalidateEvent.type, () => {
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

    this._backupCentre = new L.LatLng(0, 0);

    if (JSVarDiv !== null && type === 'display') {
      this.pinPlants(JSON.parse(JSVarDiv.dataset.plants));
    }

    // Location-picker specific setup
    if (type === 'pickLocation') {
      this._chosenLocation = null;

      // Place submit button onto map
      this._mapDiv.insertAdjacentHTML(
        'afterbegin',
        `<button 
            id="submit-location" 
            class="hover-button absolute top-3 left-3 z-[1000] px-3 py-2 rounded flex items-center gap-2 font-bold" 
            style="font-size: 1rem"
            data-close="modal"
            data-target="pick-location-modal"
        >
          <span class="material-symbols-outlined">check_circle</span>
          Done
        </button>`,
      );

      document.getElementById('submit-location').addEventListener('click', () => {
        let event;
        // Create new custom event to pass coordinates of chosen location out of this map
        if (this._chosenLocation === null) {
          event = new CustomEvent('pick-location', { detail: { lat: 0, lng: 0 } });
        } else {
          const latlng = this._chosenLocation.getLatLng().wrap();
          event = new CustomEvent('pick-location', { detail: { lat: latlng.lat, lng: latlng.lng } });
        }

        document.dispatchEvent(event);
      });

      this._mapDiv.style.cursor = 'pointer';
      this._map.on('click', (e) => {
        if (this._chosenLocation === null) {
          this._chosenLocation = new L.Marker(e.latlng, { icon: getNewPlantIcon(e.latlng) });
          this._chosenLocation.addTo(this._map);
        } else {
          this._chosenLocation.setLatLng(e.latlng);
        }
      });
    }

    this.resetMapView();
  }

  /**
   * Resets the map view, ensuring it is centred on the desired plant (or [0,0] for location picker)
   */
  resetMapView() {
    if (Object.keys(this._plantMarkers).length > 0) {
      const pinGroup = L.featureGroup(Object.values(this._plantMarkers));
      this._map.fitBounds(pinGroup.getBounds());
    } else {
      this._map.setView(this._backupCentre, 3);
    }
  }

  clear() {
    Object.values(this._plantMarkers).forEach((element) => {
      element.removeFrom(this._map);
    });

    this._plantMarkers = {};
  }

  /**
   * Draws pins for a list of plant coordinates, and stores them in an object
   * @param plants {{_id: string, coordinates: int[], image: string}[]}
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
