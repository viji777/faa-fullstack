const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// Helper to generate a URL-friendly slug
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    let query = {};

    // Search by product name
    if (req.query.keyword) {
      query.name = {
        $regex: req.query.keyword,
        $options: 'i' // case-insensitive
      };
    }

    if (req.query.ids) {
      // Allows frontend to pass a comma-separated list of IDs from LocalStorage
      const ids = req.query.ids.split(',');
      query._id = { $in: ids };
    }

    // Filter by Price Range
    if (req.query.minPrice || req.query.maxPrice) {
      query['variants.price'] = {};
      if (req.query.minPrice) {
        query['variants.price'].$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query['variants.price'].$lte = Number(req.query.maxPrice);
      }
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (req.query.isSpecial === 'true') {
      query.isSpecial = true;
    }
    
    if (req.query.exclude) {
      if (query._id) {
         query._id.$ne = req.query.exclude;
      } else {
         query._id = { $ne: req.query.exclude };
      }
    }

    let mongooseQuery = Product.find(query).populate('category', 'name slug');

    // For "New Arrivals", frontend can pass ?sort=newest
    if (req.query.sort === 'newest') {
      mongooseQuery = mongooseQuery.sort('-createdAt');
    }

    // Frontend can limit the number of products (e.g. ?limit=8)
    if (req.query.limit) {
      mongooseQuery = mongooseQuery.limit(parseInt(req.query.limit, 10));
    }

    const products = await mongooseQuery;
    
    // Sort images by order for each product
    const formattedProducts = products.map(product => {
      const p = product.toObject();
      if (p.images && p.images.length > 0) {
        p.images.sort((a, b) => a.order - b.order);
      }
      return p;
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = product.toObject();
    if (p.images && p.images.length > 0) {
      p.images.sort((a, b) => a.order - b.order);
    }

    res.status(200).json(p);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = product.toObject();
    if (p.images && p.images.length > 0) {
      p.images.sort((a, b) => a.order - b.order);
    }

    res.status(200).json(p);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin & Support)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, images, variants, isFeatured, isSpecial } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    // Ensure images are valid
    if (!images || images.length === 0 || images.length > 3) {
      return res.status(400).json({ message: 'Product must have between 1 and 3 images' });
    }

    // Ensure at least one image is primary, if none are, make the first one primary
    const hasPrimary = images.some(img => img.isPrimary);
    if (!hasPrimary) {
      images[0].isPrimary = true;
    }

    const slug = generateSlug(name);

    // Check if slug already exists
    const productExists = await Product.findOne({ slug });
    if (productExists) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      category,
      images,
      variants,
      isFeatured: isFeatured || false,
      isSpecial: isSpecial || false
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin & Support)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, images, variants, isFeatured, isSpecial } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) {
      product.name = name;
      product.slug = generateSlug(name);
    }
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isSpecial !== undefined) product.isSpecial = isSpecial;
    
    if (images) {
       if (images.length === 0 || images.length > 3) {
        return res.status(400).json({ message: 'Product must have between 1 and 3 images' });
       }
       const hasPrimary = images.some(img => img.isPrimary);
       if (!hasPrimary) {
         images[0].isPrimary = true;
       }
       
       // Compare old images with new images to find deleted ones
       if (product.images && product.images.length > 0) {
         const newImageIds = images.map(img => img.imageId).filter(Boolean);
         const imagesToDelete = product.images.filter(img => img.imageId && !newImageIds.includes(img.imageId));
         
         for (const img of imagesToDelete) {
           try {
             await cloudinary.uploader.destroy(img.imageId);
           } catch (err) {
             console.error('Failed to delete old product image from cloudinary', err);
           }
         }
       }
       
       product.images = images;
    }
    
    if (variants) {
       if (variants.length === 0) {
         return res.status(400).json({ message: 'Product must have at least one variant' });
       }
       product.variants = variants;
    }

    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin & Support)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.imageId) {
          try {
            await cloudinary.uploader.destroy(img.imageId);
          } catch (err) {
            console.error('Failed to delete product image from cloudinary', err);
          }
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
