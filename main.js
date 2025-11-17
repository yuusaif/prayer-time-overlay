const { app, BrowserWindow, Tray, Menu, ipcMain, screen, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { scheduleNotifications, clearScheduledNotifications } = require('./src/notifications');

let tray = null;
let overlayWindow = null;
let settingsWindow = null;
let checkInterval = null;

const DATA_FILE = path.join(app.getPath('userData'), 'prayer-times.json');

// Initialize data file if it doesn't exist
//Location: platform-specific (Windows: %APPDATA%, macOS: ~/Library/Application Support, Linux: ~/.config)
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      fajr: "05:00",
      zuhr: "13:10",
      asr: "16:00",
      maghrib: "17:30",
      isha: "19:30",
      autoStart: false
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
  } else {
    // Ensure autoStart field exists in existing data
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (data.autoStart === undefined) {
        data.autoStart = false;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Error updating data file:', error);
    }
  }
}

// Read prayer times from file
function getPrayerTimes() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading prayer times:', error);
    return {fajr:"5:00", zuhr: "13:10", asr: "16:00", maghrib: "17:30", isha: "19:30", autoStart: false };
  }
}

// Get auto-start setting
function getAutoStart() {
  try {
    const data = getPrayerTimes();
    return data.autoStart || false;
  } catch (error) {
    console.error('Error reading auto-start setting:', error);
    return false;
  }
}

// Set auto-start setting
function setAutoStart(enabled) {
  try {
    const data = getPrayerTimes();
    data.autoStart = enabled;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    // Update system auto-start setting
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true
    });
    
    return true;
  } catch (error) {
    console.error('Error setting auto-start:', error);
    return false;
  }
}

// Save prayer times to file
function savePrayerTimes(times) {
  try {
    // Preserve autoStart setting when saving prayer times
    const existingData = getPrayerTimes();
    const dataToSave = {
      ...times,
      autoStart: existingData.autoStart !== undefined ? existingData.autoStart : false
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    scheduleNotifications(times);
    return true;
  } catch (error) {
    console.error('Error saving prayer times:', error);
    return false;
  }
}

// Create overlay window
function createOverlay(prayerName = 'Prayer Time', prayerTime = '') {
  if (overlayWindow) {
    overlayWindow.show();
    // Update prayer info if window already exists
    const nameStr = JSON.stringify(String(prayerName || 'Prayer Time'));
    const timeStr = JSON.stringify(String(prayerTime || ''));
    overlayWindow.webContents.executeJavaScript(`
      (function() {
        try {
          var nameEl = document.getElementById('prayerName');
          var timeEl = document.getElementById('prayerTime');
          if (nameEl) nameEl.textContent = ${nameStr};
          if (timeEl) timeEl.textContent = ${timeStr};
        } catch(e) {
          console.error('Error updating prayer info:', e);
        }
      })();
    `).catch(err => console.error('Error executing script:', err));
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: true,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the overlay HTML
  overlayWindow.loadFile(path.join(__dirname, 'src', 'overlay', 'overlay.html'));
  
  // Set prayer info after page loads (with a small delay to ensure DOM is ready)
  overlayWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      const nameStr = JSON.stringify(String(prayerName || 'Prayer Time'));
      const timeStr = JSON.stringify(String(prayerTime || ''));
      overlayWindow.webContents.executeJavaScript(`
        (function() {
          try {
            var nameEl = document.getElementById('prayerName');
            var timeEl = document.getElementById('prayerTime');
            if (nameEl) {
              nameEl.textContent = ${nameStr};
            }
            if (timeEl) {
              timeEl.textContent = ${timeStr};
            }
          } catch(e) {
            console.error('Error setting prayer info:', e);
          }
        })();
      `).catch(err => console.error('Error executing script:', err));
    }, 150);
  });
  
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true);
  overlayWindow.setFullScreenable(true);
  overlayWindow.setFullScreen(true);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 950,
    resizable: false,
    maximizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'src', 'settings', 'settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// Check if current time matches prayer time
function checkPrayerTime() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const prayerTimes = getPrayerTimes();
  const prayerNames = {
    fajr: 'Fajr',
    zuhr: 'Zuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha'
  };
  
  // Check which prayer time matches
  for (const [key, time] of Object.entries(prayerTimes)) {
    if (currentTime === time) {
      createOverlay(prayerNames[key] || key, time);
      break;
    }
  }
}

