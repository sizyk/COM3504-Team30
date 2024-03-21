const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const chatbox = document.getElementById('chatbox');
const chatContainer = document.getElementById('chat-interface');
const openChatButton = document.getElementById('open-chat');
const closeChatButton = document.getElementById('close-chat');

let isChatboxOpen = false;

function toggleChatbox() {
  chatContainer.classList.toggle('hidden');
  isChatboxOpen = !isChatboxOpen;
}

openChatButton.addEventListener('click', toggleChatbox);

closeChatButton.addEventListener('click', toggleChatbox);

function addUserMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('mb-2', 'text-right');
  messageElement.innerHTML = `<p class="bg-accent rounded-lg py-2 px-4 inline-block">${message}</p>`;
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}

sendButton.addEventListener('click', () => {
  const userMessage = userInput.value;
  if (userMessage.trim() !== '') {
    addUserMessage(userMessage);
    userInput.value = '';
  }
});

userInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    const userMessage = userInput.value;
    addUserMessage(userMessage);
    userInput.value = '';
  }
});
