// Get DOM elements
const messageInput = document.getElementById('messageInput');
const broadcastButton = document.getElementById('broadcastButton');
const cancelButton = document.getElementById('cancelButton');
const messageDiv = document.getElementById('message');

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

async function broadcastMessage() {
  const message = messageInput.value.trim();
  
  if (!message) {
    showMessage('Please enter a message', 'error');
    return;
  }
  
  try {
    const result = await window.electronAPI.broadcastMessage(message);
    if (result.success) {
      showMessage('Message broadcasted successfully!', 'success');
      messageInput.value = '';
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      showMessage(result.error || 'Error broadcasting message', 'error');
    }
  } catch (error) {
    showMessage('Error broadcasting message', 'error');
  }
}

function closeWindow() {
  window.close();
}

// Event listeners
broadcastButton.addEventListener('click', broadcastMessage);
cancelButton.addEventListener('click', closeWindow);

// Allow Enter key to broadcast (Ctrl+Enter)
messageInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    broadcastMessage();
  }
});

