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

  const router = require('next/navigation').useRouter();

  const handleProceedToCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      toast('Please sign in or create an account to checkout.', { icon: '👋' });
      setAuthModalOpen(true);
      return;
    }
    if (cartItems.length === 0) return;

    setIsCartOpen(false);
    router.push('/checkout');
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

            <div className={styles.totalRow}>
              <span>Total:</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className={styles.placeOrderBtn} onClick={handleProceedToCheckout}>
              Proceed to Checkout <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
