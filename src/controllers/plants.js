const log = require('debug')('app:db');
// Import the plants model
const PlantModel = require('../models/plants');

/**
 * 'Upserts' (updates or creates) a plant object to the database
 * @param plant {Object} plant to upsert
 */
exports.upsert = async (plant) => {
  // Update the plant in the database
  let newPlant = null;
  try {
    newPlant = await PlantModel.findByIdAndUpdate(plant._id, plant, { upsert: true, new: true });
    return {
      code: 200,
      message: 'Plant updated successfully!',
      object: newPlant,
    };
  } catch (error) {
    log(error);
    return {
      code: 500,
      message: 'Plant failed to upload to MongoDB!',
      object: newPlant,
    };
  }
};

// Function to delete plant
exports.delete = async (id) => {
  // Delete the plant from the database
  try {
    await PlantModel.findByIdAndDelete(id);

    return {
      code: 200,
      message: 'Successfully deleted plant!',
    };
    // Redirect to some page or send a response indicating success
  } catch (error) {
    log(error);
    return {
      code: 500,
      message: 'Failed to delete plant!',
    };
  }
};

// Function to get all plants
exports.get = (filter) => PlantModel.find(filter)
  .then((plants) => {
    plants.forEach((p) => {
      const dt = new Date(p.dateTimeSeen.toString());
      let day = dt.getDate().toString(); // Days are 1-indexed
      day = day > 9 ? day : `0${day}`;

      let month = (dt.getMonth() + 1).toString(); // Months are 0-indexed (consistency!)
      month = month > 9 ? month : `0${month}`;

      const year = dt.getFullYear();

      let hour = dt.getHours().toString();
      hour = hour > 9 ? hour : `0${hour}`;

      let min = dt.getMinutes().toString();
      min = min > 9 ? min : `0${min}`;

      // const tz = dt.getTimezoneOffset();

      p.spottedString = `${hour}:${min} on ${day}/${month}/${year}, in Sheffield `;

      p.emoji = '🇬🇧';
    });

    return plants;
  })
  .catch((error) => {
    log(error);

    // return null in case of an error
    return null;
  });
