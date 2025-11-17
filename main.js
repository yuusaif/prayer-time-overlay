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
      isha: "19:30"
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// Read prayer times from file
function getPrayerTimes() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading prayer times:', error);
    return {fajr:"5:00", zuhr: "13:10", asr: "16:00", maghrib: "17:30", isha: "19:30" };
  }
}

// Save prayer times to file
function savePrayerTimes(times) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(times, null, 2));
    scheduleNotifications(times);
    return true;
  } catch (error) {
    console.error('Error saving prayer times:', error);
    return false;
  }
}

// Create overlay window
function createOverlay() {
  if (overlayWindow) {
    overlayWindow.show();
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

  overlayWindow.loadFile(path.join(__dirname, 'src', 'overlay', 'overlay.html'));
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
    height: 700,
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
  
  if (currentTime === prayerTimes.fajr || currentTime === prayerTimes.zuhr || currentTime === prayerTimes.asr || currentTime === prayerTimes.maghrib || currentTime === prayerTimes.isha) {
    createOverlay();
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
  const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Prayer Time Overlay',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        createSettingsWindow();
      }
    },
    {
      label: 'Test Overlay',
      click: () => {
        createOverlay();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Prayer Time Overlay');
  tray.setContextMenu(contextMenu);
}

// Inter Process Communication Handlers
ipcMain.handle('get-prayer-times', () => {
  return getPrayerTimes();
});

ipcMain.handle('save-prayer-times', (event, times) => {
  return savePrayerTimes(times);
});

ipcMain.on('close-overlay', () => {
  if (overlayWindow) {
    overlayWindow.close();
  }
});

// App Initialization
app.whenReady().then(() => {
  try {
    initDataFile();
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