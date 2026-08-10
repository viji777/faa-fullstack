const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

// @desc    Place a new order (Generates WhatsApp Link)
// @route   POST /api/orders
// @access  Private (Logged in user)
exports.placeOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.country || !shippingAddress.pincode) {
      return res.status(400).json({ message: 'Please provide complete shipping address' });
    }

    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name variants'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // 2. Prepare Order Items and Calculate Total
    let totalAmount = 0;
    const orderItems = [];
    let whatsappItemsText = '';

    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue; // If product was deleted

      const variantIdStr = item.variantId.toString();
      const selectedVariant = product.variants.find(v => v._id.toString() === variantIdStr);
      
      if (selectedVariant) {
        const itemTotal = selectedVariant.price * item.quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          product: product._id,
          name: product.name,
          size: selectedVariant.size,
          quantity: item.quantity,
          price: selectedVariant.price
        });

        whatsappItemsText += `- ${item.quantity}x ${product.name} (${selectedVariant.size}) - ₹${itemTotal}\n`;
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'Invalid items in cart' });
    }

    // 3. Save Order to Database
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount
    });

    // 4. Update User Profile with latest address/phone if it's new (Optional convenience)
    await User.findByIdAndUpdate(req.user._id, {
      phone: shippingAddress.phone,
      address: {
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        pincode: shippingAddress.pincode
      }
    });

    // 5. Clear the Cart
    cart.items = [];
    await cart.save();

    // 6. Generate Multi-Line WhatsApp Message
    const adminPhone = '917200407943';
    
    // Formatting Address cleanly into multiple lines
    let formattedAddress = `${shippingAddress.name}\n${shippingAddress.addressLine1}`;
    if (shippingAddress.addressLine2) {
      formattedAddress += `\n${shippingAddress.addressLine2}`;
    }
    formattedAddress += `\n${shippingAddress.city}, ${shippingAddress.state}`;
    formattedAddress += `\n${shippingAddress.country} - ${shippingAddress.pincode}`;
    formattedAddress += `\nPhone: ${shippingAddress.phone}`;

    const message = `Hello Faa Nuts and Dates! I would like to place an order.

*Order ID:* ${order._id}

*Order Details:*
${whatsappItemsText}
*Total Price:* ₹${totalAmount}

*Shipping Address:*
${formattedAddress}`;

    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      whatsappUrl
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private (Admin & Support)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (Logged in user)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin & Support)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
