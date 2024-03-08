const mongoose = require('mongoose');

// Define the MongoDB connection URL including the database name
const mongoDB = 'mongodb://localhost:27017/com3504';
let connection;

// Set Monmgoose to use ES6 Promises
mongoose.Promise = global.Promise;

// Connect to the MongoDB database using Mongoose
mongoose.connect(mongoDB).then(result => {
    //Store connection instance for later use if needed
    connection = result.connection;
    // Log a success message if connection is established
    console.log('Successfully connected to the MongoDB database');
}).catch(error => {
    // Log an error if there is an error connecting to the database
    console.log('Error connecting to the MongoDB database');
    console.error(error);
});