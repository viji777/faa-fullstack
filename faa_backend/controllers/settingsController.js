const Settings = require('../models/Settings');
const cloudinary = require('cloudinary').v2;

// Helper to get or create the single settings document
const getSettingsDocument = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const { phone, email, logoUrl, logoImageId } = req.body;
    let settings = await getSettingsDocument();

    // If a new logo is provided and there's an old one in cloudinary, delete the old one
    if (logoImageId && settings.logoImageId && logoImageId !== settings.logoImageId) {
      try {
        await cloudinary.uploader.destroy(settings.logoImageId);
      } catch (err) {
        console.error('Failed to delete old logo from cloudinary', err);
      }
    }

    settings.phone = phone || settings.phone;
    settings.email = email || settings.email;
    
    if (logoUrl) settings.logoUrl = logoUrl;
    if (logoImageId) settings.logoImageId = logoImageId;

    await settings.save();

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
