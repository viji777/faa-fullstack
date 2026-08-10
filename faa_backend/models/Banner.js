const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Banner image URL is required']
  },
  imageId: {
    type: String
  },
  tabletImage: {
    type: String
  },
  tabletImageId: {
    type: String
  },
  mobileImage: {
    type: String
  },
  mobileImageId: {
    type: String
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  linkType: {
    type: String,
    enum: ['Category', 'Product', 'None'],
    default: 'None'
  },
  linkCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: function() { return this.linkType === 'Category'; }
  },
  linkProduct: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: function() { return this.linkType === 'Product'; }
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
