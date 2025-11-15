# Prayer Time Overlay

A modern, full-screen desktop overlay app designed to quietly remind everyone in your office when it’s time for Zuhr and Asr prayers. At the designated times, a subtle overlay appears on all screens, ensuring everyone is notified simultaneously—eliminating the need for verbal reminders or disruptions. If you have urgent tasks, you can easily dismiss the overlay with a single click or press of a key.

## Features

- 🕌 **Prayer Time Reminders**: Full-screen overlay at Zuhr and Asr times
- 🖥️ **Cross-Platform**: Works on Windows, macOS, and Linux
- ⚙️ **Easy Configuration**: Simple settings window to set prayer times
- 🔔 **Background App**: Runs silently in system tray
- ⌨️ **Quick Dismiss**: Press ESC or click button to close overlay
- 🎨 **Beautiful UI**: Modern, clean design with animations

## Installation

### Prerequisites
- Node.js v16 or higher

### Setup
\`\`\`bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/prayer-time-overlay.git

# Navigate to project
cd prayer-time-overlay

# Install dependencies
npm install

# Create icon placeholder
node create-icon.js

# Run the app
npm start
\`\`\`

## Usage

1. **Start the app**: Run `npm start`
2. **Configure times**: Right-click tray icon → Settings
3. **Set Zuhr and Asr times** in 24-hour format (e.g., 13:00, 16:30)
4. **Save settings**
5. The overlay will automatically appear at prayer times

## Building for Distribution

\`\`\`bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux

# Build for all platforms
npm run build
\`\`\`

## Configuration

Prayer times are stored locally in:
- **Windows**: `%APPDATA%/prayer-time-overlay/prayer-times.json`
- **macOS**: `~/Library/Application Support/prayer-time-overlay/prayer-times.json`
- **Linux**: `~/.config/prayer-time-overlay/prayer-times.json`

## Tech Stack

- Electron 28
- HTML/CSS/JavaScript
- electron-builder

##Complete Flow Diagram
1. App Starts
   ↓
2. initDataFile() → Creates prayer-times.json if missing
   ↓
3. createTray() → Creates system tray icon with menu
   ↓
4. startTimeCheck() → Starts 60-second interval
   ↓
5. checkPrayerTime() → Every minute:
   ├─ Get current time (HH:MM)
   ├─ Load prayer times from file
   └─ If match → createOverlay()
   ↓
6. createOverlay() → Creates fullscreen window
   ├─ Loads overlay.html
   ├─ User sees prayer message
   └─ User can close via ESC or button
   ↓
7. closeOverlay() → IPC sends 'close-overlay'
   └─ Main process closes window

Settings Flow:
User clicks "Settings" in tray
   ↓
createSettingsWindow() → Opens settings window
   ↓
loadPrayerTimes() → Fetches current times via IPC
   ↓
User edits times → Clicks Save
   ↓
savePrayerTimes() → Saves via IPC
   ↓
Main process writes to file → Success message shown

## License

Not configured yet.

## Contributing

Pull requests are welcome! For major changes, please open an issue first.