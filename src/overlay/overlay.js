function closeOverlay() {
  window.electronAPI.closeOverlay();
}

// Get prayer name and time from URL parameters or window data
function displayPrayerInfo() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const prayerName = urlParams.get('prayer') || window.prayerName || 'Prayer Time';
    const prayerTime = urlParams.get('time') || window.prayerTime || '';
    
    const prayerNameElement = document.getElementById('prayerName');
    const prayerTimeElement = document.getElementById('prayerTime');
    
    if (prayerNameElement) {
      prayerNameElement.textContent = String(prayerName);
    }
    
    if (prayerTimeElement && prayerTime) {
      prayerTimeElement.textContent = String(prayerTime);
    }
  } catch (error) {
    console.error('Error displaying prayer info:', error);
  }
}

// Close button click handler
document.getElementById('closeButton').addEventListener('click', closeOverlay);

// ESC key handler
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeOverlay();
  }
});

// Prevent context menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Focus on the window when loaded and display prayer info
window.addEventListener('load', () => {
  document.body.focus();
  displayPrayerInfo();
});