const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  image: {
    type: String // Cloudinary URL
  },
  imageId: {
    type: String // Cloudinary public_id
  },
  icon: {
    type: String // Cloudinary URL
  },
  iconId: {
    type: String // Cloudinary public_id
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
