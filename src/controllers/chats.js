const log = require('debug')('app:db');
// Import the chat model
const ChatModel = require('../models/chat');

/**
 * 'Upserts' (updates or creates) a chat object to the database
 * @param chat {Object} chat to upsert
 */
exports.upsert = async (chat) => {
  // Update the plant in the database
  let newChat = null;
  try {
    newChat = await ChatModel.findByIdAndUpdate(chat._id, chat, { upsert: true, new: true });
    return {
      code: 200,
      message: 'Chat updated successfully!',
      object: newChat,
    };
  } catch (error) {
    log(error);
    return {
      code: 500,
      message: 'Chat failed to upload to MongoDB!',
      object: newChat,
    };
  }
};

// Function to delete chat
exports.delete = async (id) => {
  // Delete the plant from the database
  try {
    await ChatModel.findByIdAndDelete(id);

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
exports.get = (filter) => ChatModel.find(filter)
  .then((plants) => plants)
  .catch((error) => {
    log(error);

    // return null in case of an error
    return null;
  });
