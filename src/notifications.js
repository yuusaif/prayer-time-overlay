const { Notification } = require('electron');

// Store timeout IDs so we can clear them when needed
let notificationTimeouts = [];

function showNotification(title, body) {
  // Electron's Notification API works on Windows, macOS, and Linux
  if (Notification.isSupported()) {
    const notification = new Notification({ 
      title, 
      body,
      urgency: 'normal'
    });
    notification.show();
  } else {
    // Fallback for platforms without notification support
    console.log(`Notification: ${title} - ${body}`);
  }
}

// Clear all scheduled notifications
function clearScheduledNotifications() {
  notificationTimeouts.forEach(timeout => clearTimeout(timeout));
  notificationTimeouts = [];
}

// Schedule notifications for prayer times (5 and 10 minutes before)
function scheduleNotifications(prayerTimes) {
  // Clear any existing scheduled notifications
  clearScheduledNotifications();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Get prayer names for better notification messages
  const prayerNames = {
    fajr: 'Fajr',
    zuhr: 'Zuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha'
  };
  
  Object.keys(prayerTimes).forEach((prayerKey) => {
    const prayerTime = prayerTimes[prayerKey];
    if (!prayerTime) return;
    
    // Parse prayer time (format: "HH:MM")
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const prayerDateTime = new Date(today);
    prayerDateTime.setHours(hours, minutes, 0, 0);
    
    // If prayer time has already passed today, schedule for tomorrow
    if (prayerDateTime <= now) {
      prayerDateTime.setDate(prayerDateTime.getDate() + 1);
    }
    
    const prayerName = prayerNames[prayerKey] || prayerKey;
    const timeUntilPrayer = prayerDateTime.getTime() - now.getTime();
    
    // Schedule 10-minute notification
    const tenMinutesBefore = timeUntilPrayer - (10 * 60 * 1000);
    if (tenMinutesBefore > 0) {
      const timeout10 = setTimeout(() => {
        showNotification(
          'Prayer Time Reminder',
          `${prayerName} prayer is in 10 minutes`
        );
      }, tenMinutesBefore);
      notificationTimeouts.push(timeout10);
    }
    
    // Schedule 5-minute notification
    const fiveMinutesBefore = timeUntilPrayer - (5 * 60 * 1000);
    if (fiveMinutesBefore > 0) {
      const timeout5 = setTimeout(() => {
        showNotification(
          'Prayer Time Reminder',
          `${prayerName} prayer is in 5 minutes. Perform your Udhu`
        );
      }, fiveMinutesBefore);
      notificationTimeouts.push(timeout5);
    }
  });
}

module.exports = { 
  scheduleNotifications, 
  clearScheduledNotifications,
  showNotification 
};
