const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to calculate live totals and format cart
const formatCartResponse = async (cart) => {
  if (!cart) return { items: [], cartTotal: 0 };

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name slug images variants category'
  });

  let cartTotal = 0;
  const formattedItems = [];

  // Filter out items where the product might have been deleted, and calculate totals
  cart.items = cart.items.filter(item => item.product !== null);
  
  for (const item of cart.items) {
    const product = item.product;
    const variantIdStr = item.variantId.toString();
    
    // Find the specific variant the user selected
    const selectedVariant = product.variants.find(v => v._id.toString() === variantIdStr);
    
    if (selectedVariant) {
      const itemTotal = selectedVariant.price * item.quantity;
      cartTotal += itemTotal;
      
      formattedItems.push({
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images
        },
        variant: {
          _id: selectedVariant._id,
          size: selectedVariant.size,
          price: selectedVariant.price
        },
        quantity: item.quantity,
        itemTotal
      });
    }
  }

  // Save if we filtered out any deleted products
  await cart.save();

  return {
    _id: cart._id,
    user: cart.user,
    items: formattedItems,
    cartTotal
  };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private (Logged in user)
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const response = await formatCartResponse(cart);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (Logged in user)
exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    // Verify product and variant exist
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const variantExists = product.variants.some(v => v._id.toString() === variantId);
    if (!variantExists) {
      return res.status(400).json({ message: 'Invalid variant selected' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart with same variant
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.variantId.toString() === variantId
    );

    if (itemIndex > -1) {
      // Item exists, update quantity
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variantId,
        quantity: Number(quantity)
      });
    }

    await cart.save();

    const response = await formatCartResponse(cart);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/:itemId
// @access  Private (Logged in user)
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    const response = await formatCartResponse(cart);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private (Logged in user)
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Filter out the item to be removed
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    await cart.save();

    const response = await formatCartResponse(cart);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private (Logged in user)
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ message: 'Cart cleared successfully', items: [], cartTotal: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
