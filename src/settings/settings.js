// Get DOM elements
const zuhrInput = document.getElementById('zuhrTime');
const asrInput = document.getElementById('asrTime');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const messageDiv = document.getElementById('message');

// Load existing prayer times when page loads
async function loadPrayerTimes() {
  try {
    const times = await window.electronAPI.getPrayerTimes();
    zuhrInput.value = times.zuhr;
    asrInput.value = times.asr;
  } catch (error) {
    showMessage('Error loading prayer times', 'error');
  }
}

// Show message to user
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

// Save prayer times
async function savePrayerTimes() {
  const zuhr = zuhrInput.value;
  const asr = asrInput.value;
  
  if (!zuhr || !asr) {
    showMessage('Please fill in all time fields', 'error');
    return;
  }
  
  try {
    const success = await window.electronAPI.savePrayerTimes({
      zuhr: zuhr,
      asr: asr
    });
    
    if (success) {
      showMessage('Prayer times saved successfully!', 'success');
    } else {
      showMessage('Error saving prayer times', 'error');
    }
  } catch (error) {
    showMessage('Error saving prayer times', 'error');
  }
}

// Close window
function closeWindow() {
  window.close();
}

// Event listeners
saveButton.addEventListener('click', savePrayerTimes);
cancelButton.addEventListener('click', closeWindow);

// Load times when page loads
window.addEventListener('load', loadPrayerTimes);