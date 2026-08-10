const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  imageId: {
    type: String
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 1
  }
});

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: [true, 'Variant size is required (e.g. 500g or Standard)']
  },
  price: {
    type: Number,
    required: [true, 'Variant price is required']
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Product must belong to a category']
  },
  images: {
    type: [imageSchema],
    validate: [
      {
        validator: function(v) {
          return v && v.length >= 1;
        },
        message: 'A product must have at least one image'
      },
      {
        validator: function(v) {
          return v && v.length <= 3;
        },
        message: 'A product can have a maximum of 3 images'
      }
    ]
  },
  variants: {
    type: [variantSchema],
    validate: [
      function(v) {
        return v && v.length >= 1;
      },
      'A product must have at least one variant (size/price)'
    ]
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isSpecial: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
