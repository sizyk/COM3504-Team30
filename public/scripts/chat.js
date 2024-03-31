import DBController from './utils/DBController.mjs';
import initSyncing from './global-scripts/syncing.mjs';
import { showMessage } from './utils/flash-messages.mjs';

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
    fetch(`/api/chat/${roomId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          data.forEach((msg) => {
            addUserMessage(msg.message, msg.user);
            DBController.addChat(msg, true, () => {}, () => {});
          });
        }
      })
      .catch((error) => console.error('Error:', error));
  } else {
    DBController.getChatsByPlant(roomId, (chats) => {
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
  isChatboxOpen = !isChatboxOpen;
  if (isChatboxOpen) {
    connectToRoom();
  } else if (!isChatboxOpen) {
    clearChatbox();
  }
}

openChatButton.addEventListener('click', toggleChatbox);

closeChatButton.addEventListener('click', toggleChatbox);

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
    if (navigator.onLine) {
      socket.emit('chat', roomId, newChat);
    } else {
      addUserMessage(userMessage, userId);
      DBController.addChat(newChat, false, () => {});
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
  socket.on('chat', (params) => {
    try {
      const newChat = {
        _id: Date.now().toString(16).padStart(24, '0'), // Auto-generate id
        user: params.user,
        plant: params.plant,
        message: params.message,
        dateTime: params.dateTime,
      };
      DBController.addChat(newChat, false, () => {});
      addUserMessage(params.message, params.user);
    } catch (error) {
      showMessage('Failed to send message', 'error');
    }
  });

  socket.on('oldMessages', (messages) => {
    // Possibly fetch old messages from IDB if messages are empty - need to discuss
    messages.forEach((chat) => {
      addUserMessage(chat.message, chat.user);
      DBController.addChat(chat, true, () => {});
    });
  });
}

window.onload = () => {
  init();
  initSyncing();
};
