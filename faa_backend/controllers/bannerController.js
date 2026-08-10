const Banner = require('../models/Banner');
const cloudinary = require('cloudinary').v2;

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate('linkCategory', 'name slug')
      .populate('linkProduct', 'name slug')
      .sort('order');
      
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private (Admin & Support)
exports.createBanner = async (req, res) => {
  try {
    const bannerCount = await Banner.countDocuments();

    if (bannerCount >= 5) {
      return res.status(400).json({ message: 'Maximum limit of 5 banners reached. Please delete an existing banner first.' });
    }

    const { title, image, imageId, tabletImage, tabletImageId, mobileImage, mobileImageId, order, linkType, linkCategory, linkProduct } = req.body;

    const banner = await Banner.create({
      title,
      image,
      imageId,
      tabletImage,
      tabletImageId,
      mobileImage,
      mobileImageId,
      order,
      linkType,
      linkCategory: linkType === 'Category' ? linkCategory : undefined,
      linkProduct: linkType === 'Product' ? linkProduct : undefined
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private (Admin & Support)
exports.updateBanner = async (req, res) => {
  try {
    const { title, image, imageId, tabletImage, tabletImageId, mobileImage, mobileImageId, order, linkType, linkCategory, linkProduct } = req.body;

    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    if (title !== undefined) banner.title = title;
    if (image !== undefined) {
      if (banner.imageId && banner.imageId !== imageId) {
        try {
          await cloudinary.uploader.destroy(banner.imageId);
        } catch (err) {
          console.error('Failed to delete old image from cloudinary', err);
        }
      }
      banner.image = image;
      banner.imageId = imageId;
    }
    
    if (tabletImage !== undefined) {
      if (banner.tabletImageId && banner.tabletImageId !== tabletImageId) {
        try {
          await cloudinary.uploader.destroy(banner.tabletImageId);
        } catch (err) {
          console.error('Failed to delete old tablet image from cloudinary', err);
        }
      }
      banner.tabletImage = tabletImage;
      banner.tabletImageId = tabletImageId;
    }

    if (mobileImage !== undefined) {
      if (banner.mobileImageId && banner.mobileImageId !== mobileImageId) {
        try {
          await cloudinary.uploader.destroy(banner.mobileImageId);
        } catch (err) {
          console.error('Failed to delete old mobile image from cloudinary', err);
        }
      }
      banner.mobileImage = mobileImage;
      banner.mobileImageId = mobileImageId;
    }

    if (order !== undefined) banner.order = order;
    
    if (linkType !== undefined) {
      banner.linkType = linkType;
      if (linkType === 'Category') {
        banner.linkCategory = linkCategory;
        banner.linkProduct = undefined;
      } else if (linkType === 'Product') {
        banner.linkProduct = linkProduct;
        banner.linkCategory = undefined;
      } else {
        banner.linkCategory = undefined;
        banner.linkProduct = undefined;
      }
    }

    const updatedBanner = await banner.save();

    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin & Support)
exports.deleteBanner = async (req, res) => {
  try {
    const bannerCount = await Banner.countDocuments();

    if (bannerCount <= 1) {
      return res.status(400).json({ message: 'You must have at least 1 banner active. Cannot delete the last banner.' });
    }

    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    if (banner.imageId) {
      try {
        await cloudinary.uploader.destroy(banner.imageId);
      } catch (err) {
        console.error('Failed to delete image from cloudinary', err);
      }
    }
    
    if (banner.tabletImageId) {
      try {
        await cloudinary.uploader.destroy(banner.tabletImageId);
      } catch (err) {
        console.error('Failed to delete tablet image from cloudinary', err);
      }
    }
    
    if (banner.mobileImageId) {
      try {
        await cloudinary.uploader.destroy(banner.mobileImageId);
      } catch (err) {
        console.error('Failed to delete mobile image from cloudinary', err);
      }
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Banner removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
