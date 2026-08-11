"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MapPin, ShoppingBag, Send } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, setAuthModalOpen } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: ''
  });

  useEffect(() => {
    if (!user) {
      toast('Please login to continue checkout');
      setAuthModalOpen(true);
      router.push('/');
    } else {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        addressLine1: user.address?.addressLine1 || '',
        addressLine2: user.address?.addressLine2 || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || 'India',
        pincode: user.address?.pincode || ''
      }));
    }
  }, [user, router, setAuthModalOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Strict Custom Validations
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      return toast.error('Name must be at least 3 characters long');
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      return toast.error('Please enter a valid phone number (digits only, 10 to 15 digits)');
    }

    if (!formData.addressLine1.trim() || formData.addressLine1.trim().length < 3) {
      return toast.error('Address Line 1 must be at least 3 characters long');
    }

    if (!formData.city.trim() || formData.city.trim().length < 3) {
      return toast.error('City must be at least 3 characters long');
    }

    if (!formData.state.trim() || formData.state.trim().length < 3) {
      return toast.error('State must be at least 3 characters long');
    }

    const pincodeRegex = /^[0-9]{5,6}$/;
    if (!pincodeRegex.test(formData.pincode.trim())) {
      return toast.error('Please enter a valid Pincode (digits only)');
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const orderPayload = {
        shippingAddress: formData,
        items: cartItems.map(item => ({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity
        }))
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Order placed successfully!');
        clearCart();
        
        // Open WhatsApp link if provided by backend
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
        }
        
        // Redirect to order history
        router.push('/account/orders');
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('An error occurred while placing order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (cartItems.length === 0) {
    return (
      <div className={styles.main}>
        <div className={styles.container} style={{ display: 'block' }}>
          <div className={styles.emptyState}>
            <ShoppingBag size={64} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link href="/products" className={styles.shopBtn}>Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        
        {/* Left Side: Delivery Form */}
        <div className={styles.checkoutForm}>
          <h2 className={styles.sectionTitle}><MapPin size={24} /> Delivery Address</h2>
          
          <form id="checkout-form" onSubmit={handlePlaceOrder} className={styles.formGrid} noValidate>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>
            
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Address Line 1</label>
              <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="House No, Building, Street Area" required />
            </div>
            
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Address Line 2 (Optional)</label>
              <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Locality, Landmark" />
            </div>
            
            <div className={styles.inputGroup}>
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>State</label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleInputChange} required readOnly />
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className={styles.orderSummary}>
          <h2 className={styles.sectionTitle}><ShoppingBag size={24} /> Order Summary</h2>
          
          <div className={styles.summaryItems}>
            {cartItems.map((item, index) => {
              const primaryImg = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
              const price = item.variant ? item.variant.price : (item.product.variants?.[0]?.price || 0);
              
              return (
                <div key={index} className={styles.summaryItem}>
                  {primaryImg ? (
                    <img src={primaryImg.url} alt={item.product.name} className={styles.itemImage} />
                  ) : (
                    <div className={styles.itemImage} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Faa</div>
                  )}
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>{item.product.name}</div>
                    {item.variant && <div className={styles.itemVariant}>Size: {item.variant.size}</div>}
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Qty: {item.quantity}</div>
                  </div>
                  <div className={styles.itemPrice}>₹{price * item.quantity}</div>
                </div>
              );
            })}
          </div>
          
          <div className={styles.totalRow}>
            <span>Total Payable</span>
            <span>₹{cartTotal}</span>
          </div>
          
          <button 
            type="submit" 
            form="checkout-form"
            className={styles.placeOrderBtn}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order via WhatsApp'} <Send size={20} />
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Clicking this will save your order to our system and open WhatsApp for confirmation.
          </p>
        </div>

      </div>
    </div>
  );
}
