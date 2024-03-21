const mongoose = require('mongoose');

// Get the schema class from mongoose
const { Schema } = mongoose;

// Define schema for the plants model
const ChatSchema = new Schema({
  user: { type: String, required: true, max: 32 },
  plant: { type: String, required: true, max: 40 },
  message: { type: String, required: true, max: 256 },
  dateTime: { type: Date, required: true },
});

// Configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
ChatSchema.set('toObject', { getters: true, virtuals: true });

// Create the mongoose model 'Plant' based on the defined schema
const Chat = mongoose.model('plant', ChatSchema);

// Export the model for use in other modules
module.exports = Chat;
