const mongoose = require('mongoose');
const log = require('debug')('app:db');

// Define the MongoDB connection URL including the database name
const mongoDB = 'mongodb://localhost:27017/com3504';

// Set Monmgoose to use ES6 Promises
mongoose.Promise = global.Promise;

// Connect to the MongoDB database using Mongoose
mongoose
  .connect(mongoDB)
  .then((result) => {
    // Store connection instance for later use if needed
    global.conn = result.connection;
    // Log a success message if connection is established
    log('Successfully connected to the MongoDB database');
  })
  .catch((error) => {
    // Log an error if there is an error connecting to the database
    log('Error connecting to the MongoDB database');
    log(error);
  });
