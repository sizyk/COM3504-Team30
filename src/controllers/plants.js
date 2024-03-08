// Import the plants model
const plantModel = require('../models/plants');

// Function to create new plants
exports.create = function (plantData) {
    // Create a new plant model
    let plant = new plantModel({
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
    return plant.save().then(plant => {
        console.log(plant);

        // return plant data as a JSON string
        return JSON.stringify(plant);
    }).catch(error => {
        console.log(error);

        // return null in case of an error
        return null;
    });
};

// Function to get all plants
exports.getAll = function () {
    // Retrieve all plants from the database
    return plantModel.find({}).then(plants => {
        // return plant data as a JSON string
        return JSON.stringify(plants);
    }).catch(error => {
        console.log(error);

        // return null in case of an error
        return null;
    });
};
