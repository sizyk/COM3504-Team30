/* eslint import/extensions: 0 */
import PlantMap from './utils/PlantMap.mjs';

// eslint-disable-next-line no-unused-vars
const PLANT_MAP = window.plantsAppOffline ? null : new PlantMap();

export default PLANT_MAP;
