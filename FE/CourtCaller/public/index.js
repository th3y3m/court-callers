// index.js
document.addEventListener('DOMContentLoaded', () => {
    const chatMessage = document.getElementById('chat-message');
    setInterval(() => {
      chatMessage.classList.add('show');
      setTimeout(() => {
        chatMessage.classList.remove('show');
      }, 3000); // Show message for 3 seconds
    }, 10000); // Toggle message every 10 seconds
  });
  