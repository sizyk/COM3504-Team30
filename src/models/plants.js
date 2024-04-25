const mongoose = require('mongoose');

// Get the schema class from mongoose
const { Schema } = mongoose;

// Define schema for the plants model
const PlantSchema = new Schema({
  author: { type: String, required: true, max: 32 },
  name: { type: String, required: true, max: 40 }, // longest name of plant is 39 characters
  description: { type: String, required: true },
  dateTimeSeen: { type: Date, required: true },
  size: { type: Number, required: true }, // size in cm
  sunExposure: { type: String, required: true, max: 10 }, // full, partial or none
  colour: { type: String, required: true, max: 10 }, // in hexadecimal format
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  image: { type: String, required: true }, // base64 image
  flag: { type: String, required: true }, // flag emoji
  placeName: { type: String, required: true }, // place display name
  hasFlowers: { type: Boolean, required: true },
  hasLeaves: { type: Boolean, required: true },
  hasFruit: { type: Boolean, required: true },
  hasSeeds: { type: Boolean, required: true },
});

// Configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
PlantSchema.set('toObject', { getters: true, virtuals: true });

// Create the mongoose model 'Plant' based on the defined schema
const Plant = mongoose.model('plant', PlantSchema);

// Export the model for use in other modules
module.exports = Plant;
