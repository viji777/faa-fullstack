"use client";

import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, ShoppingBag, Plus, Minus, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './CartDrawer.module.css';

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { user, setAuthModalOpen } = useAuth();
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');

  React.useEffect(() => {
    if (user && user.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  const handlePlaceOrder = () => {
    if (!user) {
      setIsCartOpen(false);
      toast('Please sign in or create an account to place an order.', { icon: '👋' });
      setAuthModalOpen(true);
      return;
    }

    if (cartItems.length === 0) return;

    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    
    // Validate phone number: only digits, 10 to 15 length
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s+/g, ''))) {
      toast.error('Please enter a valid phone number (10 to 15 digits, numbers only)');
      return;
    }

    if (!address.trim() || address.trim().length < 10) {
      toast.error('Please enter a valid delivery address (minimum 10 characters)');
      return;
    }

    // Construct WhatsApp message
    let message = `*New Order from Faa Website* 🛍️\n\n*Customer Details:*\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${phone.trim()}\n*Delivery Address:*\n${address.trim()}\n\n*Order Items:*\n`;
    
    cartItems.forEach((item, index) => {
      const price = item.variant ? item.variant.price : (item.product.variants?.[0]?.price || 0);
      const sizeStr = item.variant ? ` (${item.variant.size})` : '';
      message += `${index + 1}. ${item.product.name}${sizeStr} x ${item.quantity} = ₹${price * item.quantity}\n`;
    });

    message += `\n*Total Order Value: ₹${cartTotal}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/917200407943?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div 
        className={`${styles.overlay} ${isCartOpen ? styles.overlayOpen : ''}`} 
        onClick={() => setIsCartOpen(false)}
      />
      <div className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <h2>Your Cart</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.itemsContainer}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const primaryImg = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
              const price = item.variant ? item.variant.price : (item.product.variants?.[0]?.price || 0);
              
              return (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImageWrapper}>
                    {primaryImg ? (
                      <img src={primaryImg.url} alt={item.product.name} className={styles.itemImage} />
                    ) : (
                      <div className={styles.itemImage} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Faa</div>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>{item.product.name}</div>
                    {item.variant && <div className={styles.itemVariant}>Size: {item.variant.size}</div>}
                    <div className={styles.itemPrice}>₹{price}</div>
                    <div className={styles.itemControls}>
                      <div className={styles.qtyControl}>
                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyDisplay}>{item.quantity}</span>
                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.addressSection}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input 
                id="phoneNumber"
                type="tel"
                className={styles.inputField} 
                placeholder="Enter your phone number..."
                maxLength={15}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
              
              <label htmlFor="deliveryAddress" style={{marginTop: '0.5rem'}}>Delivery Address</label>
              <textarea 
                id="deliveryAddress"
                className={styles.inputField} 
                placeholder="Enter your full delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="3"
              />
            </div>
            <div className={styles.totalRow}>
              <span>Total:</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className={styles.placeOrderBtn} onClick={handlePlaceOrder}>
              Place Order <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
