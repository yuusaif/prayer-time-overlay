# Admin Setup Guide

## How to Enable Admin Mode

To enable admin mode, edit the admin config file:

**Location:**
- **Windows**: `%APPDATA%/prayer-time-overlay/admin-config.json`
- **macOS**: `~/Library/Application Support/prayer-time-overlay/admin-config.json`
- **Linux**: `~/.config/prayer-time-overlay/admin-config.json`

**Edit the file and set:**
```json
{
  "isAdmin": true
}
```

**To disable admin mode, set:**
```json
{
  "isAdmin": false
}
```

## Admin Features

When admin mode is enabled:
- ✅ Can edit prayer times
- ✅ Can change auto-start settings
- ✅ Can broadcast custom messages via overlay
- ✅ Tray menu shows "⚙️ Settings (Admin)" and "📢 Broadcast Message"

## User Mode (Non-Admin)

When admin mode is disabled:
- ❌ Can only view prayer times (read-only)
- ❌ Cannot change settings
- ❌ Cannot broadcast messages
- ✅ Tray menu shows "Settings (View Only)"

## Quick Demo Steps

1. **Enable Admin Mode**: Edit `admin-config.json` and set `"isAdmin": true`
2. **Restart the app** (or the tray menu will update on next interaction)
3. **Right-click tray icon** → You'll see "⚙️ Settings (Admin)" and "📢 Broadcast Message"
4. **Test Broadcast**: Click "📢 Broadcast Message" → Enter message → Click "Broadcast"
5. **Test Settings**: Click "⚙️ Settings (Admin)" → Change prayer times → Save

## Note

For the hackathon demo, you can manually edit the config file. In a production version, you'd want proper authentication/login system.

