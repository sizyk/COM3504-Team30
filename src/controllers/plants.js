const log = require('debug')('app:db');
// Import the plants model
const PlantModel = require('../models/plants');

// Function to create new plants
exports.create = (plantData) => {
  // Create a new plant model
  const plant = new PlantModel({
    author: plantData.author,
    name: plantData.name,
    description: plantData.description,
    dateTimeSeen: plantData.dateTimeSeen,
    size: plantData.size,
    sunExposure: plantData.sunExposure,
    colour: plantData.colour,
    longitude: plantData.longitude,
    latitude: plantData.latitude,
    image: plantData.image,
    hasFlowers: plantData.hasFlowers,
    hasLeaves: plantData.hasLeaves,
    hasFruit: plantData.hasFruit,
    hasSeeds: plantData.hasSeeds,
  });

  // Save the new plant to the database and handle success or failure
  return plant
    .save()
    .then(() => {
      log(plant);

      // return plant data as a JSON string
      return JSON.stringify(plant);
    })
    .catch((error) => {
      log(error);

      // return null in case of an error
      return null;
    });
};

// Function to get all plants
exports.getAll = () => PlantModel.find({})
  .then((plants) => JSON.stringify(plants))
  .catch((error) => {
    log(error);

    // return null in case of an error
    return null;
  });
