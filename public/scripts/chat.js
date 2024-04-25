import DBController from './utils/DBController.mjs';
import { showMessage } from './utils/flash-messages.mjs';
import IDB from './utils/IDB.mjs';
import getUsername from './utils/localStore.mjs';

let sendButton;
let userInput;
let chatbox;
let chatContainer;
let openChatButton;
let closeChatButton;

// Remove trailing forward slash (if any) and parse to get plant ID
const [roomId] = window.location.href.replace(/\/$/, '').split('/').slice(-1);

let socket = null;
if (typeof io !== 'undefined') {
  // eslint-disable-next-line no-undef
  socket = io();
}

/**
 * Encodes a string to hexadecimal string
 * @param string
 * @returns {string}
 */
function hexEncode(string) {
  let result = '';

  for (let i = 0; i < string.length; i += 1) {
    result += string.charCodeAt(i).toString(16);
  }
  return result;
}

/**
 * Creates a unique ID for a chat message using the timestamp and username
 * encoded in hexadecimal and padded to 24 characters to match MongoDB ObjectID
 * @param timestamp
 * @param username
 * @returns {string}
 */
function createUniqueId(timestamp, username) {
  const timestampString = timestamp.toString(16);
  const usernameTo16 = hexEncode(username);
  const truncatedUsername = usernameTo16.slice(0, 24 - timestampString.length);
  return (timestampString + truncatedUsername).padEnd(24, '0');
}

/**
 * Add a message to the chatbox
 * @param {string} message - The message to add
 * @param {string} user - The user who sent the message
 */
function addUserMessage(message, user) {
  const messageElement = document.createElement('div');
  // Get username from localStore
  const username = getUsername();
  // If username is not set do nothing
  if (username == null) {
    return;
  }
  if (user === username) {
    messageElement.classList.add('mb-2', 'text-right');
    messageElement.innerHTML = `<p class="bg-primary text-white dark:text-on-secondary rounded-lg py-2 px-4 inline-block">You: ${message}</p>`;
  } else {
    messageElement.classList.add('mb-2');
    messageElement.innerHTML = `<p class="bg-gray-300 text-gray-950 dark:text-on-secondary rounded-lg py-2 px-4 inline-block">${user}: ${message}</p>`;
  }
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}

/**
 * Connects to socket io room if online and saves all chats to IDB
 */
function connectToRoom() {
  if (socket && navigator.onLine) {
    // Get username from localStore
    const username = getUsername();
    // If username is not set do nothing
    if (username == null) {
      return;
    }
    socket.emit('create or join', roomId, username);
  }

  DBController.get('chats', { plant: roomId }, (chats) => {
    chats.forEach((chat) => {
      // PUT all chats to IDB, to ensure that the latest version of all are saved locally
      // eslint-disable-next-line no-console
      IDB.put('chats', chat, () => {}, console.error);
      addUserMessage(chat.message, chat.user);
    });
  });
}

/**
 * Toggles the chatbox to be open or closed
 */
function toggleChatbox() {
  chatContainer.classList.toggle('hidden');
}

/**
 * Receives a chat message from the server and updates the chatbox
 * @param params - The chat message
 */
function receiveChat(params) {
  try {
    const newChat = {
      _id: createUniqueId(params.dateTime, params.user),
      user: params.user,
      plant: params.plant,
      message: params.message,
      dateTime: params.dateTime,
    };
    DBController.createOrUpdate('chats', newChat, () => {}, () => showMessage('Failed to add chat. Please try again.', 'error', 'error'));
    addUserMessage(params.message, params.user);
  } catch (error) {
    showMessage('Failed to send message', 'error');
  }
}

/**
 * Sends a chat message to the socketIO chatroom
 */
function sendChatMessage() {
  const userMessage = userInput.value;
  // Get username from localStore
  const username = getUsername();
  console.log(username, userMessage);
  // If username is not set do nothing
  if (username == null) {
    return;
  }
  if (userMessage.trim() !== '') {
    const timestamp = Date.now();
    const newChat = {
      _id: createUniqueId(timestamp, username),
      user: username,
      plant: roomId,
      message: userMessage,
      dateTime: timestamp,
    };
    if (socket && navigator.onLine) {
      socket.emit('chat', roomId, newChat);
    } else {
      receiveChat(newChat);
    }
    userInput.value = '';
  }
}

export function addChatEventListeners() {
  openChatButton.addEventListener('click', toggleChatbox);

  closeChatButton.addEventListener('click', toggleChatbox);

  sendButton.addEventListener('click', (event) => {
    event.preventDefault();
    sendChatMessage();
  });

  userInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendChatMessage();
    }
  });
}

export default function initChat() {
  sendButton = document.getElementById('send-button');
  userInput = document.getElementById('user-input');
  chatbox = document.getElementById('chatbox');
  chatContainer = document.getElementById('chat-interface');
  openChatButton = document.getElementById('open-chat');
  closeChatButton = document.getElementById('close-chat');
  addChatEventListeners();
  connectToRoom();
}

if (socket) {
  socket.on('chat', receiveChat);
}

try {
  initChat();
} catch (e) { /* empty */ }
