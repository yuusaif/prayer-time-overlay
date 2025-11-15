// Close overlay function
function closeOverlay() {
  window.electronAPI.closeOverlay();
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

// Focus on the window when loaded
window.addEventListener('load', () => {
  document.body.focus();
});