const sharp = require('sharp');
sharp('public/cursor.png')
  .resize(32, 32, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .toFile('public/cursor-small.png')
  .then(() => console.log('Resized cursor successfully'))
  .catch(err => console.error('Error resizing cursor:', err));
