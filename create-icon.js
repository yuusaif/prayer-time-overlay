// create-icon.js - Run this with Node.js to create a basic icon
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'src', 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple 1x1 transparent PNG as placeholder
// This is a base64 encoded 1x1 transparent PNG
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync(path.join(assetsDir, 'icon.png'), transparentPNG);
console.log('Placeholder icon created at src/assets/icon.png');
console.log('Replace this with your actual 512x512 icon for production.');