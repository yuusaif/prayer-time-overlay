// Get DOM elements
const fajrInput = document.getElementById('fajrTime');
const zuhrInput = document.getElementById('zuhrTime');
const asrInput = document.getElementById('asrTime');
const maghribInput = document.getElementById('maghribTime');
const ishaInput = document.getElementById('ishaTime');
const autoStartToggle = document.getElementById('autoStartToggle');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const messageDiv = document.getElementById('message');

// Load existing prayer times and settings when page loads
async function loadPrayerTimes() {
  try {
    const isAdminUser = await window.electronAPI.isAdmin();
    
    const times = await window.electronAPI.getPrayerTimes();
    fajrInput.value = times.fajr;
    zuhrInput.value = times.zuhr;
    asrInput.value = times.asr;
    maghribInput.value = times.maghrib;
    ishaInput.value = times.isha;
    
    // Load auto-start setting
    const autoStart = await window.electronAPI.getAutoStart();
    autoStartToggle.checked = autoStart;
    
    // Disable editing if not admin
    if (!isAdminUser) {
      fajrInput.disabled = true;
      zuhrInput.disabled = true;
      asrInput.disabled = true;
      maghribInput.disabled = true;
      ishaInput.disabled = true;
      autoStartToggle.disabled = true;
      saveButton.disabled = true;
      saveButton.textContent = 'View Only (Admin Required)';
      saveButton.style.opacity = '0.6';
      saveButton.style.cursor = 'not-allowed';
      
      // Update title to show view-only mode
      const title = document.querySelector('h1');
      if (title) {
        title.textContent = 'Prayer Time Settings (View Only)';
      }
    }
  } catch (error) {
    showMessage('Error loading prayer times', 'error');
  }
}

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

async function savePrayerTimes() {
  // Check if user is admin
  const isAdminUser = await window.electronAPI.isAdmin();
  if (!isAdminUser) {
    showMessage('Only admin can save settings', 'error');
    return;
  }
  
  const fajr = fajrInput.value;
  const zuhr = zuhrInput.value;
  const asr = asrInput.value;
  const maghrib = maghribInput.value;
  const isha = ishaInput.value;
  
  if (!fajr || !zuhr || !asr || !maghrib || !isha) {
    showMessage('Please fill in all time fields', 'error');
    return;
  }
  
  try {
    const success = await window.electronAPI.savePrayerTimes({
      fajr: fajr,
      zuhr: zuhr,
      asr: asr,
      maghrib: maghrib,
      isha: isha
    });
    
    if (success) {
      showMessage('Settings saved successfully!', 'success');
    } else {
      showMessage('Error saving prayer times', 'error');
    }
  } catch (error) {
    showMessage('Error saving prayer times', 'error');
  }
}

async function saveAutoStart() {
  // Check if user is admin
  const isAdminUser = await window.electronAPI.isAdmin();
  if (!isAdminUser) {
    showMessage('Only admin can change auto-start setting', 'error');
    return;
  }
  
  try {
    const enabled = autoStartToggle.checked;
    const success = await window.electronAPI.setAutoStart(enabled);
  } catch (error) {
    showMessage('Error saving auto-start setting', 'error');
  }
}

function closeWindow() {
  window.close();
}

// Event listeners
saveButton.addEventListener('click', savePrayerTimes);
cancelButton.addEventListener('click', closeWindow);
autoStartToggle.addEventListener('change', saveAutoStart);

// Load times when page loads
window.addEventListener('load', loadPrayerTimes);