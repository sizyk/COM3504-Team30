const log = require('debug')('app:db');
// Import the chat model
const ChatModel = require('../models/chat');

// Function to create new chat
exports.create = (chatData) => {
  // Create a new chat model
  const chat = new ChatModel({
    user: chatData.user,
    plant: chatData.plant,
    message: chatData.message,
    dateTime: chatData.dateTime,
  });

  // Save the new plant to the database and handle success or failure
  return chat
    .save()
    .then(() => {
      log(chat);

      // return plant data as a JSON string
      return JSON.stringify(chat);
    })
    .catch((error) => {
      log(error);

      // return null in case of an error
      return null;
    });
};

exports.add = async (chatData) => {
  const chat = { // Get data from the form
    user: chatData.user,
    plant: chatData.plant,
    message: chatData.message,
    dateTime: chatData.dateTime,
  };

  // Update the plant in the database
  let newChat = null;
  try {
    newChat = await ChatModel.create(chat);
    return {
      code: 200,
      message: 'Plant updated successfully!',
      object: newChat,
    };
  } catch (error) {
    log(error);
    return {
      code: 500,
      message: 'Plant failed to upload to MongoDB!',
      object: newChat,
    };
  }
};

// Function to get all plants
exports.getAll = () => ChatModel.find({})
  .then((plants) => JSON.stringify(plants))
  .catch((error) => {
    log(error);

    // return null in case of an error
    return null;
  });

exports.getChat = (filter) => ChatModel.find(filter)
  .then((chats) => chats)
  .catch((e) => {
    log(e);
    return null;
  });