function startTimeCheck() {
  // Check every minute
  checkInterval = setInterval(checkPrayerTime, 60000);
  // Also check immediately
  checkPrayerTime();
}

// Create system tray with icon
function createTray() {
  try {
    // Determine icon path based on whether app is packaged or in development
    let iconPath;
    
    if (app.isPackaged) {
      // In packaged app, resources are in process.resourcesPath
      iconPath = path.join(process.resourcesPath, 'src', 'assets', 'icon.png');
      
      // If not found, try app path (for AppImage or other formats)
      if (!fs.existsSync(iconPath)) {
        iconPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'src', 'assets', 'icon.png');
      }
      
      // Last resort: try app path
      if (!fs.existsSync(iconPath)) {
        iconPath = path.join(app.getAppPath(), 'src', 'assets', 'icon.png');
      }
    } else {
      // In development, use __dirname
      iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
    }
    
    // If icon doesn't exist, we can't create tray - will be caught in catch block
    if (!fs.existsSync(iconPath)) {
      throw new Error(`Icon not found. Tried: ${iconPath}`);
    }
    
    tray = new Tray(iconPath);
    
    const adminMode = isAdmin();
    const menuItems = [
      {
        label: 'Prayer Time Overlay',
        enabled: false
      },
      { type: 'separator' }
    ];

    // Admin-only items
    if (adminMode) {
      menuItems.push({
        label: '⚙️ Settings (Admin)',
        click: () => {
          createSettingsWindow();
        }
      });
      menuItems.push({
        label: '📢 Broadcast Message',
        click: () => {
          createBroadcastWindow();
        }
      });
      menuItems.push({ type: 'separator' });
    } else {
      menuItems.push({
        label: 'Settings (View Only)',
        click: () => {
          createSettingsWindow();
        }
      });
      menuItems.push({ type: 'separator' });
    }

    menuItems.push(
      {
        label: 'Test Overlay',
        click: () => {
          const prayerTimes = getPrayerTimes();
          // Show Zuhr as default for testing
          createOverlay('Zuhr', prayerTimes.zuhr || '13:00');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    );
    
    const contextMenu = Menu.buildFromTemplate(menuItems);

    tray.setToolTip('Prayer Time Overlay');
    tray.setContextMenu(contextMenu);
    
    // Handle tray click (some Linux DEs use single click instead of right-click)
    tray.on('click', () => {
      createSettingsWindow();
    });
    
  } catch (error) {
    console.error('Failed to create system tray:', error);
    // Fallback: Show settings window if tray creation fails
    console.log('System tray not available, showing settings window instead');
    createSettingsWindow();
  }
}

// Inter Process Communication Handlers
ipcMain.handle('get-prayer-times', () => {
  return getPrayerTimes();
});

ipcMain.handle('save-prayer-times', (event, times) => {
  return savePrayerTimes(times);
});

ipcMain.handle('get-auto-start', () => {
  return getAutoStart();
});

ipcMain.handle('set-auto-start', (event, enabled) => {
  return setAutoStart(enabled);
});

ipcMain.handle('is-admin', () => {
  return isAdmin();
});

ipcMain.handle('broadcast-message', (event, message) => {
  if (!isAdmin()) {
    return { success: false, error: 'Only admin can broadcast messages' };
  }
  try {
    createOverlay('Admin Message', '', message);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.on('close-overlay', () => {
  if (overlayWindow) {
    overlayWindow.close();
  }
});

// App Initialization
app.whenReady().then(() => {
  try {
    initAdminConfig();
    initDataFile();
    
    // Set auto-start based on saved preference
    const autoStartEnabled = getAutoStart();
    app.setLoginItemSettings({
      openAtLogin: autoStartEnabled,
      openAsHidden: true
    });
    
    createTray();
    startTimeCheck();
    
    // Schedule notifications for all prayer times
    const prayerTimes = getPrayerTimes();
    scheduleNotifications(prayerTimes);
  } catch (error) {
    console.error('Error during app initialization:', error);
    // Try to show settings window as fallback
    createSettingsWindow();
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Prevent app from quitting when all windows are closed
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

// Quit app
app.on('before-quit', () => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  clearScheduledNotifications();
});

// macOS specific
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSettingsWindow();
  }
});