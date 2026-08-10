const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, adminAndSupport } = require('../middleware/authMiddleware');

// Setup multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/upload
// @desc    Upload image to Cloudinary and return URL
// @access  Private (Admin & Support)
router.post('/', protect, adminAndSupport, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  // Upload to Cloudinary using upload_stream
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'faa_assets' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        if (!res.headersSent) {
          return res.status(500).json({ message: 'Image upload failed', error: error.message });
        }
        return;
      }
      
      // Return the secure URL and public_id from Cloudinary
      if (!res.headersSent) {
        res.status(200).json({ url: result.secure_url, imageId: result.public_id });
      }
    }
  );

  // End the stream with the file buffer
  uploadStream.end(req.file.buffer);
});

module.exports = router;
