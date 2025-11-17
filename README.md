<div align="center">
  <img src="src/assets/banner.png" alt="Prayer Time Overlay" width="600">
</div>

# Prayer Time Overlay

> A modern desktop app that displays full-screen prayer time reminders across all screens, ensuring everyone is notified simultaneously without disruptions.

[![Electron](https://img.shields.io/badge/Electron-28.0.0-blue.svg)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

---

## ✨ Features

- 🕌 **Full-Screen Overlay** - Displays prayer reminders on all screens simultaneously
- ⏰ **Custom Prayer Times** - Configure Fajr, Zuhr, Asr, Maghrib, and Isha times
- 👥 **Admin/User Roles** - Centralized control with admin and user permission levels
- 📢 **Broadcast Messages** - Admin can send custom messages via overlay at any time
- 🔔 **System Tray Integration** - Runs silently in the background
- 🚀 **Auto-Start on Boot** - Option to start automatically after reboot
- ⌨️ **Quick Dismiss** - Press ESC or click to close overlay
- 🎨 **Modern UI** - Clean, beautiful interface with smooth animations
- 🌍 **Cross-Platform** - Works on Windows, macOS, and Linux
- 📱 **Helpful Notifications** - To remind us to get ready, perform Udhu

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/prayer-time-overlay.git
cd prayer-time-overlay

# Install dependencies
npm install

# Run the app
npm start
```

### Usage

1. **Launch the app** - The app runs in your system tray
2. **Open Settings** - Right-click the tray icon → Settings
3. **Configure Times** - Set your prayer times in 24-hour format (HH:MM)
4. **Enable Auto-Start** (optional) - Toggle "Start automatically after reboot"
5. **Save Settings** - Your preferences are saved automatically

The overlay will appear automatically at the configured prayer times.

### Admin Mode

To enable admin features (edit settings, broadcast messages):

1. Edit the admin config file (see [ADMIN_SETUP.md](ADMIN_SETUP.md) for locations)
2. Set `"isAdmin": true` in `admin-config.json`
3. Restart the app
4. Admin menu options will appear in the tray menu

**Admin Features:**
- ✅ Edit prayer times centrally
- ✅ Change auto-start settings
- ✅ Broadcast custom messages via overlay

**User Mode (Default):**
- 👀 View-only access to settings
- ❌ Cannot modify prayer times
- ❌ Cannot broadcast messages

---

## 📦 Building

```bash
# Build for your platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux

# Build for all platforms
npm run build
```

Built files will be in the `dist/` directory.

---

## ⚙️ Configuration

Prayer times and settings are stored locally:

**Prayer Times:**
- **Windows**: `%APPDATA%/prayer-time-overlay/prayer-times.json`
- **macOS**: `~/Library/Application Support/prayer-time-overlay/prayer-times.json`
- **Linux**: `~/.config/prayer-time-overlay/prayer-times.json`

**Admin Config:**
- **Windows**: `%APPDATA%/prayer-time-overlay/admin-config.json`
- **macOS**: `~/Library/Application Support/prayer-time-overlay/admin-config.json`
- **Linux**: `~/.config/prayer-time-overlay/admin-config.json`

See [ADMIN_SETUP.md](ADMIN_SETUP.md) for detailed admin setup instructions.

---

## 🛠️ Tech Stack

- **Electron 28** - Cross-platform desktop framework
- **HTML/CSS/JavaScript** - Modern web technologies
- **electron-builder** - Application packaging

---

## 📝 License

Not configured yet.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

