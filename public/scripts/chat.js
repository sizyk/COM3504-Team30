const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const chatbox = document.getElementById('chatbox');
const chatContainer = document.getElementById('chat-interface');
const openChatButton = document.getElementById('open-chat');
const closeChatButton = document.getElementById('close-chat');
const roomId = document.getElementById('plant-id').innerText;
const userId = document.getElementById('user-id').innerText;

const socket = io();

let isChatboxOpen = false;

function connectToRoom() {
  socket.emit('create or join', roomId, userId);
}

function toggleChatbox() {
  chatContainer.classList.toggle('hidden');
  isChatboxOpen = !isChatboxOpen;
  if (isChatboxOpen) {
    connectToRoom();
  }
}

openChatButton.addEventListener('click', toggleChatbox);

closeChatButton.addEventListener('click', toggleChatbox);

function addUserMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('mb-2', 'text-right');
  messageElement.innerHTML = `<p class="bg-primary text-white dark:text-on-secondary rounded-lg py-2 px-4 inline-block">${message}</p>`;
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}

sendButton.addEventListener('click', () => {
  const userMessage = userInput.value;
  if (userMessage.trim() !== '') {
    socket.emit('chat', roomId, userId, userMessage);
    userInput.value = '';
  }
});

userInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    const userMessage = userInput.value;
    if (userMessage.trim() !== '') {
      socket.emit('chat', roomId, userId, userMessage);
      userInput.value = '';
    }
  }
});

function init() {
  // socket.on('joined', (roomNo, userId) {
  // }
  socket.on('chat', (room, user, chatText) => {
    addUserMessage(chatText);

    console.log(chatText);
  });
  socket.on('oldMessages', (messages) => {
    messages.forEach((chat) => {
      addUserMessage(chat.message);
    });
  });
}

window.onload = () => {
  init();
  // if('serviceWorker' in navigator) {
  //   navigator.serviceWorker.register('/sw.js', { scope: `/plant/${roomId}` })
  //     .then(r  =>{
  //
  //     })
  //     .catch(err => {
  //
  //   });
  // }
  // if (navigator.onLine) {
  //   fetch('')
  // }
};

// const insertChatInList = (chat) => {
//   chat.forEach()
// }
