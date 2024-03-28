import DBController from './utils/DBController.mjs';
import initSyncing from './global-scripts/syncing.mjs';

const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const chatbox = document.getElementById('chatbox');
const chatContainer = document.getElementById('chat-interface');
const openChatButton = document.getElementById('open-chat');
const closeChatButton = document.getElementById('close-chat');
const roomId = document.getElementById('plant-id').value;
const userId = document.getElementById('user-id').value;
// const formElem = document.getElementById('chat-form');

// eslint-disable-next-line no-undef
const socket = io();

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
  if (navigator.onLine) {
    socket.emit('create or join', roomId, userId);
    socket.emit('oldMessages', roomId);
  } else {
    DBController.getChatsByPlant(roomId, (event) => {
      const chats = event.target.result;
      console.log(chats);
      chats.forEach((chat) => {
        addUserMessage(chat.message, chat.user);
      });
    });
  }
}

function clearChatbox() {
  chatbox.innerHTML = '';
}

function toggleChatbox() {
  chatContainer.classList.toggle('hidden');
  console.log('Toggled chatbox');
  isChatboxOpen = !isChatboxOpen;
  if (isChatboxOpen && navigator.onLine) {
    connectToRoom();
  } else if (!isChatboxOpen) {
    console.log('Clearing chatbox');
    clearChatbox();
  }
}

openChatButton.addEventListener('click', toggleChatbox);

closeChatButton.addEventListener('click', toggleChatbox);

function sendChatMessage() {
  const userMessage = userInput.value;
  if (userMessage.trim() !== '') {
    const newChat = {
      _id: Date.now().toString(),
      user: userId,
      plant: roomId,
      message: userMessage,
      dateTime: Date.now(),
    };
    if (navigator.onLine) {
      socket.emit('chat', roomId, newChat);
    } else {
      addUserMessage(userMessage, userId);
      DBController.addChat(newChat);
    }
    userInput.value = '';
  }
}

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

function init() {
  // socket.on('joined', (roomNo, userId) {
  // }

  socket.on('chat', (params) => {
    try {
      const newChat = {
        _id: Date.now().toString(), // Auto-generate id
        user: params.user,
        plant: params.plant,
        message: params.message,
        dateTime: params.dateTime,
      };
      console.log(newChat);
      DBController.addChat(newChat);
      addUserMessage(params.message, params.user);
    } catch (error) {
      console.error('Error saving message:', error);
    }
    console.log(params);
  });

  socket.on('oldMessages', (messages) => {
    console.log(messages);
    messages.forEach((chat) => {
      addUserMessage(chat.message, chat.user);
      DBController.addChat(chat, true);
    });
  });
}

window.onload = () => {
  init();
  initSyncing();
};
