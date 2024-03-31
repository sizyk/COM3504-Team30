import DBController from './utils/DBController.mjs';
import { showMessage } from './utils/flash-messages.mjs';
import IDB from './utils/IDB.mjs';

let sendButton = document.getElementById('send-button');
let userInput = document.getElementById('user-input');
let chatbox = document.getElementById('chatbox');
let chatContainer = document.getElementById('chat-interface');
let openChatButton = document.getElementById('open-chat');
let closeChatButton = document.getElementById('close-chat');

// Remove trailing forward slash (if any) and parse to get plant ID
const [roomId] = window.location.href.replace(/\/$/, '').split('/').slice(-1);
const userId = 'user-placeholder'; // repace with local storage or something i guess
// const formElem = document.getElementById('chat-form');

let socket = null;
if (typeof io !== 'undefined') {
  // eslint-disable-next-line no-undef
  socket = io();
}

let isChatboxOpen = false;

function addUserMessage(message, user) {
  const messageElement = document.createElement('div');
  if (user === userId) {
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
    socket.emit('create or join', roomId, userId);
  }

  DBController.get('chats', { plant: roomId }, (chats) => {
    chats.forEach((chat) => {
      // PUT all chats to IDB, to ensure that the latest version of all are saved locally
      IDB.put('chats', chat, () => {}, console.error);
      addUserMessage(chat.message, chat.user);
    });
  });
}

function clearChatbox() {
  chatbox.innerHTML = '';
}

function toggleChatbox() {
  chatContainer.classList.toggle('hidden');
  isChatboxOpen = !isChatboxOpen;
  if (isChatboxOpen) {
    connectToRoom();
  } else if (!isChatboxOpen) {
    clearChatbox();
  }
}

function receiveChat(params) {
  try {
    const newChat = {
      _id: Date.now().toString(16).padStart(24, '0'), // Auto-generate id
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

function sendChatMessage() {
  const userMessage = userInput.value;
  if (userMessage.trim() !== '') {
    const newChat = {
      _id: Date.now().toString(16).padStart(24, '0'),
      user: userId,
      plant: roomId,
      message: userMessage,
      dateTime: Date.now(),
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
