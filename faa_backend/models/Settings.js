const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  phone: {
    type: String,
    default: '917200407943'
  },
  email: {
    type: String,
    default: 'faabusinessgroup@gmail.com'
  },
  logoUrl: {
    type: String,
    default: '/faa_logo.png' // Default logo path in frontend public folder
  },
  logoImageId: {
    type: String // Cloudinary public_id for deletion/management
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
