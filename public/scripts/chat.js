import DBController from './utils/DBController.mjs';
import { showMessage } from './utils/flash-messages.mjs';
import IDB from './utils/IDB.mjs';
import getUsername from './utils/localStore.mjs';

let sendButton = document.getElementById('send-button');
let userInput = document.getElementById('user-input');
let chatbox = document.getElementById('chatbox');
let chatContainer = document.getElementById('chat-interface');
let openChatButton = document.getElementById('open-chat');
let closeChatButton = document.getElementById('close-chat');

// Remove trailing forward slash (if any) and parse to get plant ID
const [roomId] = window.location.href.replace(/\/$/, '').split('/').slice(-1);

let socket = null;
if (typeof io !== 'undefined') {
  // eslint-disable-next-line no-undef
  socket = io();
}

let isChatboxOpen = false;

function hexEncode(string) {
  let result = '';

  for (let i = 0; i < string.length; i += 1) {
    result += string.charCodeAt(i).toString(16);
  }
  return result;
}

function createMongoId(timestamp, username) {
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
 * Clears the chatbox of all messages
 */
function clearChatbox() {
  chatbox.innerHTML = '';
}

/**
 * Toggles the chatbox to be open or closed
 */
function toggleChatbox() {
  chatContainer.classList.toggle('hidden');
  isChatboxOpen = !isChatboxOpen;
  if (isChatboxOpen) {
    connectToRoom();
  } else if (!isChatboxOpen) {
    clearChatbox();
  }
}

/**
 * Receives a chat message from the server and updates the chatbox
 * @param params - The chat message
 */
function receiveChat(params) {
  try {
    const newChat = {
      _id: createMongoId(params.dateTime, params.user),
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
  // If username is not set do nothing
  if (username == null) {
    return;
  }
  if (userMessage.trim() !== '') {
    const timestamp = Date.now();
    const newChat = {
      _id: createMongoId(timestamp, username),
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

export default function addChatEventListeners() {
  sendButton = document.getElementById('send-button');
  userInput = document.getElementById('user-input');
  chatbox = document.getElementById('chatbox');
  chatContainer = document.getElementById('chat-interface');
  openChatButton = document.getElementById('open-chat');
  closeChatButton = document.getElementById('close-chat');

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

if (socket) {
  socket.on('chat', receiveChat);
}

try {
  addChatEventListeners();
} catch (e) { /* empty */ }
